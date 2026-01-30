import { EffectType } from '@devvit/protos/json/devvit/ui/effects/v1alpha/effect.js';
import {
  type WebViewInternalMessage,
  WebViewInternalMessageScope,
} from '@devvit/protos/json/devvit/ui/effects/web_view/v1alpha/post_message.js';
// eslint-disable-next-line no-restricted-imports
import {
  WebViewInternalEventMessage,
  WebViewMessageEvent_MessageData,
} from '@devvit/protos/types/devvit/ui/events/v1alpha/web_view.js'; // to-do: use /json/ not /types/.

/** `WebViewInternalMessage.type`. */
export const webViewInternalMessageType = 'devvit-internal';

export type Effect = Omit<WebViewInternalMessage, 'id' | 'scope' | 'type'> & { type: EffectType };

/**
 * Emits an effect to the parent window returns immediately.
 *
 * @param effect - The effect to be emitted to the parent window
 * @description
 * This function handles effects that don't require a response.
 */
export const emitEffect = (effect: Readonly<Effect>): void => {
  const message: WebViewInternalMessage = {
    ...effect,
    realtimeEffect: effect.realtime, // to-do: remove deprecated field.
    scope: WebViewInternalMessageScope.CLIENT,
    type: webViewInternalMessageType,
  };

  // For temporary backward compatibility, we set both `message.effect_type` above, and `effect` below
  // Once mobile clients are updated to consume the strongly typed properties above, we can remove this block
  // *Do not* add new effects here, use the strongly typed properties above
  if (effect.showToast || effect.navigateToUrl) {
    message.effect = effect;
  }

  parent.postMessage(message, '*');
};

/**
 * Emits an effect to the parent window and returns a promise that resolves with the response message.
 *
 * @param effect - The effect to be emitted to the parent window
 * @returns A promise that resolves with the response message
 *
 * @description
 * This function handles effects that require a response.
 */
export const emitEffectWithResponse = (
  effect: Readonly<Effect>
): Promise<WebViewInternalEventMessage | undefined> => {
  return new Promise<WebViewInternalEventMessage | undefined>((resolve) => {
    const message: WebViewInternalMessage = {
      ...effect,
      realtimeEffect: effect.realtime, // to-do: remove deprecated field.
      scope: WebViewInternalMessageScope.CLIENT,
      type: webViewInternalMessageType,
    };

    // For temporary backward compatibility, we set both `message.effect_type` above, and `effect` below
    // Once mobile clients are updated to consume the strongly typed properties above, we can remove this block
    // *Do not* add new effects here, use the strongly typed properties above
    if (effect.showForm || effect.type === EffectType.EFFECT_CAN_RUN_AS_USER) {
      message.effect = effect;
    }

    const id = crypto.randomUUID();
    message.id = id;

    const handleEffect = (event: MessageEvent<WebViewMessageEvent_MessageData>): void => {
      if (event.data?.type === 'devvit-message' && event.data?.data?.id === id) {
        // to-do: drop fromJSON() when iOS is sending fully hydrated messages.
        const serializedMessage = WebViewInternalEventMessage.fromJSON(event.data.data);
        resolve(serializedMessage);
        removeEventListener('message', handleEffect);
      }
    };
    addEventListener('message', handleEffect);

    // Post message to the parent window, handled by client web view component
    parent.postMessage(message, '*');
  });
};
