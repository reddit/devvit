# Redis

You can add a database to your app to store and retrieve data. The Redis plugin is designed to be fast, scalable, and secure. It supports a subset of the full Redis API, including:

- [Transactions](#transactions) for things like counting votes atomically in polls
- [String operations](#strings) for batch writing or incrementing numbers
- [Sorted sets](#sorted-set) for creating leaderboards
- [Hashes](#hash) for managing a collection of key-value pairs

Each app version installed on a subreddit is namespaced, which means Redis data is siloed from other subreddits. Keep in mind that there won’t be a single source of truth for all installations of your app, since each app installation can only access the data that it has stored in the Redis database.

## Limits and Quotas

- Max commands per second: 1000
- Max request size: 5 MB
- Max storage: 500 MB

All limits are applied at a per-installation granularity.

## Add Redis to your app

When creating an app, enable the plugin in `Devvit.configure`.

```tsx
Devvit.configure({
  redis: true,
});
```

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

### Experience posts

You can follow this template to create an experience post containing an interactive progress bar backed by Redis.

```tsx
// start from a template
devvit new <replace-with-your-app-name> --template=redis
devvit playtest <your-test-subreddit>
```

## Supported Redis commands

:::note
Not all Redis features are supported. If you would like to request a specific Redis feature, please reach out to our team [via modmail](https://www.reddit.com/message/compose/?to=%2Fr%2FDevvit) or Discord.
:::

### Simple read/write

| **Command**                            | **Action**                                                            |
| -------------------------------------- | --------------------------------------------------------------------- |
| [get](https://redis.io/commands/Get)   | Gets the value of key.                                                |
| [set](https://redis.io/commands/Set)   | Sets key to hold a string value.                                      |
| [del](https://redis.io/commands/Del)   | Removes the specified keys.                                           |
| [type](https://redis.io/commands/Type) | Returns the string representation of the type of value stored at key. |

### Batch read/write

| **Command**                            | **Action**                                      |
| -------------------------------------- | ----------------------------------------------- |
| [mget](https://redis.io/commands/MGet) | Returns the values of all specified keys.       |
| [mset](https://redis.io/commands/MSet) | Sets the given keys to their respective values. |

### Strings

| **Command**                                    | **Action**                                                                                                             |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| [getRange](https://redis.io/commands/GetRange) | Returns the substring of the string value stored at key, determined by the offsets start and end (both are inclusive). |
| [setRange](https://redis.io/commands/SetRange) | Overwrites part of the string stored at key, starting at the specified offset, for the entire length of value.         |
| [strlen](https://redis.io/commands/Strlen)     | Returns the length of the string value stored at key.                                                                  |

### Hash

Redis hashes can store up to ~ 4.2 billion key-value pairs. We recommend using hash for managing collections of key-value pairs whenever possible and iterating over it using a combination of `hscan`, `hkeys` and `hgetall`.

| **Command**                                   | **Action**                                                                      |
| --------------------------------------------- | ------------------------------------------------------------------------------- |
| [hget](https://redis.io/commands/hget)        | Returns the value associated with field in the hash stored at key.              |
| [hset](https://redis.io/commands/hset/)       | Sets the specified fields to their respective values in the hash stored at key. |
| [hdel](https://redis.io/commands/hdel/)       | Removes the specified fields from the hash stored at key.                       |
| [hgetall](https://redis.io/commands/hgetall/) | Returns a map of fields and their values stored in the hash                     |
| [hkeys](https://redis.io/commands/hkeys/)     | Returns all field names in the hash stored at key.                              |
| [hscan](https://redis.io/commands/hscan/)     | Iterates fields of Hash types and their associated values.                      |
| [hincrby](https://redis.io/commands/hincrby/) | Increments the score of member in the sorted set stored at key by value         |
| [hlen](https://redis.io/commands/hlen/)       | Returns the number of fields contained in the hash stored at key.               |

### Numbers

| **Command**                                | **Action**                                        |
| ------------------------------------------ | ------------------------------------------------- |
| [incrBy](https://redis.io/commands/incrby) | Increments the number stored at key by increment. |

### Key expiration

| **Command**                                         | **Action**                                                                                                 |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| [expire](https://redis.io/commands/expire/)         | Sets a timeout on key.                                                                                     |
| [expireTime](https://redis.io/commands/expiretime/) | Returns the absolute Unix timestamp (since January 1, 1970) in seconds at which the given key will expire. |

### [Transactions](https://redis.io/topics/transactions)

Redis transactions allow a group of commands to be executed in a single isolated step. For example, to implement voting action in a polls app, these three actions need to happen together:

- Store the selected option for the user.
- Increment the count for selected option.
- Add the user to voted user list.

You can sequence all of the above steps in a single transaction using `multi` and `exec` to ensure that either all of the steps happen together or none at all.

| **Command**                                   | **Action**                                                                                            |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| [multi](https://redis.io/commands/multi/)     | Marks the start of a transaction block.                                                               |
| [exec](https://redis.io/commands/exec/)       | Executes all previously queued commands in a transaction and restores the connection state to normal. |
| [discard](https://redis.io/commands/discard/) | Flushes all previously queued commands in a transaction and restores the connection state to normal.  |
| [watch](https://redis.io/commands/watch/)     | Marks the given keys to be watched for conditional execution of a transaction.                        |
| [unwatch](https://redis.io/commands/unwatch/) | Flushes all the previously watched keys for a transaction.                                            |

### Sorted set

| **Command**                                                     | **Action**                                                                                                                                                               |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [zAdd](https://redis.io/commands/zadd/)                         | Adds all the specified members with the specified scores to the sorted set stored at key.                                                                                |
| [zCard](https://redis.io/commands/zcard)                        | Returns the sorted set cardinality (number of elements) of the sorted set stored at key.                                                                                 |
| [zRange](https://redis.io/commands/zrange/)                     | Returns the specified range of elements in the sorted set stored at key.                                                                                                 |
| [zRem](https://redis.io/commands/zrem/)                         | Removes the specified members from the sorted set stored at key.                                                                                                         |
| [zScore](https://redis.io/commands/zscore/)                     | Returns the score of member in the sorted set at key.                                                                                                                    |
| [zRank](https://redis.io/commands/zrank/)                       | Returns the rank of member in the sorted set stored at key                                                                                                               |
| [zIncrBy](https://redis.io/commands/zincrby/)                   | Increments the score of member in the sorted set stored at key by value                                                                                                  |
| [zScan](https://redis.io/commands/zscan/)                       | Iterates elements of sorted set types and their associated scores.                                                                                                       |
| [zRemRangeByLex](https://redis.io/commands/zremrangebylex/)     | When all elements in a sorted set are inserted with the same score, this command removes the elements at key between the lexicographical range specified by min and max. |
| [zRemRangeByRank](https://redis.io/commands/zremrangebyrank/)   | Removes all elements in the sorted set stored at key with rank between start and stop.                                                                                   |
| [zRemRangeByScore](https://redis.io/commands/zremrangebyscore/) | Removes all elements in the sorted set stored at key with a score between min and max (inclusive).                                                                       |
