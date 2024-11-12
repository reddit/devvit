import './createPost.js';

import { Devvit, type JSONValue } from '@devvit/public-api';

Devvit.addCustomPostType({
  name: 'Webview Example',
  height: 'tall',
  render: (context) => {
    const onMessage = (msg: JSONValue): void => {
      if (msg === 'ping') {
        context.ui.webView.postMessage('myWebView', 'pong');
      }
    };

    return (
      <vstack grow padding="small">
        <text>WebView Content:</text>
        <vstack border="thick" borderColor="black" grow>
          <webview id="myWebView" url="page.html" onMessage={onMessage} grow />
        </vstack>
        <vstack grow padding="small">
          <text size="small" alignment="middle center">
            Your webview app is working.{' '}
          </text>
          <text size="small" alignment="middle center">
            If you can't see the content of page.html, you likely need to get your app allow-listed
            for the webview feature.
          </text>
          <text size="small" alignment="middle center">
            Get in touch with Reddit admins via Discord to allow-list your app.{' '}
          </text>
        </vstack>
      </vstack>
    );
  },
});

export default Devvit;
