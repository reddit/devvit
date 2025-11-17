import { EffectType } from '@devvit/protos/json/devvit/ui/effects/v1alpha/effect.js';
import {
  type WebViewInternalMessage,
  WebViewInternalMessageScope,
} from '@devvit/protos/json/devvit/ui/effects/web_view/v1alpha/post_message.js';
import {
  WebViewInternalEventMessage,
  WebViewMessageEvent_MessageData,
} from '@devvit/protos/types/devvit/ui/events/v1alpha/web_view.js'; // to-do: use /json/ not /types/.

export type Effect = Omit<WebViewInternalMessage, 'id' | 'scope' | 'type'> & { type: EffectType };

const EFFECTS_WITH_RESPONSE: { readonly [fx in EffectType]?: true } = {
  [EffectType.EFFECT_SHOW_FORM]: true,
  [EffectType.EFFECT_CAN_RUN_AS_USER]: true,
  [EffectType.EFFECT_CREATE_ORDER]: true,
};

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
export const emitEffect = (
  effect: Readonly<Effect>
): Promise<WebViewInternalEventMessage | undefined> => {
  return new Promise<WebViewInternalEventMessage | undefined>((resolve) => {
    const message: WebViewInternalMessage = {
      ...effect,
      realtimeEffect: effect.realtime, // to-do: remove deprecated field.
      scope: WebViewInternalMessageScope.CLIENT,
      type: 'devvit-internal',
    };

    // For temporary backward compatibility, we set both `message.effect_type` above, and `effect` below
    // Once mobile clients are updated to consume the strongly typed properties above, we can remove this block
    // *Do not* add new effects here, use the strongly typed properties above
    if (
      effect.showToast ||
      effect.navigateToUrl ||
      effect.showForm ||
      effect.type === EffectType.EFFECT_CAN_RUN_AS_USER
    ) {
      message.effect = effect;
    }

    // Only set message id and add a listener for effects which require a response
    if (EFFECTS_WITH_RESPONSE[effect.type]) {
      const id = crypto.randomUUID();
      message.id = id;

      const handleEffect = (event: MessageEvent<WebViewMessageEvent_MessageData>): void => {
        if (event.data?.type === 'devvit-message' && event.data?.data?.id === id) {
          const serializedMessage = WebViewInternalEventMessage.fromJSON(event.data.data);
          resolve(serializedMessage);
          removeEventListener('message', handleEffect);
        }
      };
      addEventListener('message', handleEffect);

      // Post message to the parent window, handled by client web view component
      parent.postMessage(message, '*');
    } else {
      parent.postMessage(message, '*');
      // Resolve immediately for effects that don't expect a response.
      resolve(undefined);
    }
  });
};
