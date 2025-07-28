import type { EffectType } from '@devvit/protos/types/devvit/ui/effects/v1alpha/effect.js';
import type { Comment, Post, Subreddit, User } from '@devvit/reddit';
import { emitEffect } from '@devvit/shared-types/client/emit-effect.js';

/**
 * Navigates to a URL, subreddit, post, comment, or user.
 *
 * @param thingOrUrl - The URL, subreddit, post, comment, or user to navigate to
 */
export function navigateTo(url: string): void;
export function navigateTo(subreddit: Readonly<Subreddit>): void;
export function navigateTo(post: Readonly<Post>): void;
export function navigateTo(comment: Readonly<Comment>): void;
export function navigateTo(user: Readonly<User>): void;
export function navigateTo(
  thingOrUrl: string | Readonly<Subreddit> | Readonly<Post> | Readonly<Comment> | Readonly<User>
): void {
  const inputUrl = typeof thingOrUrl === 'string' ? thingOrUrl : thingOrUrl.url;
  if (!URL.canParse(inputUrl)) {
    throw new TypeError(`Invalid URL: ${inputUrl}`);
  }
  const normalizedUrl = new URL(inputUrl).toString();
  void emitEffect({
    navigateToUrl: {
      url: normalizedUrl,
    },
    type: 5 satisfies EffectType.EFFECT_NAVIGATE_TO_URL,
  });
}
