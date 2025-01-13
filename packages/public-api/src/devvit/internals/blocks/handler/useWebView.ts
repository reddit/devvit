import { EffectType, type UIEvent } from '@devvit/protos';
import { WebViewVisibility } from '@devvit/protos';
import type { JSONValue } from '@devvit/shared-types/json.js';

import type {
  UseWebViewOnMessage,
  UseWebViewOptions,
  UseWebViewResult,
} from '../../../../index.js';
import { registerHook } from './BlocksHandler.js';
import type { RenderContext } from './RenderContext.js';
import type { Hook, HookParams } from './types.js';

class WebViewHook<T extends JSONValue> implements Hook {
  state: {
    // Auto-incrementing count of the number of WebviewMessage effects called this frame.
    // Used as part of the dedup key for emitEvent to prevent messages from being dedup'd.
    messageCount: number;
  } = { messageCount: 0 };
  #hookId: string;
  // This url is the path to the asset that will be loaded in the web view.
  // It is ensured to be a valid path prior to the effect being emitted.
  #url: string;
  #onMessage: UseWebViewOnMessage<T>;
  #onUnmount?: (hook: UseWebViewResult) => void | Promise<void>;
  #renderContext: RenderContext;

  constructor(params: HookParams, options: UseWebViewOptions<T>) {
    // Default to index.html if there is no URL provided.
    this.#url = options.url ?? 'index.html';
    this.#hookId = params.hookId;
    this.#onMessage = options.onMessage;
    this.#onUnmount = options.onUnmount;
    this.#renderContext = params.context;
  }

  /**
   * Handles UI events originating from the web view and calls associated callbacks for the Devvit app to handle.
   */
  async onUIEvent(event: UIEvent): Promise<void> {
    if (event.webView?.fullScreen) {
      const isVisible = event.webView.fullScreen.visibility === WebViewVisibility.WEBVIEW_VISIBLE;
      if (!isVisible && this.#onUnmount) await this.#onUnmount(this);
    } else if (event.webView?.postMessage) {
      // Handle messages sent from web view -> Devvit app
      const { message } = event.webView.postMessage;
      await this.#onMessage(message, this);
    }
  }

  /**
   * Send a message from a Devvit app to a web view.
   */
  postMessage = <Message extends JSONValue = JSONValue>(message: Message): void => {
    // Handle messages sent from Devvit app -> web view
    this.#renderContext.emitEffect(`postMessage${this.state.messageCount++}`, {
      type: EffectType.EFFECT_WEB_VIEW,
      webView: {
        postMessage: {
          webViewId: this.#hookId,
          app: { message },
        },
      },
    });
  };

  /**
   * Triggers the fullscreen effect to show the web view in fullscreen mode.
   */
  mount = (): void => {
    const assets = this.#renderContext?.devvitContext?.assets;

    // Get the public URL for the asset. Returns an empty string if the asset is not found.
    const url = assets.getURL(this.#url, { webView: true });

    if (!url) {
      throw Error(`useWebView fullscreen request failed; web view asset could not be found`);
    }

    this.#renderContext.emitEffect('fullscreen', {
      type: EffectType.EFFECT_WEB_VIEW,
      webView: {
        fullscreen: {
          id: this.#hookId,
          show: true,
          url,
        },
      },
    });
  };
}

/**
 * Use this hook to handle a web view's visibility state and any messages sent to your app.
 * */
export function useWebView<T extends JSONValue = JSONValue>(
  options: UseWebViewOptions<T>
): UseWebViewResult {
  const hook = registerHook({
    namespace: 'useWebView',
    initializer: (params) => new WebViewHook<T>(params, options),
  });
  return {
    postMessage: hook.postMessage,
    mount: hook.mount,
  };
}
