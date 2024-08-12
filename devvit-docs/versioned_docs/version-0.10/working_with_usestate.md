# Working with useState

Add a state variable to your app.

State hooks allow you to preserve and mutate data between your components without costly server calls. Working with `useState` can be confusing, though, so here’s a helpful primer in case you need it.

## Arguments

`useState` takes an initial state as an argument, and returns an array of two items:

- a variable
- a setter function to update the variable

Note that the initial state can also be a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) - if it is, the state variable will be set to the resolved value of that promise.

```ts
const [variable, updateVariable] = useState('initialState');
```

`useState` helps you retain and update data throughout your app during a single user session.

## Updating state

You’ll want to retrieve and update state at various points in your app. There are a few common patterns you’ll see for doing this.

```ts
// Setting up state
const [count, setCount] = useState(async () => {
  await redis.get('count');
});

//Update state using predefined logic
setCount((count) => count + 1);

//Update state by editing value directly
useState((state) => {
  state.count = state.count + 1;
});
```

## Using state hooks

Leverage `useState` across components to preserve and change values without relying on server-side storage.

In this example, state hooks are used to:

- Navigate between two app "pages"
- Add a simple counter that increments a value

```ts
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

//useState is available in Context of the CustomPostComponent.
const App: Devvit.CustomPostComponent = ({ useState }: Devvit.Context) => {
  //set state components
  const [page, navigate] = useState(PageType.HOMEPAGE);
  const [count, setCount] = useState(0);

  //pass state into a Props object. This can be passed to components for passing state across componenents in your app
  const props: Props = {
    navigate,
    setCount,
    count,
  };

  //pass props into components
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
  const counting: Devvit.Blocks.OnPressEventHandler = () => {
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
        <button onPress={counting} appearance="secondary">
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

‘useState’ will keep your custom posts performant and responsive. UI that relies on too many server-side calls will slow down your app.

The `redis` should be used for storing data that needs to persist across sessions. Make these updates to your app in the background i.e. separate from the UI updates you are making. This way, your app does not need to wait on expensive calls to render new components. You should retrieve `redis` data once on render.

Use state hooks for single session memory, like changing tabs, selecting a checkbox within the UI, or changing values in the user’s view during their app session.

## User sessions

`useState` persists through a single user session. If a user scrolls away from the page, navigates away from the page, or disconnects, the session will end and the state is invalidated.

:::info
For more in-depth information on `useState`, we recommend reading the [react documentation](https://react.dev/reference/react/useState).
:::
