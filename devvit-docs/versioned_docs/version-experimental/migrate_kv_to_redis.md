# How to migrate the KV store to Redis

Migrating your app to the Redis plugin is easy! If your app is already using the key value store plugin, use the following steps to migrate to the Redis plugin.

1. From the terminal, navigate to the directory where you store your project.
2. Open `main.ts` or `main.tsx` in your code editor.
3. Add the Redis plugin

```tsx
Devvit.configure({
  redis: true,
});
```

4. In your app code, replace the following commands:

- Change `kvStore.put` to `redis.set`
- Change `kvStore.get` to `redis.get`
- Change `kvStore.delete` with `redis.del`

5. `kvStore.list` can be replaced with redis hash or sorted set usage. Example migration patterns:

- Use `redis.hscan` if your app is retrieving key-value pairs based on a matched pattern. Alternate iteration methods like `redis.hgetall` and `redis.hkeys` might also fit your usecase. See the **Redis Hash Migration** for more details.
- If you're implementing a leaderboard by listing all the keys and sorting them in memory - use `redis.zadd` and `redis.zrange` to leverage the redis data-structure custom built for this usecase.
- If your app is periodically listing all the keys and deleting older keys based on a stored timestamp, use `redis.expire` to set a key expiration and simplify your code - no periodic listing is necessary.

6. Save your changes.
7. Upload the new version of your app and update existing installations.

# Redis Hash Migration

A custom menu action to migrate all your KV store items to a Redis Hash

```tsx
import { Devvit } from '@devvit/public-api';

Devvit.configure({
  redis: true,
  kvStore: true,
});

Devvit.addMenuItem({
  location: 'subreddit',
  label: 'Migrate KV Store to Redis Hash',
  onPress: async (_, { redis, ui, kvStore }) => {
    const keys = await kvStore.list();
    const hashKey = 'custom_hash_key'; // define your hash key here
    keys.forEach(async (key) => {
      const value = await kvStore.get(key);
      if (value) {
        console.log(`setting field: ${key} with value: ${value} in hash: ${hashKey}`);
        await redis.hset(hashKey, { [key]: value as string });
      }
    });
    // Verify the redis hash contents
    const items = await redis.hgetall(hashKey);
    if (items) {
      for (const key in items) {
        console.log(`redis hash contains field: ${key} and value: ${items[key]}`);
      }
    }
    // Now you can start using hget/hset methods for reads and writes
    // to the custom redis hash. And iterate with hscan, hgetall and hkeys.
    ui.showToast(`Completed redis hash migration`);
  },
});

export default Devvit;
```

# Troubleshooting

- When apps use `kvStore.list` - safe execution in a multi-tenant environment is not guaranteed - it causes CPU spikes and blocks other Redis commands from running at the same time. We recommend using Redis Hashes instead, each hash can store upto 4.2 billion key value pairs and a combination of `hscan`, `hgetall` and `hkeys` can be used for iteration. Please reach out to us in Discord - we can help adapt your existing data model to use Redis and improve performance and reliability of your app.
- `kvStore.put` encodes the values with `JSON.stringify` and `kvStore.get` does `JSON.parse` to obtain the original data. If you are seeing returned values from `redis.get` wrapped in additional quotes during migration - add a try/catch block with `JSON.parse` to resolve the issue.
