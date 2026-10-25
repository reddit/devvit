import type { EffectType } from '@devvit/protos/json/devvit/ui/effects/v1alpha/effect.js';
import type {
  ShareParam,
  ShareParam_Presentation,
} from '@devvit/protos/json/devvit/ui/effects/web_view/v1alpha/context.js';
import type { T3 } from '@devvit/shared';
import { emitEffect } from '@devvit/shared-types/client/emit-effect.js';
import { resolveNavigationInput } from '@devvit/shared-types/thing-navigation.js';
import { redditUrlFromPostId } from '@devvit/shared-types/web-view-scripts-constants.js';

import type { WebViewOptions } from './web-view-options.js';

/** Options for navigating to a URL or Reddit object. */
export type NavigateToOptions = WebViewOptions & {
  presentation?: 'expanded';
};

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
  emitNavigationEffect(normalizedUrl);
}

/**
 * Navigates to a post.
 *
 * @param postId - The ID of the post to navigate to.
 * @param options - Optional settings for the presentation of the custom post.
 */
export function navigateToPost(postId: T3, options?: NavigateToOptions): void {
  const normalizedUrl = new URL(redditUrlFromPostId(postId));

  const devvitShare: Partial<ShareParam> = {};

  if (options?.title !== undefined) {
    devvitShare.title = options.title;
  }

  if (options?.presentation === 'expanded') {
    devvitShare.presentation = 1 satisfies ShareParam_Presentation.EXPANDED;
  }

  if (devvitShare.title !== undefined || devvitShare.presentation !== undefined) {
    normalizedUrl.searchParams.set('devvitshare', JSON.stringify(devvitShare));
  }

  emitNavigationEffect(normalizedUrl.toString());
}

function emitNavigationEffect(url: string): void {
  void emitEffect({
    navigateToUrl: { url },
    type: 5 satisfies EffectType.EFFECT_NAVIGATE_TO_URL,
  });
}
