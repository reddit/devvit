import { EffectType } from '@devvit/protos/json/devvit/ui/effects/v1alpha/effect.js';
import { WebViewUserProgressEffect_State } from '@devvit/protos/json/devvit/ui/effects/web_view/v1alpha/user_progress.js';
import { emitEffect } from '@devvit/shared-types/client/emit-effect.js';
import { userProgressStateHeader } from '@devvit/shared-types/user-progress.js';

// Multiple bundled copies of the client SDK must not emit the same notification twice.
const userProgressFetch = Symbol.for('@devvit/client/user-progress');
type ProgressFetch = typeof globalThis.fetch & { [userProgressFetch]?: true };

/** Receives server SDK progress when the browser client SDK is imported. @internal */
export function initUserProgress(): void {
  const fetch = globalThis.fetch as ProgressFetch;
  if (fetch[userProgressFetch]) return;

  const wrappedFetch: ProgressFetch = async (input, init) => {
    const response = await fetch(input, init);
    const url = new URL(input instanceof Request ? input.url : input, location.href);
    if (
      url.origin === location.origin &&
      url.pathname.startsWith('/api/') &&
      !response.redirected
    ) {
      // Notification delivery must not turn a successful app request into a failure.
      try {
        notifyUserProgress(response);
      } catch (error) {
        console.error('Failed to deliver user progress notification', error);
      }
    }
    return response;
  };
  wrappedFetch[userProgressFetch] = true;
  globalThis.fetch = wrappedFetch;
}

function notifyUserProgress(response: Response): void {
  const progress = response.headers.get(userProgressStateHeader);
  const state =
    progress === 'STARTED'
      ? WebViewUserProgressEffect_State.STARTED
      : progress === 'COMPLETED'
        ? WebViewUserProgressEffect_State.COMPLETED
        : undefined;
  if (state !== undefined) {
    emitEffect({ type: EffectType.EFFECT_WEB_VIEW, userProgress: { state } });
  }
}
