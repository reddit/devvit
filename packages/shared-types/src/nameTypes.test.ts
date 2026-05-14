import { describe, expect, test } from 'vitest';

import { isAccountName } from './nameTypes.js';

describe('isAccountName', () => {
  test.each(['SnooSnek', 'some-hyphen-name', 'underscore_name', 'mix-CaSe_underscore_and-hyphen'])(
    'Works for "%s"',
    (name) => {
      expect(isAccountName(name)).toBe(true);
    }
  );
  test.each(['', 'weird-$h!t'])('Fails for "%s"', (name) => {
    expect(isAccountName(name)).toBe(false);
  });
});
