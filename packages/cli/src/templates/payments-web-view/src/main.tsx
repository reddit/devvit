import './createPost.js';

import {
  addPaymentHandler,
  type OnPurchaseResult,
  OrderResultStatus,
  usePayments,
} from '@devvit/payments';
import { Devvit, useWebView } from '@devvit/public-api';

import type { DevvitMessage, WebViewMessage } from './message.js';

Devvit.configure({
  redditAPI: true,
  redis: true,
});

// Generally, use this to accept/reject purchases and/or update persistent
// state to take into account the purchase.
// In this example it is fine for it to be empty.
// When a user performs a purchase, fulfillOrder will be called.
// After which, the lambda given to usePayments will be called,
// which actually results in the UI changing.
addPaymentHandler({
  fulfillOrder() {},
});

// Add a custom post type to Devvit
Devvit.addCustomPostType({
  name: 'Payments + Web View Example',
  height: 'tall',
  render: () => {
    // Create UsePayments hook.
    const payments = usePayments((result: OnPurchaseResult) => {
      // When a successful purchase is made, send a message to the webview
      // for it to update its UI.
      if (result.status === OrderResultStatus.Success) {
        webView.postMessage({
          type: 'purchaseMade',
          data: {},
        });
      }
    });
    // Create webview
    const webView = useWebView<WebViewMessage, DevvitMessage>({
      url: 'page.html',
      async onMessage(message) {
        if (message.type === 'purchase') {
          // When a message is sent from the webview with the type 'purchase'
          // trigger a purchase. This will result in a modal being presented
          // to the user to confirm they want to purchase the item with the
          // specified SKU. Their action on that modal will result in
          // "fulfill order" being triggered.
          payments.purchase(message.data.sku);
        } else {
          throw new Error(`Unknown message type: ${message.type}`);
        }
      },
    });

    // Render the custom post type
    return (
      <vstack grow padding="small">
        <vstack grow alignment="middle center">
          <text size="xlarge" weight="bold">
            Payments on WebView Example App
          </text>
          <button onPress={() => webView.mount()}>Launch App</button>
        </vstack>
      </vstack>
    );
  },
});

export default Devvit;
