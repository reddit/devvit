import type { EffectType } from '@devvit/protos/json/devvit/ui/effects/v1alpha/effect.js';
import { emitEffect } from '@devvit/shared-types/client/emit-effect.js';
import { resolveNavigationInput } from '@devvit/shared-types/thing-navigation.js';

/**
 * Navigates to a URL, subreddit, post, comment, or user.
 *
 * @param url - The URL, subreddit, post, comment, or user to navigate to
 */
export function navigateTo(
  url: string | { readonly url: string; readonly permalink?: string }
): void {
  const inputUrl = resolveNavigationInput(url);
  let normalizedUrl: string;
  try {
    normalizedUrl = new URL(inputUrl).toString();
  } catch {
    throw new TypeError(`Invalid URL: ${inputUrl}`);
  }
  void emitEffect({
    navigateToUrl: {
      url: normalizedUrl,
    },
    type: 5 satisfies EffectType.EFFECT_NAVIGATE_TO_URL,
  });
}
