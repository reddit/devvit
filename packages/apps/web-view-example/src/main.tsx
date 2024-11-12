import './createPost.js';

import { Devvit, type JSONValue, useState } from '@devvit/public-api';

type MyMessageType = {
  foo: string;
};

Devvit.addCustomPostType({
  name: 'WebView Example',
  height: 'tall',
  render: (context) => {
    const [webViewState, setWebViewState] = useState({
      lastUpdate: 0,
    });

    const onMessage = (msg: JSONValue): void => {
      if (msg) {
        console.log(msg);
        const newState = { ...webViewState, lastUpdate: Date.now() };
        setWebViewState(newState);
      }
    };

    const sendPing = () => context.ui.webView.postMessage('myWebView', 'ping');
    const sendMessage = () =>
      context.ui.webView.postMessage<MyMessageType>('myWebView', { foo: 'bar' });

    return (
      <vstack grow padding="small">
        <text>WebView Content:</text>
        <vstack border="thick" borderColor="black" gap="small" grow>
          <webview id="myWebView" url="page.html" state={webViewState} onMessage={onMessage} grow />
          <button onPress={sendPing}>Send Ping</button>
          <button onPress={sendMessage}>Send Message</button>
        </vstack>
        <vstack grow padding="small">
          <text size="small" alignment="middle center">
            Your WebView app is working.{' '}
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
