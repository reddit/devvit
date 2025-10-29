import { clientVersionQueryParam } from '@devvit/shared-types/web-view-scripts-constants.js';

/**
 * Queries the client version (eg, `'1.2.3'`) from the iframe document's script
 * tag:
 *
 *   <script src="https://webview.devvit.net/scripts/devvit.v1.min.js?clientVersion=1.2.3"></script>
 *
 * See `clientVersionQueryParam`.
 */
export function queryClientVersion(document: {
  readonly currentScript: { readonly src: string } | SVGScriptElement | null;
}): string | undefined {
  if (document.currentScript && 'src' in document.currentScript)
    return (
      new URL(document.currentScript.src).searchParams.get(clientVersionQueryParam) ?? undefined
    );
}
