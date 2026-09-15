import type { DevvitGlobal } from '@devvit/shared-types/client/devvit-global.js';
import { afterEach, describe, expect, test } from 'vitest';

import { requireTrustedEvents } from './experiments.js';

describe('requireTrustedEvents()', () => {
  afterEach(() => {
    delete (globalThis as { devvit?: DevvitGlobal }).devvit;
  });

  test.each([
    { variant: undefined, want: false },
    { variant: 'control_1', want: false },
    { variant: 'enabled', want: true },
    { variant: 'unexpected', want: false },
  ])('returns $want for $variant', ({ variant, want }) => {
    globalThis.devvit = {
      experiments: variant == null ? {} : { devvit_require_trusted_events: variant },
    } as DevvitGlobal;

    expect(requireTrustedEvents()).toBe(want);
  });

  test('defaults to false before the Devvit global is initialized', () => {
    expect(requireTrustedEvents()).toBe(false);
  });

  test('defaults to false when older Web View Scripts omit experiments', () => {
    globalThis.devvit = {} as DevvitGlobal;

    expect(requireTrustedEvents()).toBe(false);
  });
});
