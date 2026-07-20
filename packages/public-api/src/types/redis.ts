import type {
  HScanResponse,
  RedisClient as RedisClientBase,
  TxClientLike as TxClientLikeBase,
} from '@devvit/redis';

export type {
  BitfieldCommand,
  SetOptions,
  ZMember,
  ZRangeByScoreOptions,
  ZRangeOptions,
} from '@devvit/redis';

export interface TxClientLike extends TxClientLikeBase {
  /** @deprecated Use {@link TxClientLike.strLen} instead. */
  strlen(key: string): Promise<TxClientLike>;
  /** @deprecated Use {@link TxClientLike.mGet} instead. */
  mget(keys: string[]): Promise<TxClientLike>;
  /** @deprecated Use {@link TxClientLike.mSet} instead. */
  mset(keyValues: { [key: string]: string }): Promise<TxClientLike>;
  /** @deprecated Use {@link TxClientLike.hSet} instead. */
  hset(key: string, fieldValues: { [field: string]: string }): Promise<TxClientLike>;
  /** @deprecated Use {@link TxClientLike.hGet} instead. */
  hget(key: string, field: string): Promise<TxClientLike>;
  /** @deprecated Use {@link TxClientLike.hGetAll} instead. */
  hgetall(key: string): Promise<TxClientLike>;
  /** @deprecated Use {@link TxClientLike.hDel} instead. */
  hdel(key: string, fields: string[]): Promise<TxClientLike>;
  /** @deprecated Use {@link TxClientLike.hScan} instead. */
  hscan(
    key: string,
    cursor: number,
    pattern?: string | undefined,
    count?: number | undefined
  ): Promise<TxClientLike>;
  /** @deprecated Use {@link TxClientLike.hKeys} instead. */
  hkeys(key: string): Promise<TxClientLike>;
  /** @deprecated Use {@link TxClientLike.hIncrBy} instead. */
  hincrby(key: string, field: string, value: number): Promise<TxClientLike>;
  /** @deprecated Use {@link TxClientLike.hLen} instead. */
  hlen(key: string): Promise<TxClientLike>;
}

export type RedisClient = Omit<RedisClientBase, 'global' | 'watch'> & {
  watch(...keys: string[]): Promise<TxClientLike>;
  /** @deprecated Use {@link RedisClient.strLen} instead. */
  strlen(key: string): Promise<number>;
  /** @deprecated Use {@link RedisClient.mGet} instead. */
  mget(keys: string[]): Promise<(string | null)[]>;
  /** @deprecated Use {@link RedisClient.mSet} instead. */
  mset(keyValues: { [key: string]: string }): Promise<void>;
  /** @deprecated Use {@link RedisClient.hSet} instead. */
  hset(key: string, fieldValues: { [field: string]: string }): Promise<number>;
  /** @deprecated Use {@link RedisClient.hGet} instead. */
  hget(key: string, field: string): Promise<string | undefined>;
  /** @deprecated Use {@link RedisClient.hGetAll} instead. */
  hgetall(key: string): Promise<Record<string, string>>;
  /** @deprecated Use {@link RedisClient.hDel} instead. */
  hdel(key: string, fields: string[]): Promise<number>;
  /** @deprecated Use {@link RedisClient.hScan} instead. */
  hscan(
    key: string,
    cursor: number,
    pattern?: string | undefined,
    count?: number | undefined
  ): Promise<HScanResponse>;
  /** @deprecated Use {@link RedisClient.hKeys} instead. */
  hkeys(key: string): Promise<string[]>;
  /** @deprecated Use {@link RedisClient.hIncrBy} instead. */
  hincrby(key: string, field: string, value: number): Promise<number>;
  /** @deprecated Use {@link RedisClient.hLen} instead. */
  hlen(key: string): Promise<number>;
  global: Omit<RedisClient, 'global'>;
};
