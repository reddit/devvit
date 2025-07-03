# Rendering apps

Before your app is displayed on the screen, it needs to be rendered by Devvit. Understanding this process will help you think about how your code executes and explain its behavior.

## Client/server environments

Devvit apps exist in two environments: client and server. As a developer, you don’t have to worry about it too much, but this concept is important to understand how things work under the hood.

To optimize app performance, Devvit executes on the client side as much as possible to avoid making unnecessary requests to the server. This is why app code is downloaded by the client and executed locally most of the time.

Some things can only be executed on the server side, including:

- `onPress` handlers of [menu actions](./capabilities/menu-actions.md)
- [Scheduled actions](./capabilities/scheduler.md)
- API requests (such as [Reddit API](./api/redditapi/classes/RedditAPIClient.RedditAPIClient.md), [Redis](./capabilities/redis.md), and [HTTP fetch](./capabilities/http-fetch.md))

If the API request is encountered when the app code runs on the client, Devvit switches the code execution to the server side.

## Using state variables

Your app relies on state variables to know what to render. The `useState` function declares the variable and contains:

- the current value
- a value setter
- the initial value/initialization function

`const [clickCount, setClickCount] = useState(0);`

In this example `clickCount` holds the current value, `setClickCount` is the value setter function, and `0` is the initial value. When the initialization function is passed instead of initial value, the result of the function call is used as the initial value.

State variables are shared between client and server environments, and they persist through a single user session. If a user disconnects or navigates away from the page, the session ends and the state is invalidated.

## Rendering an app for the first time

Each app is rendered separately for each user. For the first render, your application’s code is executed on the server and the calculated layout is sent to the client to display. The initial values of all state variables are calculated and used at this point. All the state variables are initialized one after the other.

At the same time, Devvit sets up the local environment for your app and downloads the app code. As soon as it’s done, the rendering switches to the client side. If a re-render needs to happen before the download is complete, Devvit will send a request to the server to get the new layout.

## Re-rendering the app

To trigger a UI update, you need to update at least one of the state variables. You can do this by calling the value setter, which can be updated on user action or from an external event.

### Example: user action

```ts
const onClick = () => {
  const newValue = clickCount + 1;
  setClickCount(newValue);
};
```

You can pass this function to `onPress` handler to react to user actions. If the handler has the API request, the execution will switch to the server side.

### Example: external event

You can use intervals and realtime to trigger a UI update that is not initiated by the user.

In this countdown example, the value setter function is called inside the interval to update the UI based on a timer:

```ts
import { Devvit, useState, useInterval } from '@devvit/public-api';

const [counter, setCounter] = useState(1000);

const updateInterval = useInterval(() => {
  setCounter((counter) => counter - 1);
}, 1000);

updateInterval.start();
```

In the synced progress bar example, the value setter function is called inside the onMessage handler to update UI based on an external event.

```ts
const [progress, setProgress] = useState(0);

const progressChannel = useChannel({
  name: 'progress_state',
  onMessage: (message) => {
    setProgress(message.payload.progress);
  },
});

progressChannel.subscribe();
```
