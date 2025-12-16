import { RedisClient as RedisClientImpl } from './RedisClient.js';
import { RedisCompressionProxy } from './redisCompression.js';
import { type RedisClient, RedisKeyScope } from './types/redis.js';

export * from './types/redis.js';

const redisClientImpl: RedisClientImpl = new RedisClientImpl(RedisKeyScope.INSTALLATION);
export const redis: RedisClient = redisClientImpl;

/**
 * Drop-in replacement for the standard Devvit `redis` client that transparently handles
 * compression and decompression of values.
 *
 * Usage:
 * Instead of:
 *   import { redis } from '@devvit/redis';
 *
 * Use:
 *   import { redisCompressed as redis } from '@devvit/redis';
 *
 * It automatically:
 * - Compresses values on write (set, hSet, mSet, etc.) if it saves space
 * - Decompresses values on read (get, hGet, mGet, etc.)
 *
 * For globally scoped data (`RedisClient.global`), all versions of the app
 * across all subreddit installations must use compression or not.
 *
 * @experimental
 */
export const redisCompressed: RedisClient = new RedisCompressionProxy(redisClientImpl);
