import fsp from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import JSZip from 'jszip';

import type { DevvitCommand } from './commands/DevvitCommand.js';
import { getAppSourceZip } from './getAppSourceZip.js';

function makeCommand(projectRoot: string, roots: string[] | undefined): DevvitCommand {
  return {
    project: {
      root: projectRoot,
      appConfig: { additionalSourceRoots: roots, sourceIgnores: ['config-ignored.ts'] },
    },
    error(message: string): never {
      throw new Error(message);
    },
  } as unknown as DevvitCommand;
}

describe('getAppSourceZip', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'devvit-source-zip-'));
    const files = {
      'project/app/src/message.ts': 'app source',
      'project/app/.env': 'secret',
      'project/app/.git/config': 'git config',
      'project/app/node_modules/dependency/index.js': 'dependency',
      'project/shared/message.ts': 'sibling source',
      'project/shared/.gitignore': 'ignored.ts\n',
      'project/shared/ignored.ts': 'ignored by external .gitignore',
      'project/shared/config-ignored.ts': 'ignored by sourceIgnores',
      'project/shared/.env': 'external secret',
      'shared/message.ts': 'outer source',
      'unselected/message.ts': 'unselected source',
    };
    await Promise.all(
      Object.entries(files).map(async ([name, content]) => {
        const file = path.join(tempDir, name);
        await fsp.mkdir(path.dirname(file), { recursive: true });
        await fsp.writeFile(file, content);
      })
    );
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await fsp.rm(tempDir, { recursive: true, force: true });
  });

  it.each([
    { roots: undefined, expected: { 'src/message.ts': 'app source' } },
    { roots: ['./src'], expected: { 'src/message.ts': 'app source' } },
    {
      roots: ['../shared'],
      expected: {
        'app/src/message.ts': 'app source',
        'shared/.gitignore': 'ignored.ts\n',
        'shared/message.ts': 'sibling source',
      },
    },
    {
      roots: ['../shared/../shared/'],
      expected: {
        'app/src/message.ts': 'app source',
        'shared/.gitignore': 'ignored.ts\n',
        'shared/message.ts': 'sibling source',
      },
    },
    {
      roots: ['../shared', '../../shared'],
      expected: {
        'project/app/src/message.ts': 'app source',
        'project/shared/.gitignore': 'ignored.ts\n',
        'project/shared/message.ts': 'sibling source',
        'shared/message.ts': 'outer source',
      },
    },
  ])('safely packages source roots $roots', async ({ roots, expected }) => {
    const cmd = makeCommand(path.join(tempDir, 'project/app'), roots);
    expect(process.cwd()).not.toBe(cmd.project.root);

    // Inspect entries before loading: JSZip sanitizes traversal paths on load.
    const generate = vi.spyOn(JSZip.prototype, 'generateAsync');
    const buffer = await getAppSourceZip(cmd);
    const rawZip = generate.mock.contexts[0] as JSZip;
    for (const name of Object.keys(rawZip.files)) {
      expect(path.posix.isAbsolute(name) || path.win32.isAbsolute(name)).toBe(false);
      expect(name).not.toContain('\\');
      expect(name.split('/')).not.toContain('..');
      expect(path.posix.normalize(name)).toBe(name);
    }

    const zip = await JSZip.loadAsync(buffer);
    const files = await Promise.all(
      Object.values(zip.files)
        .filter((entry) => !entry.dir)
        .map(async (entry) => [entry.name, await entry.async('string')])
    );
    expect(Object.fromEntries(files)).toEqual(expected);
  });

  it('rejects absolute and filesystem source roots', async () => {
    const projectRoot = path.join(tempDir, 'project/app');
    const resolvedProjectRoot = await fsp.realpath(projectRoot);
    const filesystemRoot = path.parse(resolvedProjectRoot).root;

    await expect(
      getAppSourceZip(makeCommand(projectRoot, [path.join(tempDir, 'shared')]))
    ).rejects.toThrow('Additional source root must be relative');
    await expect(
      getAppSourceZip(
        makeCommand(projectRoot, [path.relative(resolvedProjectRoot, filesystemRoot)])
      )
    ).rejects.toThrow('Additional source root must not resolve to a filesystem root');
  });

  it('resolves symlinks before validating source roots', async () => {
    const projectRoot = path.join(tempDir, 'project/app');
    const filesystemRoot = path.parse(await fsp.realpath(projectRoot)).root;
    const linkedRoot = path.join(projectRoot, 'linked');
    await fsp.symlink(
      filesystemRoot,
      linkedRoot,
      process.platform === 'win32' ? 'junction' : 'dir'
    );

    await expect(getAppSourceZip(makeCommand(projectRoot, ['linked']))).rejects.toThrow(
      'Additional source root must not resolve to a filesystem root'
    );
  });
});
