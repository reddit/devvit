import {
  type BitfieldCommand as BitfieldCommandProto,
  BitfieldOverflowBehavior,
  type HScanRequest,
  type HScanResponse,
  RedisKeyScope,
  type TransactionId,
  type ZMember,
  type ZScanRequest,
  type ZScanResponse,
} from '@devvit/protos/json/devvit/plugin/redis/redisapi.js';
import type { Metadata } from '@devvit/protos/lib/Types.js';
// eslint-disable-next-line no-restricted-imports
import {
  type RedisAPI,
  RedisAPIDefinition,
} from '@devvit/protos/types/devvit/plugin/redis/redisapi.js';
import { context } from '@devvit/server';
import { getDevvitConfig } from '@devvit/shared-types/server/get-devvit-config.js';

import type {
  BitfieldCommand,
  RedisClient as RedisClientLike,
  SetOptions,
  TxClientLike,
  ZRangeOptions,
} from './types/redis.js';

// TODO: This code is currently cloned into the Devvit Web world from `@devvit/public-api`. If
//  you change this code, please make sure to update the other package as well. Eventually, that
//  copy of the code will be deleted, when we move to a fully Devvit Web world.

export class TxClient implements TxClientLike {
  #plugin: RedisAPI;
  #transactionId: TransactionId;
  #txnStartMetadata: Metadata;

  constructor(plugin: RedisAPI, transactionId: TransactionId, metadata: Metadata) {
    this.#plugin = plugin;
    this.#transactionId = transactionId;
    this.#txnStartMetadata = metadata;
  }

  async get(key: string): Promise<TxClientLike> {
    await this.#plugin.Get({ key: key, transactionId: this.#transactionId }, this.#metadata);
    return this;
  }

  async multi(): Promise<void> {
    await this.#plugin.Multi(this.#transactionId, this.#metadata);
  }

  async set(key: string, value: string, options?: SetOptions): Promise<TxClientLike> {
    let expiration;
    if (options?.expiration) {
      expiration = Math.floor((options.expiration.getTime() - Date.now()) / 1000); // convert to seconds
      if (expiration < 1) {
        expiration = 1; // minimum expiration is 1 second, clock skew can cause issues, so let's set 1 second.
      }
    }
    await this.#plugin.Set(
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
    await this.#plugin.Del({ keys: keys, transactionId: this.#transactionId }, this.#metadata);
    return this;
  }

  async type(key: string): Promise<TxClientLike> {
    await this.#plugin.Type({ key: key, transactionId: this.#transactionId }, this.#metadata);
    return this;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async exec(): Promise<any[]> {
    const response = await this.#plugin.Exec(this.#transactionId, this.#metadata);
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
      } else if (result.dbl !== undefined) {
        output.push(result.dbl);
      }
    }
    return output;
  }

  async discard(): Promise<void> {
    await this.#plugin.Discard(this.#transactionId, this.#metadata);
  }

  async watch(...keys: string[]): Promise<TxClientLike> {
    await this.#plugin.Watch({ keys: keys, transactionId: this.#transactionId }, this.#metadata);
    return this;
  }

  async unwatch(): Promise<TxClientLike> {
    await this.#plugin.Unwatch(this.#transactionId, this.#metadata);
    return this;
  }

  async getRange(key: string, start: number, end: number): Promise<TxClientLike> {
    await this.#plugin.GetRange(
      { key, start, end, transactionId: this.#transactionId },
      this.#metadata
    );
    return this;
  }
  async setRange(key: string, offset: number, value: string): Promise<TxClientLike> {
    await this.#plugin.SetRange(
      { key, offset, value, transactionId: this.#transactionId },
      this.#metadata
    );
    return this;
  }

  async strLen(key: string): Promise<TxClientLike> {
    await this.#plugin.Strlen({ key, transactionId: this.#transactionId }, this.#metadata);
    return this;
  }

  async mGet(keys: string[]): Promise<TxClientLike> {
    await this.#plugin.MGet({ keys, transactionId: this.#transactionId }, this.#metadata);
    return this;
  }

  async mSet(keyValues: { [key: string]: string }): Promise<TxClientLike> {
    const kv = Object.entries(keyValues).map(([key, value]) => ({ key, value }));
    await this.#plugin.MSet({ kv, transactionId: this.#transactionId }, this.#metadata);
    return this;
  }

  async incrBy(key: string, value: number): Promise<TxClientLike> {
    await this.#plugin.IncrBy({ key, value, transactionId: this.#transactionId }, this.#metadata);
    return this;
  }

  async expire(key: string, seconds: number): Promise<TxClientLike> {
    await this.#plugin.Expire({ key, seconds, transactionId: this.#transactionId }, this.#metadata);
    return this;
  }

  async expireTime(key: string): Promise<TxClientLike> {
    await this.#plugin.ExpireTime({ key, transactionId: this.#transactionId }, this.#metadata);
    return this;
  }

  async zAdd(key: string, ...members: ZMember[]): Promise<TxClientLike> {
    await this.#plugin.ZAdd({ key, members, transactionId: this.#transactionId }, this.#metadata);
    return this;
  }

  async zScore(key: string, member: string): Promise<TxClientLike> {
    await this.#plugin.ZScore(
      { key: { key, transactionId: this.#transactionId }, member },
      this.#metadata
    );
    return this;
  }

  async zRank(key: string, member: string): Promise<TxClientLike> {
    await this.#plugin.ZRank(
      { key: { key, transactionId: this.#transactionId }, member },
      this.#metadata
    );
    return this;
  }

  async zIncrBy(key: string, member: string, value: number): Promise<TxClientLike> {
    await this.#plugin.ZIncrBy(
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
    await this.#plugin.ZScan(request, this.#metadata);
    return this;
  }

  async zCard(key: string): Promise<TxClientLike> {
    await this.#plugin.ZCard({ key, transactionId: this.#transactionId }, this.#metadata);
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
    if (options?.limit) {
      if (opts.byLex || opts.byScore) {
        opts.offset = options.limit.offset;
        opts.count = options.limit.count;
      } else {
        throw new Error(
          `zRange parsing error: 'limit' only allowed when 'options.by' is 'lex' or 'score'`
        );
      }
    }

    await this.#plugin.ZRange(
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
    await this.#plugin.ZRem(
      { key: { key, transactionId: this.#transactionId }, members: members },
      this.#metadata
    );
    return this;
  }

  async zRemRangeByLex(key: string, min: string, max: string): Promise<TxClientLike> {
    await this.#plugin.ZRemRangeByLex(
      { key: { key, transactionId: this.#transactionId }, min: min, max: max },
      this.#metadata
    );
    return this;
  }

  async zRemRangeByRank(key: string, start: number, stop: number): Promise<TxClientLike> {
    await this.#plugin.ZRemRangeByRank(
      { key: { key, transactionId: this.#transactionId }, start: start, stop: stop },
      this.#metadata
    );
    return this;
  }

  async zRemRangeByScore(key: string, min: number, max: number): Promise<TxClientLike> {
    await this.#plugin.ZRemRangeByScore(
      { key: { key, transactionId: this.#transactionId }, min: min, max: max },
      this.#metadata
    );
    return this;
  }

  async hGetAll(key: string): Promise<TxClientLike> {
    await this.#plugin.HGetAll({ key, transactionId: this.#transactionId }, this.#metadata);
    return this;
  }

  async hGet(key: string, field: string): Promise<TxClientLike> {
    await this.#plugin.HGet(
      { key: key, field: field, transactionId: this.#transactionId },
      this.#metadata
    );
    return this;
  }

  async hMGet(key: string, fields: string[]): Promise<TxClientLike> {
    await this.#plugin.HMGet(
      { key: key, fields: fields, transactionId: this.#transactionId },
      this.#metadata
    );
    return this;
  }

  async hSet(key: string, fieldValues: { [field: string]: string }): Promise<TxClientLike> {
    const fv = Object.entries(fieldValues).map(([field, value]) => ({ field, value }));
    await this.#plugin.HSet({ key, fv, transactionId: this.#transactionId }, this.#metadata);
    return this;
  }

  async hIncrBy(key: string, field: string, value: number): Promise<TxClientLike> {
    await this.#plugin.HIncrBy(
      { key, field, value, transactionId: this.#transactionId },
      this.#metadata
    );
    return this;
  }

  async hDel(key: string, fields: string[]): Promise<TxClientLike> {
    await this.#plugin.HDel({ key, fields, transactionId: this.#transactionId }, this.#metadata);
    return this;
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
    await this.#plugin.HScan(request, this.#metadata);
    return this;
  }

  async hKeys(key: string): Promise<TxClientLike> {
    await this.#plugin.HKeys({ key, transactionId: this.#transactionId }, this.#metadata);
    return this;
  }

  async hLen(key: string): Promise<TxClientLike> {
    await this.#plugin.HLen({ key, transactionId: this.#transactionId }, this.#metadata);
    return this;
  }

  get #metadata(): Metadata {
    assertTxMetadataIsCurrent(this.#txnStartMetadata);
    return this.#txnStartMetadata;
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
  readonly global: Omit<RedisClientLike, 'global'>;
  readonly scope: RedisKeyScope;

  constructor(scope: RedisKeyScope) {
    this.scope = scope;
    this.global =
      scope === RedisKeyScope.INSTALLATION ? new RedisClient(RedisKeyScope.GLOBAL) : this;
  }

  async watch(...keys: string[]): Promise<TxClientLike> {
    const txId = await this.#plugin.Watch({ keys }, this.#metadata);
    return new TxClient(this.#plugin, txId, this.#metadata);
  }

  async get(key: string): Promise<string | undefined> {
    try {
      const response = await this.#plugin.Get(
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

  async getBuffer(key: string): Promise<Buffer | undefined> {
    try {
      const response = await this.#plugin.GetBytes(
        { key, scope: this.scope },
        {
          ...this.#metadata,
          'throw-redis-nil': { values: ['true'] },
        }
      );
      return response !== null ? Buffer.from(response.value) : response;
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

    const response = await this.#plugin.Set(
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

  async exists(...keys: string[]): Promise<number> {
    const response = await this.#plugin.Exists({ keys, scope: this.scope }, this.#metadata);
    return response.existingKeys;
  }

  async del(...keys: string[]): Promise<void> {
    await this.#plugin.Del({ keys, scope: this.scope }, this.#metadata);
  }

  async incrBy(key: string, value: number): Promise<number> {
    const response = await this.#plugin.IncrBy({ key, value, scope: this.scope }, this.#metadata);
    return response.value;
  }

  async getRange(key: string, start: number, end: number): Promise<string> {
    const response = await this.#plugin.GetRange(
      { key, start, end, scope: this.scope },
      this.#metadata
    );
    return response !== null ? response.value : response;
  }

  async setRange(key: string, offset: number, value: string): Promise<number> {
    const response = await this.#plugin.SetRange(
      { key, offset, value, scope: this.scope },
      this.#metadata
    );
    return response.value;
  }

  async strLen(key: string): Promise<number> {
    const response = await this.#plugin.Strlen({ key, scope: this.scope }, this.#metadata);
    return response.value;
  }

  async expire(key: string, seconds: number): Promise<void> {
    await this.#plugin.Expire({ key, seconds, scope: this.scope }, this.#metadata);
  }

  async expireTime(key: string): Promise<number> {
    const response = await this.#plugin.ExpireTime({ key, scope: this.scope }, this.#metadata);
    return response.value;
  }

  async zAdd(key: string, ...members: ZMember[]): Promise<number> {
    return (await this.#plugin.ZAdd({ key, members, scope: this.scope }, this.#metadata)).value;
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

    if (options?.limit) {
      if (opts.byLex || opts.byScore) {
        opts.offset = options.limit.offset;
        opts.count = options.limit.count;
      } else {
        throw new Error(
          `zRange parsing error: 'limit' only allowed when 'options.by' is 'lex' or 'score'`
        );
      }
    }

    return (
      await this.#plugin.ZRange(
        { key: { key: key }, start: start + '', stop: stop + '', ...opts, scope: this.scope },
        this.#metadata
      )
    ).members;
  }

  async zRem(key: string, members: string[]): Promise<number> {
    const response = await this.#plugin.ZRem(
      { key: { key }, members, scope: this.scope },
      this.#metadata
    );
    return response.value;
  }

  async zRemRangeByLex(key: string, min: string, max: string): Promise<number> {
    const response = await this.#plugin.ZRemRangeByLex(
      { key: { key }, min, max, scope: this.scope },
      this.#metadata
    );
    return response.value;
  }

  async zRemRangeByRank(key: string, start: number, stop: number): Promise<number> {
    const response = await this.#plugin.ZRemRangeByRank(
      { key: { key }, start, stop, scope: this.scope },
      this.#metadata
    );
    return response.value;
  }

  async zRemRangeByScore(key: string, min: number, max: number): Promise<number> {
    const response = await this.#plugin.ZRemRangeByScore(
      { key: { key }, min, max, scope: this.scope },
      this.#metadata
    );
    return response.value;
  }

  async zScore(key: string, member: string): Promise<number | undefined> {
    try {
      const response = await this.#plugin.ZScore(
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
      const response = await this.#plugin.ZRank(
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
    const response = await this.#plugin.ZIncrBy(
      { key, member, value, scope: this.scope },
      this.#metadata
    );
    return response !== null ? response.value : response;
  }

  async mGet(keys: string[]): Promise<(string | null)[]> {
    const response = await this.#plugin.MGet({ keys, scope: this.scope }, this.#metadata);
    return response !== null ? response.values.map((value) => value || null) : response;
  }

  async mSet(keyValues: { [key: string]: string }): Promise<void> {
    const kv = Object.entries(keyValues).map(([key, value]) => ({ key, value }));
    await this.#plugin.MSet({ kv, scope: this.scope }, this.#metadata);
  }

  async zCard(key: string): Promise<number> {
    const response = await this.#plugin.ZCard({ key, scope: this.scope }, this.#metadata);
    return response !== null ? response.value : response;
  }

  async zScan(
    key: string,
    cursor: number,
    pattern?: string | undefined,
    count?: number | undefined
  ): Promise<ZScanResponse> {
    const request: ZScanRequest = { key, cursor, pattern, count, scope: this.scope };
    return await this.#plugin.ZScan(request, this.#metadata);
  }

  async type(key: string): Promise<string> {
    const response = await this.#plugin.Type({ key: key, scope: this.scope }, this.#metadata);
    return response !== null ? response.value : response;
  }

  async rename(key: string, newKey: string): Promise<string> {
    const response = await this.#plugin.Rename({ key, newKey, scope: this.scope }, this.#metadata);
    return response.result;
  }

  async hGet(key: string, field: string): Promise<string | undefined> {
    try {
      const response = await this.#plugin.HGet(
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

  async hMGet(key: string, fields: string[]): Promise<(string | null)[]> {
    const response = await this.#plugin.HMGet({ key, fields, scope: this.scope }, this.#metadata);
    return response !== null ? response.values.map((value) => value || null) : response;
  }

  async hSet(key: string, fieldValues: { [field: string]: string }): Promise<number> {
    const fv = Object.entries(fieldValues).map(([field, value]) => ({ field, value }));
    const response = await this.#plugin.HSet({ key, fv, scope: this.scope }, this.#metadata);
    return response.value;
  }

  async hSetNX(key: string, field: string, value: string): Promise<number> {
    const response = await this.#plugin.HSetNX(
      { key, field, value, scope: this.scope },
      this.#metadata
    );
    return response.success;
  }

  async hGetAll(key: string): Promise<Record<string, string>> {
    const response = await this.#plugin.HGetAll({ key, scope: this.scope }, this.#metadata);
    return response !== null ? response.fieldValues : response;
  }

  async hDel(key: string, fields: string[]): Promise<number> {
    const response = await this.#plugin.HDel({ key, fields, scope: this.scope }, this.#metadata);
    return response.value;
  }

  async hScan(
    key: string,
    cursor: number,
    pattern?: string | undefined,
    count?: number | undefined
  ): Promise<HScanResponse> {
    const request: HScanRequest = { key, cursor, pattern, count, scope: this.scope };
    return await this.#plugin.HScan(request, this.#metadata);
  }

  async hKeys(key: string): Promise<string[]> {
    const response = await this.#plugin.HKeys({ key, scope: this.scope }, this.#metadata);
    return response !== null ? response.keys : response;
  }

  async hIncrBy(key: string, field: string, value: number): Promise<number> {
    const response = await this.#plugin.HIncrBy(
      { key, field, value, scope: this.scope },
      this.#metadata
    );
    return response.value;
  }

  async hLen(key: string): Promise<number> {
    const response = await this.#plugin.HLen({
      key,
      scope: this.scope,
    });
    return response.value;
  }

  async bitfield(
    key: string,
    ...cmds:
      | []
      | BitfieldCommand
      | [...BitfieldCommand, ...BitfieldCommand]
      | [...BitfieldCommand, ...BitfieldCommand, ...BitfieldCommand, ...(number | string)[]]
  ): Promise<number[]> {
    const commands: BitfieldCommandProto[] = [];
    for (let argIndex = 0; argIndex < cmds.length; ) {
      const currentArg = cmds[argIndex];
      const command: BitfieldCommandProto = {};

      switch (currentArg) {
        case 'get': {
          if (argIndex + 2 >= cmds.length) {
            throw Error(`bitfield command parse failed; not enough arguments for 'get' command`);
          }
          command.get = {
            encoding: cmds[argIndex + 1] as string,
            offset: cmds[argIndex + 2].toString(),
          };

          argIndex += 3;
          break;
        }
        case 'set': {
          if (argIndex + 3 >= cmds.length) {
            throw Error(`bitfield command parse failed; not enough arguments for 'set' command`);
          }
          command.set = {
            encoding: cmds[argIndex + 1] as string,
            offset: cmds[argIndex + 2].toString(),
            value: cmds[argIndex + 3].toString(),
          };

          argIndex += 4;
          break;
        }
        case 'incrBy': {
          if (argIndex + 3 >= cmds.length) {
            throw Error(`bitfield command parse failed; not enough arguments for 'incrBy' command`);
          }
          command.incrBy = {
            encoding: cmds[argIndex + 1] as string,
            offset: cmds[argIndex + 2].toString(),
            increment: cmds[argIndex + 3].toString(),
          };

          argIndex += 4;
          break;
        }
        case 'overflow': {
          if (argIndex + 1 >= cmds.length) {
            throw Error(
              `bitfield command parse failed; not enough arguments for 'overflow' command`
            );
          }
          const behavior = cmds[argIndex + 1].toString();
          command.overflow = {
            behavior: toBehaviorProto(behavior),
          };

          argIndex += 2;
          break;
        }
        default: {
          throw Error(
            `bitfield command parse failed; ${currentArg} unrecognized (must be 'get', 'set', 'incrBy', or 'overflow')`
          );
        }
      }
      commands.push(command);
    }

    const response = await this.#plugin.Bitfield({
      key,
      commands,
    });

    return response.results;
  }

  get #metadata(): Metadata {
    return context.metadata;
  }

  get #plugin(): RedisAPI {
    return getDevvitConfig().use(RedisAPIDefinition);
  }
}

function toBehaviorProto(behavior: string): BitfieldOverflowBehavior {
  const lowercase = behavior.toLowerCase();
  switch (lowercase) {
    case 'wrap':
      return BitfieldOverflowBehavior.BITFIELD_OVERFLOW_BEHAVIOR_WRAP;
    case 'sat':
      return BitfieldOverflowBehavior.BITFIELD_OVERFLOW_BEHAVIOR_SAT;
    case 'fail':
      return BitfieldOverflowBehavior.BITFIELD_OVERFLOW_BEHAVIOR_FAIL;
    default:
      throw Error(`unknown bitfield overflow behavior: ${lowercase}`);
  }
}

function isRedisNilError(e: unknown): boolean {
  // TODO: Replace with impl in a Gatsby-only world
  //return e && e.details === 'redis: nil';

  if (e && typeof e === 'object' && 'message' in e && typeof e.message === 'string') {
    return e.message.includes('redis: nil');
  } else {
    return false;
  }
}

function assertTxMetadataIsCurrent(metadata: Metadata): void {
  if (context.metadata !== metadata) {
    throw new Error(
      `TxClient: Current metadata does not match what was used to start the transaction. Don't pass clients around between calls!`
    );
  }
}
