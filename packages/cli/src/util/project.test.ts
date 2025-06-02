import type { JSONObject } from '@devvit/public-api';
import type {
  AppConfig,
  AppPermissionConfig,
} from '@devvit/shared-types/schemas/config-file.v1.js';
import { test } from 'vitest';
import { vi } from 'vitest';

import {
  type ClassicAppConfig,
  type DevvitConfig,
  isAppConfig,
  parseClassicConfig,
  Project,
  validateConfig,
} from './project.js';

const noPermissions: AppPermissionConfig = {
  http: { enabled: false, allowedDomains: [] },
  media: false,
  payments: false,
  realtime: false,
  redis: false,
  reddit: { enabled: false, scope: 'user', asUser: [] },
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
});

describe('validateConfig()', () => {
  test('blocks.entry', () => {
    for (const exists of [false, true]) {
      const config: AppConfig = {
        blocks: { entry: 'entry' },
        schema: 'v1',
        name: 'name',
        permissions: noPermissions,
        json: { name: 'name' },
      };
      expect(validateConfig(config, () => exists)).toStrictEqual(
        exists ? [] : ['`config.blocks.entry` (entry) does not exist']
      );
    }
  });

  test('post.client.dir', () => {
    for (const exists of [false, true]) {
      const config: AppConfig = {
        schema: 'v1',
        name: 'name',
        permissions: noPermissions,
        post: {
          client: { dir: 'dir', entry: 'dir/entry' },
          create: {
            title: 'title',
            height: 'regular',
            menu: { enable: false, label: 'label', scope: 'user' },
            onInstall: false,
          },
        },
        json: { name: 'name' },
      };
      expect(
        validateConfig(config, (filename: string) => (filename === 'dir' ? exists : true))
      ).toStrictEqual(exists ? [] : ['`config.post.client.dir` (dir) does not exist']);
    }
  });

  test('post.client.entry', () => {
    for (const exists of [false, true]) {
      const config: AppConfig = {
        schema: 'v1',
        name: 'name',
        permissions: noPermissions,
        post: {
          client: { dir: 'dir', entry: 'dir/entry' },
          create: {
            title: 'title',
            height: 'regular',
            menu: { enable: false, label: 'label', scope: 'user' },
            onInstall: false,
          },
        },
        json: { name: 'name' },
      };
      expect(
        validateConfig(config, (filename: string) => (filename === 'dir/entry' ? exists : true))
      ).toStrictEqual(exists ? [] : ['`config.post.client.entry` (dir/entry) does not exist']);
    }
  });

  test('server.entry', () => {
    for (const exists of [false, true]) {
      const config: AppConfig = {
        schema: 'v1',
        name: 'name',
        permissions: noPermissions,
        server: { entry: 'entry' },
        json: { name: 'name' },
      };
      expect(validateConfig(config, () => exists)).toStrictEqual(
        exists ? [] : ['`config.server.entry` (entry) does not exist']
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
    const config: JSONObject & DevvitConfig = { name: 'name', abc: 'def' };
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
          enabled: false,
          allowedDomains: [],
        },
        media: false,
        payments: false,
        realtime: false,
        redis: false,
        reddit: {
          enabled: false,
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
