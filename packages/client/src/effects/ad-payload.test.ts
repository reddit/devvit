import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { getAdPayload } from './ad-payload.js';
import { mockDevvit } from './helpers/test-helpers.js';

describe('getAdPayload', () => {
  beforeEach(() => {
    globalThis.devvit = mockDevvit;
  });

  afterEach(() => {
    delete (globalThis as { devvit?: unknown }).devvit;
  });

  it('returns the ad payload when set', () => {
    globalThis.devvit = {
      ...mockDevvit,
      adPayload: { data: { clickUrl: 'https://example.com' } },
    };
    expect(getAdPayload()).toEqual({ data: { clickUrl: 'https://example.com' } });
  });

  it('returns undefined when the ad payload is not set', () => {
    expect(getAdPayload()).toBeUndefined();
  });
});
