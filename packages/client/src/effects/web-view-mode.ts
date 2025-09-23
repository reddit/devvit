import type { EffectType } from '@devvit/protos/json/devvit/ui/effects/v1alpha/effect.js';
import { WebViewImmersiveMode } from '@devvit/protos/json/devvit/ui/effects/web_view/v1alpha/immersive_mode.js';
import type { WebViewMessageEvent_MessageData } from '@devvit/protos/json/devvit/ui/events/v1alpha/web_view.js';
import { emitEffect } from '@devvit/shared-types/client/emit-effect.js';

/**
 * The presentation mode of the web view.
 * 'inline' The web view is displayed inline within a feed or post detail page
 * 'expanded' The web view is displayed in a larger modal presentation
 */
export type WebViewMode = 'inline' | 'expanded';

/**
 * A listener that is called when the web view mode changes.
 * @param mode The new mode, either 'inline' or 'expanded'.
 */
export type WebViewModeListener = (mode: WebViewMode) => void;

const modeListeners = new Set<WebViewModeListener>();

/**
 * Represents the current web view mode state for the application.
 *
 * @defaultValue 'inline'
 */
export const getWebViewMode = (): WebViewMode => webViewMode(devvit.webViewMode);

/**
 * Requests expanded mode for the web view.
 * This will display the web view in a larger modal presentation.
 *
 * @param event The event that triggered the request, must be a trusted event.
 * @returns A promise that resolves request has been received.
 *
 * @example
 * ```ts
 * button.addEventListener('click', async (event) => {
 *   await requestExpandedMode(event);
 * });
 * ```
 */
export function requestExpandedMode(event: PointerEvent): Promise<void> {
  return emitModeEffect(WebViewImmersiveMode.IMMERSIVE_MODE, event);
}

/**
 * Exits expanded mode for the web view.
 * This will display the web view in an inline presentation.
 *
 * @param event The event that triggered the request, must be a trusted event.
 * @returns A promise that resolves request has been received.
 *
 * @example
 * ```ts
 * button.addEventListener('click', async (event) => {
 *   await exitExpandedMode(event);
 * });
 * ```
 */
export function exitExpandedMode(event: PointerEvent): Promise<void> {
  return emitModeEffect(WebViewImmersiveMode.INLINE_MODE, event);
}

/**
 * Adds a listener that is called when the web view mode changes.
 * The listener will be called with the new mode, either 'inline' or 'expanded'.
 *
 * @param callback The callback to be called when the mode changes.
 */
export function addWebViewModeListener(callback: WebViewModeListener): void {
  modeListeners.add(callback);
}

/**
 * Removes a listener that was previously added with `addWebViewModeListener`.
 *
 * @param callback The callback to be removed.
 */
export function removeWebViewModeListener(callback: WebViewModeListener): void {
  modeListeners.delete(callback);
}

async function emitModeEffect(mode: WebViewImmersiveMode, event: PointerEvent): Promise<void> {
  if (!event.isTrusted || event.type !== 'click') {
    console.error('Expanded mode effect ignored due to untrusted event');
    throw new Error('Untrusted event');
  }

  const type = 9 satisfies EffectType.EFFECT_WEB_VIEW;
  await emitEffect({ type, immersiveMode: { immersiveMode: mode } });
}

/**
 * @internal
 * Handles incoming messages from the client, like when the user closes the immersive modal
 */
export function registerListener() {
  console.log('Registering web view mode listener');
  addEventListener('message', (event: MessageEvent<WebViewMessageEvent_MessageData>) => {
    const { type, data } = event.data;

    if (type !== 'devvit-message') {
      return;
    }
    if (!data?.immersiveModeEvent) {
      return;
    }

    devvit.webViewMode = data.immersiveModeEvent.immersiveMode;

    const webViewModeString = webViewMode(data.immersiveModeEvent.immersiveMode);
    modeListeners.forEach((listener) => listener(webViewModeString));
  });
}

function webViewMode(mode: WebViewImmersiveMode | undefined): WebViewMode {
  switch (mode) {
    case WebViewImmersiveMode.IMMERSIVE_MODE:
      return 'expanded';
    case WebViewImmersiveMode.INLINE_MODE:
    case WebViewImmersiveMode.UNRECOGNIZED:
    case WebViewImmersiveMode.UNSPECIFIED:
    case undefined:
      return 'inline';
    default:
      mode satisfies never;
      throw Error(`${mode} not a WebViewImmersiveMode`);
  }
}
