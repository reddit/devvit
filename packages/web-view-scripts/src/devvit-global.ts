import type { DevvitPostData } from '@devvit/protos';
import type { RequestContext } from '@devvit/protos/json/devvit/platform/request_context.js';
import type {
  BridgeContext,
  WebViewClientData,
  WebViewContext,
} from '@devvit/protos/json/devvit/ui/effects/web_view/v1alpha/context.js';
import type { Context } from '@devvit/shared-types/client/client-context.js';
import type {
  DevvitGlobal,
  WebViewScriptsVersion,
} from '@devvit/shared-types/client/devvit-global.js';
import { T2, T3, T5 } from '@devvit/shared-types/tid.js';
import { type WebbitToken } from '@devvit/shared-types/webbit.js';

import { queryClientVersion } from './client.js';
import { decodeToken } from './token.js';

declare global {
  // eslint-disable-next-line no-var
  var devvit: DevvitGlobal;
  /** Defined by build.js. */
  // eslint-disable-next-line no-var
  var webViewScriptsVersion: Readonly<WebViewScriptsVersion>;
}

/** @internal */
export const initDevvitGlobal = (
  document: { readonly currentScript: { readonly src: string } | SVGScriptElement | null },
  location: { readonly hash: string },
  window: { readonly name: string }
): void => {
  const bridge = getBridgeContext(window.name, location.hash);

  const reqCtx = decodeToken(bridge.signedRequestContext);

  let context;
  if (reqCtx) context = contextFromRequestContext(reqCtx, bridge.postData);
  else if (bridge.webViewContext)
    context = contextFromWebViewContext(bridge.webViewContext, bridge.postData);
  if (!context) throw Error('no context');

  // to-do: expose `BridgeContext.client`, `devvitDebug`,
  // `nativeVersion` / `shredditVersion`.

  const clientData: WebViewClientData | undefined = bridge.webViewClientData;
  globalThis.devvit = {
    context,
    dependencies: {
      client: queryClientVersion(document),
      webViewScripts: globalThis.webViewScriptsVersion,
    },
    entrypoints: clientData?.appConfig?.entrypoints ?? {},
    share: bridge?.shareParam ? { userData: bridge?.shareParam.userData } : undefined,
    appPermissionState: bridge?.appPermissionState,
    token: (bridge.signedRequestContext || bridge.webbitToken) as WebbitToken,
    webViewMode: bridge?.viewMode,
  };
};

/** @internal */
export function contextFromRequestContext(
  reqCtx: Readonly<RequestContext>,
  postData: Readonly<DevvitPostData> | undefined
): Context {
  if (!reqCtx.app) throw Error('no RequestContext.app');
  if (!reqCtx.post) throw Error('no RequestContext.post');
  if (!reqCtx.subreddit) throw Error('no RequestContext.subreddit');
  return {
    appName: reqCtx.app.name,
    appVersion: reqCtx.app.version,
    postAuthorId: T2(reqCtx.post.author),
    postData: postData?.developerData,
    postId: T3(reqCtx.post.id),
    snoovatar: reqCtx.user?.snoovatar,
    subredditId: T5(reqCtx.subreddit.id),
    subredditName: reqCtx.subreddit.name,
    userId: reqCtx.user?.id ? T2(reqCtx.user.id) : undefined,
    username: reqCtx.user?.name,
  };
}

/** @internal */
export function contextFromWebViewContext(
  webViewCtx: Readonly<WebViewContext>,
  postData: Readonly<DevvitPostData> | undefined
): Context {
  return {
    appName: webViewCtx.appName,
    appVersion: webViewCtx.appVersion,
    postData: postData?.developerData,
    postAuthorId: undefined,
    postId: T3(webViewCtx.postId),
    snoovatar: undefined,
    subredditId: T5(webViewCtx.subredditId),
    subredditName: webViewCtx.subredditName,
    userId: webViewCtx.userId ? T2(webViewCtx.userId) : undefined,
    username: undefined,
  };
}

/**
 * Extracts the BridgeContext from the hash.
 * @internal
 */
export function getBridgeContext(name: string | undefined, hash: string): BridgeContext {
  if (name) return JSON.parse(name);
  const json = hash?.slice(1); // Strip the leading '#' from the hash
  if (!json) throw Error('no bridge context');
  return JSON.parse(decodeURIComponent(json));
}
