import type { RedisClient } from '@devvit/redis';
import type { JsonValue } from '@devvit/shared-types/json.js';

export type CacheEntry = {
  // The cached value, if no error occurred
  value: JsonValue | null;
  // When the cache entry expires (in milliseconds since the Unix epoch)
  expires: number;
  // The error message, if an error occurred when caching this value
  error: string | null;
  // When the above error occurred (in milliseconds since the Unix epoch)
  errorTime: number | null;
  // When we last checked this cache entry (in milliseconds since the Unix epoch)
  checkedAt: number;
  // How many consecutive errors have occurred
  errorCount: number;
};

/**
 * A class that provides a random number between 0 and 1. It is helpful to extract this for testing purposes.
 */
export type Randomizer = {
  random(): number;
};

// Isolate the random() method to avoid passing the Math package around
export const MathRandomizer: Randomizer = {
  random() {
    return Math.random();
  },
};

/**
 * A class that provides the current time. It is helpful to extract this for testing purposes.
 */
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
   * Time to live in seconds.
   */
  ttl: number;

  /**
   * Key to use for caching.
   */
  key: string;
};

export type LocalCache = { [key: string]: CacheEntry };

export function _namespaced(key: string): string {
  return `__devvit_cache_val__${key}`;
}
export function _lock(key: string): string {
  return `__devvit_cache_lock__${key}`;
}

const minTtlMsValue: number = 5_000; // milliseconds
const pollEvery: number = 300; // milliseconds
const maxPollingTimeout: number = 1_000; // milliseconds
export const retryLimit: number = 3;
const errorRetryProbability: number = 0.1;
export const clientRetryDelay: number = 1_000; // milliseconds
export const allowStaleFor: number = 30_000; // milliseconds

function _unwrap<T>(entry: CacheEntry): T {
  if (entry.error) {
    throw new Error(entry.error);
  }
  return entry.value as T;
}

/**
 * This class is responsible for managing the caching of promises. It is a layered cache, meaning it will first check
 * the local in-memory cache, then the redis cache, and finally the source of truth. It will also handle refreshing the cache according
 * to the TTL and error handling.
 *
 * The local cache is shared across all requests to a given pod, while the redis cache is shared across all requests to all pods.
 *
 * Please note that in order to prevent a stampede of requests to the source of truth, we use a lock in redis to ensure only one
 * request is made to the source of truth at a time. If the lock is obtained, the cache will be updated and the lock will be released.
 *
 * Additionally, we use a polling mechanism to fetch the cache if the lock is not obtained. This is to prevent unnecessary errors.
 *
 * Finally, we also want to prevent stampedes against redis for the lock election and the retries. We use a ramping probability to ease in the
 * attempts to get the lock, and not every error will trigger a retry.
 *
 * This means that the cache will be eventually consistent, but will not be immediately consistent. This is a tradeoff we are willing to make.
 * Additionally, this means that the TTL is not precise. The cache may be updated a bit more often than the TTL, but it will not be updated less often.
 *
 * @example
 * ```tsx
 *   import { cache, reddit } from "@devvit/web/server";
 *   export function fetchSnoovatarUrl(username: string): Promise<string> {
 *     return await cache(
 *       async () => {
 *         const url = await reddit.getSnoovatarUrl(username)
 *         console.log(`snoovatar URL cache busted for ${username}`)
 *         if (!url) {
 *           throw new Error(`Failed to fetch snoovatar URL for user ${username}`);
 *         }
 *         return url;
 *       },
 *       {
 *         key: `snoovatar_by_${username}`,
 *         ttl: 24 * 60 * 60 * 1000 // expire after one day.
 *       }
 *     );
 *   }
 * ```
 */
export class PromiseCache {
  #redis: RedisClient;
  #localCache: LocalCache;
  #clock: Clock;
  #randomizer: Randomizer;

  constructor(redis: RedisClient, localCache: LocalCache, clock: Clock, randomizer: Randomizer) {
    this.#redis = redis;
    this.#localCache = localCache;
    this.#clock = clock;
    this.#randomizer = randomizer;
  }

  /*
   * Main entry point for caching a promise.  This will first check the local cache, then the redis cache, and finally
   * call the provided closure to get the value.  It will also handle refreshing the cache according to the TTL and error handling.
   *
   * When interacting with redis, this method may run:
   * - GET __autocache__${key} to get the cached value for a given key
   * - SET __autocache__${key} ${value} to set the cached value for a given key
   * - SET __lock__${key} '1' and DEL __lock__${key} to acquire and release a lock for a given key
   */
  async cache<T extends JsonValue>(closure: () => Promise<T>, options: CacheOptions): Promise<T> {
    const { key } = options;
    let ttlMs = options.ttl * 1000; // convert to milliseconds without mutating the original options object
    if (ttlMs < minTtlMsValue) {
      console.warn(
        `Cache TTL cannot be less than ${minTtlMsValue / 1000} seconds! Updating ttl value to ${minTtlMsValue / 1000} seconds.`
      );
      ttlMs = minTtlMsValue;
    }

    const localCachedAnswer = this.#localCachedAnswer<T>(key);
    if (localCachedAnswer !== undefined) {
      return localCachedAnswer;
    }
    const existing = await this.#redisEntry(key);
    const entry = await this.#maybeRefreshCache(key, ttlMs, existing, closure);

    return _unwrap(entry);
  }

  /**
   * Get the value from the local cache if it exists and is not expired.  We're willing to retry errors, and we're willing
   * to throw errors if we have them in cache.
   *
   * We don't want to retry excessively, so we have a limit on the number of retries.  If someone else has retried in the last
   * clientRetryDelay, let's not retry again.  We also have a probability of retrying, so we don't retry every time.
   */
  #localCachedAnswer<T extends JsonValue>(key: string): T | undefined {
    const val = this.#localCache[key];
    if (val) {
      const now = this.#clock.now().getTime();
      const hasRetryableError =
        val?.error &&
        val?.errorTime &&
        val.errorCount < retryLimit &&
        this.#randomizer.random() < errorRetryProbability &&
        val.errorTime + clientRetryDelay < now;
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
  async #maybeRefreshCache<T extends JsonValue>(
    key: string,
    ttlMs: number,
    entry: CacheEntry | undefined,
    closure: () => Promise<T>
  ): Promise<CacheEntry> {
    const expires = entry?.expires;
    const rampProbability = expires ? this.#calculateRamp(expires) : 1;
    if (
      !entry ||
      (entry?.error &&
        entry.errorCount < retryLimit &&
        errorRetryProbability > this.#randomizer.random()) ||
      rampProbability > this.#randomizer.random()
    ) {
      return this.#refreshCache(key, ttlMs, entry, closure);
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
  async #refreshCache<T extends JsonValue>(
    key: string,
    ttlMs: number,
    entry: CacheEntry | undefined,
    closure: () => Promise<T>
  ): Promise<CacheEntry> {
    const lockKey = _lock(key);
    const now = this.#clock.now().getTime();

    /**
     * The write lock should last for a while, but not the full TTL.  Hopefully write attempts settle down after a while.
     */
    const lockExpiration = new Date(now + ttlMs / 2);

    const lockObtained = await this.#redis.set(lockKey, '1', {
      expiration: lockExpiration,
      nx: true,
    });
    if (lockObtained) {
      return this.#updateCache(key, entry, closure, ttlMs);
    } else if (entry) {
      // This entry is still valid, return it
      return entry;
    } else {
      const start = this.#clock.now();
      return this.#pollForCache(start, key, ttlMs);
    }
  }

  async #pollForCache(start: Date, key: string, ttlMs: number): Promise<CacheEntry> {
    const pollingTimeout = Math.min(ttlMs, maxPollingTimeout);
    const existing = await this.#redisEntry(key);
    if (existing) {
      return existing;
    }

    if (this.#clock.now().getTime() - start.getTime() >= pollingTimeout) {
      throw new Error(`Cache request timed out trying to get data at key: ${key}`);
    }

    await new Promise((resolve) => setTimeout(resolve, pollEvery));
    return this.#pollForCache(start, key, ttlMs);
  }

  /**
   * Actually update the cache.  This is the method that will be called if we have the lock.
   */
  async #updateCache<T extends JsonValue>(
    key: string,
    entry: CacheEntry | undefined,
    closure: () => Promise<T>,
    ttlMs: number
  ): Promise<CacheEntry> {
    const expires = this.#clock.now().getTime() + ttlMs;
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
    } catch (err) {
      entry.value = null;
      entry.error = err instanceof Error ? err.message : 'unknown error';
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
}
