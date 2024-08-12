# Optimizing performance

You may want to optimize your app to make it run faster, use resources more efficiently, or just create a better user experience. Here are some ways to improve performance.

## Make the initial render faster

Look at the render function of this experience post.

```tsx
import { Devvit, useState } from '@devvit/public-api';

render: (context) => {
  const [postInfo] = useState(async () => {
    return await getThreadInfo(context);
  });

  const [user] = useState(async () => {
    return await getUser(context);
  });

  const [weather] = useState(async () => {
    return await getTheWeather(context);
  });

  const [leaderboardStats] = useState(async () => {
    return await getLeaderboard(context);
  });

  // the rest of the render function
};
```

You can see that the app fetches data about the post, the user, the weather, and the leaderboard stats. In Devvit, the first [render](rendering_apps.md) happens on the server side, and all four data requests need to be resolved before the app can be rendered for the user.

If each request takes roughly 250 ms, then four requests will take around 1 second to resolve. But, If we make these requests in parallel, it’ll take 250 ms to resolve all four!

To achieve this, you can:

- use [`useAsync`](/docs/working_with_useasync.md) to make everything non-blocking
- use [Promise.all](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all) inside of one `useState` to get all of the information as once

:::note
The difference between these two methods is that `useState` will block render until it is resolved whereas `useAsync` will allow the app to render immediately. By rendering the app immediately, you will need to add `loading` states while the requests resolve.

`useAsync` is the best choice for performance as it allows you to render parts of your application while others may still be loading.
:::

Here’s how the optimized version looks for `useAsync`:

```tsx
import { Devvit, useAsync } from '@devvit/public-api';

const { data: postInfo, loading: postInfoLoading } = useAsync(async () => {
  return await getThreadInfo(context);
});

const { data: user, loading: userLoading } = useAsync(async () => {
  return await getUser(context);
});

const { data: weather, loading: weatherLoading } = useAsync(async () => {
  return await getTheWeather(context);
});

const { data: leaderboardStats, loading: leaderboardStatsLoading } = useAsync(async () => {
  return await getLeaderboard(context);
});
```

and for `useState`:

```tsx
import { Devvit, useState } from '@devvit/public-api';

render: (context) => {
  const [appState, setAppState] = useState(async () => {
    const [postInfo, user, weather, leaderboardStats] = await Promise.all([
      getThreadInfo(context),
      getUser(context),
      getTheWeather(context),
      getLeaderboard(context),
    ]);
    return {
      postInfo,
      user,
      weather,
      leaderboardStats,
    };
  });

  const { postInfo, user, weather, leaderboardStats } = appState;

  // the rest of the render function
};
```

You can see the app gets the same variables from the state object, which means that you won’t need to change the way you access the data from the state in the rest of the app.

:::note
If you need to update one of the state props, instead of
`setPostInfo(newPostInfo)` you’ll need to do `setAppState({...appState, postInfo: newPostInfo})`.
:::

## Fetch data for multiple users

Imagine your app needs to get data from an external resource, such as a weather API. The code would look like this:

```tsx
import { Devvit, useState } from '@devvit/public-api';

const [externalData] = useState(async (async) => {
  const response = await fetch('https://external.weather.com');

  return await response.json();
});
```

### Request overload

The [state](rendering_apps.md#state-variables) is initialized for each user that sees the app. This means that in a large subreddit, where thousands of users can see the post at the same time, your app would make thousands of requests to the external resource. This can put unnecessary pressure on the external resource or drain your request quota for the resource (if there is one). Some requests are just slow by their nature, so you might want to minimize the amount of duplicate requests to external resources.

This situation gets even worse if you request the data in an interval, like to get a game score or stock market information, because the load repeats on each interval tick.

### Use cache helper

To address these issues, you can use the [cache helper](./capabilities/cache.md). This lets the app make one request for the data, saves the response and provides this response to all users requesting the same data.

In addition to the request you’d like to optimize, cache helper needs two parameters:

- `key` is a string that is used to distinguish between different cached responses. Instead of making a real request, the app gets the response from cache using the key you provide. Just make sure to use different keys for different data (like if you’re saving post-specific data, add the postId to the cache key like `post_data_${postId}`).
- `ttl` (time to live) is the number of milliseconds during which the cached response is expected to be relevant. Once it expires, the cached response will be voided and a real request is made to populate the cache again. You can treat it as a threshold, where `ttl` of 30000 would mean that a request is done no more than once per 30 seconds.

:::note
**Do not cache sensitive information**. Cache helper randomly selects one user to make the real request and saves the response to the cache for others to use. You should only use cache helper for non-personalized fetches, since the same response is available to all users.
:::

## Update the client state without intervals

Imagine you have a game with a leaderboard. When a user wins and their score is saved, the leaderboard needs to update immediately for all active sessions. One way to achieve this is to set an interval to fetch leaderboard stats as often as possible, but making a request in the interval would trigger the circuit breaker and affect the performance of the app. In addition, each time a user viewed the app, it would spam the leaderboard database in an attempt to get the latest data.

To achieve the best performance in this scenario, you can use [realtime](./capabilities/realtime.md) to send the leaderboard stats to all users directly.

### Without realtime

Before using realtime, the leaderboard fetching code looked like this:

```tsx
const getLeaderboard = async () =>
  await context.redis.zRange('leaderboard', 0, 5, {
    reverse: true,
    by: 'rank',
  });

const [leaderboard, setLeaderboard] = useState(async () => {
  return await getLeaderboard();
});

const leaderboardInterval = useInterval(async () => {
  const newLeaderboard = await getLeaderboard();
  setLeaderboard(newLeaderboard);
}, 1000);
```

And code for setting the leaderboard looked like this:

```tsx
await context.redis.zAdd('leaderboard', { member: `${username}:${datetime}`, score: gameScore });
```

### With realtime

Using realtime, you can fetch the leaderboard during the initial render and emit the new leaderboard state when the user completes the game.

This is the updated game completion code:

```tsx
await context.redis.zAdd('leaderboard', { member: `${username}:${datetime}`, score: gameScore }); // stays as is
const newLeaderboard = await getLeaderboard();
context.realtime.send('leaderboard_updates', newLeaderboard);
```

Now replace the interval with the realtime subscription:

```tsx
const [leaderboard, setLeaderboard] = useState(async () => {
  return await getLeaderboard();
}); // stays as is

const channel = useChannel({
  name: 'leaderboard_updates',
  onMessage: (newLeaderboard) => {
    setLeaderboard(newLeaderboard);
  },
});
```

Using realtime ensures that extra requests will not impact your app’s performance, and the app only emits the event when the data has changed.
