import type {
  WebViewInternalMessage,
  WebViewInternalMessageScope,
} from '@devvit/protos/types/devvit/ui/effects/web_view/v1alpha/post_message.js';

/**
 * Messages which are scoped to "client" and are of type "devvit-internal" should not be sent to the app.
 * These messages are designed to be handled by client platforms.
 *
 * Not all clients are updated yet, so this check is temporary until clients beging filtering these messages out.
 *
 * @param message - The web view message to check
 * @returns True if the data is a WebViewInternalMessage
 **/
export const webViewMessageIsInternalAndClientScope = (
  message: unknown
): message is WebViewInternalMessage => {
  if (message === null || typeof message !== 'object') return false;
  return (
    'scope' in message &&
    message.scope === (0 satisfies WebViewInternalMessageScope.CLIENT) &&
    'type' in message &&
    message.type === 'devvit-internal'
  );
};
