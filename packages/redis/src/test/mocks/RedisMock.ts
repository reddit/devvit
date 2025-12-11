import { randomUUID } from 'node:crypto';

import {
  type BitfieldRequest,
  type BitfieldResponse,
  type ExistsResponse,
  type ExpireRequest,
  type HDelRequest,
  type HGetRequest,
  type HIncrByRequest,
  type HMGetRequest,
  type HScanRequest,
  type HScanResponse,
  type HSetNXRequest,
  type HSetRequest,
  type IncrByRequest,
  type KeyRangeRequest,
  type KeyRequest,
  type KeysRequest,
  type KeysResponse,
  type KeyValuesRequest,
  type Metadata,
  type RedisAPI,
  type RedisFieldValues,
  RedisKeyScope,
  type RedisValues,
  type RenameRequest,
  type RenameResponse,
  type SetRangeRequest,
  type SetRequest,
  type TransactionId,
  type TransactionResponse,
  type TransactionResponses,
  type WatchRequest,
  type ZAddRequest,
  type ZIncrByRequest,
  type ZMembers,
  type ZRangeRequest,
  type ZRankRequest,
  type ZRemRangeByLexRequest,
  type ZRemRangeByRankRequest,
  type ZRemRangeByScoreRequest,
  type ZRemRequest,
  type ZScanRequest,
  type ZScanResponse,
  type ZScoreRequest,
} from '@devvit/protos';
import type { Empty } from '@devvit/protos/types/google/protobuf/empty.js';
import type {
  BytesValue,
  DoubleValue,
  Int64Value,
  StringValue,
} from '@devvit/protos/types/google/protobuf/wrappers.js';
import type { PluginMock } from '@devvit/shared-types/test/index.js';
import { Redis } from 'ioredis';

type QueuedCommand = () => Promise<TransactionResponse>;

type TransactionState = {
  id: string;
  commands: QueuedCommand[];
  multiStarted: boolean;
  watchedKeys: string[];
  closed: boolean;
};

// Minimal helper to check the special header toggle used by RedisClient
const shouldThrowNil = (metadata?: Metadata): boolean => {
  return metadata?.['throw-redis-nil']?.values?.[0]?.toLowerCase() === 'true';
};

type ZMemberEntry = { member: string; score: number };

const normalizeOffset = (offset?: number | null): number | undefined => {
  if (offset == null) return undefined;
  if (offset === 0) return undefined;
  return offset;
};

const normalizeCount = (count?: number | null): number | undefined => {
  if (count == null) return undefined;
  if (count <= 0) return undefined;
  return count;
};

const paginateMembers = (
  members: ZMemberEntry[],
  offset?: number,
  count?: number
): ZMemberEntry[] => {
  if ((offset == null || offset === 0) && count == null) {
    return members;
  }

  const startIndex = Math.max(0, offset ?? 0);
  if (startIndex >= members.length) return [];

  if (count == null) {
    return members.slice(startIndex);
  }

  if (count <= 0) return [];
  return members.slice(startIndex, startIndex + count);
};

const pairsToMembers = (vals: string[]): ZMemberEntry[] => {
  const entries: ZMemberEntry[] = [];
  for (let i = 0; i < vals.length; i += 2) {
    const member = vals[i];
    if (member == null) continue;
    const score = vals[i + 1] != null ? Number(vals[i + 1]) : 0;
    entries.push({ member, score });
  }
  return entries;
};

const lexValsToMembers = (vals: string[]): ZMemberEntry[] =>
  vals.map((member) => ({ member, score: 0 }));

type RedisStore = {
  transactions: Map<string, TransactionState>;
  conn: Redis;
  /**
   * Prefix to use for all keys.
   * If provided, it will be used to scope all keys (including global ones).
   * A colon delimiter (:) will be automatically appended if not present.
   */
  keyPrefix?: string;
};

/**
 * Mock implementation of the Redis API for testing purposes.
 * Uses an in-memory Redis server to simulate actual Redis behavior.
 */
export class RedisPluginMock implements RedisAPI {
  private readonly _store: RedisStore;

  constructor(store: RedisStore) {
    this._store = store;
  }

  private _makeKey(key: string, scope?: RedisKeyScope | undefined): string {
    const scopedKey = scope === RedisKeyScope.GLOBAL ? `global:${key}` : key;
    if (!this._store.keyPrefix) return scopedKey;

    const prefix = this._store.keyPrefix.endsWith(':')
      ? this._store.keyPrefix
      : `${this._store.keyPrefix}:`;
    return `${prefix}${scopedKey}`;
  }

  // Simple Key-Value operations
  async Get(request: KeyRequest, metadata?: Metadata): Promise<StringValue> {
    const operation = async (): Promise<StringValue> => {
      const v = await this._store.conn.get(this._makeKey(request.key, request.scope));
      if (v == null) {
        if (shouldThrowNil(metadata)) throw new Error('redis: nil');
        return { value: '' } as StringValue;
      }
      return { value: v } as StringValue;
    };
    return this._queueOrRun(request.transactionId, operation, (result) => ({ str: result.value }));
  }

  async GetBytes(request: KeyRequest, metadata?: Metadata): Promise<BytesValue> {
    const v = await this._store.conn.getBuffer(this._makeKey(request.key, request.scope));
    if (v == null) {
      if (shouldThrowNil(metadata)) throw new Error('redis: nil');
      return { value: new Uint8Array() } as BytesValue;
    }
    return { value: v } as BytesValue;
  }

  async Set(request: SetRequest): Promise<StringValue> {
    const operation = async (): Promise<StringValue> => {
      const k = this._makeKey(request.key, request.scope);
      if (request.nx && request.xx) throw new Error('invalid Set: nx and xx cannot both be true');

      const args: (string | number)[] = [k, request.value];
      if (request.expiration && request.expiration > 0) {
        args.push('EX', request.expiration);
      }

      if (request.nx) {
        args.push('NX');
      } else if (request.xx) {
        args.push('XX');
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = await (this._store.conn.set as any)(...args);
      return { value: res ?? '' } as StringValue;
    };

    return this._queueOrRun(request.transactionId, operation, (result) => ({ str: result.value }));
  }

  async Exists(request: KeysRequest): Promise<ExistsResponse> {
    const count = await this._store.conn.exists(
      ...request.keys.map((k) => this._makeKey(k, request.scope))
    );
    return { existingKeys: count } as ExistsResponse;
  }

  async Del(request: KeysRequest): Promise<Int64Value> {
    const operation = async (): Promise<Int64Value> => {
      const n = await this._store.conn.del(
        ...request.keys.map((k) => this._makeKey(k, request.scope))
      );
      return { value: n } as Int64Value;
    };
    return this._queueOrRun(request.transactionId, operation, (result) => ({ num: result.value }));
  }

  async Type(request: KeyRequest): Promise<StringValue> {
    const operation = async (): Promise<StringValue> => {
      const t = await this._store.conn.type(this._makeKey(request.key, request.scope));
      return { value: t } as StringValue;
    };
    return this._queueOrRun(request.transactionId, operation, (result) => ({ str: result.value }));
  }

  async Rename(request: RenameRequest): Promise<RenameResponse> {
    const res = await this._store.conn.rename(
      this._makeKey(request.key, request.scope),
      this._makeKey(request.newKey, request.scope)
    );
    return { result: res } as RenameResponse;
  }

  // Number operations
  async IncrBy(request: IncrByRequest): Promise<Int64Value> {
    const operation = async (): Promise<Int64Value> => {
      const { key, value, scope } = request;
      const v = await this._store.conn.incrby(this._makeKey(key, scope), value);
      return { value: Number(v) } as Int64Value;
    };
    return this._queueOrRun(request.transactionId, operation, (result) => ({ num: result.value }));
  }

  // Redis Hash operations
  async HSet(request: HSetRequest): Promise<Int64Value> {
    const operation = async (): Promise<Int64Value> => {
      const map: Record<string, string> = {};
      for (const { field, value } of request.fv) map[field] = value;
      const v = await this._store.conn.hset(this._makeKey(request.key, request.scope), map);
      return { value: Number(v) } as Int64Value;
    };
    return this._queueOrRun(request.transactionId, operation, (result) => ({ num: result.value }));
  }

  async HGet(request: HGetRequest, metadata?: Metadata): Promise<StringValue> {
    const operation = async (): Promise<StringValue> => {
      const v = await this._store.conn.hget(
        this._makeKey(request.key, request.scope),
        request.field
      );
      if (v == null) {
        if (shouldThrowNil(metadata)) throw new Error('redis: nil');
        return { value: '' } as StringValue;
      }
      return { value: v } as StringValue;
    };
    return this._queueOrRun(request.transactionId, operation, (result) => ({ str: result.value }));
  }

  async HMGet(request: HMGetRequest): Promise<RedisValues> {
    const operation = async (): Promise<RedisValues> => {
      const vals = await this._store.conn.hmget(
        this._makeKey(request.key, request.scope),
        ...request.fields
      );
      return {
        values: vals.map((v) => (v === null ? '' : v)),
      } as unknown as RedisValues;
    };
    return this._queueOrRun(request.transactionId, operation, (result) => ({ values: result }));
  }

  async HGetAll(request: KeyRequest): Promise<RedisFieldValues> {
    const operation = async (): Promise<RedisFieldValues> => {
      const v = await this._store.conn.hgetall(this._makeKey(request.key, request.scope));
      return { fieldValues: v } as RedisFieldValues;
    };
    return this._queueOrRun(request.transactionId, operation, (result) => {
      const flattened: string[] = [];
      for (const [field, value] of Object.entries(result.fieldValues)) {
        flattened.push(field, value);
      }
      return { values: { values: flattened } };
    });
  }

  async HDel(request: HDelRequest): Promise<Int64Value> {
    const operation = async (): Promise<Int64Value> => {
      const n = await this._store.conn.hdel(
        this._makeKey(request.key, request.scope),
        ...request.fields
      );
      return { value: Number(n) } as Int64Value;
    };
    return this._queueOrRun(request.transactionId, operation, (result) => ({ num: result.value }));
  }

  async HScan(request: HScanRequest): Promise<HScanResponse> {
    const operation = async (): Promise<HScanResponse> => {
      const args: string[] = [];
      if (request.pattern) args.push('MATCH', request.pattern);
      if (request.count) args.push('COUNT', String(request.count));
      // ioredis types don't support spread arguments well, so we cast the function to any
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const [cursor, elements] = await (this._store.conn.hscan as any)(
        this._makeKey(request.key, request.scope),
        request.cursor,
        ...args
      );
      const fieldValues: { field: string; value: string }[] = [];
      for (let i = 0; i < elements.length; i += 2) {
        fieldValues.push({ field: elements[i]!, value: elements[i + 1]! });
      }
      return { cursor: Number(cursor), fieldValues } as HScanResponse;
    };
    return this._queueOrRun(request.transactionId, operation, (result) => {
      const payload: string[] = [result.cursor.toString()];
      for (const entry of result.fieldValues) {
        payload.push(entry.field, entry.value);
      }
      return { values: { values: payload } };
    });
  }

  async HKeys(request: KeyRequest): Promise<KeysResponse> {
    const operation = async (): Promise<KeysResponse> => {
      const keys = await this._store.conn.hkeys(this._makeKey(request.key, request.scope));
      return { keys } as KeysResponse;
    };
    return this._queueOrRun(request.transactionId, operation, (result) => ({
      values: { values: result.keys },
    }));
  }

  async HIncrBy(request: HIncrByRequest): Promise<Int64Value> {
    const operation = async (): Promise<Int64Value> => {
      const v = await this._store.conn.hincrby(
        this._makeKey(request.key, request.scope),
        request.field,
        request.value
      );
      return { value: Number(v) } as Int64Value;
    };
    return this._queueOrRun(request.transactionId, operation, (result) => ({ num: result.value }));
  }

  async HLen(request: KeyRequest): Promise<Int64Value> {
    const operation = async (): Promise<Int64Value> => {
      const v = await this._store.conn.hlen(this._makeKey(request.key, request.scope));
      return { value: Number(v) } as Int64Value;
    };
    return this._queueOrRun(request.transactionId, operation, (result) => ({ num: result.value }));
  }

  async HSetNX(request: HSetNXRequest): Promise<{ success: number }> {
    const operation = async (): Promise<{ success: number }> => {
      const v = await this._store.conn.hsetnx(
        this._makeKey(request.key, request.scope),
        request.field,
        request.value
      );
      return { success: Number(v) } as { success: number };
    };
    return this._queueOrRun(
      request.transactionId,
      operation,
      (result) => ({ num: result.success }),
      { success: 0 }
    );
  }

  // Transactions
  async Watch(request: WatchRequest): Promise<TransactionId> {
    if (request.transactionId) {
      const tx = this._getTransaction(request.transactionId);
      tx.watchedKeys.push(...request.keys.map((key) => this._makeKey(key)));
      return request.transactionId;
    }
    const tx = this._createTransaction(request.keys.map((key) => this._makeKey(key)));
    return { id: tx.id };
  }

  async Multi(request: TransactionId): Promise<Empty> {
    const tx = this._getTransaction(request);
    if (tx.multiStarted) {
      throw new Error(`Transaction ${request.id} already started`);
    }
    tx.multiStarted = true;
    return {} as Empty;
  }

  async Exec(request: TransactionId): Promise<TransactionResponses> {
    const tx = this._getTransaction(request);
    if (!tx.multiStarted) {
      throw new Error(`Transaction ${request.id} must call multi() before exec()`);
    }
    const response: TransactionResponse[] = [];
    for (const command of tx.commands) {
      response.push(await command());
    }
    this._closeTransaction(request);
    return { response } as TransactionResponses;
  }

  async Discard(request: TransactionId): Promise<Empty> {
    this._closeTransaction(request);
    return {} as Empty;
  }

  async Unwatch(request: TransactionId): Promise<Empty> {
    const tx = this._getTransaction(request);
    tx.watchedKeys = [];
    return {} as Empty;
  }

  // String operations
  async GetRange(request: KeyRangeRequest): Promise<StringValue> {
    const operation = async (): Promise<StringValue> => {
      const v = await this._store.conn.getrange(
        this._makeKey(request.key, request.scope),
        request.start,
        request.end
      );
      return { value: v } as StringValue;
    };
    return this._queueOrRun(request.transactionId, operation, (result) => ({ str: result.value }));
  }
  async SetRange(request: SetRangeRequest): Promise<Int64Value> {
    const operation = async (): Promise<Int64Value> => {
      const v = await this._store.conn.setrange(
        this._makeKey(request.key, request.scope),
        request.offset,
        request.value
      );
      return { value: Number(v) } as Int64Value;
    };
    return this._queueOrRun(request.transactionId, operation, (result) => ({ num: result.value }));
  }
  async Strlen(request: KeyRequest): Promise<Int64Value> {
    const operation = async (): Promise<Int64Value> => {
      const v = await this._store.conn.strlen(this._makeKey(request.key, request.scope));
      return { value: Number(v) } as Int64Value;
    };
    return this._queueOrRun(request.transactionId, operation, (result) => ({ num: result.value }));
  }

  // Batch Key-Value operations
  async MGet(request: KeysRequest): Promise<RedisValues> {
    const operation = async (): Promise<RedisValues> => {
      const keys = request.keys.map((k) => this._makeKey(k, request.scope));
      const vals = await this._store.conn.mget(...keys);
      return {
        values: vals.map((v) => (v === null ? '' : v)),
      } as unknown as RedisValues;
    };
    return this._queueOrRun(request.transactionId, operation, (result) => ({ values: result }));
  }
  async MSet(request: KeyValuesRequest): Promise<Empty> {
    const operation = async (): Promise<Empty> => {
      const flat: string[] = [];
      for (const { key, value } of request.kv) {
        flat.push(this._makeKey(key, request.scope), value);
      }
      await this._store.conn.mset(...flat);
      return {} as Empty;
    };
    return this._queueOrRun(request.transactionId, operation, () => ({ str: 'OK' }), {} as Empty);
  }

  // Key expiration
  async Expire(request: ExpireRequest): Promise<Empty> {
    const operation = async (): Promise<Empty> => {
      await this._store.conn.expire(this._makeKey(request.key, request.scope), request.seconds);
      return {} as Empty;
    };
    return this._queueOrRun(request.transactionId, operation, () => ({ str: 'OK' }), {} as Empty);
  }
  async ExpireTime(request: KeyRequest): Promise<Int64Value> {
    const operation = async (): Promise<Int64Value> => {
      const v = await this._store.conn.expiretime(this._makeKey(request.key, request.scope));
      return { value: Number(v) } as Int64Value;
    };
    return this._queueOrRun(request.transactionId, operation, (result) => ({ num: result.value }));
  }

  // Sorted sets
  async ZAdd(request: ZAddRequest): Promise<Int64Value> {
    const operation = async (): Promise<Int64Value> => {
      const args = request.members.flatMap((m) => [m.score, m.member]);
      const v = await this._store.conn.zadd(this._makeKey(request.key, request.scope), ...args);
      return { value: Number(v) } as Int64Value;
    };
    return this._queueOrRun(request.transactionId, operation, (result) => ({ num: result.value }));
  }
  async ZCard(request: KeyRequest): Promise<Int64Value> {
    const operation = async (): Promise<Int64Value> => {
      const v = await this._store.conn.zcard(this._makeKey(request.key, request.scope));
      return { value: Number(v) } as Int64Value;
    };
    return this._queueOrRun(request.transactionId, operation, (result) => ({ num: result.value }));
  }
  async ZRange(request: ZRangeRequest): Promise<ZMembers> {
    const operation = async (): Promise<ZMembers> => {
      const k = this._makeKey(request.key?.key ?? '', request.scope ?? request.key?.scope);
      const offsetVal = normalizeOffset(request.offset);
      const countVal = normalizeCount(request.count);

      if (request.byScore) {
        const vals = request.rev
          ? await this._store.conn.zrevrangebyscore(k, request.stop, request.start, 'WITHSCORES')
          : await this._store.conn.zrangebyscore(k, request.start, request.stop, 'WITHSCORES');
        const members = paginateMembers(pairsToMembers(vals), offsetVal, countVal);
        return { members } as ZMembers;
      }

      if (request.byLex) {
        const vals = request.rev
          ? await this._store.conn.zrevrangebylex(k, request.start, request.stop)
          : await this._store.conn.zrangebylex(k, request.start, request.stop);
        const members = paginateMembers(lexValsToMembers(vals), offsetVal, countVal);
        return { members } as ZMembers;
      }

      const startIndex = Number(request.start);
      const stopIndex = Number(request.stop);
      const vals = request.rev
        ? await this._store.conn.zrevrange(k, startIndex, stopIndex, 'WITHSCORES')
        : await this._store.conn.zrange(k, startIndex, stopIndex, 'WITHSCORES');
      const members = paginateMembers(pairsToMembers(vals), offsetVal, countVal);
      return { members } as ZMembers;
    };
    const txId = this._extractTransactionId(request.key);
    return this._queueOrRun(txId, operation, (result) => ({ members: result }));
  }
  async ZRem(request: ZRemRequest): Promise<Int64Value> {
    const operation = async (): Promise<Int64Value> => {
      const v = await this._store.conn.zrem(
        this._makeKey(request.key?.key ?? '', request.scope ?? request.key?.scope),
        ...request.members
      );
      return { value: Number(v) } as Int64Value;
    };
    return this._queueOrRun(
      this._extractTransactionId(request, request.key),
      operation,
      (result) => ({
        num: result.value,
      })
    );
  }
  async ZRemRangeByLex(request: ZRemRangeByLexRequest): Promise<Int64Value> {
    const operation = async (): Promise<Int64Value> => {
      const v = await this._store.conn.zremrangebylex(
        this._makeKey(request.key?.key ?? '', request.scope ?? request.key?.scope),
        request.min,
        request.max
      );
      return { value: Number(v) } as Int64Value;
    };
    return this._queueOrRun(
      this._extractTransactionId(request, request.key),
      operation,
      (result) => ({
        num: result.value,
      })
    );
  }
  async ZRemRangeByRank(request: ZRemRangeByRankRequest): Promise<Int64Value> {
    const operation = async (): Promise<Int64Value> => {
      const v = await this._store.conn.zremrangebyrank(
        this._makeKey(request.key?.key ?? '', request.scope ?? request.key?.scope),
        request.start,
        request.stop
      );
      return { value: Number(v) } as Int64Value;
    };
    return this._queueOrRun(
      this._extractTransactionId(request, request.key),
      operation,
      (result) => ({
        num: result.value,
      })
    );
  }
  async ZRemRangeByScore(request: ZRemRangeByScoreRequest): Promise<Int64Value> {
    const operation = async (): Promise<Int64Value> => {
      const v = await this._store.conn.zremrangebyscore(
        this._makeKey(request.key?.key ?? '', request.scope ?? request.key?.scope),
        request.min,
        request.max
      );
      return { value: Number(v) } as Int64Value;
    };
    return this._queueOrRun(
      this._extractTransactionId(request, request.key),
      operation,
      (result) => ({
        num: result.value,
      })
    );
  }
  async ZScan(request: ZScanRequest): Promise<ZScanResponse> {
    const operation = async (): Promise<ZScanResponse> => {
      const args: string[] = [];
      if (request.pattern) args.push('MATCH', request.pattern);
      if (request.count) args.push('COUNT', String(request.count));
      // ioredis types don't support spread arguments well, so we cast the function to any
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const [cursor, elements] = await (this._store.conn.zscan as any)(
        this._makeKey(request.key, request.scope),
        request.cursor,
        ...args
      );
      const members: { member: string; score: number }[] = [];
      for (let i = 0; i < elements.length; i += 2) {
        // ioredis returns [member, score] pairs from zscan with WITHSCORES-like structure
        const member = elements[i]!;
        const score = Number(elements[i + 1]);
        members.push({ member, score });
      }
      return { cursor: Number(cursor), members } as ZScanResponse;
    };
    return this._queueOrRun(request.transactionId, operation, (result) => {
      const payload: string[] = [result.cursor.toString()];
      for (const member of result.members) {
        payload.push(member.member, member.score.toString());
      }
      return { values: { values: payload } };
    });
  }
  async ZScore(request: ZScoreRequest, metadata?: Metadata): Promise<DoubleValue> {
    const operation = async (): Promise<DoubleValue> => {
      const v = await this._store.conn.zscore(
        this._makeKey(request.key?.key ?? '', request.scope ?? request.key?.scope),
        request.member
      );
      if (v == null) {
        if (shouldThrowNil(metadata)) throw new Error('redis: nil');
        return { value: 0 } as DoubleValue;
      }
      return { value: Number(v) } as DoubleValue;
    };
    return this._queueOrRun(
      this._extractTransactionId(request, request.key),
      operation,
      (result) => ({ dbl: result.value })
    );
  }
  async ZRank(request: ZRankRequest, metadata?: Metadata): Promise<Int64Value> {
    const operation = async (): Promise<Int64Value> => {
      const v = await this._store.conn.zrank(
        this._makeKey(request.key?.key ?? '', request.scope ?? request.key?.scope),
        request.member
      );
      if (v == null) {
        if (shouldThrowNil(metadata)) throw new Error('redis: nil');
        return { value: -1 } as Int64Value;
      }
      return { value: Number(v) } as Int64Value;
    };
    return this._queueOrRun(
      this._extractTransactionId(request, request.key),
      operation,
      (result) => ({ num: result.value })
    );
  }
  async ZIncrBy(request: ZIncrByRequest): Promise<DoubleValue> {
    const operation = async (): Promise<DoubleValue> => {
      const v = await this._store.conn.zincrby(
        this._makeKey(request.key, request.scope),
        request.value,
        request.member
      );
      return { value: Number(v) } as DoubleValue;
    };
    return this._queueOrRun(request.transactionId, operation, (result) => ({ dbl: result.value }));
  }

  // Bitfield
  async Bitfield(request: BitfieldRequest): Promise<BitfieldResponse> {
    const flat: string[] = [];
    for (const cmd of request.commands ?? []) {
      if (cmd.set) {
        flat.push('SET', cmd.set.encoding, String(cmd.set.offset), String(cmd.set.value));
      } else if (cmd.get) {
        flat.push('GET', cmd.get.encoding, String(cmd.get.offset));
      } else if (cmd.incrBy) {
        flat.push(
          'INCRBY',
          cmd.incrBy.encoding,
          String(cmd.incrBy.offset),
          String(cmd.incrBy.increment)
        );
      } else if (cmd.overflow) {
        const behavior = cmd.overflow.behavior;
        const mode = behavior === 1 ? 'WRAP' : behavior === 2 ? 'SAT' : 'FAIL';
        flat.push('OVERFLOW', mode);
      }
    }
    // TODO: Fix this once BitfieldRequest supports scope. Looks like a bug that it doesn't?
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await (this._store.conn.bitfield as any)(
      this._makeKey(request.key, undefined),
      ...flat
    );
    return { results: res } as BitfieldResponse;
  }

  private _createTransaction(keys: string[] = []): TransactionState {
    const tx: TransactionState = {
      id: randomUUID(),
      commands: [],
      multiStarted: false,
      watchedKeys: [...keys],
      closed: false,
    };
    this._store.transactions.set(tx.id, tx);
    return tx;
  }

  private _getTransaction(transactionId: TransactionId): TransactionState {
    const tx = this._store.transactions.get(transactionId.id);
    if (!tx || tx.closed) {
      throw new Error(`Unknown or closed transaction ${transactionId.id}`);
    }
    return tx;
  }

  private _extractTransactionId(...candidates: unknown[]): TransactionId | undefined {
    for (const candidate of candidates) {
      if (
        candidate &&
        typeof candidate === 'object' &&
        'transactionId' in candidate &&
        candidate.transactionId
      ) {
        return (candidate as { transactionId?: TransactionId }).transactionId;
      }
    }
    return undefined;
  }

  private async _queueOrRun<T>(
    transactionId: TransactionId | undefined,
    operation: () => Promise<T>,
    mapper: (result: T) => TransactionResponse,
    queuedValue?: T
  ): Promise<T> {
    if (!transactionId) {
      return operation();
    }
    const tx = this._getTransaction(transactionId);
    if (!tx.multiStarted) {
      throw new Error(
        `Transaction ${transactionId.id} must call multi() before executing commands`
      );
    }
    tx.commands.push(async () => mapper(await operation()));
    if (queuedValue !== undefined) {
      return queuedValue;
    }
    return {} as T;
  }

  private _closeTransaction(transactionId: TransactionId): void {
    const tx = this._store.transactions.get(transactionId.id);
    if (tx) {
      tx.closed = true;
      this._store.transactions.delete(transactionId.id);
    }
  }
}

export class RedisMock implements PluginMock<RedisAPI> {
  readonly plugin: RedisPluginMock;
  private readonly _store: RedisStore;

  /**
   * @param conn - The Redis connection to use.
   * @param keyPrefix - Optional prefix to scope all keys. If provided, `clear()` will only delete
   * keys starting with this prefix. This allows multiple test instances to share a single
   * Redis connection without interference.
   */
  constructor(conn: Redis, keyPrefix: string = '') {
    this._store = {
      transactions: new Map(),
      conn: conn,
      keyPrefix,
    };
    this.plugin = new RedisPluginMock(this._store);
  }

  /**
   * Clears the mock Redis state.
   */
  async clear(): Promise<void> {
    this._store.transactions.clear();
    if (this._store.keyPrefix) {
      const prefix = this._store.keyPrefix.endsWith(':')
        ? this._store.keyPrefix
        : `${this._store.keyPrefix}:`;
      const pattern = `${prefix}*`;
      let cursor = '0';
      do {
        const result = await this._store.conn.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
        cursor = result[0];
        const keys = result[1];
        if (keys.length > 0) {
          await this._store.conn.del(...keys);
        }
      } while (cursor !== '0');
    } else {
      await this._store.conn.flushall();
    }
  }
}
