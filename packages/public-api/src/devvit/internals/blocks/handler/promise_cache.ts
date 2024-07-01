import type { JSONValue, RedisClient } from '../../../../index.js';

export type CacheEntry = {
  value: JSONValue | null;
  expires: number; // Timestamp in milliseconds
  error: string | null;
  errorTime: number | null;
  checkedAt: number;
  errorCount: number;
};

export type Clock = {
  now(): Date;
};

export const SystemClock: Clock = {
  now() {
    return new Date();
  },
};

export type CacheOptions = {
  /**
   * Time to live in milliseconds.
   */
  ttl: number;

  /**
   * Key to use for caching.
   */
  key: string;
};

export type LocalCache = { [key: string]: CacheEntry };

export function _namespaced(key: string): string {
  return `__autocache__${key}`;
}
export function _lock(key: string): string {
  return `__lock__${key}`;
}

const pollEvery = 300; // milli
const maxPollingTimeout = 1000; // milli
const minTtlValue = 5000;
export const retryLimit = 3;
const errorRetryProbability = 0.1;
export const clientRetryDelay = 1000;
export const allowStaleFor = 30_000;

type WithLocalCache = {
  __cache?: LocalCache;
};

function _unwrap<T>(entry: CacheEntry): T {
  if (entry.error) {
    throw new Error(entry.error);
  }
  return entry.value as T;
}

/**
 * Refactored out into a class to allow for easier testing and clarity of purpose.
 *
 * This class is responsible for managing the caching of promises. It is a layered cache, meaning it will first check
 * the local cache, then the redis cache, and finally the source of truth. It will also handle refreshing the cache according
 * to the TTL and error handling.
 *
 * Please note that in order to prevent a stampede of requests to the source of truth, we use a lock in redis to ensure only one
 * request is made to the source of truth at a time.  If the lock is obtained, the cache will be updated and the lock will be released.
 *
 * Additionally, we use a polling mechanism to fetch the cache if the lock is not obtained.  This is to prevent unnecessary errors.
 *
 * Finally, we also want to prevent stampedes against redis for the lock election and the retries.  We use a ramping probability to ease in the
 * attempts to get the lock, and not every error will trigger a retry.
 *
 * This means that the cache will be eventually consistent, but will not be immediately consistent. This is a tradeoff we are willing to make.
 * Additionally, this means that the TTL is not precice.  The cache may be updated a bit more often than the TTL, but it will not be updated less often.
 *
 */
export class PromiseCache {
  #redis: RedisClient;
  /**
   * LocalCache is just an aliased reference to this.#state. Mutations to
   * this object will also mutate this.#state
   */
  #localCache: LocalCache = {};
  #clock: Clock;
  #state: WithLocalCache;

  constructor(redis: RedisClient, state: WithLocalCache, clock: Clock = SystemClock) {
    this.#redis = redis;
    this.#state = state;
    this.#clock = clock;
  }

  /**
   * This is the public API for the cache.  Call this method to cache a promise.
   *
   * @param closure
   * @param options
   * @returns
   */
  async cache<T extends JSONValue>(closure: () => Promise<T>, options: CacheOptions): Promise<T> {
    this.#state.__cache ??= {};
    this.#localCache = this.#state.__cache;

    this.#enforceTTL(options);

    const localCachedAnswer = this.#localCachedAnswer<T>(options.key);
    if (localCachedAnswer !== undefined) {
      return localCachedAnswer;
    }

    const existing = await this.#redisEntry(options.key);
    const entry = await this.#maybeRefreshCache(options, existing, closure);

    return _unwrap(entry);
  }

  /**
   * Get the value from the local cache if it exists and is not expired.  We're willing to retry errors, and we're willing
   * to throw errors if we have them in cache.
   *
   * We don't want to retry excessively, so we have a limit on the number of retries.  If someone else has retried in the last
   * clientRetryDelay, let's not retry again.  We also have a probability of retrying, so we don't retry every time.
   */
  #localCachedAnswer<T extends JSONValue>(key: string): T | undefined {
    const val = this.#localCache[key];
    if (val) {
      const now = this.#clock.now().getTime();
      const hasRetryableError =
        val?.error &&
        val?.errorTime &&
        val.errorCount < retryLimit &&
        Math.random() < errorRetryProbability &&
        val.errorTime! + clientRetryDelay < now;
      const expired = val?.expires && val.expires < now && val.checkedAt + clientRetryDelay < now;
      if (expired || hasRetryableError) {
        delete this.#localCache[key];
        return undefined;
      } else {
        return _unwrap(val);
      }
    }
    return undefined;
  }

  /**
   * If we've bothered to check redis, we're already on the backend.  Let's see if the cache either (1) contains an error, (2)
   * is expired, (3) is missing, or (4) is about to expire.  If any of these are true, we'll refresh the cache based on heuristics.
   *
   * We'll always refresh if missing or expired, but its probabilistic if we'll refresh if about to expire or if we have an error.
   */
  async #maybeRefreshCache<T extends JSONValue>(
    options: CacheOptions,
    entry: CacheEntry | undefined,
    closure: () => Promise<T>
  ): Promise<CacheEntry> {
    const expires = entry?.expires;
    const rampProbability = expires ? this.#calculateRamp(expires) : 1;
    if (
      !entry ||
      (entry?.error && entry.errorCount < retryLimit && errorRetryProbability > Math.random()) ||
      rampProbability > Math.random()
    ) {
      return this.#refreshCache(options, entry, closure);
    } else {
      return entry!;
    }
  }

  /**
   * The conditions for refreshing the cache are handled in the calling method, which should be
   * #maybeRefreshCache.
   *
   * If you don't win the lock, you'll poll for the cache.  If you don't get the cache within maxPollingTimeout, you'll throw an error.
   */
  async #refreshCache<T extends JSONValue>(
    options: CacheOptions,
    entry: CacheEntry | undefined,
    closure: () => Promise<T>
  ): Promise<CacheEntry> {
    const lockKey = _lock(options.key);
    const now = this.#clock.now().getTime();

    /**
     * The write lock should last for a while, but not the full TTL.  Hopefully write attempts settle down after a while.
     */
    const lockExpiration = new Date(now + options.ttl / 2);

    const lockObtained = await this.#redis.set(lockKey, '1', {
      expiration: lockExpiration,
      nx: true,
    });
    if (lockObtained) {
      return this.#updateCache(options.key, entry, closure, options.ttl);
    } else if (entry) {
      // This entry is still valid, return it
      return entry;
    } else {
      const start = this.#clock.now();
      return this.#pollForCache(start, options.key, options.ttl);
    }
  }

  async #pollForCache(start: Date, key: string, ttl: number): Promise<CacheEntry> {
    const pollingTimeout = Math.min(ttl, maxPollingTimeout);
    const existing = await this.#redisEntry(key);
    if (existing) {
      return existing;
    }

    if (this.#clock.now().getTime() - start.getTime() >= pollingTimeout) {
      throw new Error(`Cache request timed out trying to get data at key: ${key}`);
    }

    await new Promise((resolve) => setTimeout(resolve, pollEvery));
    return this.#pollForCache(start, key, ttl);
  }

  /**
   * Actually update the cache.  This is the method that will be called if we have the lock.
   */
  async #updateCache<T extends JSONValue>(
    key: string,
    entry: CacheEntry | undefined,
    closure: () => Promise<T>,
    ttl: number
  ): Promise<CacheEntry> {
    const expires = this.#clock.now().getTime() + ttl;
    entry = entry ?? {
      value: null,
      expires,
      errorCount: 0,
      error: null,
      errorTime: null,
      checkedAt: 0,
    };
    try {
      entry.value = await closure();
      entry.error = null;
      entry.errorCount = 0;
      entry.errorTime = null;
    } catch (e) {
      entry.value = null;
      entry.error = (e as Error).message ?? 'Unknown error';
      entry.errorTime = this.#clock.now().getTime();
      entry.errorCount++;
    }

    this.#localCache[key] = entry;

    await this.#redis.set(_namespaced(key), JSON.stringify(entry), {
      expiration: new Date(expires + allowStaleFor),
    });

    /**
     * Unlocking will allow retries to happen if there was an error.  Otherwise we don't unlock, because the lock
     * will expire on its own.
     */
    if (entry.error && entry.errorCount < retryLimit) {
      await this.#redis.del(_lock(key));
    }

    return entry;
  }

  /**
   * This is the schedule for optimistic pre-fetch of an about-to-expire cache.  It exponentially ramps in, which hopefully provides
   * a degree of flexibility in the face of varying traffic levels.
   */
  #calculateRamp(expiry: number): number {
    const now = this.#clock.now().getTime();
    const remaining = expiry - now;

    if (remaining < 0) {
      return 1;
    } else if (remaining < 1000) {
      return 0.1;
    } else if (remaining < 2000) {
      return 0.01;
    } else if (remaining < 3000) {
      return 0.001;
    } else {
      return 0;
    }
  }

  async #redisEntry(key: string): Promise<CacheEntry | undefined> {
    const val = await this.#redis.get(_namespaced(key));
    if (val) {
      const entry = JSON.parse(val) as CacheEntry;
      entry.checkedAt = this.#clock.now().getTime();
      this.#localCache[key] = entry;
      return entry;
    }
    return undefined;
  }

  #enforceTTL(options: CacheOptions): void {
    if (options.ttl < minTtlValue) {
      console.warn(
        `Cache TTL cannot be less than ${minTtlValue} milliseconds! Updating ttl value of ${options.ttl} to ${minTtlValue}.`
      );
      options.ttl = minTtlValue;
    }
  }
}
