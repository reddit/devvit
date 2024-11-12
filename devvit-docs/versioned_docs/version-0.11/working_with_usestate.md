# Working with useState

`useState` is a hook that gives your component reactive memory. It allows you to preserve information across renders and trigger updates to your app when state is updated.

## Arguments

`useState` takes an initial state as an argument, and returns an array of two items:

- a state variable
- a setter function to update the state variable

The initializer for `useState` (the first argument of the function) can be a static value or a function. **Regardless of how it is initialized, it must return a valid JSON value.** This differs from React due to how Devvit components work across server and client boundaries.

```ts
// A static value
const [variable, setVariable] = useState('initialState');

// An synchronous function
const [variable, setVariable] = useState(() => 'initialState');

// An async function
const [count, setCount] = useState(async () => await redis.get('count'));
```

:::info
If the initializer function is async it will block render under the value is resolved. This is a common performance pitfall so please use it sparingly or group async calls together into one state variable using [`Promise.all`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all).

A non-blocking equivalent for fetching data is [useAsync](/docs/working_with_useasync.md).
:::

## Updating state

You’ll want to retrieve and update state at various points in your app. There are a few common patterns you’ll see for doing this.

```tsx
import { Devvit, useState } from '@devvit/public-api';

const MyComponent = (_, context) => {
  // Setting up state
  const [count, setCount] = useState(async () => {
    return await context.redis.get('count');
  });

  return (
    <hstack>
      <text>Count: {count}</text>
      {/* Update set count by using a setter function */}
      <button onPress={() => setCount((x) => x + 1)}>Increment</button>
      <button onPress={() => setCount((x) => x - 1)}>Decrement</button>
      {/* Update set count by setting the value directly */}
      <button onPress={() => setCount(0)}>Set to 0</button>
    </hstack>
  );
};
```

## Using state hooks

Leverage `useState` across components to preserve values and trigger reactive updates across your app.

In this example, state hooks are used to:

- Navigate between two app "pages"
- Add a simple counter that increments a value

```tsx
//define types of props to pass to components
interface Props {
  navigate: (page: PageType) => void;
  setCount: (count: number) => void;
  count: number;
}

enum PageType {
  HOMEPAGE,
  COUNTPAGE,
}

//useState is available as a global import from public API.
const App: Devvit.CustomPostComponent = ({ useState }: Devvit.Context) => {
  // set state components
  const [page, navigate] = useState(PageType.HOMEPAGE);
  const [count, setCount] = useState(0);

  // pass state into a Props object. This can be passed to components for passing state across components in your app
  const props: Props = {
    navigate,
    setCount,
    count,
  };

  // pass props into components
  if (page === PageType.COUNTPAGE) {
    return <CountPage {...props} />;
  } else {
    return <HomePage {...props} />;
  }
};

//'HomePage' is a component that returns this app's default UI
const HomePage: Devvit.BlockComponent<Props> = ({ navigate }) => {
  //defines how to handle 'onPress' button event on page
  const countPage: Devvit.Blocks.OnPressEventHandler = () => {
    navigate(PageType.COUNTPAGE);
  };

  //UI blocks comprising a page
  return (
    <vstack padding="medium" gap="medium" alignment="top center" cornerRadius="medium">
      <text size="xxlarge" weight="bold" grow>
        {'This app will teach you how to count!'}
      </text>
      <vstack alignment="center bottom">
        <button onPress={countPage} appearance="secondary">
          Start counting!
        </button>
      </vstack>
    </vstack>
  );
};

//'CountPage'component
const CountPage: Devvit.BlockComponent<Props> = ({ navigate, setCount, count }, { redis }) => {
  const incrementCount: Devvit.Blocks.OnPressEventHandler = () => {
    setCount((count) => count + 1);
    // note: to preserve the value of 'count' longerterm
    // you would need to add a separate method here. For example:
    // await redis.set("count", count)
  };

  return (
    <vstack padding="medium" gap="medium" alignment="top center" cornerRadius="medium">
      <text size="xxlarge" weight="bold" grow>
        {'Press the button to add +1'}
      </text>
      <text>{count}</text>
      <vstack alignment="center bottom">
        <button onPress={incrementCount} appearance="secondary">
          Count!
        </button>
      </vstack>
    </vstack>
  );
};

//add your custom post
Devvit.addCustomPostType({
  name: 'AppName',
  description: 'Navigate between pages and count!',
  render: App,
});
```

In this example, when a user session ends, state will no longer be available to the app. To save and persist data between sessions you will need to [store data server-side via the Redis](https://developers.reddit.com/docs/redis).

## Redis vs useState

The `redis` [plugin](https://developers.reddit.com/docs/redis) serves as your app’s long-term, server-side memory, while `useState` serves as its short-term, client-side memory.

`useState` will keep your custom posts performant and responsive. UI that relies on too many server-side calls will slow down your app.

The `redis` plugin should be used for storing data that needs to persist across sessions. Make these updates to your app in the background i.e. separate from the UI updates you are making. This way, your app does not need to wait on expensive calls to render new components. You should retrieve `redis` data once on render.

Use state hooks for single session memory, like changing tabs, selecting a checkbox within the UI, or changing values in the user’s view during their app session.

## User sessions

`useState` persists through a single user session. If a user scrolls away from the page, navigates away from the page, or disconnects, the session will end and the state is invalidated.

## Differences compared to React

The Devvit `useState` hook is inspired by [React](https://react.dev/reference/react/useState) with a few key differences.

- `useState` can only return something that can be serialized to JSON. That is booleans, numbers, strings, arrays, and objects. This is due to how the hook persists across server/client boundaries under the hood.
- `useState` can be initialized with an async function. This allows you to get remote information from Redis, Reddit, or by using fetch to place on to state. Please use this sparingly, as using an async initializer blocks render until the promise resolves. This can make your app feel slow.
