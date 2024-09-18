import type { JSONValue } from '@devvit/shared-types/json.js';

import type { RedisClient } from '../../types/redis.js';
import type { BlocksReconciler } from './blocks/BlocksReconciler.js';
import type { CacheOptions, Clock, LocalCache } from './promise_cache.js';
import { PromiseCache, SystemClock } from './promise_cache.js';

export type CacheHelper = <T extends JSONValue>(
  fn: () => Promise<T>,
  options: CacheOptions
) => Promise<T>;

export function makeCache(
  redis: RedisClient,
  state: Partial<BlocksReconciler['state']> & { __cache?: LocalCache },
  clock: Clock = SystemClock
): CacheHelper {
  const pc = new PromiseCache(redis, state, clock);
  return pc.cache.bind(pc);
}
