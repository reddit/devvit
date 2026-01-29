/* eslint-disable implicitDependencies/no-implicit */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import type { AppConfig } from '@devvit/shared-types/schemas/config-file.v1.js';
import chalk from 'chalk';
import type { RollupLog } from 'rollup';
import { afterEach, beforeAll, expect, test, vi } from 'vitest';

import {
  getClientInputs,
  getServerEntry,
  readDevvitConfig,
  resolveClientRoot,
  resolvePublicDir,
  resolveRepoRoot,
  shouldCheckClientForServerImports,
  shouldSuppressWarning,
} from './utils.js';

class TempProject {
  readonly root: string;

  constructor() {
    this.root = fs.mkdtempSync(path.join(os.tmpdir(), 'devvit-start-utils-'));
  }

  write(filePath: string, content: string = ''): void {
    const fullPath = path.join(this.root, filePath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, content);
  }

  cleanup(): void {
    fs.rmSync(this.root, { recursive: true, force: true });
  }
}

const tempProjects: TempProject[] = [];

function createTempProject(): TempProject {
  const project = new TempProject();
  tempProjects.push(project);
  return project;
}

beforeAll(() => {
  process.env.FORCE_COLOR = '0';
  chalk.level = 0;
});

afterEach(() => {
  while (tempProjects.length > 0) {
    tempProjects.pop()?.cleanup();
  }
  vi.restoreAllMocks();
});

test('shouldSuppressWarning matches protobufjs inquire eval', () => {
  const warning = {
    code: 'EVAL',
    id: 'node_modules/@protobufjs/inquire/index.js',
  } as unknown as RollupLog;
  expect(shouldSuppressWarning(warning)).toBe(true);

  const differentModule = {
    code: 'EVAL',
    id: 'node_modules/other/index.js',
  } as unknown as RollupLog;
  expect(shouldSuppressWarning(differentModule)).toBe(false);

  const differentCode = {
    code: 'OTHER',
    id: 'node_modules/@protobufjs/inquire/index.js',
  } as unknown as RollupLog;
  expect(shouldSuppressWarning(differentCode)).toBe(false);
});

test('shouldCheckClientForServerImports allows client checks', () => {
  expect(shouldCheckClientForServerImports(undefined)).toBe(true);
  expect(shouldCheckClientForServerImports('client')).toBe(true);
  expect(shouldCheckClientForServerImports('server')).toBe(false);
});

test('readDevvitConfig parses devvit.json', () => {
  const project = createTempProject();
  const config = {
    post: {
      entrypoints: {
        default: { entry: 'index.html' },
      },
    },
  };
  project.write('devvit.json', JSON.stringify(config));

  const parsed = readDevvitConfig(project.root);
  expect(parsed.post?.entrypoints?.default?.entry).toBe('index.html');
});

test('readDevvitConfig throws for missing devvit.json', () => {
  const project = createTempProject();
  expect(() => readDevvitConfig(project.root)).toThrow('Could not read devvit.json');
});

test('getClientInputs maps entrypoints', () => {
  const project = createTempProject();
  const config = {
    post: {
      entrypoints: {
        default: { entry: 'index.html' },
        splash: { entry: 'splash.html' },
      },
    },
  } as unknown as AppConfig;
  const clientRoot = path.join(project.root, 'src/client');

  expect(getClientInputs(config, project.root, clientRoot)).toStrictEqual({
    default: 'index.html',
    splash: 'splash.html',
  });
});

test('getClientInputs returns undefined when missing entrypoints', () => {
  const project = createTempProject();
  const clientRoot = path.join(project.root, 'src/client');

  expect(getClientInputs({} as AppConfig, project.root, clientRoot)).toBeUndefined();
  expect(
    getClientInputs({ post: { entrypoints: {} } } as AppConfig, project.root, clientRoot)
  ).toBeUndefined();
});

test('getServerEntry prefers api entry', () => {
  const project = createTempProject();
  project.write('src/api/index.ts', 'export {}');
  project.write('src/server/index.ts', 'export {}');

  expect(getServerEntry(project.root)).toBe(path.join(project.root, 'src/api/index.ts'));
});

test('getServerEntry falls back to server entry', () => {
  const project = createTempProject();
  project.write('src/server/index.ts', 'export {}');

  expect(getServerEntry(project.root)).toBe(path.join(project.root, 'src/server/index.ts'));
});

test('getServerEntry throws when missing', () => {
  const project = createTempProject();
  expect(() => getServerEntry(project.root)).toThrow('Could not find server entry point');
});

test('resolveRepoRoot prefers explicit root', () => {
  const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue('/tmp/project');
  expect(resolveRepoRoot()).toBe('/tmp/project');
  expect(resolveRepoRoot('/explicit')).toBe('/explicit');
  cwdSpy.mockRestore();
});

test('resolveClientRoot uses src/client when present', () => {
  const project = createTempProject();
  project.write('src/client/index.html', '<!doctype html>');

  expect(resolveClientRoot(project.root)).toBe(path.join(project.root, 'src/client'));
});

test('resolveClientRoot uses repo root when missing', () => {
  const project = createTempProject();
  expect(resolveClientRoot(project.root)).toBe(project.root);
});

test('resolvePublicDir returns repo public when root matches', () => {
  const project = createTempProject();
  project.write('public/snoo.png', 'png');

  expect(resolvePublicDir(project.root, project.root)).toBe(path.join(project.root, 'public'));
});

test('resolvePublicDir returns client public when only client exists', () => {
  const project = createTempProject();
  project.write('src/client/public/snoo.png', 'png');

  const clientRoot = path.join(project.root, 'src/client');
  expect(resolvePublicDir(project.root, clientRoot)).toBe(
    path.join(project.root, 'src/client/public')
  );
});

test('resolvePublicDir returns repo public when only repo exists', () => {
  const project = createTempProject();
  project.write('public/snoo.png', 'png');

  const clientRoot = path.join(project.root, 'src/client');
  expect(resolvePublicDir(project.root, clientRoot)).toBe(path.join(project.root, 'public'));
});

test('resolvePublicDir throws when both public dirs exist', () => {
  const project = createTempProject();
  project.write('public/snoo.png', 'png');
  project.write('src/client/public/snoo.png', 'png');

  const clientRoot = path.join(project.root, 'src/client');
  expect(() => resolvePublicDir(project.root, clientRoot)).toThrow(
    'Choose a single public directory'
  );
});

test('resolvePublicDir returns undefined when none exist', () => {
  const project = createTempProject();
  const clientRoot = path.join(project.root, 'src/client');

  expect(resolvePublicDir(project.root, clientRoot)).toBeUndefined();
});

test('getClientInputs resolves entries in repo and client roots', () => {
  const project = createTempProject();
  project.write('src/client/index.html', '<!doctype html>');
  project.write('src/client/splash.html', '<!doctype html>');

  const config = {
    post: {
      entrypoints: {
        default: { entry: 'src/client/index.html' },
        splash: { entry: 'splash.html' },
      },
    },
  } as unknown as AppConfig;

  const clientRoot = path.join(project.root, 'src/client');
  const inputs = getClientInputs(config, project.root, clientRoot);

  expect(inputs).toStrictEqual({
    default: path.join(project.root, 'src/client/index.html'),
    splash: path.join(project.root, 'src/client/splash.html'),
  });
});

test('getClientInputs throws for entries outside client root', () => {
  const project = createTempProject();
  project.write('src/server/secret.ts', 'export {}');
  project.write('src/client/index.html', '<!doctype html>');

  const config = {
    post: {
      entrypoints: {
        server: { entry: 'src/server/secret.ts' },
      },
    },
  } as unknown as AppConfig;

  const clientRoot = path.join(project.root, 'src/client');
  expect(() => getClientInputs(config, project.root, clientRoot)).toThrow('must be inside');
});

test('getClientInputs preserves missing entry paths', () => {
  const project = createTempProject();
  const clientRoot = path.join(project.root, 'src/client');
  const config = {
    post: {
      entrypoints: {
        missing: { entry: 'missing.html' },
      },
    },
  } as unknown as AppConfig;

  const inputs = getClientInputs(config, project.root, clientRoot);
  expect(inputs).toStrictEqual({ missing: 'missing.html' });
});
