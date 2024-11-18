# Webviews

The webviews component allows you to include your own html/css/javascript and have it run within your reddit app. This feature is currently in beta and is meant to be tested primarily on desktop web. Mobile support coming later this year.

# Why use webviews over blocks?

Here’s a comparison between the two:

| Support                                     | Webviews | Blocks |
| ------------------------------------------- | -------- | ------ |
| Rich Multimedia (animations, sounds, video) | Yes      | No     |
| Gestures                                    | Yes      | Clicks |
| Optimized for in-feed experience            | No       | Yes    |
| Uses Reddit design system                   | No       | Yes    |

If you're a web developer and prefer to work with familiar technologies like HTML, CSS, and JavaScript, webviews might be the better choice for you. However, if you're comfortable learning a new domain-specific language with a constrained API and want to optimize for a speedy and simple app, you may want to build your app using blocks.

# How webviews work

### New Devvit block: `<webview />`

The new `<webview />` component in Devvit will display the contents of your web application and provide APIs for handling messaging and state synchronization between your web code and your Devvit code
All of the code that will run in your webview should be contained in a special folder called `webroot/`. There you can use Javascript APIs to send and receive messages from your Devvit environment. You cannot call external services from within the webview so if you want to fetch, use redis (storage), or the reddit API client you will need to leverage one of the strategies below to communicate between your web app and your Devvit app.

See the section below on [handling state with webviews](#handling-state-between-devvit-and-webviews) to learn how to send and receive messages and state updates between your javascript app and your Devvit app.

### Known limitations

- Inline CSS or JS is not allowed. All JS and CSS must be contained in separate files and imported via links.
- Gesture recognition on mobile does not yet work, as it triggers native gestures in the Reddit app as well. We are working on a fix for this that should be available in November.
- Uploading a new asset, even in a playtest, will overwrite assets for all versions when a new version of assets is uploaded (even via playtest) ALL versions of that app will have access to those assets. This can cause problems if you use a single app for both development and production releases. We are working on a fix that should be available in October. In the interim, we recommend creating separate apps for development and production versions of the app.
- Form submissions from within a webview are blocked for security purposes (post/get to external servers), devs can instead add a listener to the click button, read form values, and take relevant actions.

## Best practices

- The resulting webview files need to be in a folder called `webroot/` in the project directory. If you’re using a bundler for your webview app make sure that the html/css/js files build out to that directory
- Use a "Launch App" button to change visibility of your webview to prevent flashing, like used in the template below
- Try to rely on local storage and state, and limit the amount of passing back and forth into the Devvit app to handle changes when your webview is gets detsroyed or recreated in the feed
- Blocks can be used to generate a fast preview of your webview content

## Create an app with webviews

1. Create a new app.

```sh
$ devvit new

? Project name: my-webview-app
? Choose a template:
 > web-view-post

$ cd my-webview-app
```

When asked to choose a template, you can choose the `webviews-post` template to have the scaffolding auto-generated for you. Below we will provide an explanation the generated code and its functionality.

2. Upload the first version.

```sh
$ devvit upload

? Pick a name for your app: (my-webview-app)
? Is the app NSFW? (y/N)
✨ Visit https://developers.reddit.com/apps/my-webview-app to view your app!

```

3. Use Playtest to test the application in your own Subreddit

```sh
$ devvit playtest r/MyTestSubreddit

  Type checking is disabled.
  ...
  App is building remotely...... ✅
  Installing playtest version 0.0.1...... ✅
  Success! Please visit your test subreddit and refresh to see your latest changes:
  ✨ https://www.reddit.com/r/mytestsubreddit?playtest=my-webview-app

```

4. Visit your Subreddit and create a new post

Now you can visit your subreddit to try out the new post. The application creates a new Menu Action. So clicking the ellipsis (...) button on the top right of your subreddit should open an action menu that now contains the option "Create New Devvit Post (with Web View)". Go ahead and click on that. You should see a new post coming up. Clicking on Launch app on that post will launch your webview's contents:

![Sample webviews post](./assets/webviews_example.png)

### Devvit blocks (`main.tsx`)

_Load username and data from redis_

```tsx
// Load username with `useAsync` hook
const {
  loading: usernameLoading,
  error: usernameError,
  data: username,
} = useAsync(async () => {
  const currUser = await context.reddit.getCurrentUser();
  return currUser?.username ?? 'anon';
});

// Load latest counter from redis with `useAsync` hook
const {
  data: counter,
  loading,
  error,
} = useAsync(async () => {
  var redisCount = await context.redis.get(`counter_${context.postId}`);
  console.log('redisCount:', redisCount);
  return Number(redisCount ?? 0);
});
```

_Send Initial data and show Webview_

```tsx
// When the Launch App button is clicked, send initial data to webview and show it
const onShowWebviewClick = () => {
  setWebviewVisible(true);
  context.ui.webView.postMessage('myWebView', {
    type: 'initialData',
    data: {
      username: username,
      currentCounter: counter,
    },
  });
};
```

_Define the webviews component within blocks_

```tsx
<vstack grow={webviewVisible} height={webviewVisible ? '100%' : '0%'}>
  <vstack border="thick" borderColor="black" height={webviewVisible ? '100%' : '0%'}>
    <webview
      id="myWebView"
      url="page.html"
      onMessage={(msg) => onMessage(msg as WebViewMessage)}
      grow
      height={webviewVisible ? '100%' : '0%'}
    />
  </vstack>
</vstack>
```

_Respond to messages from Webview changing data in Redis DB_

```tsx
// When the webview invokes `window.parent.postMessage` this function is called
const onMessage = async (msg: WebViewMessage) => {
  if (msg?.type === 'setCounter') {
    // Get new counter value from the message
    var newCounter = msg.data.newCounter!;
    // Update Redis DB
    await context.redis.set(`counter_${context.postId}`, newCounter.toString());
    // Send confirmation of new value back to the Webview
    context.ui.webView.postMessage('myWebView', {
      type: 'updateCounter',
      data: {
        currentCounter: newCounter,
      },
    });
  }
};
```

### Web application (`webroot/page.js`)

_Listening to updates from the Devvit app_

```js
// When the Devvit app sends a message with `context.ui.webView.postMessage`, this will be triggered
window.addEventListener('message', (ev) => {
  const { type, data } = ev.data;

  // Reserved type for messages sent via `context.ui.webView.postMessage`
  if (type === 'devvit-message') {
    const { message } = data;

    // Load initial data
    if (message.type == 'initialData') {
      const { username, currentCounter } = message.data;
      usernameLabel.innerHTML = username;
      counterLabel.innerHTML = counter = currentCounter;
    }

    // Update counter
    if (message.type == 'updateCounter') {
      const { currentCounter } = message.data;
      counterLabel.innerHTML = counter = currentCounter;
    }
  }
});
```

_Sending messages to the Devvit app_

```js
window.parent?.postMessage(
  {
    type: 'setCounter',
    data: { newCounter: Number(counter + 1) },
  },
  '*'
);
```

## Explaining the Template App

Here's how this template app behaves.

Upon startup the app will:

- Load the current logged in user's username
- Load the last state of the app (counter) from Redis DB
- Display this data in Devvit Blocks

When the Launch App button is clicked, the app will:

- Show the webview and hide the other Devvit blocks
- Send an 'initialData' message from Blocks to the Webview so it can populate state
- The user is now seeing a webview with the contents of the `/webroot` folder

When the Increase/Decrease counter buttons are clicked the app will:

- Send a message from the Webviews to Blocks so state can be persisted in Redis (Webviews can't communicate directly with Redis)
- Receive a response from Blocks and update current state in the Webview

In the steps below, more details will be provided about each of the above.

## Handling state between Devvit and webviews

### Exchanging messages with `postMessage` hooks

Here's how you can send and receive messages between your webview code and your Devvit app.

In your Devvit app:

- `onMessage` property (message listener from webview → devvit)
- `context.ui.webview.postMessage` (message sender from devvit → webview)

Example (`main.tsx`):

```ts
// Receive Messages from the webview
const onMessage = (msg: JSONValue): void => {
  if (msg.type === 'stageCleared') {
    console.log('Received message from Web View', msg.data)
  }
};

<webview
  id="myWebView"
  url="page.html"
  onMessage={handleMessage} // Attach onMessage handler to the webview block
/>

// Send messages to the webview
context.ui.webview.postMessage("myWebView", {lives: 9, stage:3, world:1})
```

In your web app:

- `window.parent.postMessage` (message sender from webview → devvit)
- `window.onMessage` (message listener from devvit → webview)

Example (`webroot/app.js`):

```js
// Send messages to the Devvit app
window.parent.postMessage({ type: 'stageCleared', data: {stage: 3} }, '*');

// Receive messages from the Devvit app
window.addEventListener('message', (ev) => {
  if (ev.type === 'devvit-message') {
    console.log('Received message from Devvit', JSON.stringify(ev.data);
  }
});

```

### Local, webview-only state

The webview does not have direct access to Devvit's services such as `redis`, `realtime` and `scheduler`. Communicating with server-side logic always needs to go through the Devvit application, i.e. you need to send a `window.parent.postMessage`, capture that message in your Devvit application, and send information to the backend.

If you want to keep local state that does not need to be persisted to the backend you can use [`window.localStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage).

Example (`webroot/app.js`)

```js
// Save data to localStorage
localStorage.setItem('gameState', JSON.stringify(stateToSave));

// Load data from localStorage
const loadedState = localStorage.getItem('gameState');
```

## Questions

Don't forget to join our [Discord](https://discord.gg/Cd43ExtEFS) if you have any additional questions
