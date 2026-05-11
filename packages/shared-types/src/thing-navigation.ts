/**
 * Resolves a `navigateTo` argument (a raw URL string or a Reddit Thing-like
 * object) to the URL string the platform should navigate to.
 *
 * - Strings pass through unchanged.
 * - Things with only `url` (no `permalink`) pass through `url` unchanged. This
 *   keeps backward compatibility with callers that produce `{ url: '...' }`
 *   shapes (e.g. `UiResponse.navigateTo`).
 * - Things with both `url` and `permalink` get a heuristic:
 *   - If `url`'s pathname equals `permalink`, navigate to `url`. This is the
 *     case for Subreddit/Comment/User and self/text Posts, and using `url`
 *     preserves the source origin (e.g. Snoodev mocks return snoodev-rooted
 *     URLs and we want to keep the user on Snoodev).
 *   - Otherwise, `url` is an asset URL such as `https://i.redd.it/foo.jpg`
 *     (typical for link/image/video Posts). Fall back to `permalink` resolved
 *     against `https://www.reddit.com` so we land on the comments page rather
 *     than the asset.
 */
export function resolveNavigationInput(
  thingOrUrl: string | { readonly url: string; readonly permalink?: string }
): string {
  if (typeof thingOrUrl === 'string') {
    return thingOrUrl;
  }
  const { url, permalink } = thingOrUrl;
  if (permalink === undefined) {
    return url;
  }
  try {
    if (new URL(url).pathname !== permalink) {
      return new URL(permalink, 'https://www.reddit.com').toString();
    }
  } catch {
    return new URL(permalink, 'https://www.reddit.com').toString();
  }
  return url;
}
