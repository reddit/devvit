import { cache as cacheWithSeconds } from '@devvit/cache';

import type { JSONValue } from '../../types/json.js';

export type CacheOptions = {
  /** Time to live in milliseconds. */
  ttl: number;
  /** Key to use for caching. */
  key: string;
};

export type CacheHelper = <T extends JSONValue>(
  fn: () => Promise<T>,
  options: CacheOptions
) => Promise<T>;

export const cache: CacheHelper = (fn, options) =>
  cacheWithSeconds(fn, { ...options, ttl: options.ttl / 1000 });
