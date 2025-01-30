# Web views

:::note
Web views is currently experimental. Web view apps will be publishable soon.
:::

Web views allow you to include HTML, CSS, and JavaScript and have it run within your Reddit app. This gives you full control over your app's appearance and behavior while running within Reddit's platform.

## Getting started

Create a new web view project:

```bash
devvit new --template web-view-post
cd my-project
```

Your project structure will look like this.

```
my-project/
├── webroot/           # All web content goes here
│   ├── page.html     # Main HTML file
│   ├── styles.css    # Stylesheets
│   └── app.js        # JavaScript code
└── src/
    └── main.tsx      # Devvit app code
```

## useWebView

The `useWebViewHook` integrates web views into your Devvit app. It will open a large viewport (full screen on mobile and a modal on web) and provides a clean interface for managing webview lifecycle and communication.

### Syntax

```typescript
const { mount } = useWebView({
  url: string,
  onMessage: (message: any, webView: UseWebViewResult) => void,
  onUnmount?: () => void
});
```

- url: the path to your HTML file relative to the webroot directory
- onMessage: callback function that handles messages received from the webview. Receives two parameters:
  - message: the data sent from the webview via postMessage
  - webView: an object containing methods to interact with the webview
- onUnmount (optional): callback function that runs when the webview is closed

Return values:

- mount: function to programmatically open the webview

### Basic example

```typescript
const App = () => {
  const { mount } = useWebView({
    // URL of your webview content
    url: 'page.html',

    // Handle messages from webview
    onMessage: (message) => {
      console.log('Received from webview:', message);
    },

    // Cleanup when webview closes
    onUnmount: () => {
      console.log('Webview closed');
    },
  });

  return <button onPress={mount}>Launch App</button>;
};
```

## Migration guide

<details>
  <summary>Click here for instructions on how to migrate from the webview component to the new useWebView hook.</summary>
  <div>
    <div>

This migration guide helps you migrate from using the webview component with visibility toggle, as used in our web-view-post template, to using the new useWebView hook. This will give you access to more gestures and sounds, and make sure your apps are performant in Reddit feeds.

**Overview**

The `useWebView` hook simplifies webview management with three main parameters:

- url: The URL of your webview content
- onMessage: Handler for messages from the webview
- onUnmount: Cleanup function that runs when the webview is closed

Instead of managing visibility with state, you'll use the mount function returned by the hook to open the webview.

**Before (webview component)**

```ts
// Managing visibility with state
const [webViewVisible, setWebViewVisible] = useState(false);

// Message handler
const onMessage = async (msg) => {
  if (msg.type === 'setCounter') {
    await context.redis.set(`counter_${context.postId}`, msg.data.newCounter.toString());
    setCounter(msg.data.newCounter);
  }
};

return (
  <vstack>
    <button onPress={() => setWebViewVisible(true)}>Launch App</button>
    {webViewVisible ? <webview id="myWebView" url="page.html" onMessage={onMessage} /> : null}
  </vstack>
);
```

**After (useWebView hook)**

```ts
import { useWebView } from '@devvit/public-api';

// Using useWebView hook
const { mount } = useWebView({
  // URL of your webview content
  url: 'page.html',

  // Message handler
  onMessage: async (message, webView) => {
    if (message.type === 'setCounter') {
      await context.redis.set(`counter_${context.postId}`, message.data.newCounter.toString());
      setCounter(message.data.newCounter);
    }
  },

  // Cleanup when webview is closed
  onUnmount: () => {
    context.ui.showToast('Web view closed!');
  },
});

return (
  <vstack>
    <button onPress={mount}>Launch App</button>
  </vstack>
);
```

**Key Differences**

1. Opening the web view

Old: Webview component was open immediately
The old web-view-post template toggled visibility with state (setWebViewVisible(true))

New: Use mount function from the hook

2. Message Handling

Old: Separate onMessage function passed as a parameter to component
New: Defined directly in useWebView parameters, along with access to an onUnmount function

3. Cleanup

Old: N/A
New: onUnmount parameter handles callback after cleanup

</div>
    <br/>
  </div>
</details>

## Best practices

### Performance

- Cache data in localStorage where appropriate
- Minimize state synchronization between webview and Devvit
- Handle responsive views across mobile and desktop devices

### File organization

- Keep all web files in the webroot/ directory
- Use separate files for HTML, CSS, and JavaScript
- Consider using a bundler for larger applications

## Known limitations

### CSS/JS requirements

- ❌ No inline CSS or JavaScript
- ✅ Use separate .css and .js files

### Forms

- ❌ No direct form submissions
- ✅ Use JavaScript to handle form data
- ✅ Send data via postMessage

## Communication between Devvit and web view

Web views let you build custom UIs with HTML/CSS/JS while accessing Devvit's backend services ([Redis](./capabilities/redis.md), [fetch](./capabilities/http-fetch.md), [scheduler](./capabilities/scheduler.md), [triggers](./capabilities/triggers.md)) via message passing between the two contexts.

![Sample web views post](./assets/webviews-devvit-architecture.png)

### From web view to Devvit

In your webview JavaScript:

```javascript
// app.js
window.parent.postMessage(
  {
    type: 'userAction',
    data: { clicked: true },
  },
  '*'
);
```

In your Devvit app:

```typescript
// main.tsx
const { mount } = useWebView({
  url: 'page.html',
  onMessage: (message) => {
    if (message.type === 'userAction') {
      console.log('User clicked:', message.data.clicked);
    }
  },
});
```

### From Devvit to web view

Your webview code needs to listen for messages:

```javascript
// app.js
window.addEventListener('message', (event) => {
  if (event.data.type === 'devvit-message') {
    const { message } = event.data;
    console.log('Received from Devvit:', message);
  }
});
```

## Managing state

### Local state

Webviews can use localStorage for client-side persistence:

```javascript
// Save data
localStorage.setItem('gameState', JSON.stringify(state));

// Load data
const savedState = localStorage.getItem('gameState');
```

### Server state

For data that needs to persist or sync with Devvit's backend:

```typescript
const App = () => {
  // Load data from Redis
  const [counter] = useState(async () => {
    const value = await context.redis.get(`counter_${context.postId}`);
    return Number(value ?? 0);
  });

  const { mount } = useWebView({
    url: 'page.html',
    onMessage: async (message) => {
      if (message.type === 'updateCounter') {
        // Update Redis
        await context.redis.set(`counter_${context.postId}`, message.data.newValue);
      }
    },
  });

  return <button onPress={mount}>Open App</button>;
};
```
