import type { JSONValue } from './json.js';

export interface WebViewUIClient {
  /**
   * @internal
   */
  postMessage<T extends JSONValue>(webviewIdOrMessage: string | T, message?: T | undefined): void;

  /**
   * Send a message to a WebView in your UI
   * Any WebView can receive this message.  If your app contains different WebViews with specific
   * IDs you can target a specific WebView with the alternate overload: postMessage('id', message);
   *
   * Message will arrive via window.onmessage and will be wrapped in an object:
   * { type: 'devvit-message', data: { message } }
   *
   * If no WebViews are present an error will be logged to the console.
   *
   * @param message
   */
  postMessage<T extends JSONValue>(message: T): void;
  /**
   * Send a message to a specific WebView in your UI
   *
   * Message will arrive via window.onmessage and will be wrapped in an object:
   * { type: 'devvit-message', data: { message } }
   *
   * If a WebView with the given ID is not found an error will be logged to the console.
   *
   * @param webviewId
   * @param message
   */
  postMessage<T extends JSONValue>(webviewId: string, message: T): void;
}
