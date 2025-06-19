# Webviews

Webviews are components that let you display web content directly within your app. This means you can show websites, HTML content, or other web-based resources without needing to leave the app.

## Known limitations

- Your app must be allowlisted by a Reddit administrator before you can use webviews.
- Inline CSS or JS is not allowed. All JS and CSS must be contained in separate files and imported via links.
- Gesture recognition on mobile does not yet work, as it triggers native gestures in the Reddit app as well. We are working on a fix for this that should be available in November.
- Assets are not tied to the app version; when a new version of assets is uploaded (even via playtest) ALL versions of that app will have access to those assets. This can cause problems if you use a single app for both development and production releases. We are working on a fix that should be available in October. In the interim, we recommend creating separate apps for development and production versions of the app.

## Install Devvit Next

In order to use webviews, you’ll need to install and use Devvit Next on 0.11.

```tsx

npm install -g devvit@next

```

In the following example, you’ll create an app that looks like [this](https://www.reddit.com/r/blockstesting/comments/1dtwjq3/my_devvit_post/) once you install it:

![Sample webviews post](../assets/webviews_example.png)

## Create an app with webviews

1. Create a new app.

```tsx
$ devvit new

? Project name: my-webview-app
? Choose a template:
 > experience-post

$ cd my-webview-app
```

2. Upload the first version.

```tsx
$ devvit upload

? Pick a name for your app: (my-webview-app)
? Is the app NSFW? (y/N)
✨ Visit https://developers.reddit.com/apps/my-webview-app to view your app!

```

3. **Ask your Reddit contact to enable webview for your app.**

4. Create HTML (project/webroot/page.html).

```tsx
<!DOCTYPE html>
<html>
   <head>
   <link rel="stylesheet" href="style.css">
   </head>
   <body>
       <h1>Hello, world!</h1>
       <button id="ping">Ping!</button>
       <div id="log"></div>
       <script src="page.js"></script>
   </body>
</html>
```

5. Create JS (project/webroot/page.js).

```tsx
window.onmessage = (ev) => {
  const log = document.querySelector('#log');
  const msg = JSON.stringify(ev.data);
  const pre = document.createElement('pre');
  pre.innerText = msg;
  log.appendChild(pre);
};

window.addEventListener('load', () => {
  window.parent.postMessage({ type: 'webview_ready' }, '*');
});

function sendPing() {
  window.parent.postMessage(
    {
      type: 'ping',
      data: {
        time: Date.now(),
      },
    },
    '*'
  );
}

document.body.querySelector('#ping').onclick = sendPing;
```

6. Create CSS (project/webroot/style.css).

```tsx
body {
    background-color: red;
}
```

7. Update `main.tsx`.

```tsx
Devvit.addCustomPostType({
  name: 'My awesome webview',
  height: 'regular',
  render: (context) => {
    const { useState } = context;

    const [myState, setMyState] = useState({
      time: Date.now(),
    });

    const handleMessage = (ev: JSONObject) => {
      if (ev.type === 'webview_ready') {
        context.ui.webView.postMessage(myState);
      } else if (ev.type == 'ping') {
        setMyState(ev.data);
        context.ui.webView.postMessage(ev.data);
      }
    };

    return (
      <vstack height="100%" width="100%" gap="medium" alignment="center middle">
        <webview grow url="page.html" onMessage={handleMessage} />
      </vstack>
    );
  },
});
```

8. If webview does not take the full width, use this workaround.

```tsx
<webview
  url="page.html"
  onMessage={handleMessage}
  width=”100%”
  minWidth=”100%”
/>
```

9. Upload your app again.

```tsx
$ devvit upload

Uploading new webview assets...... New webview assets uploaded.
```

You now have webviews enabled in your app!
