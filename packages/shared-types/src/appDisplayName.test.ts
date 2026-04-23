import { describe, expect, it } from 'vitest';

import { APP_DISPLAY_NAME_MAX_LENGTH, getAppDisplayNameLengthError } from './appDisplayName.js';

describe('getAppDisplayNameLengthError', () => {
  it('accepts a name at the max length', () => {
    const name = 'a'.repeat(APP_DISPLAY_NAME_MAX_LENGTH);
    expect(getAppDisplayNameLengthError(name)).toBeUndefined();
  });

  it('rejects a name longer than the max', () => {
    const name = 'a'.repeat(APP_DISPLAY_NAME_MAX_LENGTH + 1);
    expect(getAppDisplayNameLengthError(name)).toBeDefined();
  });
});
