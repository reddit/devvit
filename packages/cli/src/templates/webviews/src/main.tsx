import './createPost.js';

import { Devvit, type JSONObject, useState } from '@devvit/public-api';

Devvit.addCustomPostType({
  name: 'Webview Example',
  height: 'tall',
  render: () => {
    const [webviewState, setWebviewState] = useState({
      lastUpdate: 0,
    });

    const onMessage = (msg: JSONObject): void => {
      if (msg.type === 'ping') {
        const newState = { ...webviewState, lastUpdate: Date.now() };
        setWebviewState(newState);
      }
    };

    return (
      <vstack grow padding="small">
        <text>WebView Content:</text>
        <vstack border="thick" borderColor="black" grow>
          <webview url="page.html" state={webviewState} onMessage={onMessage} grow />
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
