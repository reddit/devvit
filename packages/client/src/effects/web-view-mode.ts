import type { EffectType } from '@devvit/protos/json/devvit/ui/effects/v1alpha/effect.js';
import { WebViewImmersiveMode } from '@devvit/protos/json/devvit/ui/effects/web_view/v1alpha/immersive_mode.js';
import type { WebViewMessageEvent_MessageData } from '@devvit/protos/json/devvit/ui/events/v1alpha/web_view.js';
import { emitEffect } from '@devvit/shared-types/client/emit-effect.js';
import { tokenParam } from '@devvit/shared-types/webbit.js';

/**
 * The presentation mode of the web view.
 * 'inline' The web view is displayed inline within a feed or post detail page
 * 'expanded' The web view is displayed in a larger modal presentation
 * @experimental
 */
export type WebViewMode = 'inline' | 'expanded';

/**
 * A listener that is called when the web view mode changes.
 * @param mode The new mode, either 'inline' or 'expanded'.
 * @experimental
 */
export type WebViewModeListener = (mode: WebViewMode) => void;

const modeListeners = new Set<WebViewModeListener>();

/**
 * Represents the current web view mode state for the application.
 *
 * @experimental
 */
export const getWebViewMode = (): WebViewMode => webViewMode(devvit.webViewMode);

/**
 * Requests expanded mode for the web view.
 * This will display the web view in a larger modal presentation.
 *
 * @param event The gesture that triggered the request, must be a trusted event.
 * @param entry The destination URI name. Eg, `'splash'` or `'default'`. Entry
 *              names are the `devvit.json` `post.entrypoints` keys. Passing the
 *              same entrypoint as currently loaded causes a reload.
 * @returns A promise that resolves request has been received.
 * @throws When already expanded.
 *
 * @experimental
 * @example
 * ```ts
 * button.addEventListener('click', async (event) => {
 *   await requestExpandedMode(event);
 * });
 * ```
 */
export function requestExpandedMode(event: PointerEvent, entry: string): Promise<void> {
  if (devvit.webViewMode === WebViewImmersiveMode.IMMERSIVE_MODE)
    throw Error('web view is already expanded');
  return emitModeEffect(WebViewImmersiveMode.IMMERSIVE_MODE, event, entry);
}

/**
 * Exits expanded mode for the web view.
 * This will display the web view in an inline presentation.
 *
 * @param event The event that triggered the request, must be a trusted event.
 * @returns A promise that resolves request has been received.
 * @throws When already inlined.
 *
 * @experimental
 * @example
 * ```ts
 * button.addEventListener('click', async (event) => {
 *   await exitExpandedMode(event);
 * });
 * ```
 */
export function exitExpandedMode(event: PointerEvent): Promise<void> {
  if (devvit.webViewMode === WebViewImmersiveMode.INLINE_MODE)
    throw Error('web view is already inlined');
  return emitModeEffect(WebViewImmersiveMode.INLINE_MODE, event, undefined);
}

/**
 * Adds a listener that is called when the web view mode changes.
 * The listener will be called with the new mode, either 'inline' or 'expanded'.
 *
 * @param callback The callback to be called when the mode changes.
 * @experimental
 */
export function addWebViewModeListener(callback: WebViewModeListener): void {
  modeListeners.add(callback);
}

/**
 * Removes a listener that was previously added with `addWebViewModeListener`.
 *
 * @param callback The callback to be removed.
 * @experimental
 */
export function removeWebViewModeListener(callback: WebViewModeListener): void {
  modeListeners.delete(callback);
}

async function emitModeEffect(
  mode: WebViewImmersiveMode,
  event: PointerEvent,
  entry: string | undefined
): Promise<void> {
  if (!event.isTrusted || event.type !== 'click') {
    console.error('Expanded mode effect ignored due to untrusted event');
    throw new Error('Untrusted event');
  }

  if (entry != null && !devvit.entrypoints[entry])
    throw Error(
      `no entrypoint named "${entry}"; all entrypoints must appear in \`devvit.json\` \`post.entrypoints\``
    );

  let entryUrl;
  if (entry) {
    // Only `DevvitPost.entrypointUrl` has a token.
    const url = new URL(devvit.entrypoints[entry]);
    url.searchParams.set(tokenParam, devvit.token);
    entryUrl = `${url}`;
  }

  const type = 9 satisfies EffectType.EFFECT_WEB_VIEW;
  await emitEffect({
    type,
    immersiveMode: { entryUrl, immersiveMode: mode },
  });
}

/**
 * @internal
 * Handles incoming messages from the client, like when the user closes the immersive modal
 */
export function registerListener() {
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
