import { gunzipSync, gzipSync } from 'node:zlib';

import { redis } from './RedisClient.js';
import type { SetOptions } from './types/redis.js';

// Envelope parameters
const COMPRESSION_ALGO = 'gz';
const ENCODING_ALGO = 'b64';

// Envelope format: __<compression>:<encoding>__:
// We use a structured envelope to allow for future changes in compression/encoding
// while keeping the prefix small and unlikely to collide with user data.
export const REDIS_COMPRESSION_PREFIX = `__${COMPRESSION_ALGO}:${ENCODING_ALGO}__:` as const;

// Set a safe threshold where compression is unlikely to be beneficial.
const MIN_COMPRESSION_LENGTH = 80;

const compress = (value: string): string => {
  if (value.length < MIN_COMPRESSION_LENGTH) return value;

  try {
    const compressed = gzipSync(value);
    return `${REDIS_COMPRESSION_PREFIX}${compressed.toString('base64')}`;
  } catch {
    return value;
  }
};

const decompress = (value: string): string => {
  if (!value.startsWith(REDIS_COMPRESSION_PREFIX)) return value;

  try {
    const buffer = Buffer.from(value.slice(REDIS_COMPRESSION_PREFIX.length), 'base64');
    return gunzipSync(buffer as unknown as Uint8Array).toString('utf-8');
  } catch {
    return value;
  }
};

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
 * @experimental
 */
export const redisCompressed = new Proxy(redis, {
  get(target, prop, receiver) {
    if (prop === 'get') {
      return async (key: string) => {
        const val = await target.get(key);
        if (!val) return val;
        return val.startsWith(REDIS_COMPRESSION_PREFIX) ? decompress(val) : val;
      };
    }

    if (prop === 'set') {
      return async (key: string, value: string, options?: SetOptions) => {
        const compressed = compress(value);
        // Only store compressed if it saves space
        const toStore = compressed.length < value.length ? compressed : value;
        return target.set(key, toStore, options);
      };
    }

    if (prop === 'hGet') {
      return async (key: string, field: string) => {
        const val = await target.hGet(key, field);
        if (!val) return val;
        return val.startsWith(REDIS_COMPRESSION_PREFIX) ? decompress(val) : val;
      };
    }

    if (prop === 'hSet') {
      return async (key: string, fieldValues: Record<string, string>) => {
        const newFieldValues: Record<string, string> = {};
        for (const [field, value] of Object.entries(fieldValues)) {
          const compressed = compress(value);
          newFieldValues[field] = compressed.length < value.length ? compressed : value;
        }
        return target.hSet(key, newFieldValues);
      };
    }

    if (prop === 'hSetNX') {
      return async (key: string, field: string, value: string) => {
        const compressed = compress(value);
        const toStore = compressed.length < value.length ? compressed : value;
        return target.hSetNX(key, field, toStore);
      };
    }

    if (prop === 'hGetAll') {
      return async (key: string) => {
        const all = await target.hGetAll(key);
        if (!all) {
          return all;
        }
        const result: Record<string, string> = {};
        for (const [field, value] of Object.entries(all)) {
          result[field] = value.startsWith(REDIS_COMPRESSION_PREFIX) ? decompress(value) : value;
        }
        return result;
      };
    }

    if (prop === 'hMGet') {
      return async (key: string, fields: string[]) => {
        const values = await target.hMGet(key, fields);
        return values.map((val) => {
          if (val?.startsWith(REDIS_COMPRESSION_PREFIX)) {
            return decompress(val);
          }
          return val;
        });
      };
    }

    if (prop === 'mGet') {
      return async (keys: string[]) => {
        const values = await target.mGet(keys);
        return values.map((val) => {
          if (val?.startsWith(REDIS_COMPRESSION_PREFIX)) {
            return decompress(val);
          }
          return val;
        });
      };
    }

    if (prop === 'mSet') {
      return async (keyValues: Record<string, string>) => {
        const newKeyValues: Record<string, string> = {};
        for (const [key, value] of Object.entries(keyValues)) {
          const compressed = compress(value);
          newKeyValues[key] = compressed.length < value.length ? compressed : value;
        }
        return target.mSet(newKeyValues);
      };
    }

    // Forward any other properties/methods to the original redis client.
    // Crucial: We must bind functions to the target because the Devvit redis client
    // uses private class members (internal slots). If we call them with 'this'
    // set to the Proxy (default behavior), it throws "TypeError: Cannot read private member...".
    const value = Reflect.get(target, prop, receiver);
    return typeof value === 'function' ? value.bind(target) : value;
  },
});
