import type { JSONObject } from '@devvit/public-api';
import { test } from 'vitest';

import { _parseConfig, type DevvitConfig } from './devvit-config.js';

describe('_parseConfig()', () => {
  test('ok', () => {
    const config: DevvitConfig = { name: 'name' };
    expect(_parseConfig(config)).toStrictEqual(config);
  });
  test('no root', () => {
    expect(() => _parseConfig(null)).toThrow(
      'devvit.yaml must be an object `{"name": "foo", ...}`.'
    );
    expect(() => _parseConfig([])).toThrow('devvit.yaml must be an object `{"name": "foo", ...}`.');
  });
  test('no name', () =>
    expect(() => _parseConfig({})).toThrow('devvit.yaml must have `name` property.'));
  test('superset', () => {
    const config: JSONObject & DevvitConfig = { name: 'name', abc: 'def' };
    expect(_parseConfig(config)).toStrictEqual(config);
  });
});
