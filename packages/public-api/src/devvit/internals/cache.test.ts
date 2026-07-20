import { beforeEach, describe, expect, test, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  cache: vi.fn(async (fn: () => Promise<unknown>) => fn()),
}));

vi.mock('@devvit/cache', () => ({ cache: mocks.cache }));

import { cache } from './cache.js';

describe('cache', () => {
  beforeEach(() => {
    mocks.cache.mockClear();
  });

  test('converts the public API TTL from milliseconds to seconds', async () => {
    const fn = vi.fn(async () => 'value');
    const options = { key: 'key', ttl: 10_000 };

    await expect(cache(fn, options)).resolves.toBe('value');
    expect(mocks.cache).toHaveBeenCalledWith(fn, { key: 'key', ttl: 10 });
    expect(options).toEqual({ key: 'key', ttl: 10_000 });
  });
});
