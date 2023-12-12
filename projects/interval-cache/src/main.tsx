import { Devvit, NumberField } from '@devvit/public-api';

Devvit.configure({
  redis: true,
  redditAPI: true,
});

/**
 * This app runs both intervals and caching at the same time, letting you observe the behavior of the cache.
 */
const DEFAULT_TTL = 10000;
const App: Devvit.CustomPostComponent = async ({ cache, useState, useForm, useInterval, ui }) => {
  const now = new Date().getTime();
  let [cachedNow, setCachedNow] = useState(now);
  let [ttl, setTTL] = useState(DEFAULT_TTL);
  let timer = useInterval(async () => {
    console.log('firing interval', new Date().toLocaleTimeString());
    setCachedNow(
      await cache(
        async () => {
          console.log('fetching underlying data', new Date().toLocaleTimeString());
          return new Date().getTime();
        },
        {
          key: 'the-only-cache',
          ttl,
        }
      )
    );
  }, 1000);
  timer.start();

  let field: NumberField = {
    name: 'ttl',
    label: 'TTL',
    defaultValue: DEFAULT_TTL,
    type: 'number',
  };
  let form = useForm({ fields: [field] }, (values) => {
    setTTL(values.ttl);
  });

  return (
    <vstack gap="small">
      <text>Now: {new Date(now).toLocaleTimeString()}</text>
      <text>Cached: {new Date(cachedNow).toLocaleTimeString()}</text>
      <text>TTL: {ttl} millis</text>
      <button onPress={() => ui.showForm(form)}>Change TTL</button>
    </vstack>
  );
};

Devvit.addMenuItem({
  label: 'Create a new cache interval tester',
  location: 'subreddit',
  onPress: async (_event, { reddit, subredditId }) => {
    const sub = await reddit.getSubredditById(subredditId);
    const options = {
      title: 'Interval/Cache Test',
      preview: <text>loading...</text>,
      subredditName: sub.name,
    };
    await reddit.submitPost(options);
  },
});

Devvit.addCustomPostType({
  name: 'Cache/Interval',
  description: 'test app',
  render: App,
});

export default Devvit;
