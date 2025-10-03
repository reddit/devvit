import type { JsonObject } from '@devvit/shared-types/json.js';
import type {
  AppConfig,
  AppPermissionConfig,
} from '@devvit/shared-types/schemas/config-file.v1.js';
import { describe, expect, test } from 'vitest';
import { vi } from 'vitest';

import {
  type ClassicAppConfig,
  type DevvitConfig,
  doEnvFileReplacement,
  isAppConfig,
  parseClassicConfig,
  Project,
  validateConfig,
} from './project.js';

const noPermissions: AppPermissionConfig = {
  http: { enable: false, domains: [] },
  media: false,
  menu: false,
  payments: false,
  realtime: false,
  redis: false,
  reddit: { enable: false, scope: 'user', asUser: [] },
  settings: false,
  triggers: false,
};

describe('Project', () => {
  beforeEach(() => {
    vi.mock('node:fs', async () => ({
      ...(await vi.importActual('node:fs')),
      writeFileSync: vi.fn(),
    }));
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('update ClassicAppConfig', () => {
    const config: ClassicAppConfig = { name: 'name' };
    const project = new Project('root', 'filename', config, undefined);
    project.name = 'name2';
    expect(project.name).toBe('name2');
  });

  test('update AppConfig', () => {
    const config: AppConfig = {
      schema: 'v1',
      name: 'name',
      permissions: noPermissions,
      json: { name: 'name' },
    };
    const project = new Project('root', 'filename', config, undefined);
    project.name = 'name2';
    expect(project.name).toBe('name2');
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

describe('parseClassicConfig()', () => {
  test('ok', () => {
    const config: DevvitConfig = { name: 'name' };
    expect(parseClassicConfig(config)).toStrictEqual(config);
  });
  test('no root', () => {
    expect(() => parseClassicConfig(null)).toThrow(
      'devvit.yaml must be an object `{"name": "foo", ...}`.'
    );
    expect(() => parseClassicConfig([])).toThrow(
      'devvit.yaml must be an object `{"name": "foo", ...}`.'
    );
  });
  test('no name', () =>
    expect(() => parseClassicConfig({})).toThrow('devvit.yaml must have `name` property.'));
  test('superset', () => {
    const config: JsonObject & DevvitConfig = { name: 'name', abc: 'def' };
    expect(parseClassicConfig(config)).toStrictEqual(config);
  });
});

describe('isAppConfig()', () => {
  test('v1', () => {
    const config = {
      schema: 'v1',
      name: 'name',
      permissions: {
        http: {
          enable: false,
          domains: [],
        },
        media: false,
        payments: false,
        realtime: false,
        redis: false,
        reddit: {
          enable: false,
          scope: 'user',
          asUser: [],
        },
      },
    };
    expect(isAppConfig(config)).toBe(true);
  });

  test('classic', () => {
    const config = { name: 'name' };
    expect(isAppConfig(config)).toBe(false);
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
