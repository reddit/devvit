import {
  devvitScriptFileName,
  devvitScriptUrl,
} from '@devvit/shared-types/web-view-scripts-constants.js';

/** Resolves a companion WebView script URL from the bootstrap script URL. */
export function getWebViewScriptUrl(
  scriptSrc: string | undefined,
  companionScriptFileName: string
): string {
  const fallbackScriptUrl = new URL(companionScriptFileName, devvitScriptUrl).toString();
  const trimmedScriptSrc = scriptSrc?.trim();
  if (!trimmedScriptSrc) return fallbackScriptUrl;

  try {
    const scriptUrl = new URL(trimmedScriptSrc);
    if (scriptUrl.pathname.endsWith(`/${devvitScriptFileName}`)) {
      return new URL(companionScriptFileName, scriptUrl).toString();
    }
  } catch {
    // Fall back when the current script URL is missing or malformed.
  }

  return fallbackScriptUrl;
}
