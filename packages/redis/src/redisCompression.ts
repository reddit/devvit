import { gunzipSync, gzipSync } from 'node:zlib';

import {
  type HScanResponse,
  RedisKeyScope,
  type ZMember,
  type ZScanResponse,
} from '@devvit/protos/json/devvit/plugin/redis/redisapi.js';

import { RedisClient as RedisClientImpl } from './RedisClient.js';
import type {
  BitfieldCommand,
  RedisClient,
  SetOptions,
  TxClientLike,
  ZRangeOptions,
} from './types/redis.js';

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

export class RedisCompressionProxy implements RedisClient {
  readonly global: Omit<RedisClient, 'global'>;
  readonly #client: RedisClientImpl;

  constructor(client: RedisClientImpl) {
    this.#client = client;
    this.global =
      client.scope === RedisKeyScope.INSTALLATION
        ? new RedisCompressionProxy(client.global as RedisClientImpl)
        : this;
  }

  async get(key: string): Promise<string | undefined> {
    const val = await this.#client.get(key);
    if (!val) return val;
    return val.startsWith(REDIS_COMPRESSION_PREFIX) ? decompress(val) : val;
  }

  async set(key: string, value: string, options?: SetOptions): Promise<string> {
    const compressed = compress(value);
    const toStore = compressed.length < value.length ? compressed : value;
    return this.#client.set(key, toStore, options);
  }

  async hGet(key: string, field: string): Promise<string | undefined> {
    const val = await this.#client.hGet(key, field);
    if (!val) return val;
    return val.startsWith(REDIS_COMPRESSION_PREFIX) ? decompress(val) : val;
  }

  async hSet(key: string, fieldValues: { [field: string]: string }): Promise<number> {
    const newFieldValues: Record<string, string> = {};
    for (const [field, value] of Object.entries(fieldValues)) {
      const compressed = compress(value);
      newFieldValues[field] = compressed.length < value.length ? compressed : value;
    }
    return this.#client.hSet(key, newFieldValues);
  }

  async hSetNX(key: string, field: string, value: string): Promise<number> {
    const compressed = compress(value);
    const toStore = compressed.length < value.length ? compressed : value;
    return this.#client.hSetNX(key, field, toStore);
  }

  async hGetAll(key: string): Promise<Record<string, string>> {
    const all = await this.#client.hGetAll(key);
    if (!all) {
      return all;
    }
    const result: Record<string, string> = {};
    for (const [field, value] of Object.entries(all)) {
      result[field] = value.startsWith(REDIS_COMPRESSION_PREFIX) ? decompress(value) : value;
    }
    return result;
  }

  async hMGet(key: string, fields: string[]): Promise<(string | null)[]> {
    const values = await this.#client.hMGet(key, fields);
    return values.map((val) => {
      if (val?.startsWith(REDIS_COMPRESSION_PREFIX)) {
        return decompress(val);
      }
      return val;
    });
  }

  async mGet(keys: string[]): Promise<(string | null)[]> {
    const values = await this.#client.mGet(keys);
    return values.map((val) => {
      if (val?.startsWith(REDIS_COMPRESSION_PREFIX)) {
        return decompress(val);
      }
      return val;
    });
  }

  async mSet(keyValues: { [key: string]: string }): Promise<void> {
    const newKeyValues: Record<string, string> = {};
    for (const [key, value] of Object.entries(keyValues)) {
      const compressed = compress(value);
      newKeyValues[key] = compressed.length < value.length ? compressed : value;
    }
    return this.#client.mSet(newKeyValues);
  }

  watch(...keys: string[]): Promise<TxClientLike> {
    return this.#client.watch(...keys);
  }

  getBuffer(key: string): Promise<Buffer | undefined> {
    return this.#client.getBuffer(key);
  }

  exists(...keys: string[]): Promise<number> {
    return this.#client.exists(...keys);
  }

  del(...keys: string[]): Promise<void> {
    return this.#client.del(...keys);
  }

  type(key: string): Promise<string> {
    return this.#client.type(key);
  }

  rename(key: string, newKey: string): Promise<string> {
    return this.#client.rename(key, newKey);
  }

  getRange(key: string, start: number, end: number): Promise<string> {
    return this.#client.getRange(key, start, end);
  }

  setRange(key: string, offset: number, value: string): Promise<number> {
    return this.#client.setRange(key, offset, value);
  }

  strLen(key: string): Promise<number> {
    return this.#client.strLen(key);
  }

  incrBy(key: string, value: number): Promise<number> {
    return this.#client.incrBy(key, value);
  }

  expire(key: string, seconds: number): Promise<void> {
    return this.#client.expire(key, seconds);
  }

  expireTime(key: string): Promise<number> {
    return this.#client.expireTime(key);
  }

  zAdd(key: string, ...members: ZMember[]): Promise<number> {
    return this.#client.zAdd(key, ...members);
  }

  zCard(key: string): Promise<number> {
    return this.#client.zCard(key);
  }

  zScore(key: string, member: string): Promise<number | undefined> {
    return this.#client.zScore(key, member);
  }

  zRank(key: string, member: string): Promise<number | undefined> {
    return this.#client.zRank(key, member);
  }

  zIncrBy(key: string, member: string, value: number): Promise<number> {
    return this.#client.zIncrBy(key, member, value);
  }

  zRange(
    key: string,
    start: number | string,
    stop: number | string,
    options?: ZRangeOptions
  ): Promise<{ member: string; score: number }[]> {
    return this.#client.zRange(key, start, stop, options);
  }

  zRem(key: string, members: string[]): Promise<number> {
    return this.#client.zRem(key, members);
  }

  zRemRangeByLex(key: string, min: string, max: string): Promise<number> {
    return this.#client.zRemRangeByLex(key, min, max);
  }

  zRemRangeByRank(key: string, start: number, stop: number): Promise<number> {
    return this.#client.zRemRangeByRank(key, start, stop);
  }

  zRemRangeByScore(key: string, min: number, max: number): Promise<number> {
    return this.#client.zRemRangeByScore(key, min, max);
  }

  zScan(
    key: string,
    cursor: number,
    pattern?: string | undefined,
    count?: number | undefined
  ): Promise<ZScanResponse> {
    return this.#client.zScan(key, cursor, pattern, count);
  }

  hDel(key: string, fields: string[]): Promise<number> {
    return this.#client.hDel(key, fields);
  }

  hScan(
    key: string,
    cursor: number,
    pattern?: string | undefined,
    count?: number | undefined
  ): Promise<HScanResponse> {
    return this.#client.hScan(key, cursor, pattern, count);
  }

  hKeys(key: string): Promise<string[]> {
    return this.#client.hKeys(key);
  }

  hIncrBy(key: string, field: string, value: number): Promise<number> {
    return this.#client.hIncrBy(key, field, value);
  }

  hLen(key: string): Promise<number> {
    return this.#client.hLen(key);
  }

  bitfield(
    key: string,
    ...cmds:
      | []
      | BitfieldCommand
      | [...BitfieldCommand, ...BitfieldCommand]
      | [...BitfieldCommand, ...BitfieldCommand, ...BitfieldCommand, ...(number | string)[]]
  ): Promise<number[]> {
    return this.#client.bitfield(key, ...cmds);
  }
}
