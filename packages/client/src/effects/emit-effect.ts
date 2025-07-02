import type { Effect } from '@devvit/protos';
import type {
  WebViewInternalMessage,
  WebViewInternalMessageScope,
} from '@devvit/protos/types/devvit/ui/effects/web_view/v1alpha/post_message.js';
import { WebViewInternalEventMessage } from '@devvit/protos/types/devvit/ui/events/v1alpha/web_view.js';

import { EFFECTS_WITH_RESPONSE } from './constants.js';

/**
 * Emits an effect to the parent window and handles the response if required.
 *
 * @param effect - The effect to be emitted to the parent window
 * @returns A promise that resolves with the response message for effects that require
 *          a response, or resolves immediately with undefined for effects that don't
 *
 * @description
 * This function handles two types of effects:
 * 1. Effects that require a response: Creates a unique ID, sets up a message listener,
 *    and resolves the promise when a matching response is received
 * 2. Effects that don't require a response: Posts the message and resolves immediately
 */
export const emitEffect = (effect: Effect): Promise<WebViewInternalEventMessage | undefined> => {
  return new Promise<WebViewInternalEventMessage | undefined>((resolve) => {
    const message: WebViewInternalMessage = {
      scope: 0 satisfies WebViewInternalMessageScope.CLIENT,
      type: 'devvit-internal',
    };
    if (effect.realtimeSubscriptions) {
      message.realtimeEffect = effect.realtimeSubscriptions;
    } else {
      message.effect = effect;
    }

    // Only set message id and add a listener for effects which require a response
    if (EFFECTS_WITH_RESPONSE.includes(effect.type)) {
      const id = self.crypto.randomUUID();
      message.id = id;

      const handleEffect = (event: MessageEvent): void => {
        if (event.data?.type === 'devvit-message' && event.data?.data?.id === id) {
          const serializedMessage = WebViewInternalEventMessage.fromJSON(event.data.data);
          resolve(serializedMessage);
          window.removeEventListener('message', handleEffect);
        }
      };
      window.addEventListener('message', handleEffect);

      // Post message to the parent window, handled by client web view component
      window.parent.postMessage(message, '*');
    } else {
      window.parent.postMessage(message, '*');
      // Resolve immediately for effects that don't expect a response.
      resolve(undefined);
    }
  });
};
