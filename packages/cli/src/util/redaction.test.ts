import { describe, expect, test } from 'vitest';

import { shouldRedact } from './redaction.js';

describe('shouldRedact', () => {
  test('redacts settings set', () => {
    expect(shouldRedact(['settings', 'set'])).toBe(true);
    expect(shouldRedact(['settings', 'set', 'foo', 'bar'])).toBe(true);
  });

  test('does not redact settings get', () => {
    expect(shouldRedact(['settings', 'get'])).toBe(false);
    expect(shouldRedact(['settings', 'get', 'foo'])).toBe(false);
  });

  test('does not redact other settings commands', () => {
    expect(shouldRedact(['settings', 'list'])).toBe(false);
    expect(shouldRedact(['settings'])).toBe(false);
  });

  test('does not redact other commands', () => {
    expect(shouldRedact(['deploy'])).toBe(false);
    expect(shouldRedact(['upload'])).toBe(false);
  });
});
