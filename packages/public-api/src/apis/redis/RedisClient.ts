import { RedisClientImplementation, RedisKeyScope, TxClientImplementation } from '@devvit/redis';

import type { RedisClient as RedisClientLike, TxClientLike } from '../../types/redis.js';

export class TxClient extends TxClientImplementation implements TxClientLike {
  strlen(key: string): Promise<this> {
    return this.strLen(key);
  }

  mget(keys: string[]): Promise<this> {
    return this.mGet(keys);
  }

  mset(keyValues: { [key: string]: string }): Promise<this> {
    return this.mSet(keyValues);
  }

  hset(key: string, fieldValues: { [field: string]: string }): Promise<this> {
    return this.hSet(key, fieldValues);
  }

  hget(key: string, field: string): Promise<this> {
    return this.hGet(key, field);
  }

  hgetall(key: string): Promise<this> {
    return this.hGetAll(key);
  }

  hdel(key: string, fields: string[]): Promise<this> {
    return this.hDel(key, fields);
  }

  hscan(
    key: string,
    cursor: number,
    pattern?: string | undefined,
    count?: number | undefined
  ): Promise<this> {
    return this.hScan(key, cursor, pattern, count);
  }

  hkeys(key: string): Promise<this> {
    return this.hKeys(key);
  }

  hincrby(key: string, field: string, value: number): Promise<this> {
    return this.hIncrBy(key, field, value);
  }

  hlen(key: string): Promise<this> {
    return this.hLen(key);
  }
}

export class RedisClient extends RedisClientImplementation implements RedisClientLike {
  override readonly global: Omit<RedisClientLike, 'global'>;

  constructor(scope: RedisKeyScope) {
    super(scope);
    this.global =
      scope === RedisKeyScope.INSTALLATION ? new RedisClient(RedisKeyScope.GLOBAL) : this;
  }

  override async watch(...keys: string[]): Promise<TxClient> {
    const plugin = this.plugin;
    const metadata = this.metadata;
    const transactionId = await plugin.Watch({ keys }, metadata);
    return new TxClient(plugin, transactionId, metadata);
  }

  strlen(key: string): Promise<number> {
    return this.strLen(key);
  }

  mget(keys: string[]): Promise<(string | null)[]> {
    return this.mGet(keys);
  }

  mset(keyValues: { [key: string]: string }): Promise<void> {
    return this.mSet(keyValues);
  }

  hset(key: string, fieldValues: { [field: string]: string }): Promise<number> {
    return this.hSet(key, fieldValues);
  }

  hget(key: string, field: string): Promise<string | undefined> {
    return this.hGet(key, field);
  }

  hgetall(key: string): Promise<Record<string, string>> {
    return this.hGetAll(key);
  }

  hdel(key: string, fields: string[]): Promise<number> {
    return this.hDel(key, fields);
  }

  hscan(key: string, cursor: number, pattern?: string | undefined, count?: number | undefined) {
    return this.hScan(key, cursor, pattern, count);
  }

  hkeys(key: string): Promise<string[]> {
    return this.hKeys(key);
  }

  hincrby(key: string, field: string, value: number): Promise<number> {
    return this.hIncrBy(key, field, value);
  }

  hlen(key: string): Promise<number> {
    return this.hLen(key);
  }
}

export const redis: RedisClientLike = new RedisClient(RedisKeyScope.INSTALLATION);
