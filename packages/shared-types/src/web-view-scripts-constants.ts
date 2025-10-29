/**
 * The `@devvit/client` version query parameter name the web view's document
 * script tag:
 *
 *   <script src="https://webview.devvit.net/scripts/devvit.v1.min.js?clientVersion=1.2.3"></script>
 *
 * The value is the version of `@devvit/client` bundled with the app.
 * `@devvit/client` may have runtime dependencies on
 * `@devvit/web-view-scripts` (`devvit.v1.min.js`) which is not bundled. The
 * client version can be used to specialize behavior to match the static
 * expectations of the `@devvit/client` version.
 */
export const clientVersionQueryParam: string = 'clientVersion';
