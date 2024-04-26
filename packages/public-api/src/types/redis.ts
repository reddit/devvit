import type { HScanResponse, ZScanResponse } from '@devvit/protos';

export type TxClientLike = {
  /**
   * Executes all previously queued commands in a transaction and
   * restores the connection state to normal. https://redis.io/commands/exec/
   * @returns array, each element being the reply to each of the commands in the atomic transaction.
   */
  exec(): Promise<any[]>; // eslint-disable-line @typescript-eslint/no-explicit-any
  /**
   * Marks the start of a transaction block. Subsequent commands will be
   * queued for atomic execution using EXEC. https://redis.io/commands/multi/
   */
  multi(): Promise<void>;
  discard(): Promise<void>;
  /**
   * Marks the given keys to be watched for conditional execution of a transaction.
   * https://redis.io/commands/watch/
   * @arg {} keys - given keys to be watched
   */
  watch(...keys: string[]): Promise<TxClientLike>;
  unwatch(): Promise<TxClientLike>;
  /**
   * Get the value of key. If the key does not exist the special value nil is returned.
   * https://redis.io/commands/get/
   * @arg {} key
   * @returns value of key or null when key does not exist.
   */
  get(key: string): Promise<TxClientLike>;
  /**
   * Set key to hold the string value. If key already holds a value, it is overwritten
   * https://redis.io/commands/set/
   * @arg {} key
   * @arg {} value
   * @arg {} options
   */
  set(key: string, value: string, options?: SetOptions): Promise<TxClientLike>;
  /**
   * Removes the specified keys. A key is ignored if it does not exist.
   * https://redis.io/commands/del/
   * @arg {} keys
   */
  del(...keys: string[]): Promise<TxClientLike>;
  /**
   * Increments the number stored at key by increment.
   * https://redis.io/commands/incrby/
   * @arg {} key
   * @arg {} value
   */
  incrBy(key: string, value: number): Promise<TxClientLike>;
  /**
   * Returns the string representation of the type of the value stored at key
   * https://redis.io/commands/type/
   * @arg {} key
   * @returns string representation of the type
   */
  type(key: string): Promise<TxClientLike>;
  /**
   * Returns the substring of the string value stored at key, determined by
   * the offsets start and end (both are inclusive).
   * https://redis.io/commands/getrange/
   * @arg {} key
   * @arg {} start
   * @arg {} end
   * @returns substring determined by offsets [start, end]
   */
  getRange(key: string, start: number, end: number): Promise<TxClientLike>;
  /**
   * Overwrites part of the string stored at key, starting at the
   * specified offset, for the entire length of value.
   * https://redis.io/commands/setrange/
   * @arg {} key
   * @arg {} offset
   * @returns length of the string after it was modified by the command
   */
  setRange(key: string, offset: number, value: string): Promise<TxClientLike>;
  /**
   * Returns the length of the string value stored at key.
   * An error is returned when key holds a non-string value.
   * https://redis.io/commands/strlen/
   * @arg {} key
   * @returns length of the string stored at key
   */
  strlen(key: string): Promise<TxClientLike>;
  /**
   * Returns the values of all specified keys.
   * https://redis.io/commands/mget/
   * @arg {} keys
   * @returns list of values at the specified keys
   */
  mget(keys: string[]): Promise<TxClientLike>;
  /**
   * Sets the given keys to their respective values.
   * https://redis.io/commands/mset/
   * @arg {} keyValues
   */
  mset(keyValues: { [key: string]: string }): Promise<TxClientLike>;
  /**
   * Set a timeout on key.
   * https://redis.io/commands/expire/
   * @arg {} key
   * @arg {} seconds
   */
  expire(key: string, seconds: number): Promise<TxClientLike>;
  /**
   * Returns the absolute Unix timestamp in seconds at which the given key will expire
   * https://redis.io/commands/expiretime/
   * @arg {} key
   * @returns expiration Unix timestamp in seconds, or a negative value in order to signal an error
   */
  expireTime(key: string): Promise<TxClientLike>;
  /**
   * Adds all the specified members with the specified scores to the sorted set stored at key.
   * https://redis.io/commands/zadd/
   * @arg {} key
   * @returns number of elements added to the sorted set
   */
  zAdd(key: string, ...members: ZMember[]): Promise<TxClientLike>;
  /**
   * Returns the cardinality (number of elements) of the sorted set stored at key.
   * https://redis.io/commands/zcard/
   * @arg {} key
   * @returns cardinality of the sorted set
   */
  zCard(key: string): Promise<TxClientLike>;
  /**
   * Increments the score of member in the sorted set stored at key by value
   * https://redis.io/commands/zincrby/
   * @arg {} key
   * @arg {} member
   * @arg {} value
   * @returns the new score of member as a double precision floating point number
   */
  zIncrBy(key: string, member: string, value: number): Promise<TxClientLike>;
  /**
   * Returns the rank of member in the sorted set stored at key
   * https://redis.io/commands/zrank/
   * @arg {} key
   * @arg {} member
   * @returns rank of the member. The rank (or index) is 0-based
   * which means that the member with the lowest score has rank 0
   */
  zRank(key: string, member: string): Promise<TxClientLike>;
  /**
   * Returns the score of member in the sorted set at key.
   * https://redis.io/commands/zscore/
   * @arg {} key
   * @arg {} member
   * @returns the score of the member (a double-precision floating point number).
   */
  zScore(key: string, member: string): Promise<TxClientLike>;
  /**
   * Iterates elements of Sorted Set types and their associated scores.
   * @arg {} key
   * @arg {} cursor
   * @arg {} pattern
   * @arg {} count
   */
  zScan(
    key: string,
    cursor: number,
    pattern?: string | undefined,
    count?: number | undefined
  ): Promise<TxClientLike>;
  /**
   * Returns the specified range of elements in the sorted set stored at key.
   * https://redis.io/commands/zrange/
   * @arg {} key
   * @arg {} start
   * @arg {} stop
   * @arg {} options
   * @returns list of elements in the specified range
   */
  zRange(
    key: string,
    start: number | string,
    stop: number | string,
    options?: ZRangeOptions
  ): Promise<TxClientLike>;
  /**
   * Removes the specified members from the sorted set stored at key.
   * https://redis.io/commands/zrem/
   * @arg {} key
   * @arg {} members
   * @returns number of members removed from the sorted set
   */
  zRem(key: string, members: string[]): Promise<TxClientLike>;
  /**
   * removes all elements in the sorted set stored at key between the
   * lexicographical range specified by min and max
   * https://redis.io/commands/zremrangebylex/
   * @arg {} key
   * @arg {} min
   * @arg {} max
   * @returns number of members removed from the sorted set
   */
  zRemRangeByLex(key: string, min: string, max: string): Promise<TxClientLike>;
  /**
   * Removes all elements in the sorted set stored at key with rank between start and stop.
   * https://redis.io/commands/zremrangebyrank/
   * @arg {} key
   * @arg {} start
   * @arg {} stop
   * @returns number of members removed from the sorted set
   */
  zRemRangeByRank(key: string, start: number, stop: number): Promise<TxClientLike>;
  /**
   * Removes all elements in the sorted set stored at key with a score between min and max
   * https://redis.io/commands/zremrangebyscore/
   * @arg {} key
   * @arg {} min
   * @arg {} max
   * @returns number of members removed from the sorted set
   */
  zRemRangeByScore(key: string, min: number, max: number): Promise<TxClientLike>;
  /**
   * Sets the specified fields to their respective values in the hash stored at key.
   * https://redis.io/commands/hset
   * @arg {} key
   * @arg {} fieldValues
   * @returns number of fields that were added
   */
  hset(key: string, fieldValues: { [field: string]: string }): Promise<TxClientLike>;
  /**
   * Returns the value associated with field in the hash stored at key.
   * https://redis.io/commands/hget
   * @arg {} key
   * @arg {} field
   * @returns value associated with field
   */
  hget(key: string, field: string): Promise<TxClientLike>;
  /**
   * Returns all fields and values of the hash stored at key
   * https://redis.io/commands/hgetall
   * @arg {} key
   * @returns a map of fields and their values stored in the hash,
   */
  hgetall(key: string): Promise<TxClientLike>;
  /**
   * Removes the specified fields from the hash stored at key.
   * https://redis.io/commands/hdel/
   * @arg {} key
   * @arg {} fields
   * @returns number of fields that were removed from the hash
   */
  hdel(key: string, fields: string[]): Promise<TxClientLike>;
  /**
   * Iterates fields of Hash types and their associated values.
   * @arg {} key
   * @arg {} cursor
   * @arg {} pattern
   * @arg {} count
   */
  hscan(
    key: string,
    cursor: number,
    pattern?: string | undefined,
    count?: number | undefined
  ): Promise<TxClientLike>;
  /**
   * Returns all field names in the hash stored at key.
   * @arg {} key
   */
  hkeys(key: string): Promise<TxClientLike>;
  /**
   * Increments the number stored at field in the hash stored at key by increment.
   * https://redis.io/commands/hincrby/
   * @arg {} key
   * @arg {} field
   * @arg {} value
   * @returns value of key after the increment
   */
  hincrby(key: string, field: string, value: number): Promise<TxClientLike>;
  /**
   * Returns the number of fields contained in the hash stored at key.
   * @arg {} key
   * @returns the number of fields in the hash, or 0 when the key does not exist.
   */
  hlen(key: string): Promise<TxClientLike>;
};

// See redis.io/commands for what these do.
export type RedisClient = {
  /**
   * Marks the given keys to be watched for conditional execution of a transaction.
   * https://redis.io/commands/watch/
   * @arg {} keys - given keys to be watched
   */
  watch(...keys: string[]): Promise<TxClientLike>;
  /**
   * Get the value of key. If the key does not exist the special value nil is returned.
   * https://redis.io/commands/get/
   * @arg {} key
   * @returns value of key or null when key does not exist.
   */
  get(key: string): Promise<string | undefined>;
  /**
   * Set key to hold the string value. If key already holds a value, it is overwritten
   * https://redis.io/commands/set/
   * @arg {} key
   * @arg {} value
   * @arg {} options
   */
  set(key: string, value: string, options?: SetOptions): Promise<string>;
  /**
   * Removes the specified keys. A key is ignored if it does not exist.
   * https://redis.io/commands/del/
   * @arg {} keys
   */
  del(...keys: string[]): Promise<void>;
  /**
   * Returns the string representation of the type of the value stored at key
   * https://redis.io/commands/type/
   * @arg {} key
   * @returns string representation of the type
   */
  type(key: string): Promise<string>;
  /**
   * Returns the substring of the string value stored at key, determined by
   * the offsets start and end (both are inclusive).
   * https://redis.io/commands/getrange/
   * @arg {} key
   * @arg {} start
   * @arg {} end
   * @returns substring determined by offsets [start, end]
   */
  getRange(key: string, start: number, end: number): Promise<string>;
  /**
   * Overwrites part of the string stored at key, starting at the
   * specified offset, for the entire length of value.
   * https://redis.io/commands/setrange/
   * @arg {} key
   * @arg {} offset
   * @returns length of the string after it was modified by the command
   */
  setRange(key: string, offset: number, value: string): Promise<number>;
  /**
   * Returns the length of the string value stored at key.
   * An error is returned when key holds a non-string value.
   * https://redis.io/commands/strlen/
   * @arg {} key
   * @returns length of the string stored at key
   */
  strlen(key: string): Promise<number>;
  /**
   * Increments the number stored at key by increment.
   * https://redis.io/commands/incrby/
   * @arg {} key
   * @arg {} value
   * @returns value of key after the increment
   */
  incrBy(key: string, value: number): Promise<number>;
  /**
   * Returns the values of all specified keys.
   * https://redis.io/commands/mget/
   * @arg {} keys
   * @returns list of values at the specified keys
   */
  mget(keys: string[]): Promise<(string | null)[]>;
  /**
   * Sets the given keys to their respective values.
   * https://redis.io/commands/mset/
   * @arg {} keyValues
   */
  mset(keyValues: { [key: string]: string }): Promise<void>;
  /**
   * Set a timeout on key.
   * https://redis.io/commands/expire/
   * @arg {} key
   * @arg {} seconds
   */
  expire(key: string, seconds: number): Promise<void>;
  /**
   * Returns the absolute Unix timestamp in seconds at which the given key will expire
   * https://redis.io/commands/expiretime/
   * @arg {} key
   * @returns expiration Unix timestamp in seconds, or a negative value in order to signal an error
   */
  expireTime(key: string): Promise<number>;
  /**
   * Adds all the specified members with the specified scores to the sorted set stored at key.
   * https://redis.io/commands/zadd/
   * @arg {} key
   * @returns number of elements added to the sorted set
   */
  zAdd(key: string, ...members: ZMember[]): Promise<number>;
  /**
   * Returns the cardinality (number of elements) of the sorted set stored at key.
   * https://redis.io/commands/zcard/
   * @arg {} key
   * @returns cardinality of the sorted set
   */
  zCard(key: string): Promise<number>;
  /**
   * Returns the score of member in the sorted set at key.
   * https://redis.io/commands/zscore/
   * @arg {} key
   * @arg {} member
   * @returns the score of the member (a double-precision floating point number).
   */
  zScore(key: string, member: string): Promise<number>;
  /**
   * Returns the rank of member in the sorted set stored at key
   * https://redis.io/commands/zrank/
   * @arg {} key
   * @arg {} member
   * @returns rank of the member. The rank (or index) is 0-based
   * which means that the member with the lowest score has rank 0
   */
  zRank(key: string, member: string): Promise<number>;
  /**
   * Increments the score of member in the sorted set stored at key by value
   * https://redis.io/commands/zincrby/
   * @arg {} key
   * @arg {} member
   * @arg {} value
   * @returns the new score of member as a double precision floating point number
   */
  zIncrBy(key: string, member: string, value: number): Promise<number>;
  /**
   * Returns the specified range of elements in the sorted set stored at key.
   * https://redis.io/commands/zrange/
   * @arg {} key
   * @arg {} start
   * @arg {} stop
   * @arg {} options
   * @returns list of elements in the specified range
   */
  zRange(
    key: string,
    start: number | string,
    stop: number | string,
    options?: ZRangeOptions
  ): Promise<{ member: string; score: number }[]>;
  /**
   * Removes the specified members from the sorted set stored at key.
   * https://redis.io/commands/zrem/
   * @arg {} key
   * @arg {} members
   * @returns number of members removed from the sorted set
   */
  zRem(key: string, members: string[]): Promise<number>;
  /**
   * removes all elements in the sorted set stored at key between the
   * lexicographical range specified by min and max
   * https://redis.io/commands/zremrangebylex/
   * @arg {} key
   * @arg {} min
   * @arg {} max
   * @returns number of members removed from the sorted set
   */
  zRemRangeByLex(key: string, min: string, max: string): Promise<number>;
  /**
   * Removes all elements in the sorted set stored at key with rank between start and stop.
   * https://redis.io/commands/zremrangebyrank/
   * @arg {} key
   * @arg {} start
   * @arg {} stop
   * @returns number of members removed from the sorted set
   */
  zRemRangeByRank(key: string, start: number, stop: number): Promise<number>;
  /**
   * Removes all elements in the sorted set stored at key with a score between min and max
   * https://redis.io/commands/zremrangebyscore/
   * @arg {} key
   * @arg {} min
   * @arg {} max
   * @returns number of members removed from the sorted set
   */
  zRemRangeByScore(key: string, min: number, max: number): Promise<number>;
  /**
   * Iterates elements of Sorted Set types and their associated scores.
   * @arg {} key
   * @arg {} cursor
   * @arg {} pattern
   * @arg {} count
   */
  zScan(
    key: string,
    cursor: number,
    pattern?: string | undefined,
    count?: number | undefined
  ): Promise<ZScanResponse>;
  /**
   * Sets the specified fields to their respective values in the hash stored at key.
   * https://redis.io/commands/hset
   * @arg {} key
   * @arg {} fieldValues
   * @returns number of fields that were added
   */
  hset(key: string, fieldValues: { [field: string]: string }): Promise<number>;
  /**
   * Returns the value associated with field in the hash stored at key.
   * https://redis.io/commands/hget
   * @arg {} key
   * @arg {} field
   * @returns value associated with field
   */
  hget(key: string, field: string): Promise<string | undefined>;
  /**
   * Returns all fields and values of the hash stored at key
   * https://redis.io/commands/hgetall
   * @arg {} key
   * @returns a map of fields and their values stored in the hash,
   */
  hgetall(key: string): Promise<Record<string, string> | undefined>;
  /**
   * Removes the specified fields from the hash stored at key.
   * https://redis.io/commands/hdel/
   * @arg {} key
   * @arg {} fields
   * @returns number of fields that were removed from the hash
   */
  hdel(key: string, fields: string[]): Promise<number>;
  /**
   * Iterates fields of Hash types and their associated values.
   * @arg {} key
   * @arg {} cursor
   * @arg {} pattern
   * @arg {} count
   */
  hscan(
    key: string,
    cursor: number,
    pattern?: string | undefined,
    count?: number | undefined
  ): Promise<HScanResponse>;
  /**
   * Returns all field names in the hash stored at key.
   * @arg {} key
   */
  hkeys(key: string): Promise<string[]>;
  /**
   * Increments the number stored at field in the hash stored at key by increment.
   * https://redis.io/commands/hincrby/
   * @arg {} key
   * @arg {} field
   * @arg {} value
   * @returns value of key after the increment
   */
  hincrby(key: string, field: string, value: number): Promise<number>;
  /**
   * Returns the number of fields contained in the hash stored at key.
   * @arg {} key
   * @returns the number of fields in the hash, or 0 when the key does not exist.
   */
  hlen(key: string): Promise<number>;

  /**
   * Allows read/write operations to global keys in Redis
   * Global redis enables apps to persist and access state across subreddit installations
   */
  global: Omit<RedisClient, 'global'>;
};

export type SetOptions = {
  /** Only set the key if it does not already exist. */
  nx?: boolean;
  /** Only set the key if it already exists. */
  xx?: boolean;
  expiration?: Date;
};
export type ZMember = {
  score: number;
  member: string;
};

export type ZRangeOptions = {
  /**
   * Reverses the sorted set, with index 0 as the element with the highest
   * score.
   */
  reverse?: boolean;
  by: 'score' | 'lex' | 'rank';
};

export type ZRangeByScoreOptions = {
  withScores?: boolean;
  limit?: {
    offset: number;
    count: number;
  };
};
