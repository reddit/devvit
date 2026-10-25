import { clientVersionDataAttribute } from '@devvit/shared-types/web-view-scripts-constants.js';

/** Document fields used to read metadata from the currently executing script. */
export type ScriptDocument = {
  readonly currentScript:
    | { readonly src: string; getAttribute(name: string): string | null }
    | SVGScriptElement
    | null;
};

/**
 * Queries the client version (eg, `'1.2.3'`) from the iframe document's script
 * tag:
 *
 *   <script src="https://webview.devvit.net/scripts/devvit.v1.min.js" data-client-version="1.2.3"></script>
 */
export function queryClientVersion(document: ScriptDocument): string | undefined {
  return document.currentScript?.getAttribute(clientVersionDataAttribute) ?? undefined;
}

/** Queries the current script `src` from the active document. */
export function queryCurrentScriptSrc(document: {
  readonly currentScript: { readonly src: string } | SVGScriptElement | null;
}): string | undefined {
  if (document.currentScript && 'src' in document.currentScript) {
    return document.currentScript.src;
  }
}
