import type { JSONObject } from '@devvit/public-api';
import type { AppConfig } from '@devvit/shared-types/schemas/config-file.v1.js';
import { test } from 'vitest';
import { vi } from 'vitest';

import {
  type ClassicAppConfig,
  type DevvitConfig,
  DevvitConfigCache,
  isAppConfig,
  parseClassicConfig,
} from './devvit-config.js';

describe('DevvitConfigCache', () => {
  beforeEach(() => {
    vi.mock('node:fs', async () => ({
      ...(await vi.importActual('node:fs')),
      writeFileSync: vi.fn(),
    }));
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('update ClassicAppConfig', async () => {
    const config: ClassicAppConfig = { name: 'name' };
    const cache = new DevvitConfigCache('root', 'filename', config, undefined);
    await cache.update({ name: 'name2' });
    expect(cache.config.name).toBe('name2');
    expect(cache.v1Config).toBe(undefined);
  });

  test('update AppConfig', async () => {
    const config: AppConfig = {
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
      json: { name: 'name' },
    };
    const cache = new DevvitConfigCache('root', 'filename', config, undefined);
    await cache.update({ name: 'name2' });
    expect(cache.config.name).toBe('name2');
    expect(cache.v1Config?.name).toBe('name2');
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
