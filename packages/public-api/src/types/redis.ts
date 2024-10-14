import type { HScanResponse, ZScanResponse } from '@devvit/protos';

export type TxClientLike = {
  /**
   * Executes all previously queued commands in a transaction and
   * restores the connection state to normal. https://redis.io/commands/exec/
   * @returns array, each element being the reply to each of the commands in the atomic transaction.
   * @example
   * ```ts
   * async function execExample(context: Devvit.Context) {
   *  await context.redis.set("karma", "32");
   *
   *  const txn = await context.redis.watch("quantity");
   *
   *  await txn.multi();  // Begin a transaction
   *  await txn.incrBy("karma", 10);
   *  await txn.exec();   // Execute the commands in the transaction
   * }
   * ```
   */
  exec(): Promise<any[]>; // eslint-disable-line @typescript-eslint/no-explicit-any
  /**
   * Marks the start of a transaction block. Subsequent commands will be
   * queued for atomic execution using EXEC. https://redis.io/commands/multi/
   * @example
   * ```ts
   * async function multiExample(context: Devvit.Context) {
   *  await context.redis.set("karma", "32");
   *
   *  const txn = await context.redis.watch("quantity");
   *
   *  await txn.multi();  // Begin a transaction
   *  await txn.incrBy("karma", 10);
   *  await txn.exec();   // Execute the commands in the transaction
   * }
   * ```
   */
  multi(): Promise<void>;
  /**
   * Flushes all previously queued commands in a transaction and restores the connection state to normal.
   * If WATCH was used, DISCARD unwatches all keys watched by the connection. https://redis.io/docs/latest/commands/discard/
   * @example
   * ```ts
   * async function discardExample(context: Devvit.Context) {
   *  await context.redis.set("price", "25");
   *
   *  const txn = await context.redis.watch("price");
   *
   *  await txn.multi();     // Begin a transaction
   *  await txn.incrBy("price", 5);
   *  await txn.discard();   // Discard the commands in the transaction
   * }
   * ```
   */
  discard(): Promise<void>;
  /**
   * Marks the given keys to be watched for conditional execution of a transaction.
   * https://redis.io/commands/watch/
   * @arg {} keys - given keys to be watched
   * @example
   * ```ts
   * async function watchExample(context: Devvit.Context) {
   *  await context.redis.set("karma", "32");
   *
   *  const txn = await context.redis.watch("quantity");
   *
   *  await txn.multi();  // Begin a transaction
   *  await txn.incrBy("karma", 10);
   *  await txn.exec();   // Execute the commands in the transaction
   * }
   * ```
   */
  watch(...keys: string[]): Promise<TxClientLike>;
  /**
   * Flushes all the previously watched keys for a transaction.
   * If you call EXEC or DISCARD, there's no need to manually call UNWATCH.
   * https://redis.io/commands/unwatch/
   * @example
   * ```ts
   * async function unwatchExample(context: Devvit.Context) {
   *  await context.redis.set("gold", "50");
   *
   *  const txn = await context.redis.watch("gold");
   *
   *  await txn.multi();     // Begin a transaction
   *  await txn.incrBy("gold", 30);
   *  await txn.unwatch();   // Unwatch "gold"
   *
   *  // Now that "gold" has been unwatched, we can increment its value
   *  // outside the transaction without canceling the transaction
   *  await context.redis.incrBy("gold", -20);
   *
   *  await txn.exec();   // Execute the commands in the transaction
   *
   *  console.log("Gold value: " + await context.redis.get("gold")); // The value of 'gold' should be 50 + 30 - 20 = 60
   * }
   * ```
   */
  unwatch(): Promise<TxClientLike>;
  /**
   * Get the value of key. If the key does not exist the special value nil is returned.
   * https://redis.io/commands/get/
   * @arg {} key
   * @returns value of key or null when key does not exist.
   * @example
   * ```ts
   * async function getExample(context: Devvit.Context) {
   *  await context.redis.set("quantity", "5");
   *  const quantity : string | undefined = await context.redis.get("quantity");
   *  console.log("Quantity: " + quantity);
   * }
   * ```
   */
  get(key: string): Promise<TxClientLike>;
  /**
   * Set key to hold the string value. If key already holds a value, it is overwritten
   * https://redis.io/commands/set/
   * @arg {} key
   * @arg {} value
   * @arg {} options
   * @example
   * ```ts
   * async function setExample(context: Devvit.Context) {
   *  await context.redis.set("quantity", "5");
   * }
   * ```
   */
  set(key: string, value: string, options?: SetOptions): Promise<TxClientLike>;
  /**
   * Removes the specified keys. A key is ignored if it does not exist.
   * https://redis.io/commands/del/
   * @arg {} keys
   * @example
   * ```ts
   * async function delExample(context: Devvit.Context) {
   *  await context.redis.set("quantity", "5");
   *  await context.redis.del("quantity");
   * }
   * ```
   */
  del(...keys: string[]): Promise<TxClientLike>;
  /**
   * Increments the number stored at key by increment.
   * https://redis.io/commands/incrby/
   * @arg {} key
   * @arg {} value
   * @example
   * ```ts
   * async function incrByExample(context: Devvit.Context) {
   *  await context.redis.set("totalPoints", "53")
   *  const updatedPoints : number = await context.redis.incrBy("totalPoints", 100);
   *  console.log("Updated points: " + updatedPoints);
   * }
   * ```
   */
  incrBy(key: string, value: number): Promise<TxClientLike>;
  /**
   * Returns the string representation of the type of the value stored at key
   * https://redis.io/commands/type/
   * @arg {} key
   * @returns string representation of the type
   * @example
   * ```ts
   * async function typeExample(context: Devvit.Context) {
   *  await context.redis.set("quantity", "5");
   *  const type : string = await context.redis.type("quantity");
   *  console.log("Key type: " + type);
   * }
   * ```
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
   * @example
   * ```ts
   * async function getRangeExample(context: Devvit.Context) {
   *  await context.redis.set("word", "tacocat");
   *  const range : string = await context.redis.getRange("word", 0, 3)
   *  console.log("Range from index 0 to 3: " + range);
   * }
   * ```
   */
  getRange(key: string, start: number, end: number): Promise<TxClientLike>;
  /**
   * Overwrites part of the string stored at key, starting at the
   * specified offset, for the entire length of value.
   * https://redis.io/commands/setrange/
   * @arg {} key
   * @arg {} offset
   * @returns length of the string after it was modified by the command
   * @example
   * ```ts
   * async function setRangeExample(context: Devvit.Context) {
   *  await context.redis.set("word", "tacocat");
   *  await context.redis.setRange("word", 0, "blue");
   * }
   * ```
   */
  setRange(key: string, offset: number, value: string): Promise<TxClientLike>;
  /**
   * Returns the length of the string value stored at key.
   * An error is returned when key holds a non-string value.
   * https://redis.io/commands/strlen/
   * @deprecated Use {@link TxClientLike.strLen} instead.
   * @arg {} key
   * @returns length of the string stored at key
   */
  strlen(key: string): Promise<TxClientLike>;
  /**
   * Returns the length of the string value stored at key.
   * An error is returned when key holds a non-string value.
   * https://redis.io/commands/strlen/
   * @arg {} key
   * @returns length of the string stored at key
   * @example
   * ```ts
   * async function strLenExample(context: Devvit.Context) {
   *  await context.redis.set("word", "tacocat");
   *  const length : number = await context.redis.strLen("word");
   *  console.log("Length of word: " + length);
   * }
   * ```
   */
  strLen(key: string): Promise<TxClientLike>;
  /**
   * Returns the values of all specified keys.
   * https://redis.io/commands/mget/
   * @deprecated Use {@link TxClientLike.mGet} instead.
   * @arg {} keys
   * @returns list of values at the specified keys
   */
  mget(keys: string[]): Promise<TxClientLike>;
  /**
   * Returns the values of all specified keys.
   * https://redis.io/commands/mget/
   * @arg {} keys
   * @returns list of values at the specified keys
   * @example
   * ```ts
   * async function mGetExample(context: Devvit.Context) {
   *  await context.redis.mSet({"name": "Zeek", "occupation": "Developer"});
   *  const result : (string | null)[] = await context.redis.mGet(["name", "occupation"]);
   *  result.forEach(x => {
   *    console.log(x);
   *  });
   * }
   * ```
   */
  mGet(keys: string[]): Promise<TxClientLike>;
  /**
   * Sets the given keys to their respective values.
   * https://redis.io/commands/mset/
   * @deprecated Use {@link TxClientLike.mSet} instead.
   * @arg {} keyValues
   */
  mset(keyValues: { [key: string]: string }): Promise<TxClientLike>;
  /**
   * Sets the given keys to their respective values.
   * https://redis.io/commands/mset/
   * @arg {} keyValues
   * @example
   * ```ts
   * async function mSetExample(context: Devvit.Context) {
   *  await context.redis.mSet({"name": "Zeek", "occupation": "Developer"});
   * }
   * ```
   */
  mSet(keyValues: { [key: string]: string }): Promise<TxClientLike>;
  /**
   * Set a timeout on key.
   * https://redis.io/commands/expire/
   * @arg {} key
   * @arg {} seconds
   * @example
   * ```ts
   * async function expireExample(context: Devvit.Context) {
   *  await context.redis.set("product", "milk");
   *  await context.redis.expire("product", 60);   // Set the product to expire in 60 seconds
   * }
   * ```
   */
  expire(key: string, seconds: number): Promise<TxClientLike>;
  /**
   * Returns the absolute Unix timestamp in seconds at which the given key will expire
   * https://redis.io/commands/expiretime/
   * @arg {} key
   * @returns expiration Unix timestamp in seconds, or a negative value in order to signal an error
   * @example
   * async function expireTimeExample(context: Devvit.Context) {
   *  await context.redis.set("product", "milk");
   *  const expireTime : number = await context.redis.expireTime("product");
   *  console.log("Expire time: " + expireTime);
   * }
   */
  expireTime(key: string): Promise<TxClientLike>;
  /**
   * Adds all the specified members with the specified scores to the sorted set stored at key.
   * https://redis.io/commands/zadd/
   * @arg {} key
   * @returns number of elements added to the sorted set
   * @example
   * ```ts
   * async function zAddExample(context: Devvit.Context) {
   *  const numMembersAdded : number = await context.redis.zAdd("leaderboard",
   *    {member: "louis", score: 37},
   *    {member: "fernando", score: 10},
   *    {member: "caesar", score: 20},
   *    {member: "alexander", score: 25},
   *  );
   *  console.log("Number of members added: " + numMembersAdded);
   * }
   * ```
   */
  zAdd(key: string, ...members: ZMember[]): Promise<TxClientLike>;
  /**
   * Returns the cardinality (number of elements) of the sorted set stored at key.
   * https://redis.io/commands/zcard/
   * @arg {} key
   * @returns cardinality of the sorted set
   * @example
   * ```ts
   * async function zCardExample(context: Devvit.Context) {
   *  await context.redis.zAdd("leaderboard",
   *    {member: "louis", score: 37},
   *    {member: "fernando", score: 10},
   *    {member: "caesar", score: 20},
   *    {member: "alexander", score: 25},
   *  );
   *  const cardinality : number = await context.redis.zCard("leaderboard");
   *  console.log("Cardinality: " + cardinality);
   * }
   * ```
   */
  zCard(key: string): Promise<TxClientLike>;
  /**
   * Increments the score of member in the sorted set stored at key by value
   * https://redis.io/commands/zincrby/
   * @arg {} key
   * @arg {} member
   * @arg {} value
   * @returns the new score of member as a double precision floating point number
   * @example
   * ```ts
   * async function zIncrByExample(context: Devvit.Context) {
   *  await context.redis.zAdd("animals",
   *    {member: "zebra", score: 92},
   *    {member: "cat", score: 100},
   *    {member: "dog", score: 95},
   *    {member: "elephant", score: 97}
   *  );
   *  const updatedScore : number = await context.redis.zIncrBy("animals", "dog", 10);
   *  console.log("Dog's updated score: " + updatedScore);
   * }
   * ```
   */
  zIncrBy(key: string, member: string, value: number): Promise<TxClientLike>;
  /**
   * Returns the rank of member in the sorted set stored at key
   * https://redis.io/commands/zrank/
   * @arg {} key
   * @arg {} member
   * @returns rank of the member. The rank (or index) is 0-based
   * which means that the member with the lowest score has rank 0
   * @example
   * ```ts
   * async function zRankExample(context: Devvit.Context) {
   *  await context.redis.zAdd("animals",
   *    {member: "zebra", score: 92},
   *    {member: "cat", score: 100},
   *    {member: "dog", score: 95},
   *    {member: "elephant", score: 97}
   *  );
   *  const rank : number = await context.redis.zRank("animals", "dog");
   *  console.log("Dog's rank: " + rank);
   * }
   * ```
   */
  zRank(key: string, member: string): Promise<TxClientLike>;
  /**
   * Returns the score of member in the sorted set at key.
   * https://redis.io/commands/zscore/
   * @arg {} key
   * @arg {} member
   * @returns the score of the member (a double-precision floating point number).
   * @example
   * ```ts
   * async function zScoreExample(context: Devvit.Context) {
   *  await context.redis.zAdd("leaderboard",
   *    {member: "louis", score: 37},
   *    {member: "fernando", score: 10},
   *    {member: "caesar", score: 20},
   *    {member: "alexander", score: 25},
   *  );
   *  const score : number | undefined = await context.redis.zScore("leaderboard", "caesar");
   *  if(score !== undefined) {
   *    console.log("Caesar's score: " + score);
   *  }
   * }
   * ```
   */
  zScore(key: string, member: string): Promise<TxClientLike>;
  /**
   * Iterates elements of Sorted Set types and their associated scores.
   * @arg {} key
   * @arg {} cursor
   * @arg {} pattern
   * @arg {} count
   * @example
   * ```ts
   * async function zScanExample(context: Devvit.Context) {
   *  await context.redis.zAdd("fruits",
   *    {member: "kiwi", score: 0},
   *    {member: "mango", score: 0},
   *    {member: "banana", score: 0},
   *    {member: "orange", score: 0},
   *    {member: "apple", score: 0},
   *  );
   *  const zScanResponse = await context.redis.zScan("fruits", 0);
   *  console.log("zScanResponse: " + JSON.stringify(zScanResponse));
   * }
   * ```
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
   *
   * When using `by: 'lex'`, the start and stop inputs will be prepended with `[` by default, unless they already begin with `[`, `(` or are one of the special values `+` or `-`.
   * @arg {} key
   * @arg {} start
   * @arg {} stop
   * @arg {} options
   * @returns list of elements in the specified range
   * @example
   * ```ts
   * async function zRangeExample(context: Devvit.Context) {
   *  await context.redis.zAdd("leaderboard",
   *    {member: "louis", score: 37},
   *    {member: "fernando", score: 10},
   *    {member: "caesar", score: 20},
   *    {member: "alexander", score: 25},
   *  );
   *
   *  // View elements with scores between 0 and 30 inclusive, sorted by score
   *  const scores : {member : string, score : number}[] = await context.redis.zRange("leaderboard", 0, 30, { by: "score" });
   *
   *  scores.forEach(x => {
   *    console.log("Member: " + x.member, ", Score: " + x.score);
   *  });
   * }
   * ```
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
   * @example
   * ```ts
   * async function zRemExample(context: Devvit.Context) {
   *  await context.redis.zAdd("leaderboard",
   *    {member: "louis", score: 37},
   *    {member: "fernando", score: 10},
   *    {member: "caesar", score: 20},
   *    {member: "alexander", score: 25},
   *  );
   *  const numberOfMembersRemoved : number = await context.redis.zRem("leaderboard", ["fernando", "alexander"]);
   *  console.log("Number of members removed: " + numberOfMembersRemoved);
   * }
   * ```
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
   * @example
   * ```ts
   * async function zRemRangeByLexExample(context: Devvit.Context) {
   *  await context.redis.zAdd("fruits",
   *    {member: "kiwi", score: 0},
   *    {member: "mango", score: 0},
   *    {member: "banana", score: 0},
   *    {member: "orange", score: 0},
   *    {member: "apple", score: 0},
   *  );
   *
   *  // Remove fruits alphabetically ordered between 'kiwi' inclusive and 'orange' exclusive
   *  // Note: The symbols '[' and '(' indicate inclusive or exclusive, respectively. These must be included in the call to zRemRangeByLex().
   *  const numFieldsRemoved : number = await context.redis.zRemRangeByLex("fruits", "[kiwi", "(orange");
   *  console.log("Number of fields removed: " + numFieldsRemoved);
   * }
   * ```
   */
  zRemRangeByLex(key: string, min: string, max: string): Promise<TxClientLike>;
  /**
   * Removes all elements in the sorted set stored at key with rank between start and stop.
   * https://redis.io/commands/zremrangebyrank/
   * @arg {} key
   * @arg {} start
   * @arg {} stop
   * @returns number of members removed from the sorted set
   * @example
   * ```
   * async function zRemRangeByRankExample(context: Devvit.Context) {
   *  await context.redis.zAdd("fruits", 
   *    {member: "kiwi", score: 10},
   *    {member: "mango", score: 20},
   *    {member: "banana", score: 30}, 
   *    {member: "orange", score: 40},
   *    {member: "apple", score: 50},
   *  );

   *  // Remove fruits ranked 1 through 3 inclusive
   *  const numFieldsRemoved : number = await context.redis.zRemRangeByRank("fruits", 1, 3);
   *  console.log("Number of fields removed: " + numFieldsRemoved);
   * }
   * ```
   */
  zRemRangeByRank(key: string, start: number, stop: number): Promise<TxClientLike>;
  /**
   * Removes all elements in the sorted set stored at key with a score between min and max
   * https://redis.io/commands/zremrangebyscore/
   * @arg {} key
   * @arg {} min
   * @arg {} max
   * @returns number of members removed from the sorted set
   * @example
   * ```ts
   * async function zRemRangeByScoreExample(context: Devvit.Context) {
   *  await context.redis.zAdd("fruits",
   *    {member: "kiwi", score: 10},
   *    {member: "mango", score: 20},
   *    {member: "banana", score: 30},
   *    {member: "orange", score: 40},
   *    {member: "apple", score: 50},
   *  );
   *  // Remove fruits scored between 30 and 50 inclusive
   *  const numFieldsRemoved : number = await context.redis.zRemRangeByScore("fruits", 30, 50);
   *  console.log("Number of fields removed: " + numFieldsRemoved);
   * }
   * ```
   */
  zRemRangeByScore(key: string, min: number, max: number): Promise<TxClientLike>;
  /**
   * Sets the specified fields to their respective values in the hash stored at key.
   * https://redis.io/commands/hset
   * @deprecated Use {@link TxClientLike.hSet} instead.
   * @arg {} key
   * @arg {} fieldValues
   * @returns number of fields that were added
   */
  hset(key: string, fieldValues: { [field: string]: string }): Promise<TxClientLike>;
  /**
   * Sets the specified fields to their respective values in the hash stored at key.
   * https://redis.io/commands/hset
   * @arg {} key
   * @arg {} fieldValues
   * @returns number of fields that were added
   * @example
   * ```ts
   * async function hSetExample(context: Devvit.Context) {
   *  const numFieldsAdded = await context.redis.hSet("fruits", {"apple": "5", "orange": "7", "kiwi": "9"});
   *  console.log("Number of fields added: " + numFieldsAdded);
   * }
   * ```
   */
  hSet(key: string, fieldValues: { [field: string]: string }): Promise<TxClientLike>;
  /**
   * Returns the value associated with field in the hash stored at key.
   * https://redis.io/commands/hget
   * @deprecated Use {@link TxClientLike.hGet} instead.
   * @arg {} key
   * @arg {} field
   * @returns value associated with field
   */
  hget(key: string, field: string): Promise<TxClientLike>;
  /**
   * Returns the value associated with field in the hash stored at key.
   * https://redis.io/commands/hget
   * @arg {} key
   * @arg {} field
   * @returns value associated with field
   * @example
   * ```ts
   * async function hGetExample(context: Devvit.Context) {
   *  await context.redis.hSet("fruits", {"apple": "5", "orange": "7", "kiwi": "9"});
   *  const result : string | undefined = await context.redis.hGet("fruits", "orange");
   *  console.log("Value of orange: " + result);
   * }
   * ```
   */
  hGet(key: string, field: string): Promise<TxClientLike>;
  /**
   * Returns all fields and values of the hash stored at key
   * https://redis.io/commands/hgetall
   * @deprecated Use {@link TxClientLike.hGetAll} instead.
   * @arg {} key
   * @returns a map of fields and their values stored in the hash,
   */
  hgetall(key: string): Promise<TxClientLike>;
  /**
   * Returns all fields and values of the hash stored at key
   * https://redis.io/commands/hgetall
   * @arg {} key
   * @returns a map of fields and their values stored in the hash,
   * @example
   * ```
   * async function hGetAllExample(context: Devvit.Context) {
   *  await context.redis.hSet("groceryList", {
   *   "eggs": "12",
   *   "apples": "3",
   *   "milk": "1"
   *  });
   *
   *  const record : Record<string, string> | undefined = await context.redis.hGetAll("groceryList");
   *
   *  if (record != undefined) {
   *   console.log("Eggs: " + record.eggs + ", Apples: " + record.apples + ", Milk: " + record.milk);
   *  }
   * }
   * ```
   */
  hGetAll(key: string): Promise<TxClientLike>;
  /**
   * Removes the specified fields from the hash stored at key.
   * https://redis.io/commands/hdel/
   * @deprecated Use {@link TxClientLike.hDel} instead.
   * @arg {} key
   * @arg {} fields
   * @returns number of fields that were removed from the hash
   */
  hdel(key: string, fields: string[]): Promise<TxClientLike>;
  /**
   * Removes the specified fields from the hash stored at key.
   * https://redis.io/commands/hdel/
   * @arg {} key
   * @arg {} fields
   * @returns number of fields that were removed from the hash
   * @example
   * ```ts
   * async function hDelExample(context: Devvit.Context) {
   *  await context.redis.hSet("fruits", {"apple": "5", "orange": "7", "kiwi": "9"});
   *  const numFieldsRemoved = await context.redis.hDel("fruits", ["apple", "kiwi"]);
   *  console.log("Number of fields removed: " + numFieldsRemoved);
   * }
   * ```
   */
  hDel(key: string, fields: string[]): Promise<TxClientLike>;
  /**
   * Iterates fields of Hash types and their associated values.
   * @deprecated Use {@link TxClientLike.hScan} instead.
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
   * Iterates fields of Hash types and their associated values.
   * @arg {} key
   * @arg {} cursor
   * @arg {} pattern
   * @arg {} count
   * @example
   * ```ts
   * async function hScanExample(context: Devvit.Context) {
   *  await context.redis.hSet("userInfo", {
   *    "name": "Bob",
   *    "startDate": "01-05-20",
   *    "totalAwards": "12"
   *  });
   *
   *  const hScanResponse = await context.redis.hScan("userInfo", 0);
   *
   *  hScanResponse.fieldValues.forEach(x => {
   *    console.log("Field: '" + x.field + "', Value: '" + x.value + "'");
   *  });
   * }
   * ```
   */
  hScan(
    key: string,
    cursor: number,
    pattern?: string | undefined,
    count?: number | undefined
  ): Promise<TxClientLike>;
  /**
   * Returns all field names in the hash stored at key.
   * @deprecated Use {@link TxClientLike.hKeys} instead.
   * @arg {} key
   */
  hkeys(key: string): Promise<TxClientLike>;
  /**
   * Returns all field names in the hash stored at key.
   * @arg {} key
   * @example
   * ```ts
   * async function hKeysExample(context: Devvit.Context) {
   *  await context.redis.hSet("prices", {
   *    "chair": "48",
   *    "desk": "95",
   *    "whiteboard": "23"
   *  });
   *  const keys : string[] = await context.redis.hKeys("prices");
   *  console.log("Keys: " + keys);
   * }
   * ```
   */
  hKeys(key: string): Promise<TxClientLike>;
  /**
   * Increments the number stored at field in the hash stored at key by increment.
   * https://redis.io/commands/hincrby/
   * @deprecated Use {@link TxClientLike.hIncrBy} instead.
   * @arg {} key
   * @arg {} field
   * @arg {} value
   * @returns value of key after the increment
   */
  hincrby(key: string, field: string, value: number): Promise<TxClientLike>;
  /**
   * Increments the number stored at field in the hash stored at key by increment.
   * https://redis.io/commands/hincrby/
   * @arg {} key
   * @arg {} field
   * @arg {} value
   * @returns value of key after the increment
   * @example
   * ```ts
   * async function hIncrByExample(context: Devvit.Context) {
   *  await context.redis.hSet("user123", { "karma": "100" });
   *  await context.redis.hIncrBy("user123", "karma", 5);
   * }
   * ```
   */
  hIncrBy(key: string, field: string, value: number): Promise<TxClientLike>;
  /**
   * Returns the number of fields contained in the hash stored at key.
   * @deprecated Use {@link TxClientLike.hLen} instead.
   * @arg {} key
   * @returns the number of fields in the hash, or 0 when the key does not exist.
   */
  hlen(key: string): Promise<TxClientLike>;
  /**
   * Returns the number of fields contained in the hash stored at key.
   * @arg {} key
   * @returns the number of fields in the hash, or 0 when the key does not exist.
   * @example
   * ```ts
   * async function hLenExample(context: Devvit.Context) {
   *  await context.redis.hSet("supplies", {
   *    "paperclips": "25",
   *    "pencils": "10",
   *    "erasers": "5",
   *    "pens": "7"
   *  });
   *  const numberOfFields : number = await context.redis.hLen("supplies");
   *  console.log("Number of fields: " + numberOfFields);
   * }
   * ```
   */
  hLen(key: string): Promise<TxClientLike>;
};

// See redis.io/commands for what these do.
export type RedisClient = {
  /**
   * Marks the given keys to be watched for conditional execution of a transaction.
   * https://redis.io/commands/watch/
   * @arg {} keys - given keys to be watched
   * @example
   * ```ts
   * async function watchExample(context: Devvit.Context) {
   *  await context.redis.set("karma", "32");
   *
   *  const txn = await context.redis.watch("quantity");
   *
   *  await txn.multi();  // Begin a transaction
   *  await txn.incrBy("karma", 10);
   *  await txn.exec();   // Execute the commands in the transaction
   * }
   * ```
   */
  watch(...keys: string[]): Promise<TxClientLike>;
  /**
   * Get the value of key. If the key does not exist the special value nil is returned.
   * https://redis.io/commands/get/
   * @arg {} key
   * @returns value of key or null when key does not exist.
   * @example
   * ```ts
   * async function getExample(context: Devvit.Context) {
   *  await context.redis.set("quantity", "5");
   *  const quantity : string | undefined = await context.redis.get("quantity");
   *  console.log("Quantity: " + quantity);
   * }
   * ```
   */
  get(key: string): Promise<string | undefined>;
  /**
   * Set key to hold the string value. If key already holds a value, it is overwritten
   * https://redis.io/commands/set/
   * @arg {} key
   * @arg {} value
   * @arg {} options
   * @example
   * ```ts
   * async function setExample(context: Devvit.Context) {
   *  await context.redis.set("quantity", "5");
   * }
   * ```
   */
  set(key: string, value: string, options?: SetOptions): Promise<string>;
  /**
   * Removes the specified keys. A key is ignored if it does not exist.
   * https://redis.io/commands/del/
   * @arg {} keys
   * @example
   * ```ts
   * async function delExample(context: Devvit.Context) {
   *  await context.redis.set("quantity", "5");
   *  await context.redis.del("quantity");
   * }
   * ```
   */
  del(...keys: string[]): Promise<void>;
  /**
   * Returns the string representation of the type of the value stored at key
   * https://redis.io/commands/type/
   * @arg {} key
   * @returns string representation of the type
   * @example
   * ```ts
   * async function typeExample(context: Devvit.Context) {
   *  await context.redis.set("quantity", "5");
   *  const type : string = await context.redis.type("quantity");
   *  console.log("Key type: " + type);
   * }
   * ```
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
   * @example
   * ```ts
   * async function getRangeExample(context: Devvit.Context) {
   *  await context.redis.set("word", "tacocat");
   *  const range : string = await context.redis.getRange("word", 0, 3)
   *  console.log("Range from index 0 to 3: " + range);
   * }
   * ```
   */
  getRange(key: string, start: number, end: number): Promise<string>;
  /**
   * Overwrites part of the string stored at key, starting at the
   * specified offset, for the entire length of value.
   * https://redis.io/commands/setrange/
   * @arg {} key
   * @arg {} offset
   * @returns length of the string after it was modified by the command
   * @example
   * ```ts
   * async function setRangeExample(context: Devvit.Context) {
   *  await context.redis.set("word", "tacocat");
   *  await context.redis.setRange("word", 0, "blue");
   * }
   * ```
   */
  setRange(key: string, offset: number, value: string): Promise<number>;
  /**
   * Returns the length of the string value stored at key.
   * An error is returned when key holds a non-string value.
   * https://redis.io/commands/strlen/
   * @deprecated Use {@link RedisClient.strLen} instead.
   * @arg {} key
   * @returns length of the string stored at key
   */
  strlen(key: string): Promise<number>;
  /**
   * Returns the length of the string value stored at key.
   * An error is returned when key holds a non-string value.
   * https://redis.io/commands/strlen/
   * @arg {} key
   * @returns length of the string stored at key
   * @example
   * ```ts
   * async function strLenExample(context: Devvit.Context) {
   *  await context.redis.set("word", "tacocat");
   *  const length : number = await context.redis.strLen("word");
   *  console.log("Length of word: " + length);
   * }
   * ```
   */
  strLen(key: string): Promise<number>;
  /**
   * Increments the number stored at key by increment.
   * https://redis.io/commands/incrby/
   * @arg {} key
   * @arg {} value
   * @returns value of key after the increment
   * @example
   * ```ts
   * async function incrByExample(context: Devvit.Context) {
   *  await context.redis.set("totalPoints", "53")
   *  const updatedPoints : number = await context.redis.incrBy("totalPoints", 100);
   *  console.log("Updated points: " + updatedPoints);
   * }
   * ```
   */
  incrBy(key: string, value: number): Promise<number>;
  /**
   * Returns the values of all specified keys.
   * https://redis.io/commands/mget/
   * @deprecated Use {@link RedisClient.mGet} instead.
   * @arg {} keys
   * @returns list of values at the specified keys
   */
  mget(keys: string[]): Promise<(string | null)[]>;
  /**
   * Returns the values of all specified keys.
   * https://redis.io/commands/mget/
   * @arg {} keys
   * @returns list of values at the specified keys
   * @example
   * ```ts
   * async function mGetExample(context: Devvit.Context) {
   *  await context.redis.mSet({"name": "Zeek", "occupation": "Developer"});
   *  const result : (string | null)[] = await context.redis.mGet(["name", "occupation"]);
   *  result.forEach(x => {
   *    console.log(x);
   *  });
   * }
   * ```
   */
  mGet(keys: string[]): Promise<(string | null)[]>;
  /**
   * Sets the given keys to their respective values.
   * https://redis.io/commands/mset/
   * @deprecated Use {@link RedisClient.mSet} instead.
   * @arg {} keyValues
   */
  mset(keyValues: { [key: string]: string }): Promise<void>;
  /**
   * Sets the given keys to their respective values.
   * https://redis.io/commands/mset/
   * @arg {} keyValues
   * @example
   * ```ts
   * async function mSetExample(context: Devvit.Context) {
   *  await context.redis.mSet({"name": "Zeek", "occupation": "Developer"});
   * }
   * ```
   */
  mSet(keyValues: { [key: string]: string }): Promise<void>;
  /**
   * Set a timeout on key.
   * https://redis.io/commands/expire/
   * @arg {} key
   * @arg {} seconds
   * @example
   * ```ts
   * async function expireExample(context: Devvit.Context) {
   *  await context.redis.set("product", "milk");
   *  await context.redis.expire("product", 60);   // Set the product to expire in 60 seconds
   * }
   * ```
   */
  expire(key: string, seconds: number): Promise<void>;
  /**
   * Returns the absolute Unix timestamp in seconds at which the given key will expire
   * https://redis.io/commands/expiretime/
   * @arg {} key
   * @returns expiration Unix timestamp in seconds, or a negative value in order to signal an error
   * @example
   * async function expireTimeExample(context: Devvit.Context) {
   *  await context.redis.set("product", "milk");
   *  const expireTime : number = await context.redis.expireTime("product");
   *  console.log("Expire time: " + expireTime);
   * }
   */
  expireTime(key: string): Promise<number>;
  /**
   * Adds all the specified members with the specified scores to the sorted set stored at key.
   * https://redis.io/commands/zadd/
   * @arg {} key
   * @returns number of elements added to the sorted set
   * @example
   * ```ts
   * async function zAddExample(context: Devvit.Context) {
   *  const numMembersAdded : number = await context.redis.zAdd("leaderboard",
   *    {member: "louis", score: 37},
   *    {member: "fernando", score: 10},
   *    {member: "caesar", score: 20},
   *    {member: "alexander", score: 25},
   *  );
   *  console.log("Number of members added: " + numMembersAdded);
   * }
   * ```
   */
  zAdd(key: string, ...members: ZMember[]): Promise<number>;
  /**
   * Returns the cardinality (number of elements) of the sorted set stored at key.
   * https://redis.io/commands/zcard/
   * @arg {} key
   * @returns cardinality of the sorted set
   * @example
   * ```ts
   * async function zCardExample(context: Devvit.Context) {
   *  await context.redis.zAdd("leaderboard",
   *    {member: "louis", score: 37},
   *    {member: "fernando", score: 10},
   *    {member: "caesar", score: 20},
   *    {member: "alexander", score: 25},
   *  );
   *  const cardinality : number = await context.redis.zCard("leaderboard");
   *  console.log("Cardinality: " + cardinality);
   * }
   * ```
   */
  zCard(key: string): Promise<number>;
  /**
   * Returns the score of member in the sorted set at key.
   * https://redis.io/commands/zscore/
   * @arg {} key
   * @arg {} member
   * @returns the score of the member (a double-precision floating point number).
   * @example
   * ```ts
   * async function zScoreExample(context: Devvit.Context) {
   *  await context.redis.zAdd("leaderboard",
   *    {member: "louis", score: 37},
   *    {member: "fernando", score: 10},
   *    {member: "caesar", score: 20},
   *    {member: "alexander", score: 25},
   *  );
   *  const score : number = await context.redis.zScore("leaderboard", "caesar");
   *  console.log("Caesar's score: " + score);
   * }
   * ```
   */
  zScore(key: string, member: string): Promise<number | undefined>;
  /**
   * Returns the rank of member in the sorted set stored at key
   * https://redis.io/commands/zrank/
   * @arg {} key
   * @arg {} member
   * @returns rank of the member. The rank (or index) is 0-based
   * which means that the member with the lowest score has rank 0
   * @example
   * ```ts
   * async function zRankExample(context: Devvit.Context) {
   *  await context.redis.zAdd("animals",
   *    {member: "zebra", score: 92},
   *    {member: "cat", score: 100},
   *    {member: "dog", score: 95},
   *    {member: "elephant", score: 97}
   *  );
   *  const rank : number | undefined = await context.redis.zRank("animals", "dog");
   *  if(rank !== undefined) {
   *    console.log("Dog's rank: " + rank);
   *  }
   * }
   * ```
   */
  zRank(key: string, member: string): Promise<number | undefined>;
  /**
   * Increments the score of member in the sorted set stored at key by value
   * https://redis.io/commands/zincrby/
   * @arg {} key
   * @arg {} member
   * @arg {} value
   * @returns the new score of member as a double precision floating point number
   * @example
   * ```ts
   * async function zIncrByExample(context: Devvit.Context) {
   *  await context.redis.zAdd("animals",
   *    {member: "zebra", score: 92},
   *    {member: "cat", score: 100},
   *    {member: "dog", score: 95},
   *    {member: "elephant", score: 97}
   *  );
   *  const updatedScore : number = await context.redis.zIncrBy("animals", "dog", 10);
   *  console.log("Dog's updated score: " + updatedScore);
   * }
   * ```
   */
  zIncrBy(key: string, member: string, value: number): Promise<number>;
  /**
   * Returns the specified range of elements in the sorted set stored at key.
   * https://redis.io/commands/zrange/
   *
   * When using `by: 'lex'`, the start and stop inputs will be prepended with `[` by default, unless they already begin with `[`, `(` or are one of the special values `+` or `-`.
   * @arg {} key
   * @arg {} start
   * @arg {} stop
   * @arg {} options
   * @returns list of elements in the specified range
   * @example
   * ```ts
   * async function zRangeExample(context: Devvit.Context) {
   *  await context.redis.zAdd("leaderboard",
   *    {member: "louis", score: 37},
   *    {member: "fernando", score: 10},
   *    {member: "caesar", score: 20},
   *    {member: "alexander", score: 25},
   *  );
   *
   *  // View elements with scores between 0 and 30 inclusive, sorted by score
   *  const scores : {member : string, score : number}[] = await context.redis.zRange("leaderboard", 0, 30, { by: "score" });
   *
   *  scores.forEach(x => {
   *    console.log("Member: " + x.member, ", Score: " + x.score);
   *  });
   * }
   * ```
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
   * @example
   * ```ts
   * async function zRemExample(context: Devvit.Context) {
   *  await context.redis.zAdd("leaderboard",
   *    {member: "louis", score: 37},
   *    {member: "fernando", score: 10},
   *    {member: "caesar", score: 20},
   *    {member: "alexander", score: 25},
   *  );
   *  const numberOfMembersRemoved : number = await context.redis.zRem("leaderboard", ["fernando", "alexander"]);
   *  console.log("Number of members removed: " + numberOfMembersRemoved);
   * }
   * ```
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
   * @example
   * ```ts
   * async function zRemRangeByLexExample(context: Devvit.Context) {
   *  await context.redis.zAdd("fruits",
   *    {member: "kiwi", score: 0},
   *    {member: "mango", score: 0},
   *    {member: "banana", score: 0},
   *    {member: "orange", score: 0},
   *    {member: "apple", score: 0},
   *  );
   *
   *  // Remove fruits alphabetically ordered between 'kiwi' inclusive and 'orange' exclusive
   *  // Note: The symbols '[' and '(' indicate inclusive or exclusive, respectively. These must be included in the call to zRemRangeByLex().
   *  const numFieldsRemoved : number = await context.redis.zRemRangeByLex("fruits", "[kiwi", "(orange");
   *  console.log("Number of fields removed: " + numFieldsRemoved);
   * }
   * ```
   */
  zRemRangeByLex(key: string, min: string, max: string): Promise<number>;
  /**
   * Removes all elements in the sorted set stored at key with rank between start and stop.
   * https://redis.io/commands/zremrangebyrank/
   * @arg {} key
   * @arg {} start
   * @arg {} stop
   * @returns number of members removed from the sorted set
   * @example
   * ```
   * async function zRemRangeByRankExample(context: Devvit.Context) {
   *  await context.redis.zAdd("fruits", 
   *    {member: "kiwi", score: 10},
   *    {member: "mango", score: 20},
   *    {member: "banana", score: 30}, 
   *    {member: "orange", score: 40},
   *    {member: "apple", score: 50},
   *  );

   *  // Remove fruits ranked 1 through 3 inclusive
   *  const numFieldsRemoved : number = await context.redis.zRemRangeByRank("fruits", 1, 3);
   *  console.log("Number of fields removed: " + numFieldsRemoved);
   * }
   * ```
   */
  zRemRangeByRank(key: string, start: number, stop: number): Promise<number>;
  /**
   * Removes all elements in the sorted set stored at key with a score between min and max
   * https://redis.io/commands/zremrangebyscore/
   * @arg {} key
   * @arg {} min
   * @arg {} max
   * @returns number of members removed from the sorted set
   * @example
   * ```ts
   * async function zRemRangeByScoreExample(context: Devvit.Context) {
   *  await context.redis.zAdd("fruits",
   *    {member: "kiwi", score: 10},
   *    {member: "mango", score: 20},
   *    {member: "banana", score: 30},
   *    {member: "orange", score: 40},
   *    {member: "apple", score: 50},
   *  );
   *  // Remove fruits scored between 30 and 50 inclusive
   *  const numFieldsRemoved : number = await context.redis.zRemRangeByScore("fruits", 30, 50);
   *  console.log("Number of fields removed: " + numFieldsRemoved);
   * }
   * ```
   */
  zRemRangeByScore(key: string, min: number, max: number): Promise<number>;
  /**
   * Iterates elements of Sorted Set types and their associated scores.
   * @arg {} key
   * @arg {} cursor
   * @arg {} pattern
   * @arg {} count
   * @example
   * ```ts
   * async function zScanExample(context: Devvit.Context) {
   *  await context.redis.zAdd("fruits",
   *    {member: "kiwi", score: 0},
   *    {member: "mango", score: 0},
   *    {member: "banana", score: 0},
   *    {member: "orange", score: 0},
   *    {member: "apple", score: 0},
   *  );
   *  const zScanResponse = await context.redis.zScan("fruits", 0);
   *  console.log("zScanResponse: " + JSON.stringify(zScanResponse));
   * }
   * ```
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
   * @deprecated Use {@link RedisClient.hSet} instead.
   * @arg {} key
   * @arg {} fieldValues
   * @returns number of fields that were added
   */
  hset(key: string, fieldValues: { [field: string]: string }): Promise<number>;
  /**
   * Sets the specified fields to their respective values in the hash stored at key.
   * https://redis.io/commands/hset
   * @arg {} key
   * @arg {} fieldValues
   * @returns number of fields that were added
   * @example
   * ```ts
   * async function hSetExample(context: Devvit.Context) {
   *  const numFieldsAdded = await context.redis.hSet("fruits", {"apple": "5", "orange": "7", "kiwi": "9"});
   *  console.log("Number of fields added: " + numFieldsAdded);
   * }
   * ```
   */
  hSet(key: string, fieldValues: { [field: string]: string }): Promise<number>;
  /**
   * Returns the value associated with field in the hash stored at key.
   * https://redis.io/commands/hget
   * @deprecated Use {@link RedisClient.hGet} instead.
   * @arg {} key
   * @arg {} field
   * @returns value associated with field
   */
  hget(key: string, field: string): Promise<string | undefined>;
  /**
   * Returns the value associated with field in the hash stored at key.
   * https://redis.io/commands/hget
   * @arg {} key
   * @arg {} field
   * @returns value associated with field
   * @example
   * ```ts
   * async function hGetExample(context: Devvit.Context) {
   *  await context.redis.hSet("fruits", {"apple": "5", "orange": "7", "kiwi": "9"});
   *  const result : string | undefined = await context.redis.hGet("fruits", "orange");
   *  console.log("Value of orange: " + result);
   * }
   * ```
   */
  hGet(key: string, field: string): Promise<string | undefined>;
  /**
   * Returns all fields and values of the hash stored at key
   * https://redis.io/commands/hgetall
   * @deprecated Use {@link RedisClient.hGetAll} instead.
   * @arg {} key
   * @returns a map of fields and their values stored in the hash,
   */
  hgetall(key: string): Promise<Record<string, string>>;
  /**
   * Returns all fields and values of the hash stored at key
   * https://redis.io/commands/hgetall
   * @arg {} key
   * @returns a map of fields and their values stored in the hash,
   * @example
   * ```
   * async function hGetAllExample(context: Devvit.Context) {
   *  await context.redis.hSet("groceryList", {
   *   "eggs": "12",
   *   "apples": "3",
   *   "milk": "1"
   *  });
   *
   *  const record : Record<string, string> = await context.redis.hGetAll("groceryList");
   *
   *  if (record.eggs !== undefined) {
   *   console.log(`Eggs: ${record.eggs}`);
   *  }
   * }
   * ```
   */
  hGetAll(key: string): Promise<Record<string, string>>;
  /**
   * Removes the specified fields from the hash stored at key.
   * https://redis.io/commands/hdel/
   * @deprecated Use {@link RedisClient.hDel} instead.
   * @arg {} key
   * @arg {} fields
   * @returns number of fields that were removed from the hash
   */
  hdel(key: string, fields: string[]): Promise<number>;
  /**
   * Removes the specified fields from the hash stored at key.
   * https://redis.io/commands/hdel/
   * @arg {} key
   * @arg {} fields
   * @returns number of fields that were removed from the hash
   * @example
   * ```ts
   * async function hDelExample(context: Devvit.Context) {
   *  await context.redis.hSet("fruits", {"apple": "5", "orange": "7", "kiwi": "9"});
   *  const numFieldsRemoved = await context.redis.hDel("fruits", ["apple", "kiwi"]);
   *  console.log("Number of fields removed: " + numFieldsRemoved);
   * }
   * ```
   */
  hDel(key: string, fields: string[]): Promise<number>;
  /**
   * Iterates fields of Hash types and their associated values.
   * @deprecated Use {@link RedisClient.hScan} instead.
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
   * Iterates fields of Hash types and their associated values.
   * @arg {} key
   * @arg {} cursor
   * @arg {} pattern
   * @arg {} count
   * @example
   * ```ts
   * async function hScanExample(context: Devvit.Context) {
   *  await context.redis.hSet("userInfo", {
   *    "name": "Bob",
   *    "startDate": "01-05-20",
   *    "totalAwards": "12"
   *  });
   *
   *  const hScanResponse = await context.redis.hScan("userInfo", 0);
   *
   *  hScanResponse.fieldValues.forEach(x => {
   *    console.log("Field: '" + x.field + "', Value: '" + x.value + "'");
   *  });
   * }
   * ```
   */
  hScan(
    key: string,
    cursor: number,
    pattern?: string | undefined,
    count?: number | undefined
  ): Promise<HScanResponse>;
  /**
   * Returns all field names in the hash stored at key.
   * @deprecated Use {@link RedisClient.hKeys} instead.
   * @arg {} key
   */
  hkeys(key: string): Promise<string[]>;
  /**
   * Returns all field names in the hash stored at key.
   * @arg {} key
   * @example
   * ```ts
   * async function hKeysExample(context: Devvit.Context) {
   *  await context.redis.hSet("prices", {
   *    "chair": "48",
   *    "desk": "95",
   *    "whiteboard": "23"
   *  });
   *  const keys : string[] = await context.redis.hKeys("prices");
   *  console.log("Keys: " + keys);
   * }
   * ```
   */
  hKeys(key: string): Promise<string[]>;
  /**
   * Increments the number stored at field in the hash stored at key by increment.
   * https://redis.io/commands/hincrby/
   * @deprecated Use {@link RedisClient.hIncrBy} instead.
   * @arg {} key
   * @arg {} field
   * @arg {} value
   * @returns value of key after the increment
   */
  hincrby(key: string, field: string, value: number): Promise<number>;
  /**
   * Increments the number stored at field in the hash stored at key by increment.
   * https://redis.io/commands/hincrby/
   * @arg {} key
   * @arg {} field
   * @arg {} value
   * @returns value of key after the increment
   * @example
   * ```ts
   * async function hIncrByExample(context: Devvit.Context) {
   *  await context.redis.hSet("user123", { "karma": "100" });
   *  await context.redis.hIncrBy("user123", "karma", 5);
   * }
   * ```
   */
  hIncrBy(key: string, field: string, value: number): Promise<number>;
  /**
   * Returns the number of fields contained in the hash stored at key.
   * @deprecated Use {@link RedisClient.hLen} instead.
   * @arg {} key
   * @returns the number of fields in the hash, or 0 when the key does not exist.
   */
  hlen(key: string): Promise<number>;
  /**
   * Returns the number of fields contained in the hash stored at key.
   * @arg {} key
   * @returns the number of fields in the hash, or 0 when the key does not exist.
   * @example
   * ```ts
   * async function hLenExample(context: Devvit.Context) {
   *  await context.redis.hSet("supplies", {
   *    "paperclips": "25",
   *    "pencils": "10",
   *    "erasers": "5",
   *    "pens": "7"
   *  });
   *  const numberOfFields : number = await context.redis.hLen("supplies");
   *  console.log("Number of fields: " + numberOfFields);
   * }
   * ```
   */
  hLen(key: string): Promise<number>;

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
