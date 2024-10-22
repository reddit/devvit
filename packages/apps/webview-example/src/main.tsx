import './createPost.js';

import { Devvit, type JSONObject } from '@devvit/public-api';

Devvit.addCustomPostType({
  name: 'Webview Example',
  height: 'tall',
  render: ({ useState }) => {
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
      </vstack>
    );
  },
});

export default Devvit;
