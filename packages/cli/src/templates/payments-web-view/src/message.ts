/** Message from Devvit to the web view. */
export type DevvitMessage =
  // Message from blocks to the webview. This tells the web view to update
  // based on a purchase being made.
  { type: 'purchaseMade'; data: {} };

/** Message from the web view to Devvit. */
export type WebViewMessage =
  // Message represents the user indicating they want to purchase something
  // in the web-view. Note that this input should not be trusted, but needs
  // to be validated in blocks when the message is received.
  { type: 'purchase'; data: { sku: string } };

/**
 * Web view MessageEvent listener data type. The Devvit API wraps all messages
 * from Blocks to the web view.
 */
export type DevvitSystemMessage = {
  data: { message: DevvitMessage };
  /** Reserved type for messages sent via `context.ui.webView.postMessage`. */
  type?: 'devvit-message' | string;
};
