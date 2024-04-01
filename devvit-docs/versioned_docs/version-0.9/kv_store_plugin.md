# Key value store plugin

Sometimes you might want to store data in your app that will be there the next time it’s run.
Remember, Reddit Developer Platform apps are stateless, so you can’t just store data in memory across
executions or save data to the file system.

To store data, use the key value store plugin in your apps. Your data will be stored in a
persistent Redis database for quick retrieval. Currently, Get, Put, Delete, and List operations
are supported (see API Docs below).

Data in the key value store is partitioned by each installation of your app, so you don’t need to
worry about different installations overwriting data. This means that there won’t be one single
source of truth for all installations of your app, so keep that in mind. Each app installation can
only access the data that it has stored in the Key Value Store.

Here’s an example:

> Let’s say you’ve created an app and it has been installed into two different subreddits,
> [r/cats](https://www.reddit.com/r/cats) and [r/dogs](https://www.reddit.com/r/dogs). In your app
> code, you save a value into the key value store. Each value is implicitly saved to a different
> partition, one for r/cats and one for r/dogs. When your app retrieves that value from the key value
> store in a later execution, the app will only see the value for the subreddit it is installed in.
> Any data in the key value store for another installation is inaccessible (after all,
> [r/CatsWithDogs](https://www.reddit.com/r/catswithdogs) is a lie). This partitioning is all done
> for you automatically.

## Use

The simplified wrapper around the KVStore plugin stores all data as serialized JSON objects.

To use the wrapper:

```ts
import { Devvit } from '@devvit/public-api';
const kv = new KeyValueStorage();
```

## Limitations

- Max record size - 10Kb
- Max key value store size (per subreddit) - 500Kb

## Methods

- `put` - Assigns a value to a key in the store
- `get` - Retrieves a value from the store at the given key
- `delete` - Deletes a key from the store if present
- `list` - Returns a list of keys in the store

## Example

```ts
import { Devvit, KeyValueStorage } from '@devvit/public-api';
import { ContextActionEvent, Metadata } from '@devvit/protos';

const kv = new KeyValueStorage();

Devvit.addAction({
  name: 'Set KVStore',
  description: 'some description',
  context: [Context.POST],
  handler: useKVStore,
});

async function useKVStore(event: ContextActionEvent, metadata?: Metadata) {
  try {
    // Put has an empty return, so use try/catch to detect errors
    await kv.put('key', 'value', metadata);
  } catch (err) {
    throw new Error(`Error putting values in kvstore: ${err}`);
  }

  const messages = await kv.get('key', metadata);
  console.log(messages);

  const keys = await kv.list();
  console.log(keys);

  try {
    // Del has an empty return, so use try/catch to detect errors
    await kv.delete('key', metadata);
  } catch (err) {
    throw new Error(`Error deleting values in kvstore: ${err}`);
  }

  return { success: true };
}

export default Devvit;
```
