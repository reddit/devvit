import type { JSONValue } from '@devvit/shared-types/json.js';

export interface WebViewUIClient {
  /**
   * Send a message to a webview
   * Message will arrive via window.onmessage and will be wrapped in an object:
   * { type: 'devvit-message', data: { message } }
   */
  postMessage<T extends JSONValue>(webviewId: string, message: T): void;
}
