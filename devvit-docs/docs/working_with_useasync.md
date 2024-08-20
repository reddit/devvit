# Working with useAsync

:::note
This feature is experimental, which means the design is not final but it's still available for you to use.
:::

`useAsync` is a hook that allows your app to fetch remote data in a non-blocking way.

## Blocking versus non-blocking

The code you write in Javascript can be blocking or non-blocking. To keep applications speedy, non-blocking code is preferred.

Blocking code produces a waterfall of actions. One line must happen after another, so the speed in which a program can render takes a large hit. We want to avoid waterfalls to provide a nice experience for users.

**Blocking**

```tsx
// This will block render
const [count, setCount] = useState(async () => await redis.get('count'));

// This code will not execute until the useState above resolves
const [color, setColor] = useState(async () => await redis.get('color'));

// Any code after needs both count and color to resolve.
```

**Non-blocking**

```tsx
// Both requests will be sent at the same time!
const { data: countData, loading: countLoading } = useAsync(async () => await redis.get('count'));
const { data: colorData, loading: colorLoading } = useAsync(async () => await redis.get('color'));
```

## Arguments

`useAsync` takes an async function as the first argument and a config object containing:

```ts
{
  // Calls the async function every time this value changes (deep equality)
  depends: JSON | JSON[]
}
```

Returns an object of:

- data: The data returned from the initializer
- loading: A boolean that denotes if it is loading or not
- error: An error if the request failed

**The initializer for `useAsync` (the first argument of the function) must return a valid JSON value.** This differs from React due to how Devvit components work across server and client boundaries.

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

## Using `useAsync`

Leverage `useAsync` to fetch data in a non-blocking way.

```tsx
const App: Devvit.CustomPostComponent = ({ useState }: Devvit.Context) => {
  const [count, setCount] = useState(1);
  const loader = async () => {
    const rsp = await fetch(`https://xkcd.com/${count}`, {
      method: 'GET',
      headers: { accept: 'text/html' },
    });
    if (!rsp.ok) throw Error(`HTTP error ${rsp.status}: ${rsp.statusText}`);
    const text = await rsp.text();
    const regex = /<div id="ctitle">(.*?)<\/div>/;
    const match = regex.exec(text);
    if (match) {
      return match[1];
    } else {
      throw new Error('not found');
    }
  };
  const { data, loading, error } = useAsync(loader, { depends: [count] });

  return (
    <vstack alignment="center middle" height="100%" gap="small">
      <text size="large">XKCD Titles</text>
      <vstack>
        {data && <text>{JSON.stringify(data)}</text>}
        {loading && <text>loading</text>}
        {error && (
          <text color="red" wrap={true}>
            {error.message.split(/:/)[0]}
          </text>
        )}
      </vstack>
      <text>{count}</text>
      <button onPress={() => setCount((count) => count + 1)}>increment</button>
    </vstack>
  );
};

//add your custom post
Devvit.addCustomPostType({
  name: 'AppName',
  description: 'Using useAsync!',
  render: App,
});
```

## When to useAsync over useState

In most cases, prefer using `useAsync` over `useState` to keep your app snappy. A downside is that you need to handle `loading` and `error` when using `useAsync` or `useState`.

One situation where `useState` could be preferable is if your app only has one request and it must be resolved in order to show any part of the app.

Another time to consider `useState` is if you need to update the value you fetched and display the new result to the user. `useState` provides a better API for that, but keep in mind you still need to persist the updates to Redis. We will be working on making synced updates easier in the future.

:::note
There isn't an easy way to update `useAsync` data based off of an action in the app at the moment. We are working on a better way to allow this in the future.
:::
