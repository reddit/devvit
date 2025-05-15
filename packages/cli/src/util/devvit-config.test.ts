import type { JSONObject } from '@devvit/public-api';
import { test } from 'vitest';

import { type DevvitConfig, parseClassicConfig } from './devvit-config.js';

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
