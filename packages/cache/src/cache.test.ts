/* eslint-disable sonarjs/no-identical-functions */
import type { RedisClient, SetOptions } from '@devvit/redis';
import { describe, expect, test } from 'vitest';

import type { CacheHelper } from './cache.js';
import { makeCache } from './cache.js';
import type { CacheEntry, LocalCache } from './PromiseCache.js';
import { _lock, _namespaced, allowStaleFor, clientRetryDelay, retryLimit } from './PromiseCache.js';

class FakeRandomizer {
  #next: number;
  constructor(next: number = Math.random()) {
    this.#next = next;
  }

  random(): number {
    return this.#next;
  }

  set next(n: number) {
    this.#next = n;
  }
}

class Clock {
  #now: number = new Date().getTime();
  now(): Date {
    return new Date(this.#now);
  }
  advance(ms: number): Date {
    this.#now += ms;
    return this.now();
  }
}
type Stats = {
  gets: number;
};

function mockedCache(
  clock: Clock,
  randomizer: FakeRandomizer,
  stats: Stats,
  vals: { [key: string]: [value: string, expiry?: Date | undefined] } = {},
  localCache: LocalCache = {}
): CacheHelper {
  const mockRedis = {
    set: async (key: string, value: string, options?: SetOptions) => {
      const expiration = options?.expiration || new Date(clock.now().getTime() + 100000);
      if (!options?.nx) {
        vals[key] = [value, expiration];
        return 'OK';
      }
      if (vals[key]) {
        const expires = vals[key][1];
        if (expires && clock.now().getTime() > expires.getTime()) {
          vals[key] = [value, expiration];
          return 'OK';
        } else {
          return '';
        }
      } else {
        vals[key] = [value, expiration];
        return 'OK';
      }
    },
    get: async (key: string) => {
      stats.gets++;
      const val = vals[key];
      if (!val) {
        return null;
      }
      const [value, expires] = val;
      if (expires && clock.now().getTime() > expires.getTime()) {
        delete vals[key];
        return null;
      } else {
        return value;
      }
    },
    del: async (key: string) => {
      delete vals[key];
    },
    incrBy: async (key: string, incrBy: number) => {
      const expiryCheck = vals[key];
      if (expiryCheck && expiryCheck[1] && clock.now().getTime() > expiryCheck[1].getTime()) {
        delete vals[key];
      }

      const val = vals[key];
      if (!val) {
        const newVal = 1;
        vals[key] = [newVal.toString()];
        return newVal;
      }

      const newVal = Number(val[0]) + incrBy;

      vals[key] = [newVal.toString(), val[1]];

      return newVal;
    },
    expire: async (key: string, expiryInSeconds: number) => {
      const val = vals[key];

      vals[key] = [val[0], new Date(clock.now().getTime() + Math.floor(expiryInSeconds * 1000))];
    },
  } as unknown as RedisClient;
  return makeCache(mockRedis, localCache, clock, randomizer);
}

describe('cache works functionality', () => {
  test('basic try', async () => {
    const clock = new Clock();
    const random = new FakeRandomizer();
    const stats = { gets: 0 };
    const vals = {};
    const cache = mockedCache(clock, random, stats, vals);

    const val = cache(async () => 'hello', { ttl: 5, key: 'test' });
    expect(await val).toBe('hello');
  });

  test('expires', async () => {
    const clock = new Clock();
    const random = new FakeRandomizer();
    const stats = { gets: 0 };
    const vals = {};
    const cache = mockedCache(clock, random, stats, vals);

    const get = async (): Promise<number> =>
      cache(async () => clock.now().getTime(), { ttl: 5, key: 'test' });

    const orig = await get();
    clock.advance(500);
    expect(await get()).toBe(orig);
    clock.advance(5000);
    expect(await get()).not.toBe(orig);
  });

  test('sets ttl to 5s if the developer gives less (or not a number)', async () => {
    const clock = new Clock();
    const random = new FakeRandomizer();
    const stats = { gets: 0 };
    const vals = {};
    const cache = mockedCache(clock, random, stats, vals);

    const get = async (): Promise<number> =>
      cache(async () => clock.now().getTime(), { ttl: 5, key: 'test' });

    // Since we set the default to be 5s instead of the given 1s we expect the original here instead of a new object.
    const orig = await get();
    clock.advance(2_000);
    expect(await get()).toBe(orig);
  });

  test('writes through to local cache', async () => {
    const clock = new Clock();
    const random = new FakeRandomizer();
    const stats = { gets: 0 };
    const vals = {};
    const cache = mockedCache(clock, random, stats, vals);

    expect(stats.gets).toBe(0);

    const get = async (): Promise<number> =>
      cache(async () => clock.now().getTime(), { ttl: 5, key: 'test' });

    const orig = await get();
    clock.advance(500);
    expect(await get()).toBe(orig);
    expect(await get()).toBe(orig);
    expect(stats.gets).toBe(1); // because we hit the local cache not redis
  });

  test('writes through to local cache with two instances', async () => {
    const clock = new Clock();
    const random = new FakeRandomizer();
    const stats1 = { gets: 0 };
    const stats2 = { gets: 0 };
    const vals = {};
    const cache1 = mockedCache(clock, random, stats1, vals);
    const cache2 = mockedCache(clock, random, stats2, vals);

    expect(stats1.gets).toBe(0);
    expect(stats2.gets).toBe(0);

    const get1 = async (): Promise<number> =>
      cache1(async () => clock.now().getTime(), { ttl: 5, key: 'test' });
    const get2 = async (): Promise<number> =>
      cache2(async () => clock.now().getTime(), { ttl: 5, key: 'test' });

    const orig = await get1();
    clock.advance(500);
    expect(await get1()).toBe(orig);
    expect(await get1()).toBe(orig);
    expect(stats1.gets).toBe(1); // because we hit the local cache not redis
    expect(await get2()).toBe(orig);
    expect(await get2()).toBe(orig);
    expect(stats2.gets).toBe(1); // because we hit the local cache not redis
  });

  test('simultaneous', async () => {
    const clock = new Clock();
    const random = new FakeRandomizer();
    const stats = { gets: 0 };
    const vals = {};
    const cache = mockedCache(clock, random, stats, vals);
    let i = 0;

    const get = async (): Promise<number> =>
      cache(
        async () => {
          i++;
          return Math.random();
        },
        { ttl: 5, key: 'test' }
      );

    const a = get();
    const b = get();
    expect(await a).toBe(await b);
    expect(i).toBe(1);
  });

  test('optimistic refresh', async () => {
    const clock = new Clock();
    const random = new FakeRandomizer();
    const stats = { gets: 0 };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const vals: Record<string, any> = {};
    const localCache: LocalCache = {};
    const cache = mockedCache(clock, random, stats, vals, localCache);
    let inner = 'initial';

    const get = async (): Promise<string> => cache(async () => inner, { ttl: 5, key: 'test' });
    const initial = await get();
    expect(initial).toBe('initial');

    inner = 'changed';
    clock.advance(3500); // Advance 3.5s
    expect(await get()).toBe('initial'); // Should still be the initial value

    const limit = 10000; // 1% should happen in 10000 tries
    let i;
    // See if the refresh happens
    for (i = 0; i < limit; i++) {
      random.next = Math.random();
      await get();
    }
    // It should not, because we have a value in the local cache, and only redis is refreshed optimistically
    expect(await get()).toBe('initial');

    // Clear the local cache and try again
    for (const key in localCache) {
      delete localCache[key];
    }

    // Now we should probabilistically update redis since the local cache is empty and the value is about to expire
    // The TTL is 5s, we are 3.5s in, with 1.5s left, so:
    // rampProbability = #calculateRamp(5s) = 0.01 since there are 1.5s left
    random.next = 0.5; // Greater than 0.01, so we should NOT refresh redis
    expect(await get()).toBe('initial');

    // Clear the local cache (otherwise we don't hit redis and attempt to refresh it) and try again
    for (const key in localCache) {
      delete localCache[key];
    }
    random.next = 0.001; // Less than 0.01, so we should refresh redis
    expect(await get()).toBe('changed');
  });

  test('retries on failures', async () => {
    const clock = new Clock();
    const random = new FakeRandomizer();
    const stats = { gets: 0 };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const vals: Record<string, any> = {};
    const cache = mockedCache(clock, random, stats, vals);
    const key = 'test';
    const nameSpacedKey = _namespaced(key);
    let shouldFail = true;

    const get = async (): Promise<number> =>
      cache(
        async () => {
          if (shouldFail) {
            throw new Error('foo');
          }
          return Math.random();
        },
        { ttl: 10, key: 'test' }
      );
    const getSafe = async (): Promise<number | undefined> => {
      try {
        return await get();
      } catch {
        // no-op
      }
    };

    expect(await getSafe()).toBeUndefined();
    let entry: CacheEntry = JSON.parse(vals[nameSpacedKey][0]);
    expect(entry.error).toBe('foo');
    expect(entry.errorCount).toBe(1);

    const limit = 1000;

    shouldFail = false;
    let i;
    for (i = 0; i < limit; i++) {
      clock.advance(clientRetryDelay + 1);
      expect(i).toBeLessThan(limit - 1);
      const n = await getSafe();
      if (n !== undefined) {
        break;
      }
      entry = JSON.parse(vals[nameSpacedKey][0]);
      // only retrying some of the time
      expect(entry.errorCount).toBe(1);
    }
    entry = JSON.parse(vals[nameSpacedKey][0]);
    expect(entry.errorCount).toBe(0);
    expect(entry.error).toBeNull();
    expect(entry.value).toBeGreaterThan(0);
  });

  test('retries on failures doesnt retry more than limit', async () => {
    const clock = new Clock();
    const random = new FakeRandomizer();
    const stats = { gets: 0 };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const vals: Record<string, any> = {};
    const cache = mockedCache(clock, random, stats, vals);
    const key = 'test';
    const nameSpacedKey = _namespaced(key);
    const shouldFail = true;

    const get = async (): Promise<number> =>
      cache(
        async () => {
          if (shouldFail) {
            throw new Error('foo');
          }
          return Math.random();
        },
        { ttl: 10_000_000, key: 'test' }
      );
    const getSafe = async (): Promise<number | undefined> => {
      try {
        return await get();
      } catch {
        // no-op
      }
    };

    expect(await getSafe()).toBeUndefined();
    let entry: CacheEntry = JSON.parse(vals[nameSpacedKey][0]);
    expect(entry.error).toBe('foo');
    expect(entry.errorCount).toBe(1);

    let limit = 5;
    // Error retry probability is 10%, but since the clientRetryDelay hasn't passed yet, we will not retry
    random.next = 0; // Always attempt to retry
    for (let i = 0; i < limit; i++) {
      await getSafe();
    }
    entry = JSON.parse(vals[nameSpacedKey][0]);
    expect(entry.errorCount).toBe(1); // because the clientRetryDelay hasn't been reached;

    clock.advance(clientRetryDelay + 1);
    // Now we will retry once, since the clientRetryDelay has passed
    for (let i = 0; i < limit; i++) {
      await getSafe();
    }
    entry = JSON.parse(vals[nameSpacedKey][0]);
    expect(entry.errorCount).toBe(2); // because the clientRetryDelay has happened once

    // Increase the limit to verify we won't retry past the retryLimit, despite the probabilistic retry and the clientRetryDelay passing
    limit = 1000;
    for (let i = 0; i < limit; i++) {
      await getSafe();
      clock.advance(clientRetryDelay + 1);
    }

    entry = JSON.parse(vals[nameSpacedKey][0]);
    expect(entry.errorCount).toBe(retryLimit);
    expect(entry.error).toBe('foo');
    expect(entry.value).toBeNull();
  });

  test('retries on failures doesnt retry every time', async () => {
    const clock = new Clock();
    const random = new FakeRandomizer(); // always retry
    const stats = { gets: 0 };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const vals: Record<string, any> = {};
    const cache = mockedCache(clock, random, stats, vals);
    const key = 'test';
    const nameSpacedKey = _namespaced(key);
    const shouldFail = true;

    const get = async (): Promise<number> =>
      cache(
        async () => {
          if (shouldFail) {
            throw new Error('foo');
          }
          return Math.random();
        },
        { ttl: 10, key: 'test' }
      );
    const getSafe = async (): Promise<number | undefined> => {
      try {
        return await get();
      } catch {
        // no-op
      }
    };

    expect(await getSafe()).toBeUndefined();
    let entry: CacheEntry = JSON.parse(vals[nameSpacedKey][0]);
    expect(entry.error).toBe('foo');
    expect(entry.errorCount).toBe(1);

    const limit = retryLimit;
    for (let i = 0; i < limit; i++) {
      random.next = i / limit;
      await getSafe();
    }

    entry = JSON.parse(vals[nameSpacedKey][0]);
    expect(entry.errorCount).toBeLessThan(retryLimit);
    expect(entry.error).toBe('foo');
    expect(entry.value).toBeNull();
  });

  test('allows stale', async () => {
    const clock = new Clock();
    const stats = { gets: 0 };
    const random = new FakeRandomizer();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const vals: Record<string, any> = {};
    const localCache: LocalCache = {};
    const cache = mockedCache(clock, random, stats, vals, localCache);
    const key = 'test';
    let n = 0;

    const nameSpacedKey = _namespaced(key);

    const get = async (): Promise<number> =>
      cache(
        async () => {
          return n++;
        },
        { ttl: 10, key: 'test' }
      );

    expect(await get()).toBe(0);
    const entry: CacheEntry = JSON.parse(vals[nameSpacedKey][0]);
    expect(entry.expires).toBe(clock.now().getTime() + 10_000);
    const redisExpiry: Date = vals[nameSpacedKey][1];
    expect(redisExpiry.getTime()).toBe(clock.now().getTime() + 10_000 + allowStaleFor);
    clock.advance(15_000);

    expect(await get()).toBe(1);
  });

  test('allows stale, only re-fetches after delay', async () => {
    const clock = new Clock();
    const random = new FakeRandomizer();
    const stats = { gets: 0 };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const vals: Record<string, any> = {};
    const localCache: LocalCache = {};
    const cache = mockedCache(clock, random, stats, vals, localCache);
    const key = 'test';
    let n = 0;

    const get = async (): Promise<number> =>
      cache(
        async () => {
          return n++;
        },
        { ttl: 10, key: 'test' }
      );

    expect(await get()).toBe(0);
    clock.advance(12_000);
    localCache[key].checkedAt = clock.now().getTime() - 1;
    expect(await get()).toBe(0);
  });
});
