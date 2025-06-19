# Key value store plugin

:::note
[Redis](https://developers.reddit.com/docs/redis) is replacing the key value store as Devvit’s hosted data store solution. You’ll need to [migrate](migrate_kv_to_redis.md) your current apps to Redis.
:::

Sometimes you might want to store data in your app that will be there the next time it’s run.
Remember, Reddit Developer Platform apps are stateless, so you can’t just store data in memory across
executions or save data to the file system.

To store data, use the KV store plugin in your apps. Your data will be stored in a
persistent KV store database for quick retrieval. Currently, Get, Put, Delete, and List operations
are supported (see API Docs below).

Data in the KV store is partitioned by each installation of your app, so you don’t need to
worry about different installations overwriting data. This means that there won’t be one single
source of truth for all installations of your app, so keep that in mind. Each app installation can
only access the data that it has stored in the KV store.

Here’s an example:

> Let’s say you’ve created an app and it has been installed into two different subreddits,
> [r/cats](https://www.reddit.com/r/cats) and [r/dogs](https://www.reddit.com/r/dogs). In your app
> code, you save a value to the KV store. Each value is implicitly saved to a different
> partition, one for r/cats and one for r/dogs. When your app retrieves that value from the KV store in a later execution, the app will only see the value for the subreddit it is installed in.
> Any data in the KV store for another installation is inaccessible (after all,
> [r/CatsWithDogs](https://www.reddit.com/r/catswithdogs) is a lie). This partitioning is all done
> for you automatically.

## Use

Enable the plugin in Devvit.configure.

```ts
Devvit.configure({
  kvStore: true,
  // other plugins
});
```

## Limitations

- Max record size - 1Mb
- Max KV store size (per subreddit) - 100Mb

## Methods

- `put` - Assigns a value to a key in the KV store
- `get` - Retrieves a value from the KV store at the given key
- `delete` - Deletes a key from the KV store if present

## Example

```ts
import { Devvit } from '@devvit/public-api';

Devvit.configure({
  kvStore: true,
  // other plugins
});

Devvit.addMenuItem({
  label: 'Write to KV Store',
  location: 'post',
  onPress: (_, context) => {
    await context.kvStore.put('animalChoice', 'dog');
    const storedValue = context.kvStore.get('animalChoice');
    context.kvStore.delete('animalChoice');
  },
});

export default Devvit;
```
