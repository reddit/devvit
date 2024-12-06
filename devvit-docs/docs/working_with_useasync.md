# Working with useAsync

:::note
This feature is experimental, which means the design is not final but it's still available for you to use.
:::

`useAsync` is a hook that allows your app to perform server side calls like `redis.get` or `reddit.getCurrentUser` without blocking the render process.

## Blocking versus non-blocking

The code you write in Javascript can be blocking or non-blocking. To keep applications speedy, non-blocking code is preferred.

Blocking code produces a waterfall of actions. One line must happen after another, so the speed in which a program can render takes a large hit. We want to avoid waterfalls to provide a nice experience for users.

### Without useAsync (blocking) example

```tsx
const App = () => {
  // This will block the render until data is fetched
  const [message] = useState(async () => await redis.get('welcomeMessage'));

  return <text>{message}</text>;
};
```

### With useAsync (non-blocking) example

```tsx
const App = () => {
  const { data: message, loading, error } = useAsync(async () => await redis.get('welcomeMessage'));

  return (
    <vstack>
      {loading && <text>Loading...</text>}
      {error && <text>Error fetching message</text>}
      {message && <text>{message}</text>}
    </vstack>
  );
};
```

This example displays “Loading…” immediately while fetching the data.

## Understanding useAsync

### Syntax

```ts
const { data, loading, error } = useAsync(asyncFunction, { depends: {JSON object}, finally: () => { function }  });
```

- asyncFunction: an asynchronous function that must return a valid JSON value. Note that setState is not allowed in this function. Use the finally parameter if you need to use setState (see the example below).
- depends (optional): a JSON object or array of JSON objects that, when changed, will cause the asyncFunction to re-execute.
- finally (optional): a callback function that runs after the async operation completes regardless of success or failure. Ideal for state updates (i.e. calls to setState) and side effects.

### Return values

- data: the data returned from the initializer.
- loading: a boolean that denotes if it is loading or not.
- error: an error if the request failed.

**The initializer for `useAsync` (the first argument of the function) must return a valid JSON value.** This differs from React due to how Devvit components work across server and client boundaries.

### Example: fetching the time and setting state

```ts
useAsync(
  async () => {
    const response = await fetch(`https://date.api/today?timezone=${timezone}`);
    return response.json();
  },
  {
    depends: [timezone],
    finally: (data, error) => {
      if (error) {
        console.error('Failed to load date data:', error);
      } else {
        setTodayDate(data['currentDate']);
      }
    },
  }
);
```

### Example: fetching user data

```ts
// A normal useAsync function
const {
  data: username,
  loading: usernameLoading,
  error: usernameError,
} = useAsync(async () => {
  const user = await ctx.reddit.getCurrentUser();

  return user?.username ?? null;
});

// A dependent useAsync function
const {
  data: userDetails,
  loading: userDetailsLoading,
  error: userDetailsError,
} = useAsync(
  // This will run every time the value in depends changes
  async () => {
    if (!username) return null;

    const resp = await fetch(`https://some-api/get-user-details/${username}`);
    return await resp.json();
  },
  {
    // NOTE: This will be deep equality for objects and arrays!
    depends: username,
  }
);
```

### Example: complete application

This a simple application that leverages useAsync to fetch data in a non-blocking way and updates the app whenever the page changes.

```ts
import { useAsync, useState } from '@devvit/public-api';

const App = () => {
  const [count, setCount] = useState(1);

  const { data, loading, error } = useAsync(
    async () => {
      const response = await fetch(`https://xkcd.com/${count}/info.0.json`);
      if (!response.ok) throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      return await response.json();
    },
    { depends: [count] }
  );

  return (
    <vstack alignment="center middle" height="100%" gap="small">
      <text size="large">XKCD Titles</text>
      <vstack>
        {loading && <text>Loading...</text>}
        {error && (
          <text color="red" wrap={true}>
            {error.message}
          </text>
        )}
        {data && <text>{data.title}</text>}
      </vstack>
      <text>Comic Number: {count}</text>
      <button onPress={() => setCount((prev) => prev + 1)}>Increment</button>
    </vstack>
  );
};

//add your custom post
Devvit.addCustomPostType({
  name: 'AppName',
  description: 'Using useAsync with XKCD API',
  render: App,
});
```

## When to use useAsync and useState

In most cases, you'll want to use `useAsync` over `useState` to keep your app snappy. One downside is that you need to handle `loading` and `error` when using `useAsync` or `useState`.

One situation where `useState` could be preferable is if your app only has one request and it must be resolved in order to show any part of the app.

Another time to consider `useState` is if you need to update the value you fetched and display the new result to the user. `useState` provides a better API for that, but keep in mind you still need to persist the updates to Redis. We will be working on making synced updates easier in the future.

:::note
There isn't an easy way to update `useAsync` data based off of an action in the app at the moment. We are working on a better way to allow this in the future.
:::
