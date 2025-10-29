import { redis, type RedisClient } from '@devvit/redis';
import type { JsonValue } from '@devvit/shared-types/json.js';

import type { CacheOptions, Clock, LocalCache, Randomizer } from './PromiseCache.js';
import { MathRandomizer, PromiseCache, SystemClock } from './PromiseCache.js';

export type CacheHelper = <T extends JsonValue>(
  fn: () => Promise<T>,
  options: CacheOptions
) => Promise<T>;

/**
 * @internal
 */
export function makeCache(
  redis: RedisClient,
  localCache: LocalCache,
  clock: Clock,
  randomizer: Randomizer
): CacheHelper {
  const pc = new PromiseCache(redis, localCache, clock, randomizer);
  return pc.cache.bind(pc);
}

export const cache: CacheHelper = makeCache(redis, {}, SystemClock, MathRandomizer);
