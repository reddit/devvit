import { Devvit, KeyValueStorage } from '@devvit/public-api';
import { InternalDevvit } from '@devvit/public-api/abstractions/InternalDevvit.js';

const kvstore = new KeyValueStorage(Devvit.use(Devvit.Types.KVStore));
const COUNT_KEY = 'count';

InternalDevvit.Hello.onPing(async (_msg, metadata) => {
  const count = await kvstore.get(COUNT_KEY, metadata, 0);
  const newCount = (count ?? 0) + 1;
  await kvstore.put(COUNT_KEY, newCount);
  return { message: `the new count is ${newCount}` };
});

export default Devvit;
