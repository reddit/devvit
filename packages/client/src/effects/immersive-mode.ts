import type { EffectType } from '@devvit/protos/types/devvit/ui/effects/v1alpha/effect.js';
import { WebViewImmersiveMode } from '@devvit/protos/types/devvit/ui/effects/web_view/v1alpha/immersive_mode.js';
import { emitEffect } from '@devvit/shared-types/client/emit-effect.js';

/**
 * The presentation mode of the web view.
 * 'inline' The web view is displayed inline within a feed or post detail page
 * 'immersive' The web view is displayed in a larger modal presentation
 */
export type ImmersiveMode = 'inline' | 'immersive';

/**
 * A listener that is called when the immersive mode changes.
 * @param immersiveMode The new immersive mode, either 'inline' or 'immersive'.
 */
export type ImmersiveListener = (immersiveMode: ImmersiveMode) => void;

const immersiveListeners = new Set<ImmersiveListener>();

/**
 * Requests immersive mode for the web view.
 * This will display the web view in a larger modal presentation.
 *
 * @param event The event that triggered the request, must be a trusted event.
 * @returns A promise that resolves when the effect is emitted.
 *
 * @example
 * button.addEventListener('click', async (event) => {
 *   await requestImmersiveMode(event);
 * });
 */
export function requestImmersiveMode(event: Event): Promise<void> {
  return emitImmersiveModeEffect(2 satisfies WebViewImmersiveMode.IMMERSIVE_MODE, event);
}

/**
 * Exits immersive mode for the web view.
 * This will display the web view in an inline presentation.
 *
 * @param event The event that triggered the request, must be a trusted event.
 * @returns A promise that resolves when the effect is emitted.
 *
 * @example
 * button.addEventListener('click', async (event) => {
 *   await emitImmersiveModeEffect(event);
 * });
 */
export function exitImmersiveMode(event: Event): Promise<void> {
  return emitImmersiveModeEffect(1 satisfies WebViewImmersiveMode.INLINE_MODE, event);
}

/**
 * Adds a listener that is called when the immersive mode changes.
 * The listener will be called with the new immersive mode, either 'inline' or 'immersive'.
 *
 * @param callback The callback to be called when the immersive mode changes.
 */
export function addImmersiveModeChangeEventListener(callback: ImmersiveListener): void {
  immersiveListeners.add(callback);
}

/**
 * Removes a listener that was previously added with `addImmersiveModeChangeEventListener`.
 *
 * @param callback The callback to be removed.
 */
export function removeImmersiveModeChangeEventListener(callback: ImmersiveListener): void {
  immersiveListeners.delete(callback);
}

async function emitImmersiveModeEffect(mode: WebViewImmersiveMode, event: Event): Promise<void> {
  if (!event.isTrusted) {
    console.error('Immersive mode effect ignored due to untrusted event');
    throw new Error('Untrusted event');
  }

  const type = 9 satisfies EffectType.EFFECT_WEB_VIEW;
  await emitEffect({ type, immersiveMode: { immersiveMode: mode } });
}

/**
 * Handles incoming messages from the client, like when the user closes the immersive modal
 */
if (typeof addEventListener === 'function') {
  addEventListener('message', (event: MessageEvent) => {
    const { type, data } = event.data;

    if (type !== 'devvit-message') {
      return;
    }
    if (!data.immersiveMode) {
      return;
    }
    const immersiveMode = event.data.data?.immersiveMode?.immersiveMode;
    const modeString =
      immersiveMode === (2 satisfies WebViewImmersiveMode.IMMERSIVE_MODE) ? 'immersive' : 'inline';

    immersiveListeners.forEach((listener) => listener(modeString));
  });
}
