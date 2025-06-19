# Optimizing performance

You can optimize your app to make it run faster, use resources more efficiently, and create a better user experience. Here’s how.

## Always use the latest public-api

You can check your current Devvit version on the [apps version panel](./publishing.md#app-versions). To update your app to use the latest version of the public API:

1. Run `npm install -g devvit` to update the Devvit CLI globally.

2. In your project directory, run the following commands:

- `devvit update app`
- `npm install`

:::note
You must update the CLI before you upgrade @devvit/public-api in your project.
:::

## Write performant requests

These best practices will optimize your app.

### Get as much data as possible from the context

If you only need the name of the current user:

- Avoid requests like `context.reddit.getCurrentUser()` or `context.reddit.getUserById(context.userId)`.
- Use `context.reddit.getCurrentUsername()` instead.

If you only need the subreddit name:

- Don’t request the whole Subreddit model with `context.reddit.getCurrentSubreddit()`.
- Use `context.reddit.getCurrentSubredditName()` instead.

### Cache requests to RedditAPI or external resources

Use `context.cache` to reduce the amount of requests to optimize performance and running costs of your application. See [cache helper](./capabilities/cache.md) for details and examples.

### Leverage scheduled jobs to fetch or update data

Use [scheduler](./capabilities/scheduler.md) to make large data requests in the background and store it in [Redis](./capabilities/redis.md) for later use. You can also [fetch data for multiple users](#how-to-use-the-cache-helper​).

### Batch API calls to make parallel requests

Every request defined in `useState` is blocking the render function. You can improve app performance by [making parallel requests](#how-to-make-parallel-requests).

## Ensure your app has a lightweight first view

The faster the first view appears on the user’s screen, the better the user experience. You can minimize and delay the data loading necessary for your app to display the first view. To do this:

- Use [setCustomPostPreview](./custom_post_preview.md) to make a dynamic, compelling preview that loads quickly.
- Use [useAsync](./working_with_useasync.md) to load the necessary data without blocking the rendering process.
- Import [useState](./working_with_usestate.md) or [useAsync](./working_with_useasync.md) to load the data needed for the specific component only when that component is rendered.

## How to: make parallel requests

In Devvit, the first [render](./rendering_apps.md) happens on the server side. Parallel fetch requests will speed up the first render.

### Before optimization: individual fetch requests

In the render function of this interactive post, the app fetches data about the post, the user, the weather, and the leaderboard stats.

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

If each request takes roughly 250 ms, then four requests will take around 1 second to resolve. If we change the example to make those requests in parallel, it would take 250 ms to resolve all four!

### After optimization: parallel fetch requests

You can do this in two ways:

- Use [useAsync](./working_with_useasync.md) to make everything non-blocking.
- Use [Promise.all](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all) inside one [useState](./working_with_usestate.md) method to get all of the information at once.

:::note
The main difference between these two methods is that `useState` blocks render until it is resolved, and `useAsync` allows the app to render immediately and requires loading states while the requests resolve.
:::

#### useAsync

This is the best choice for performance because it allows you to render parts of your application while others may still be loading. Here’s how the same example looks for useAsync:

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

#### useState

This is the same example using useState.

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
If you need to update one of the state props, you’ll need to do `setAppState({...appState, postInfo: newPostInfo})` instead of `setPostInfo(newPostInfo)`.
:::

## How to: cache data

The following example shows how unoptimized code for fetching data from an external resource, like a weather API, looks:

```tsx
import { Devvit, useState } from '@devvit/public-api';

// naive, non-optimal way of fetching that kind of data
const [externalData] = useState(async () => {
  const response = await fetch('https://external.weather.com');

  return await response.json();
});
```

### Problem: request overload

In this case, [state](./rendering_apps.md) is initialized for each user that sees the app. This means that in a large subreddit where thousands of users can see the post at the same time, your app would make thousands of requests to the external resource. If you request the data in an interval, like to get a game score or stock market information, then the load repeats on each interval tick. This is not ideal.

### Solution: make one request

You can use a [cache helper](./capabilities/cache.md) to make one request for data, save the response, and provide this response to all users requesting the same data. The cache lives at the subreddit level (not the app level).

**Example: fetch weather data every 2 hours with cache helper**

```tsx
import { Devvit, useState } from '@devvit/public-api';

// optimized, performant way of fetching that kind of data
const [externalData] = useState(async () => {
  return context.cache(
    async () => {
      const response = await fetch('https://external.weather.com');
      return await response.json();
    },
    {
      key: `weather_data`,
      ttl: 2 * 60 * 60 * 1000, // 2 hours in milliseconds
    }
  );
});
```

:::note
Do not cache sensitive information. Cache helper randomly selects one user to make the real request and saves the response to the cache for others to use. You should only use cache helper for non-personalized fetches, since the same response is available to all users.
:::

### Solution: schedule a job

Alternatively, you can use [scheduler](./capabilities/scheduler.md) to make the request in background, save the response to [Redis](./capabilities/redis.md), and avoid unnecessary requests to the external resource.

**Example: fetch weather data every 2 hours with a scheduled job**

```tsx
import { Devvit } from '@devvit/public-api';

Devvit.addSchedulerJob({
  name: 'fetch_weather_data',
  onRun: async (_, context) => {
    const response = await fetch('https://external.weather.com');
    const responseData = await response.json();
    await context.redis.set('weather_data', JSON.stringify(responseData));
  },
});

Devvit.addTrigger({
  event: 'AppInstall',
  onEvent: async (_, context) => {
    await context.scheduler.runJob({
      cron: '0 */2 * * *', // runs at the top of every second hour
      name: 'fetch_weather_data',
    });
  },
});

// inside the render method
const [externalData] = useState(async () => {
  return context.redis.get('fetch_weather_data');
});

export default Devvit;
```

## How to: update the client state without intervals​

If you have a game with a leaderboard, scores need to be updated immediately for all active sessions.

One way to achieve this is to set an interval to fetch leaderboard stats as often as possible, but making a request in the interval would [switch the execution to server environment](./rendering_apps.md#clientserver-environments) and affect the performance of the app. In addition, each time a user viewed the app, it would spam the leaderboard database in an attempt to get the latest data.

To optimize performance, use [realtime](./capabilities/realtime.md) to send the leaderboard stats to all users directly.

### Without realtime​

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

leaderboardInterval.start();
```

And code for updating the leaderboard looked like this:

```tsx
await context.redis.zAdd('leaderboard', { member: username, score: gameScore });
```

### With realtime​

Using realtime, you can fetch the leaderboard during the initial render and emit the new leaderboard state when the user completes the game.

This is the updated game completion code:

```tsx
// stays as is
await context.redis.zAdd('leaderboard', { member: username, score: gameScore });
// new code
context.realtime.send('leaderboard_updates', { member: username, score: gameScore });
```

Now replace the interval with the realtime subscription:

```tsx
const [leaderboard, setLeaderboard] = useState(async () => {
  return await getLeaderboard();
}); // stays as is

const channel = useChannel({
  name: 'leaderboard_updates',
  onMessage: (newLeaderboardEntry) => {
    const newLeaderboard = [...leaderboard, newLeaderboardEntry] // append new entry
      .sort((a, b) => b.score - a.score) // sort by score
      .slice(0, 5); // leave top 5
    setLeaderboard(newLeaderboard); // update the state
  },
});

channel.subscribe();
```

Using realtime ensures that extra requests will not impact your app’s performance, and the app only emits the event when the data has changed.

## How to: measure your app’s performance

You can use `console.log` to calculate the operation time of your app.

This example shows the render function of a basic post that fetches the number of subreddit members.

```tsx
const [subscriberCount] = useState<number>(async () => {
  const devvitSubredditInfo = await context.reddit.getSubredditInfoByName('devvit');
  return devvitSubredditInfo.subscribersCount || 0;
});

return (
  // app markup goes here
);
```

### Add a console log

Before the above post can be rendered, two pieces of data need to be requested:
subreddit subscribers count and user avatar url. You can measure the amount of time it takes to request data inside the `useState` hook.

To do this, you can add:

- A variable that stores the timestamp of the operation start.
- A console log between the operation end and the return statement that prints the difference between the start and end in milliseconds.

```tsx
const [subscriberCount] = useState<number>(async () => {
  const startSubscribersRequest = Date.now(); // a reference point for the request start
  const devvitSubredditInfo = await context.reddit.getSubredditInfoByName('devvit');

  console.log(`subscribers request took: ${Date.now() - startSubscribersRequest} milliseconds`);

  return devvitSubredditInfo.subscribersCount || 0;
});
```

Alternatively, you can measure the whole data collection step. On the first line of the render method you can declare a state variable:

```tsx
const [performanceStartRender] = useState(Date.now()); // a reference point for the render start
```

Add a console.log before the return statement:

```tsx
console.log(`Getting the data took: ${Date.now() - performanceStartRender} milliseconds`);
```

All of that put together will look like this:

```tsx
const [performanceStartRender] = useState(Date.now()); // a reference point for the render start

const [subscriberCount] = useState<number>(async () => {
  const startSubscribersRequest = Date.now(); // a reference point for the request start
  const devvitSubredditInfo = await context.reddit.getSubredditInfoByName('devvit');

  console.log(`subscribers request took: ${Date.now() - startSubscribersRequest} milliseconds`);

  return devvitSubredditInfo.subscribersCount || 0;
});

console.log(`Getting the data took: ${Date.now() - performanceStartRender} milliseconds`);

return (
  // app markup goes here
);
```

### Review your data

Once you’ve set up your data collection, you can expect something like that in your logs:

```
subscribers request took: 106 milliseconds
getting user avatar url took: 203 milliseconds
getting the data took: 310 milliseconds
```

This will help you find the operations that affect your app’s performance.
