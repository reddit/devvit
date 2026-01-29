import type { AppPermissionState } from '@devvit/protos/json/devvit/ui/effects/web_view/v1alpha/context.js';
import type { WebViewImmersiveMode } from '@devvit/protos/json/devvit/ui/effects/web_view/v1alpha/immersive_mode.js';

import type { WebbitToken } from '../webbit.js';
import type { Context } from './client-context.js';

/** `globalThis.devvit` in web views. */
export type DevvitGlobal = {
  context: Context;
  dependencies: {
    /** `@devvit/client` semantic version. Eg, `1.2.3` or `0.12.2-dev`. */
    client: string | undefined;
    webViewScripts: WebViewScriptsVersion;
  };
  /** Entrypoint name to URL from `devvit.json` `post.entrypoints`. */
  entrypoints: { [name: string]: string };
  /** App deep link data if any. */
  share: Share | undefined;
  /** Data required for the "run as user" feature. */
  appPermissionState: AppPermissionState | undefined;
  /** The auth bearer token shared across all entries. */
  token: WebbitToken;
  /** Current state of the web views immersive mode. */
  webViewMode: WebViewImmersiveMode | undefined;
  /** Earliest moment the app started loading in UTC milliseconds. */
  startTime: number | undefined;
  /**
   * Function to refresh the token.
   * INTERNAL: This is an internal, unsupported API and may change or be removed at any time.
   */
  refreshToken: (() => Promise<void>) | undefined;
};

/** `@devvit/web-view-scripts` version detail. */
export type WebViewScriptsVersion = {
  /** Git short hash of `HEAD` at build time. */
  hash: string;
  /** `package.json` semantic version. Eg, `1.2.3` or `0.12.2-dev`. */
  version: string;
};

/** App deep link data. */
export type Share = { userData: string | undefined };
