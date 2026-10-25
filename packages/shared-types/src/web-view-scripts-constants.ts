/**
 * The `@devvit/client` version attribute name on the web view's document
 * script tag:
 *
 *   <script src="https://webview.devvit.net/scripts/devvit.v1.min.js" data-client-version="1.2.3"></script>
 *
 * The value is the version of `@devvit/client` bundled with the app.
 * `@devvit/client` may have runtime dependencies on
 * `@devvit/web-view-scripts` (`devvit.v1.min.js`) which is not bundled. The
 * client version can be used to specialize behavior to match the static
 * expectations of the `@devvit/client` version.
 */
export const clientVersionDataAttribute: string = 'data-client-version';

/** Bootstrap WebView script file name. */
export const devvitScriptFileName: string = 'devvit.v1.min.js';

/** Screenshot capture WebView script file name. */
export const screenshotScriptFileName: string = 'screenshot.v1.min.js';

/** CDN URL for the WebView bootstrap script. */
export const devvitScriptUrl: string = `https://webview.devvit.net/scripts/${devvitScriptFileName}`;

/** Constructs a Reddit URL from a post ID. */
export const redditUrlFromPostId = (postId: string): string => {
  const postWithoutPrefix = postId.replace('t3_', '');
  return `https://reddit.com/r/_/comments/${postWithoutPrefix}`;
};
