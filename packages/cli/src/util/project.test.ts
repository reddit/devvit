import { writeFileSync } from 'node:fs';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import type {
  AppConfig,
  AppPermissionConfig,
} from '@devvit/shared-types/schemas/config-file.v1.js';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { DEVVIT_APP_NAME, DEVVIT_SUBREDDIT } from '../constants/Environment.js';
import {
  doEnvFileReplacement,
  isRunningInAppDirectory,
  newProject,
  Project,
  validateConfig,
} from './project.js';

vi.mock('node:fs', async () => ({
  ...(await vi.importActual('node:fs')),
  writeFileSync: vi.fn(),
}));

const noPermissions: AppPermissionConfig = {
  externalEndpoints: false,
  http: { enable: false, domains: [] },
  blob: false,
  chromeless: false,
  journeys: false,
  media: false,
  menu: false,
  payments: false,
  realtime: false,
  redis: false,
  reddit: { enable: false, scope: 'user', asUser: [] },
  settings: false,
  triggers: false,
  hideUserFromContext: false,
  canBypassLinkInterstitial: false,
};

describe('Project', () => {
  beforeEach(() => {
    vi.stubEnv(DEVVIT_APP_NAME, undefined);
    vi.stubEnv(DEVVIT_SUBREDDIT, undefined);
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  test('update AppConfig', () => {
    const config: AppConfig = {
      schema: 'v1',
      name: 'name',
      permissions: noPermissions,
      json: { name: 'name', server: {} },
    };
    const project = new Project('root', 'devvit.json', config, undefined);
    project.name = 'Name2';
    expect(project.name).toBe('name2');
    expect(project.appConfig.json.name).toBe('name2');
    expect(writeFileSync).toHaveBeenCalledWith(
      path.join('root', 'devvit.json'),
      JSON.stringify({ name: 'name2', server: {} }, undefined, 2)
    );
  });

  test('directories come from AppConfig', () => {
    const config: AppConfig = {
      schema: 'v1',
      name: 'name',
      permissions: noPermissions,
      json: { name: 'name' },
    };
    const project = new Project('root', 'devvit.json', config, undefined);
    expect(project.appConfig).toBe(config);
    expect(project.clientDir).toBeUndefined();
    expect(project.mediaDir).toBeUndefined();
    config.post = {
      dir: 'client',
      entrypoints: { default: { name: 'default', entry: 'index.html', height: 'tall' } },
    };
    config.media = { dir: 'media' };
    expect(project.clientDir).toBe('client');
    expect(project.mediaDir).toBe('media');
  });

  test('flag watchDebounceMillis', () => {
    const config: AppConfig = {
      schema: 'v1',
      name: 'name',
      permissions: noPermissions,
      json: { name: 'name' },
    };
    const project = new Project('root', 'filename', config, undefined);
    expect(project.watchDebounceMillis).toBe(100);
    project.flag.watchDebounceMillis = 200;
    expect(project.watchDebounceMillis).toBe(200);
  });

  test('dev.subreddit', () => {
    const config: AppConfig = {
      schema: 'v1',
      name: 'name',
      permissions: noPermissions,
      json: { name: 'name' },
      dev: { subreddit: 'devsubreddit' },
    };
    const project = new Project('root', 'filename', config, undefined);
    expect(project.getSubreddit('Dev')).toBe('devsubreddit');
    project.setSubreddit('newsubreddit', 'Dev');
    expect(project.getSubreddit('Dev')).toBe('newsubreddit');
  });
});

describe('project config files', () => {
  let root: string;

  beforeEach(async () => {
    root = await mkdtemp(path.join(os.tmpdir(), 'devvit-project-'));
    vi.spyOn(process, 'cwd').mockReturnValue(root);
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await rm(root, { recursive: true, force: true });
  });

  test('returns no project when devvit.json is missing', async () => {
    expect(await newProject(undefined, 'Dynamic')).toBeUndefined();
    expect(isRunningInAppDirectory()).toBe(false);
  });

  test('finds devvit.json from a nested directory', async () => {
    await writeFile(path.join(root, 'devvit.json'), '{"name":"json-app","server":{}}');
    expect(isRunningInAppDirectory()).toBe(true);

    const nested = path.join(root, 'nested');
    await mkdir(nested);
    vi.spyOn(process, 'cwd').mockReturnValue(nested);
    const project = await newProject(undefined, 'Dynamic');
    expect(project?.root).toBe(root);
    expect(project?.filename).toBe('devvit.json');
    expect(project?.appConfig.json).toStrictEqual({ name: 'json-app', server: {} });
    expect(isRunningInAppDirectory()).toBe(false);
  });

  test('supports a custom JSON config', async () => {
    await writeFile(path.join(root, 'custom.json'), '{"name":"custom-app","server":{}}');
    const project = await newProject('custom.json', 'Dynamic');
    expect(project?.filename).toBe('custom.json');
    expect(project?.appConfig.json).toStrictEqual({ name: 'custom-app', server: {} });
  });

  test.each([
    { contents: '{', error: 'cannot parse config JSON' },
    {
      contents: '{"name":"old-app"}',
      error: 'config requires property "post", "server", or "blocks".',
    },
  ])('validates JSON configs: $contents', async ({ contents, error }) => {
    await writeFile(path.join(root, 'devvit.json'), contents);
    await expect(newProject(undefined, 'Dynamic')).rejects.toThrow(error);
  });

  test('allows an uninitialized JSON template', async () => {
    await writeFile(path.join(root, 'devvit.json'), '{"name":"<% name %>","server":{}}');
    const project = await newProject(undefined, 'Uninitialized');
    expect(project?.appConfig.name).toBe('<% name %>');
  });
});

describe('validateConfig()', () => {
  test('blocks.entry', () => {
    for (const exists of [false, true])
      for (const mode of ['Static', 'Dynamic'] as const) {
        const config: AppConfig = {
          blocks: { entry: 'entry' },
          schema: 'v1',
          name: 'name',
          permissions: noPermissions,
          json: { name: 'name' },
        };
        expect(validateConfig(config, () => exists, mode)).toStrictEqual(
          exists ? [] : ['`config.blocks.entry` (entry)']
        );
      }
  });

  for (const exists of [false, true])
    for (const mode of ['Static', 'Dynamic'] as const)
      test(`post.dir (${exists}, ${mode})`, () => {
        const config: AppConfig = {
          schema: 'v1',
          name: 'name',
          permissions: noPermissions,
          post: {
            dir: 'dir',
            entrypoints: {
              default: { name: 'default', entry: 'entry', height: 'tall' },
            },
          },
          json: { name: 'name' },
        };
        expect(
          validateConfig(config, (filename: string) => (filename === 'dir' ? exists : true), mode)
        ).toStrictEqual(exists || mode === 'Dynamic' ? [] : ['`config.post.dir` (dir)']);
      });

  for (const exists of [false, true])
    for (const mode of ['Static', 'Dynamic'] as const)
      test(`post.entrypoints.entry file (${exists}, ${mode})`, () => {
        const config: AppConfig = {
          schema: 'v1',
          name: 'name',
          permissions: noPermissions,
          post: {
            dir: 'dir',
            entrypoints: { default: { name: 'default', entry: 'entry', height: 'tall' } },
          },
          json: { name: 'name' },
        };
        expect(
          validateConfig(
            config,
            (filename: string) => (filename.endsWith('dir/entry') ? exists : true),
            mode
          )
        ).toStrictEqual(
          exists || mode === 'Dynamic' ? [] : ['`config.post.entrypoints.default.entry` (entry)']
        );
      });

  test('post.entrypoints.entry API', () => {
    const config: AppConfig = {
      schema: 'v1',
      name: 'name',
      permissions: noPermissions,
      post: {
        dir: 'dir',
        entrypoints: {
          default: { name: 'default', entry: '/api/entry', height: 'tall' },
        },
      },
      json: { name: 'name' },
    };
    expect(validateConfig(config, (filename) => filename === 'dir', 'Static')).toStrictEqual([]);
  });

  test('server.entry', () => {
    for (const exists of [false, true])
      for (const mode of ['Static', 'Dynamic'] as const) {
        const config: AppConfig = {
          schema: 'v1',
          name: 'name',
          permissions: noPermissions,
          server: { dir: 'dir', entry: 'entry' },
          json: { name: 'name' },
        };
        expect(validateConfig(config, () => exists, mode)).toStrictEqual(
          exists || mode === 'Dynamic' ? [] : ['`config.server` (dir/entry)']
        );
      }
  });
});

describe('doEnvFileReplacement()', () => {
  test('replaces env variables', () => {
    expect(doEnvFileReplacement('VAR_NAME=something', 'VAR_NAME', 'something-else')).toBe(
      'VAR_NAME=something-else'
    );
  });
  test(`do nothing if the var isn't in the file`, () => {
    expect(doEnvFileReplacement('VAR_NAME=something', 'MISSING_VAR', 'something-else')).toBe(
      'VAR_NAME=something'
    );
  });
  test('handle multi-line fine', () => {
    expect(
      doEnvFileReplacement('VAR_1=a\nVAR_NAME=something\nVAR_3=c', 'VAR_NAME', 'something-else')
    ).toBe('VAR_1=a\nVAR_NAME=something-else\nVAR_3=c');
  });
});
