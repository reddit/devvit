# Redis

You can add a database to your app to store and retrieve data. The Redis plugin is designed to be fast, scalable, and secure. It supports a subset of the full Redis API, including:

- [Transactions](#transactions) for things like counting votes atomically in polls
- [String operations](#strings) for persisting information
- [Number operations](#numbers) for incrementing numbers
- [Sorted sets](#sorted-set) for creating leaderboards
- [Hashes](#hash) for managing a collection of key-value pairs
- [Bitfields](#bitfield) for efficient operation on sequences of bits

Each app version installed on a subreddit is namespaced, which means Redis data is siloed from other subreddits. Keep in mind that there won’t be a single source of truth for all installations of your app, since each app installation can only access the data that it has stored in the Redis database.

## Limits and Quotas

- Max commands per second: 1000
- Max request size: 5 MB
- Max storage: 500 MB

All limits are applied at a per-installation granularity.

## Examples

### Menu items

```tsx
Devvit.addMenuItem({
  location: 'subreddit',
  label: 'Test Redis',
  onPress: async (event, { redis }) => {
    const key = 'hello';
    await redis.set(key, 'world');
    const value = await redis.get(key);
    console.log(`${key}: ${value}`);
  },
});
```

### Interactive posts

You can copy this [template](https://github.com/reddit/devvit/tree/main/packages/cli/src/templates/redis) to create an interactive post containing an interactive progress bar backed by Redis.

## Supported Redis commands

:::note
Not all Redis features are supported. If you would like to request a specific Redis feature, please reach out to our team [via modmail](https://www.reddit.com/message/compose/?to=%2Fr%2FDevvit) or Discord.
:::

### Simple read/write

| **Command**                                | **Action**                                                            |
| ------------------------------------------ | --------------------------------------------------------------------- |
| [get](https://redis.io/commands/get)       | Gets the value of key.                                                |
| [set](https://redis.io/commands/set)       | Sets key to hold a string value.                                      |
| [exists](https://redis.io/commands/exists) | Returns number of given keys that exist.                              |
| [del](https://redis.io/commands/del)       | Removes the specified keys.                                           |
| [type](https://redis.io/commands/type)     | Returns the string representation of the type of value stored at key. |
| [rename](https://redis.io/commands/rename) | Renames a key.                                                        |

<details><summary>Code Example</summary>

```tsx
async function simpleReadWriteExample(context: Devvit.Context) {
  // Set a key
  await context.redis.set('color', 'red');

  // Check if a key exists
  console.log('Key exists: ' + (await context.redis.exists('color')));

  // Get a key
  console.log('Color: ' + (await context.redis.get('color')));

  // Get the type of a key
  console.log('Type: ' + (await context.redis.type('color')));

  // Delete a key
  await context.redis.del('color');
}
```

```bash
Color: red
Type: string
```

</details>

### Batch read/write

| **Command**                            | **Action**                                      |
| -------------------------------------- | ----------------------------------------------- |
| [mGet](https://redis.io/commands/mget) | Returns the values of all specified keys.       |
| [mSet](https://redis.io/commands/mset) | Sets the given keys to their respective values. |

<details><summary>Code Example</summary>

```tsx
async function batchReadWriteExample(context: Devvit.Context) {
  // Set multiple keys at once
  await context.redis.mSet({
    name: 'Devvit',
    occupation: 'Developer',
    yearsOfExperience: '9000',
  });

  // Get multiple keys
  console.log('Result: ' + (await context.redis.mGet(['name', 'occupation'])));
}
```

```bash
Result: Devvit,Developer
```

</details>

### Strings

| **Command**                                    | **Action**                                                                                                             |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| [getRange](https://redis.io/commands/getrange) | Returns the substring of the string value stored at key, determined by the offsets start and end (both are inclusive). |
| [setRange](https://redis.io/commands/setrange) | Overwrites part of the string stored at key, starting at the specified offset, for the entire length of value.         |
| [strLen](https://redis.io/commands/strlen)     | Returns the length of the string value stored at key.                                                                  |

<details><summary>Code Example</summary>

```tsx
async function stringsExample(context: Devvit.Context) {
  // First, set 'word' to 'tacocat'
  await context.redis.set('word', 'tacocat');

  // Use getRange() to get the letters in 'word' between index 0 to 3, inclusive
  console.log('Range from index 0 to 3: ' + (await context.redis.getRange('word', 0, 3)));

  // Use setRange() to insert 'blue' at index 0
  await context.redis.setRange('word', 0, 'blue');

  console.log('Word after using setRange(): ' + (await context.redis.get('word')));

  // Use strLen() to verify the word length
  console.log('Word length: ' + (await context.redis.strLen('word')));
}
```

```bash
Range from index 0 to 3: taco
Word after using setRange(): bluecat
Word length: 7
```

</details>

### Hash

Redis hashes can store up to ~ 4.2 billion key-value pairs. We recommend using hash for managing collections of key-value pairs whenever possible and iterating over it using a combination of `hscan`, `hkeys` and `hgetall`.

| **Command**                                   | **Action**                                                                        |
| --------------------------------------------- | --------------------------------------------------------------------------------- |
| [hGet](https://redis.io/commands/hget)        | Returns the value associated with field in the hash stored at key.                |
| [hMGet](https://redis.io/commands/hmget)      | Returns the value of all specified field in the hash stored at multiple keys.     |
| [hSet](https://redis.io/commands/hset/)       | Sets the specified fields to their respective values in the hash stored at key.   |
| [hSetNX](https://redis.io/commands/hsetnx/)   | Sets field in the hash stored at key to value, only if field does not yet exist.ƒ |
| [hDel](https://redis.io/commands/hdel/)       | Removes the specified fields from the hash stored at key.                         |
| [hGetAll](https://redis.io/commands/hgetall/) | Returns a map of fields and their values stored in the hash.                      |
| [hKeys](https://redis.io/commands/hkeys/)     | Returns all field names in the hash stored at key.                                |
| [hScan](https://redis.io/commands/hscan/)     | Iterates fields of Hash types and their associated values.                        |
| [hIncrBy](https://redis.io/commands/hincrby/) | Increments the score of member in the sorted set stored at key by value.          |
| [hLen](https://redis.io/commands/hlen/)       | Returns the number of fields contained in the hash stored at key.                 |

<details><summary>Code Examples</summary>

**Example 1**

```tsx
// Example using hGet(), hSet(), and hDel()
async function hashExample1(context: Devvit.Context) {
  // Set 'inventory' with multiple fields and values
  await context.redis.hSet('inventory', {
    sword: '1',
    potion: '4',
    shield: '2',
    stones: '8',
  });

  // Get the value of 'shield' from 'inventory'
  console.log('Shield count: ' + await context.redis.hGet('inventory', 'shield'));

  // Get the values of both of 'shield' and 'potion' from 'inventory'
  console.log('Shield and potion count: ' + await context.redis.hMGet('inventory', ['shield', 'potion']));

  // Delete some fields from 'inventory'
  console.log(
    'Number of fields deleted: ' +
      await context.redis.hDel('inventory', ['sword', 'shield', 'stones']);
  );
}
```

```bash
Shield count: 2
Shield and potion count: 2,4
Number of fields deleted: 3
```

---

**Example 2**

```tsx
// Example using hGetAll()
async function hashExample2(context: Devvit.Context) {
  // Set 'groceryList' to fields containing products with quantities
  await context.redis.hSet('groceryList', {
    eggs: '12',
    apples: '3',
    milk: '1',
  });

  // Get the groceryList record
  const record = await context.redis.hGetAll('groceryList');

  if (record != undefined) {
    console.log('Eggs: ' + record.eggs + ', Apples: ' + record.apples + ', Milk: ' + record.milk);
  }
}
```

```bash
Eggs: 12, Apples: 3, Milk: 1
```

---

**Example 3**

```tsx
// Example using hKeys()
async function hashExample3(context: Devvit.Context) {
  await context.redis.hSet('prices', {
    chair: '48',
    desk: '95',
    whiteboard: '23',
  });

  console.log('Keys: ' + (await context.redis.hKeys('prices')));
}
```

```bash
Keys: chair,desk,whiteboard
```

---

**Example 4**

```tsx
// Example using hScan()
async function hashExample4(context: Devvit.Context) {
  await context.redis.hSet('userInfo', {
    name: 'Bob',
    startDate: '01-05-20',
    totalAwards: '12',
  });

  // Scan and interate over all the fields within 'userInfo'
  const hScanResponse = await context.redis.hScan('userInfo', 0);

  hScanResponse.fieldValues.forEach((x) => {
    console.log("Field: '" + x.field + "', Value: '" + x.value + "'");
  });
}
```

```bash
Field: 'name', Value: 'Bob'
Field: 'totalAwards', Value: '12'
Field: 'startDate', Value: '01-05-20'
```

---

**Example 5**

```tsx
// Example using hIncrBy()
async function hashExample5(context: Devvit.Context) {
  // Set user123's karma to 100
  await context.redis.hSet('user123', { karma: '100' });

  // Increase user123's karma by 5
  console.log('Updated karma: ' + (await context.redis.hIncrBy('user123', 'karma', 5)));
}
```

```bash
Updated karma: 105
```

---

**Example 6**

```tsx
// Example using hLen()
async function hashExample6(context: Devvit.Context) {
  await context.redis.hSet('supplies', {
    paperclips: '25',
    pencils: '10',
    erasers: '5',
    pens: '7',
  });

  console.log('Number of fields: ' + (await context.redis.hLen('supplies')));
}
```

```bash
Number of fields: 4
```

</details>

### Numbers

| **Command**                                | **Action**                                        |
| ------------------------------------------ | ------------------------------------------------- |
| [incrBy](https://redis.io/commands/incrby) | Increments the number stored at key by increment. |

<details><summary>Code Example</summary>

```tsx
async function numbersExample(context: Devvit.Context) {
  await context.redis.set('totalPoints', '53');

  console.log('Updated points: ' + (await context.redis.incrBy('totalPoints', 100)));
}
```

```bash
Updated points: 153
```

</details>

### Key expiration

| **Command**                                         | **Action**                                                        |
| --------------------------------------------------- | ----------------------------------------------------------------- |
| [expire](https://redis.io/commands/expire/)         | Sets a timeout on key.                                            |
| [expireTime](https://redis.io/commands/expiretime/) | Returns the remaining seconds at which the given key will expire. |

<details><summary>Code Example</summary>

```tsx
async function keyExpirationExample(context: Devvit.Context) {
  // Set a key 'product' with value 'milk'
  await context.redis.set('product', 'milk');

  // Get the current expireTime for the product
  console.log('Expire time: ' + (await context.redis.expireTime('product')));

  // Set the product to expire in 60 seconds
  await context.redis.expire('product', 60);

  // Get the updated expireTime for the product
  console.log('Updated expire time: ' + (await context.redis.expireTime('product')));
}
```

```bash
Expire time: 0
Updated expire time: 60
```

</details>

### [Transactions](https://redis.io/topics/transactions)

Redis transactions allow a group of commands to be executed in a single isolated step. For example, to implement voting action in a polls app, these three actions need to happen together:

- Store the selected option for the user.
- Increment the count for selected option.
- Add the user to voted user list.

The `watch` command provides an entrypoint for transactions. It returns a [TxClientLike](https://developers.reddit.com/docs/api/public-api/#-txclientlike) which can be used to call `multi`, `exec`, `discard`, `unwatch`, and all other Redis commands to be executed within a transaction.

You can sequence all of the above steps in a single transaction using `multi` and `exec` to ensure that either all of the steps happen together or none at all.

If an error occurs inside a transaction before `exec` is called, Redis discards the transaction automatically. See the Redis docs: [Errors inside a transaction](https://redis.io/docs/latest/develop/interact/transactions/#errors-inside-a-transaction) for more info.

| **Command**                                   | **Action**                                                                                                                                                                                                                                      |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [multi](https://redis.io/commands/multi/)     | Marks the start of a transaction block.                                                                                                                                                                                                         |
| [exec](https://redis.io/commands/exec/)       | Executes all previously queued commands in a transaction and restores the connection state to normal.                                                                                                                                           |
| [discard](https://redis.io/commands/discard/) | Flushes all previously queued commands in a transaction and restores the connection state to normal.                                                                                                                                            |
| [watch](https://redis.io/commands/watch/)     | Marks the given keys to be watched for conditional execution of a transaction. `watch` returns a [TxClientLike](https://developers.reddit.com/docs/api/public-api/#-txclientlike) which should be used to call Redis commands in a transaction. |
| [unwatch](https://redis.io/commands/unwatch/) | Flushes all the previously watched keys for a transaction.                                                                                                                                                                                      |

<details><summary>Code Examples</summary>

**Example 1**

```tsx
// Example using exec()
async function transactionsExample1(context: Devvit.Context) {
  await context.redis.mSet({ quantity: '5', karma: '32' });

  const txn = await context.redis.watch('quantity');

  await txn.multi(); // Begin a transaction
  await txn.incrBy('karma', 10);
  await txn.set('name', 'Devvit');
  await txn.exec(); // Execute the commands in the transaction

  console.log(
    'Keys after completing transaction: ' +
      (await context.redis.mGet(['quantity', 'karma', 'name']))
  );
}
```

```bash
Keys after completing transaction: 5,42,Devvit
```

---

**Example 2**

```tsx
// Example using discard()
async function transactionsExample2(context: Devvit.Context) {
  await context.redis.set('price', '25');

  const txn = await context.redis.watch('price');

  await txn.multi(); // Begin a transaction
  await txn.incrBy('price', 5);
  await txn.discard(); // Discard the commands in the transaction

  console.log('Price value: ' + (await context.redis.get('price'))); // 'price' should still be '25'
}
```

```bash
Price value: 25
```

---

**Example 3**

```tsx
// Example using unwatch()
async function transactionsExample3(context: Devvit.Context) {
  await context.redis.set('gold', '50');

  const txn = await context.redis.watch('gold');

  await txn.multi(); // Begin a transaction
  await txn.incrBy('gold', 30);
  await txn.unwatch(); // Unwatch "gold"

  // Now that "gold" has been unwatched, we can increment its value
  // outside the transaction without canceling the transaction
  await context.redis.incrBy('gold', -20);

  await txn.exec(); // Execute the commands in the transaction

  console.log('Gold value: ' + (await context.redis.get('gold'))); // The value of 'gold' should be 50 + 30 - 20 = 60
}
```

```bash
Gold value: 60
```

</details>

### Sorted set

| **Command**                                                     | **Action**                                                                                                                                                                                                                                                      |
| --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [zAdd](https://redis.io/commands/zadd/)                         | Adds all the specified members with the specified scores to the sorted set stored at key.                                                                                                                                                                       |
| [zCard](https://redis.io/commands/zcard)                        | Returns the sorted set cardinality (number of elements) of the sorted set stored at key.                                                                                                                                                                        |
| [zRange](https://redis.io/commands/zrange/)                     | Returns the specified range of elements in the sorted set stored at key. <br><br> When using `by: 'lex'`, the start and stop inputs will be prepended with `[` by default, unless they already begin with `[`, `(` or are one of the special values `+` or `-`. |
| [zRem](https://redis.io/commands/zrem/)                         | Removes the specified members from the sorted set stored at key.                                                                                                                                                                                                |
| [zScore](https://redis.io/commands/zscore/)                     | Returns the score of member in the sorted set at key.                                                                                                                                                                                                           |
| [zRank](https://redis.io/commands/zrank/)                       | Returns the rank of member in the sorted set stored at key.                                                                                                                                                                                                     |
| [zIncrBy](https://redis.io/commands/zincrby/)                   | Increments the score of member in the sorted set stored at key by value.                                                                                                                                                                                        |
| [zScan](https://redis.io/commands/zscan/)                       | Iterates elements of sorted set types and their associated scores. Note that there is no guaranteed ordering of elements in the result.                                                                                                                         |
| [zRemRangeByLex](https://redis.io/commands/zremrangebylex/)     | When all elements in a sorted set are inserted with the same score, this command removes the elements at key between the lexicographical range specified by min and max.                                                                                        |
| [zRemRangeByRank](https://redis.io/commands/zremrangebyrank/)   | Removes all elements in the sorted set stored at key with rank between start and stop.                                                                                                                                                                          |
| [zRemRangeByScore](https://redis.io/commands/zremrangebyscore/) | Removes all elements in the sorted set stored at key with a score between min and max (inclusive).                                                                                                                                                              |

<details><summary>Code Examples</summary>

**Example 1**

```tsx
// Example using zRange() with by 'score'
async function sortedSetExample1(context: Devvit.Context) {
  await context.redis.zAdd(
    'leaderboard',
    { member: 'louis', score: 37 },
    { member: 'fernando', score: 10 },
    { member: 'caesar', score: 20 },
    { member: 'alexander', score: 25 }
  );

  // Cardinality should be '4' as there are 4 elements in the leaderboard set
  console.log('Cardinality: ' + (await context.redis.zCard('leaderboard')));

  // View elements with scores between 0 and 30 inclusive, sorted by score
  let scores = await context.redis.zRange('leaderboard', 0, 30, { by: 'score' });
  console.log('Scores: ' + JSON.stringify(scores));

  // Remove 'fernando' from the leaderboard
  await context.redis.zRem('leaderboard', ['fernando']);

  // View the elements sorted by score again. This time 'fernando' should not appear in the output
  scores = await context.redis.zRange('leaderboard', 0, 30, { by: 'score' });
  console.log('Updated scores: ' + JSON.stringify(scores));

  // View caesar's score
  console.log("Caesar's score: " + (await context.redis.zScore('leaderboard', 'caesar')));
}
```

```bash
Cardinality: 4
Scores: [{"score":10,"member":"fernando"},{"score":20,"member":"caesar"},{"score":25,"member":"alexander"}]
Updated scores: [{"score":20,"member":"caesar"},{"score":25,"member":"alexander"}]
Caesar's score: 20
```

---

**Example 2**

```tsx
// Example using zRange() with by 'lex'
async function sortedSetExample2(context: Devvit.Context) {
  await context.redis.zAdd(
    'checkpoints',
    { member: 'delta', score: 0 },
    { member: 'omega', score: 0 },
    { member: 'alpha', score: 0 },
    { member: 'charlie', score: 0 }
  );

  // View elements between the words 'alpha' and 'fox' inclusive, sorted lexicographically
  // Note that 'by: "lex"' only works if all elements have the same score
  const members = await context.redis.zRange('checkpoints', 'alpha', 'fox', { by: 'lex' });
  console.log('Members: ' + JSON.stringify(members));
}
```

```bash
Members: [{"score":0,"member":"alpha"},{"score":0,"member":"charlie"},{"score":0,"member":"delta"}]
```

---

**Example 3**

```tsx
// Example using zRange() with by 'rank'
async function sortedSetExample3(context: Devvit.Context) {
  await context.redis.zAdd(
    'grades',
    { member: 'sam', score: 80 },
    { member: 'norma', score: 95 },
    { member: 'alex', score: 77 },
    { member: 'don', score: 84 },
    { member: 'zeek', score: 92 }
  );

  // View elements with a rank between 2 and 4 inclusive. Note that ranks start at index 0.
  const members = await context.redis.zRange('grades', 2, 4, { by: 'rank' });
  console.log('Members: ' + JSON.stringify(members));
}
```

```bash
Members: [{"score":84,"member":"don"},{"score":92,"member":"zeek"},{"score":95,"member":"norma"}]
```

---

**Example 4**

```tsx
// Example using zRank() and zIncrBy()
async function sortedSetExample4(context: Devvit.Context) {
  await context.redis.zAdd(
    'animals',
    { member: 'zebra', score: 92 },
    { member: 'cat', score: 100 },
    { member: 'dog', score: 95 },
    { member: 'elephant', score: 97 }
  );

  // View the rank of 'dog' in the animals set
  // Rank should be '1' since 'dog' has the second lowest score. Note that ranks start at index 0.
  console.log("Dog's rank: " + (await context.redis.zRank('animals', 'dog')));

  // View the rank of 'zebra'
  console.log("Zebra's rank: " + (await context.redis.zRank('animals', 'zebra')));

  // Increase the score of 'dog' by 10
  await context.redis.zIncrBy('animals', 'dog', 10);

  // View the rank of 'dog' again. This time it should be '3' because dog has the highest score.
  console.log(
    "Dog's rank after incrementing score: " + (await context.redis.zRank('animals', 'dog'))
  );
}
```

```bash
Dog's rank: 1
Zebra's rank: 0
Dog's rank after incrementing score: 3
```

---

**Example 5**

```tsx
// Example using zRemRangeByLex()
async function sortedSetExample5(context: Devvit.Context) {
  await context.redis.zAdd(
    'fruits',
    { member: 'kiwi', score: 0 },
    { member: 'mango', score: 0 },
    { member: 'banana', score: 0 },
    { member: 'orange', score: 0 },
    { member: 'apple', score: 0 }
  );

  // Remove fruits alphabetically ordered between 'kiwi' inclusive and 'orange' exclusive
  // Note: The symbols '[' and '(' indicate inclusive or exclusive, respectively. These must be included in the call to zRemRangeByLex().
  await context.redis.zRemRangeByLex('fruits', '[kiwi', '(orange');

  // Only 'apple', 'banana', and 'orange' should remain in the set
  const zScanResponse = await context.redis.zScan('fruits', 0);
  console.log('zScanResponse: ' + JSON.stringify(zScanResponse));
}
```

```bash
zScanResponse: {"cursor":0,"members":[{"score":0,"member":"apple"},{"score":0,"member":"banana"},{"score":0,"member":"orange"}]}
```

---

**Example 6**

```tsx
// Example using zRemRangeByRank()
async function sortedSetExample6(context: Devvit.Context) {
  await context.redis.zAdd(
    'fruits',
    { member: 'kiwi', score: 10 },
    { member: 'mango', score: 20 },
    { member: 'banana', score: 30 },
    { member: 'orange', score: 40 },
    { member: 'apple', score: 50 }
  );

  // Remove fruits ranked 1 through 3 inclusive
  await context.redis.zRemRangeByRank('fruits', 1, 3);

  // Only 'kiwi' and 'apple' should remain in the set
  const zScanResponse = await context.redis.zScan('fruits', 0);
  console.log('zScanResponse: ' + JSON.stringify(zScanResponse));
}
```

```bash
zScanResponse: {"cursor":0,"members":[{"score":10,"member":"kiwi"},{"score":50,"member":"apple"}]}
```

---

**Example 7**

```tsx
// Example using zRemRangeByScore() example
async function sortedSetExample7(context: Devvit.Context) {
  await context.redis.zAdd(
    'fruits',
    { member: 'kiwi', score: 10 },
    { member: 'mango', score: 20 },
    { member: 'banana', score: 30 },
    { member: 'orange', score: 40 },
    { member: 'apple', score: 50 }
  );

  // Remove fruits scored between 30 and 50 inclusive
  await context.redis.zRemRangeByScore('fruits', 30, 50);

  // Only 'kiwi' and 'mango' should remain in the set
  const zScanResponse = await context.redis.zScan('fruits', 0);
  console.log('zScanResponse: ' + JSON.stringify(zScanResponse));
}
```

```bash
zScanResponse: {"cursor":0,"members":[{"score":10,"member":"kiwi"},{"score":20,"member":"mango"}]}
```

</details>

### Bitfield

| **Command**                                                 | **Action**                                        |
| ----------------------------------------------------------- | ------------------------------------------------- |
| [bitfield](https://redis.io/docs/latest/commands/bitfield/) | Performs a sequence of operations on a bit string |

<details><summary>Code Example</summary>

```tsx
async function bitfieldExample(context: Devvit.Context) {
  const setBits: number[] = await context.redis.bitfield('foo', 'set', 'i5', '#0', 11);
  console.log('Set result: ' + setBits); // [0]

  const getBits: number[] = await context.redis.bitfield('foo', 'get', 'i5', '#0');
  console.log('Get result: ' + setBits); // [11]

  const manyOperations: number[] = await context.redis.bitfield(
    'bar',
    'set',
    'u2',
    0,
    3,
    'get',
    'u2',
    0,
    'incrBy',
    'u2',
    0,
    1,
    'overflow',
    'sat',
    'get',
    'u2',
    0,
    'set',
    'u2',
    0,
    3,
    'incrBy',
    'u2',
    0,
    1
  );
  console.log('Results of many operations: ' + manyOperations); // [0, 3, 0, 0, 3, 3]
}
```

```bash
fooResults: [1, 0]
barResults: [0, 3, 0, 0, 3, 3]
```

</details>
