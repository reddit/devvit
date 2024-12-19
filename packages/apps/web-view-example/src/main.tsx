import './createPost.js';

import {
  Devvit,
  useState,
  useWebView,
  UseWebViewOnMessage,
  UseWebViewResult,
} from '@devvit/public-api';

// Defines the messages that are exchanged between Devvit and Web View
type WebViewMessage =
  | {
      type: 'webViewReady';
    }
  | {
      type: 'initialData';
      data: { username: string; currentCounter: number };
    }
  | {
      type: 'setCounter';
      data: { newCounter: number };
    }
  | {
      type: 'updateCounter';
      data: { currentCounter: number };
    };

Devvit.configure({
  redditAPI: true,
  redis: true,
});

// Add a custom post type to Devvit
Devvit.addCustomPostType({
  name: 'Webview Example',
  height: 'tall',
  render: (context) => {
    // Load username with `useAsync` hook
    const [username] = useState(async () => {
      const currUser = await context.reddit.getCurrentUser();
      return currUser?.username ?? 'anon';
    });

    // Load latest counter from redis with `useAsync` hook
    const [counter, setCounter] = useState(async () => {
      const redisCount = await context.redis.get(`counter_${context.postId}`);
      return Number(redisCount ?? 0);
    });

    const onMessage: UseWebViewOnMessage<WebViewMessage> = async (
      message: WebViewMessage,
      webView: UseWebViewResult
    ) => {
      switch (message.type) {
        case 'webViewReady':
          webView.postMessage<WebViewMessage>({
            type: 'initialData',
            data: {
              username: username,
              currentCounter: counter,
            },
          });
          break;
        case 'setCounter':
          await context.redis.set(`counter_${context.postId}`, message.data.newCounter.toString());
          setCounter(message.data.newCounter);

          webView.postMessage<WebViewMessage>({
            type: 'updateCounter',
            data: {
              currentCounter: message.data.newCounter,
            },
          });
          break;
        case 'initialData':
        case 'updateCounter':
          break;

        default:
          throw new Error(`Unknown message type: ${message satisfies never}`);
      }
    };

    const { mount } = useWebView<WebViewMessage>({
      url: 'page.html',
      onMessage,
      onUnmount: () => {
        context.ui.showToast('Web view closed!');
      },
    });

    // Render the custom post type
    return (
      <vstack grow padding="small">
        <vstack grow alignment="middle center">
          <text size="xlarge" weight="bold">
            Example App
          </text>
          <spacer />
          <vstack alignment="start middle">
            <hstack>
              <text size="medium">Username:</text>
              <text size="medium" weight="bold">
                {' '}
                {username ?? ''}
              </text>
            </hstack>
            <hstack>
              <text size="medium">Current counter:</text>
              <text size="medium" weight="bold">
                {' '}
                {counter ?? ''}
              </text>
            </hstack>
          </vstack>
          <spacer />
          <button onPress={mount}>Launch App</button>
        </vstack>
      </vstack>
    );
  },
});

export default Devvit;
