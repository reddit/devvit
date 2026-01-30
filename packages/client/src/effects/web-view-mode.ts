import { EffectType } from '@devvit/protos/json/devvit/ui/effects/v1alpha/effect.js';
import { WebViewImmersiveMode } from '@devvit/protos/json/devvit/ui/effects/web_view/v1alpha/immersive_mode.js';
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
export function requestExpandedMode(event: MouseEvent, entry: string): void {
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
export function exitExpandedMode(event: MouseEvent): void {
  if (devvit.webViewMode === WebViewImmersiveMode.INLINE_MODE)
    throw Error('web view is already inlined');
  return emitModeEffect(WebViewImmersiveMode.INLINE_MODE, event, undefined);
}

/**
 * @deprecated This API is deprecated and will be removed in a future release.
 * use window.addEventListener("focus", () => { }) to receive notifications
 * when the web view mode changes back to inline.
 * Adds a listener that is called when the web view mode changes. Initial mode
 * is not reported. Web views in the process of destruction may not receive a
 * mode change event.
 *
 * @param callback The callback to be called when the mode changes.
 * @experimental
 */
export function addWebViewModeListener(_: WebViewModeListener): void {}

/**
 * @deprecated This API is deprecated and will be removed in a future release.
 * Removes a listener that was previously added with `addWebViewModeListener`.
 *
 * @param callback The callback to be removed.
 * @experimental
 */
export function removeWebViewModeListener(_: WebViewModeListener): void {}

function emitModeEffect(mode: WebViewImmersiveMode, event: Event, entry: string | undefined): void {
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

  emitEffect({
    type: EffectType.EFFECT_WEB_VIEW,
    immersiveMode: { entryUrl, immersiveMode: mode },
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
