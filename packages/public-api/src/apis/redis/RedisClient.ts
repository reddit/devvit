import type {
  RedisAPI,
  Metadata,
  TransactionId,
  ZMember,
  HScanRequest,
  HScanResponse,
  ZScanRequest,
  ZScanResponse,
} from '@devvit/protos';
import { RedisKeyScope } from '@devvit/protos';
import { Devvit } from '../../devvit/Devvit.js';
import type {
  RedisClient as RedisClientLike,
  TxClientLike,
  SetOptions,
  ZRangeOptions,
} from '../../types/redis.js';

function isRedisNilError(e: unknown): boolean {
  // TODO: Replace with impl in a Gatsby-only world
  //return e && e.details === 'redis: nil';

  if (
    e &&
    typeof e === 'object' &&
    'message' in e &&
    e.message !== undefined &&
    typeof e.message === 'string'
  ) {
    return e.message.includes('redis: nil');
  } else {
    return false;
  }
}

export class TxClient implements TxClientLike {
  #storage: RedisAPI;
  #transactionId: TransactionId;
  #metadata: Metadata | undefined;

  constructor(storage: RedisAPI, transactionId: TransactionId, metadata: Metadata) {
    this.#storage = storage;
    this.#transactionId = transactionId;
    this.#metadata = metadata;
  }

  async get(key: string): Promise<TxClientLike> {
    await this.#storage.Get({ key: key, transactionId: this.#transactionId }, this.#metadata);
    return this;
  }

  async multi(): Promise<void> {
    await this.#storage.Multi(this.#transactionId, this.#metadata);
  }

  async set(key: string, value: string, options?: SetOptions): Promise<TxClientLike> {
    let expiration;
    if (options?.expiration) {
      expiration = Math.floor((options.expiration.getTime() - Date.now()) / 1000); // convert to seconds
      if (expiration < 1) {
        expiration = 1; // minimum expiration is 1 second, clock skew can cause issues, so let's set 1 second.
      }
    }
    await this.#storage.Set(
      {
        key,
        value,
        nx: options?.nx === true,
        xx: options?.xx === true,
        expiration: expiration || 0,
        transactionId: this.#transactionId,
      },
      this.#metadata
    );
    return this;
  }

  async del(...keys: string[]): Promise<TxClientLike> {
    await this.#storage.Del({ keys: keys, transactionId: this.#transactionId }, this.#metadata);
    return this;
  }

  async type(key: string): Promise<TxClientLike> {
    await this.#storage.Type({ key: key, transactionId: this.#transactionId }, this.#metadata);
    return this;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async exec(): Promise<any[]> {
    const response = await this.#storage.Exec(this.#transactionId, this.#metadata);
    // eslint-disable-next-line
    let output: any[] = [];
    for (const result of response.response) {
      if (result.members) {
        output.push(result.members);
      } else if (result.nil !== undefined) {
        output.push(null);
      } else if (result.num !== undefined) {
        output.push(result.num);
      } else if (result.values !== undefined) {
        output.push(result.values.values);
      } else if (result.str !== undefined) {
        output.push(result.str);
      }
    }
    return output;
  }

  async discard(): Promise<void> {
    await this.#storage.Discard(this.#transactionId, this.#metadata);
  }

  async watch(...keys: string[]): Promise<TxClientLike> {
    await this.#storage.Watch({ keys: keys, transactionId: this.#transactionId }, this.#metadata);
    return this;
  }

  async unwatch(): Promise<TxClientLike> {
    await this.#storage.Unwatch(this.#transactionId, this.#metadata);
    return this;
  }

  async getRange(key: string, start: number, end: number): Promise<TxClientLike> {
    await this.#storage.GetRange(
      { key, start, end, transactionId: this.#transactionId },
      this.#metadata
    );
    return this;
  }
  async setRange(key: string, offset: number, value: string): Promise<TxClientLike> {
    await this.#storage.SetRange(
      { key, offset, value, transactionId: this.#transactionId },
      this.#metadata
    );
    return this;
  }

  async strlen(key: string): Promise<TxClientLike> {
    return this.strLen(key);
  }

  async strLen(key: string): Promise<TxClientLike> {
    await this.#storage.Strlen({ key, transactionId: this.#transactionId }, this.#metadata);
    return this;
  }

  async mget(keys: string[]): Promise<TxClientLike> {
    return this.mGet(keys);
  }

  async mGet(keys: string[]): Promise<TxClientLike> {
    await this.#storage.MGet({ keys, transactionId: this.#transactionId }, this.#metadata);
    return this;
  }

  async mset(keyValues: { [key: string]: string }): Promise<TxClientLike> {
    return this.mSet(keyValues);
  }

  async mSet(keyValues: { [key: string]: string }): Promise<TxClientLike> {
    const kv = Object.entries(keyValues).map(([key, value]) => ({ key, value }));
    await this.#storage.MSet({ kv, transactionId: this.#transactionId }, this.#metadata);
    return this;
  }

  async incrBy(key: string, value: number): Promise<TxClientLike> {
    await this.#storage.IncrBy({ key, value, transactionId: this.#transactionId }, this.#metadata);
    return this;
  }

  async expire(key: string, seconds: number): Promise<TxClientLike> {
    await this.#storage.Expire(
      { key, seconds, transactionId: this.#transactionId },
      this.#metadata
    );
    return this;
  }

  async expireTime(key: string): Promise<TxClientLike> {
    await this.#storage.ExpireTime({ key, transactionId: this.#transactionId }, this.#metadata);
    return this;
  }

  async zAdd(key: string, ...members: ZMember[]): Promise<TxClientLike> {
    await this.#storage.ZAdd({ key, members, transactionId: this.#transactionId }, this.#metadata);
    return this;
  }

  async zScore(key: string, member: string): Promise<TxClientLike> {
    await this.#storage.ZScore(
      { key: { key, transactionId: this.#transactionId }, member },
      this.#metadata
    );
    return this;
  }

  async zRank(key: string, member: string): Promise<TxClientLike> {
    await this.#storage.ZRank(
      { key: { key, transactionId: this.#transactionId }, member },
      this.#metadata
    );
    return this;
  }

  async zIncrBy(key: string, member: string, value: number): Promise<TxClientLike> {
    await this.#storage.ZIncrBy(
      { key, member, value, transactionId: this.#transactionId },
      this.#metadata
    );
    return this;
  }

  async zScan(
    key: string,
    cursor: number,
    pattern?: string | undefined,
    count?: number | undefined
  ): Promise<TxClientLike> {
    const request: ZScanRequest = {
      key,
      cursor,
      pattern,
      count,
      transactionId: this.#transactionId,
    };
    await this.#storage.ZScan(request, this.#metadata);
    return this;
  }

  async zCard(key: string): Promise<TxClientLike> {
    await this.#storage.ZCard({ key, transactionId: this.#transactionId }, this.#metadata);
    return this;
  }

  async zRange(
    key: string,
    start: number | string,
    stop: number | string,
    options?: ZRangeOptions
  ): Promise<TxClientLike> {
    // eslint-disable-next-line
    let opts = { rev: false, byLex: false, byScore: false, offset: 0, count: 1000 };
    if (options?.reverse) {
      opts.rev = options.reverse;
    }
    if (options?.by === 'lex') {
      opts.byLex = true;
    } else if (options?.by === 'score') {
      opts.byScore = true;
    }
    await this.#storage.ZRange(
      {
        key: { key: key, transactionId: this.#transactionId },
        start: start + '',
        stop: stop + '',
        ...opts,
      },
      this.#metadata
    );
    return this;
  }

  async zRem(key: string, members: string[]): Promise<TxClientLike> {
    await this.#storage.ZRem(
      { key: { key, transactionId: this.#transactionId }, members: members },
      this.#metadata
    );
    return this;
  }

  async zRemRangeByLex(key: string, min: string, max: string): Promise<TxClientLike> {
    await this.#storage.ZRemRangeByLex(
      { key: { key, transactionId: this.#transactionId }, min: min, max: max },
      this.#metadata
    );
    return this;
  }

  async zRemRangeByRank(key: string, start: number, stop: number): Promise<TxClientLike> {
    await this.#storage.ZRemRangeByRank(
      { key: { key, transactionId: this.#transactionId }, start: start, stop: stop },
      this.#metadata
    );
    return this;
  }

  async zRemRangeByScore(key: string, min: number, max: number): Promise<TxClientLike> {
    await this.#storage.ZRemRangeByScore(
      { key: { key, transactionId: this.#transactionId }, min: min, max: max },
      this.#metadata
    );
    return this;
  }

  async hgetall(key: string): Promise<TxClientLike> {
    return this.hGetAll(key);
  }

  async hGetAll(key: string): Promise<TxClientLike> {
    await this.#storage.HGetAll({ key, transactionId: this.#transactionId }, this.#metadata);
    return this;
  }

  async hget(key: string, field: string): Promise<TxClientLike> {
    return this.hGet(key, field);
  }

  async hGet(key: string, field: string): Promise<TxClientLike> {
    await this.#storage.HGet(
      { key: key, field: field, transactionId: this.#transactionId },
      this.#metadata
    );
    return this;
  }

  async hset(key: string, fieldValues: { [field: string]: string }): Promise<TxClientLike> {
    return this.hSet(key, fieldValues);
  }

  async hSet(key: string, fieldValues: { [field: string]: string }): Promise<TxClientLike> {
    const fv = Object.entries(fieldValues).map(([field, value]) => ({ field, value }));
    await this.#storage.HSet({ key, fv, transactionId: this.#transactionId }, this.#metadata);
    return this;
  }

  async hincrby(key: string, field: string, value: number): Promise<TxClientLike> {
    return this.hIncrBy(key, field, value);
  }

  async hIncrBy(key: string, field: string, value: number): Promise<TxClientLike> {
    await this.#storage.HIncrBy(
      { key, field, value, transactionId: this.#transactionId },
      this.#metadata
    );
    return this;
  }

  async hdel(key: string, fields: string[]): Promise<TxClientLike> {
    return this.hDel(key, fields);
  }

  async hDel(key: string, fields: string[]): Promise<TxClientLike> {
    await this.#storage.HDel({ key, fields, transactionId: this.#transactionId }, this.#metadata);
    return this;
  }

  async hscan(
    key: string,
    cursor: number,
    pattern?: string | undefined,
    count?: number | undefined
  ): Promise<TxClientLike> {
    return this.hScan(key, cursor, pattern, count);
  }

  async hScan(
    key: string,
    cursor: number,
    pattern?: string | undefined,
    count?: number | undefined
  ): Promise<TxClientLike> {
    const request: HScanRequest = {
      key,
      cursor,
      pattern,
      count,
      transactionId: this.#transactionId,
    };
    await this.#storage.HScan(request, this.#metadata);
    return this;
  }

  async hkeys(key: string): Promise<TxClientLike> {
    return this.hKeys(key);
  }

  async hKeys(key: string): Promise<TxClientLike> {
    await this.#storage.HKeys({ key, transactionId: this.#transactionId }, this.#metadata);
    return this;
  }

  async hlen(key: string): Promise<TxClientLike> {
    return this.hLen(key);
  }

  async hLen(key: string): Promise<TxClientLike> {
    await this.#storage.HLen({ key, transactionId: this.#transactionId }, this.#metadata);
    return this;
  }
}

/**
 * This is a subset of the overall Redis API.  You should be able to look up https://redis.io/commands
 * for more details on each command.
 *
 * For the moment, we've implemented a lot of the basic string/number commands, sorted sets, and transactions.
 * This is the most powerful subset and the safest.
 */
export class RedisClient implements RedisClientLike {
  readonly #metadata: Metadata;
  readonly #storage: RedisAPI | undefined;
  readonly scope: RedisKeyScope;
  readonly global: Omit<RedisClientLike, 'global'>;

  constructor(
    metadata: Metadata,
    storage: RedisAPI | undefined = undefined,
    scope: RedisKeyScope = RedisKeyScope.INSTALLATION
  ) {
    this.#metadata = metadata;
    this.#storage = storage;
    this.scope = scope;
    this.global =
      scope === RedisKeyScope.INSTALLATION
        ? new RedisClient(this.#metadata, this.#storage, RedisKeyScope.GLOBAL)
        : this;
  }

  get storage(): RedisAPI {
    return this.#storage || Devvit.redisPlugin;
  }

  async watch(...keys: string[]): Promise<TxClientLike> {
    const txId = await this.storage.Watch({ keys }, this.#metadata);
    return new TxClient(this.storage, txId, this.#metadata);
  }

  async get(key: string): Promise<string | undefined> {
    try {
      const response = await this.storage.Get(
        { key, scope: this.scope },
        {
          ...this.#metadata,
          'throw-redis-nil': { values: ['true'] },
        }
      );
      return response !== null ? (response.value ?? undefined) : response;
    } catch (e) {
      if (isRedisNilError(e)) {
        return undefined;
      }

      throw e;
    }
  }

  async set(key: string, value: string, options?: SetOptions): Promise<string> {
    let expiration;
    if (options?.expiration) {
      expiration = Math.floor((options.expiration.getTime() - Date.now()) / 1000); // convert to seconds
      if (expiration < 1) {
        expiration = 1; // minimum expiration is 1 second, clock skew can cause issues, so let's set 1 second.
      }
    }

    const response = await this.storage.Set(
      {
        key,
        value,
        nx: options?.nx === true && !options.xx,
        xx: options?.xx === true && !options.nx,
        expiration: expiration || 0,
        scope: this.scope,
      },
      this.#metadata
    );
    return response.value;
  }

  async del(...keys: string[]): Promise<void> {
    await this.storage.Del({ keys, scope: this.scope }, this.#metadata);
  }

  async incrBy(key: string, value: number): Promise<number> {
    const response = await this.storage.IncrBy({ key, value, scope: this.scope }, this.#metadata);
    return response.value;
  }

  async getRange(key: string, start: number, end: number): Promise<string> {
    const response = await this.storage.GetRange(
      { key, start, end, scope: this.scope },
      this.#metadata
    );
    return response !== null ? response.value : response;
  }

  async setRange(key: string, offset: number, value: string): Promise<number> {
    const response = await this.storage.SetRange(
      { key, offset, value, scope: this.scope },
      this.#metadata
    );
    return response.value;
  }

  async strlen(key: string): Promise<number> {
    return this.strLen(key);
  }

  async strLen(key: string): Promise<number> {
    const response = await this.storage.Strlen({ key, scope: this.scope }, this.#metadata);
    return response.value;
  }

  async expire(key: string, seconds: number): Promise<void> {
    await this.storage.Expire({ key, seconds, scope: this.scope }, this.#metadata);
  }

  async expireTime(key: string): Promise<number> {
    const response = await this.storage.ExpireTime({ key, scope: this.scope }, this.#metadata);
    return response.value;
  }

  async zAdd(key: string, ...members: ZMember[]): Promise<number> {
    return (await this.storage.ZAdd({ key, members, scope: this.scope }, this.#metadata)).value;
  }

  async zRange(
    key: string,
    start: number | string,
    stop: number | string,
    options?: ZRangeOptions
  ): Promise<{ member: string; score: number }[]> {
    // eslint-disable-next-line
    let opts = { rev: false, byLex: false, byScore: false, offset: 0, count: 1000 };
    if (options?.reverse) {
      opts.rev = options.reverse;
    }
    if (options?.by === 'lex') {
      opts.byLex = true;
    } else if (options?.by === 'score') {
      opts.byScore = true;
    } else {
      // LIMIT requires BYLEX/BYSCORE
      opts.offset = 0;
      opts.count = 0;
    }
    return (
      await this.storage.ZRange(
        { key: { key: key }, start: start + '', stop: stop + '', ...opts, scope: this.scope },
        this.#metadata
      )
    ).members;
  }

  async zRem(key: string, members: string[]): Promise<number> {
    const response = await this.storage.ZRem(
      { key: { key }, members, scope: this.scope },
      this.#metadata
    );
    return response.value;
  }

  async zRemRangeByLex(key: string, min: string, max: string): Promise<number> {
    const response = await this.storage.ZRemRangeByLex(
      { key: { key }, min, max, scope: this.scope },
      this.#metadata
    );
    return response.value;
  }

  async zRemRangeByRank(key: string, start: number, stop: number): Promise<number> {
    const response = await this.storage.ZRemRangeByRank(
      { key: { key }, start, stop, scope: this.scope },
      this.#metadata
    );
    return response.value;
  }

  async zRemRangeByScore(key: string, min: number, max: number): Promise<number> {
    const response = await this.storage.ZRemRangeByScore(
      { key: { key }, min, max, scope: this.scope },
      this.#metadata
    );
    return response.value;
  }

  async zScore(key: string, member: string): Promise<number | undefined> {
    try {
      const response = await this.storage.ZScore(
        { key: { key }, member, scope: this.scope },
        {
          ...this.#metadata,
          'throw-redis-nil': { values: ['true'] },
        }
      );

      return response !== null ? response.value : response;
    } catch (e) {
      if (isRedisNilError(e)) {
        return undefined;
      }

      throw e;
    }
  }

  async zRank(key: string, member: string): Promise<number | undefined> {
    try {
      const response = await this.storage.ZRank(
        { key: { key }, member, scope: this.scope },
        {
          ...this.#metadata,
          'throw-redis-nil': { values: ['true'] },
        }
      );
      return response !== null ? response.value : response;
    } catch (e) {
      if (isRedisNilError(e)) {
        return undefined;
      }

      throw e;
    }
  }

  async zIncrBy(key: string, member: string, value: number): Promise<number> {
    const response = await this.storage.ZIncrBy(
      { key, member, value, scope: this.scope },
      this.#metadata
    );
    return response !== null ? response.value : response;
  }

  async mget(keys: string[]): Promise<(string | null)[]> {
    return this.mGet(keys);
  }

  async mGet(keys: string[]): Promise<(string | null)[]> {
    const response = await this.storage.MGet({ keys, scope: this.scope }, this.#metadata);
    return response !== null ? response.values.map((value) => value || null) : response;
  }

  async mset(keyValues: { [key: string]: string }): Promise<void> {
    return this.mSet(keyValues);
  }

  async mSet(keyValues: { [key: string]: string }): Promise<void> {
    const kv = Object.entries(keyValues).map(([key, value]) => ({ key, value }));
    await this.storage.MSet({ kv, scope: this.scope }, this.#metadata);
  }

  async zCard(key: string): Promise<number> {
    const response = await this.storage.ZCard({ key, scope: this.scope }, this.#metadata);
    return response !== null ? response.value : response;
  }

  async zScan(
    key: string,
    cursor: number,
    pattern?: string | undefined,
    count?: number | undefined
  ): Promise<ZScanResponse> {
    const request: ZScanRequest = { key, cursor, pattern, count, scope: this.scope };
    return await this.storage.ZScan(request, this.#metadata);
  }

  async type(key: string): Promise<string> {
    const response = await this.storage.Type({ key: key, scope: this.scope }, this.#metadata);
    return response !== null ? response.value : response;
  }

  async hget(key: string, field: string): Promise<string | undefined> {
    return this.hGet(key, field);
  }

  async hGet(key: string, field: string): Promise<string | undefined> {
    try {
      const response = await this.storage.HGet(
        { key, field, scope: this.scope },
        {
          ...this.#metadata,
          'throw-redis-nil': { values: ['true'] },
        }
      );
      return response !== null ? (response.value ?? undefined) : response;
    } catch (e) {
      if (isRedisNilError(e)) {
        return undefined;
      }

      throw e;
    }
  }

  async hset(key: string, fieldValues: { [field: string]: string }): Promise<number> {
    return this.hSet(key, fieldValues);
  }

  async hSet(key: string, fieldValues: { [field: string]: string }): Promise<number> {
    const fv = Object.entries(fieldValues).map(([field, value]) => ({ field, value }));
    const response = await this.storage.HSet({ key, fv, scope: this.scope }, this.#metadata);
    return response.value;
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    return this.hGetAll(key);
  }

  async hGetAll(key: string): Promise<Record<string, string>> {
    const response = await this.storage.HGetAll({ key, scope: this.scope }, this.#metadata);
    return response !== null ? response.fieldValues : response;
  }

  async hdel(key: string, fields: string[]): Promise<number> {
    return this.hDel(key, fields);
  }

  async hDel(key: string, fields: string[]): Promise<number> {
    const response = await this.storage.HDel({ key, fields, scope: this.scope }, this.#metadata);
    return response.value;
  }

  async hscan(
    key: string,
    cursor: number,
    pattern?: string | undefined,
    count?: number | undefined
  ): Promise<HScanResponse> {
    return this.hScan(key, cursor, pattern, count);
  }

  async hScan(
    key: string,
    cursor: number,
    pattern?: string | undefined,
    count?: number | undefined
  ): Promise<HScanResponse> {
    const request: HScanRequest = { key, cursor, pattern, count, scope: this.scope };
    return await this.storage.HScan(request, this.#metadata);
  }

  async hkeys(key: string): Promise<string[]> {
    return this.hKeys(key);
  }

  async hKeys(key: string): Promise<string[]> {
    const response = await this.storage.HKeys({ key, scope: this.scope }, this.#metadata);
    return response !== null ? response.keys : response;
  }

  async hincrby(key: string, field: string, value: number): Promise<number> {
    return this.hIncrBy(key, field, value);
  }

  async hIncrBy(key: string, field: string, value: number): Promise<number> {
    const response = await this.storage.HIncrBy(
      { key, field, value, scope: this.scope },
      this.#metadata
    );
    return response.value;
  }

  async hlen(key: string): Promise<number> {
    return this.hLen(key);
  }

  async hLen(key: string): Promise<number> {
    const response = await this.storage.HLen({
      key,
      scope: this.scope,
    });
    return response.value;
  }
}
