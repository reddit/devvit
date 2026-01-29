import type { DevvitPostData } from '@devvit/protos';
import type { RequestContext } from '@devvit/protos/json/devvit/platform/v1/request_context.js';
import {
  type BridgeContext,
  Client as ClientName,
  type WebViewClientData,
  type WebViewContext,
} from '@devvit/protos/json/devvit/ui/effects/web_view/v1alpha/context.js';
import type { Context } from '@devvit/shared-types/client/client-context.js';
import type {
  DevvitGlobal,
  WebViewScriptsVersion,
} from '@devvit/shared-types/client/devvit-global.js';
import type { Client } from '@devvit/shared-types/shared/client.js';
import { T2, T3, T5 } from '@devvit/shared-types/tid.js';
import { type WebbitToken } from '@devvit/shared-types/webbit.js';

import { queryClientVersion } from './client.js';
import { decodeToken, requestTokenRefresh } from './token.js';

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

  const client = getClient(bridge);

  let appPermissionState = bridge?.appPermissionState;
  /**
   * Android versions older than this do not support runAsUser correctly, so we
   * suppress the permission state to allow the app to run as if the feature
   * wasn't present (failing open).
   *
   * Supported after 2026.05.0 (2605000)
   */
  if (client?.name === 'ANDROID' && client.version.number <= 2605000) {
    appPermissionState = undefined;
  }

  const reqCtx = decodeToken(bridge.signedRequestContext);

  let context;
  if (reqCtx) context = contextFromRequestContext(reqCtx, client, bridge.postData);
  else if (bridge.webViewContext)
    context = contextFromWebViewContext(bridge.webViewContext, client, bridge.postData);
  if (!context) throw Error('no context');

  // to-do: expose `devvitDebug`, `shredditVersion`.

  const clientData: WebViewClientData | undefined = bridge.webViewClientData;
  globalThis.devvit = {
    context,
    dependencies: {
      client: queryClientVersion(document),
      webViewScripts: globalThis.webViewScriptsVersion,
    },
    entrypoints: clientData?.appConfig?.entrypoints ?? {},
    share: bridge?.shareParam ? { userData: bridge?.shareParam.userData } : undefined,
    appPermissionState,
    token: (bridge.signedRequestContext || bridge.webbitToken) as WebbitToken,
    webViewMode: bridge?.viewMode,
    startTime: bridge?.startTime ?? undefined,
    refreshToken: requestTokenRefresh,
  };
};

export function updateToken(token: WebbitToken): void {
  globalThis.devvit.token = token;
}

/** @internal */
export function contextFromRequestContext(
  reqCtx: Readonly<RequestContext>,
  client: Client | undefined,
  postData: Readonly<DevvitPostData> | undefined
): Context {
  if (!reqCtx.app) throw Error('no RequestContext.app');
  if (!reqCtx.post) throw Error('no RequestContext.post');
  if (!reqCtx.subreddit) throw Error('no RequestContext.subreddit');
  return {
    appName: reqCtx.app.name,
    appSlug: reqCtx.app.slug,
    appVersion: reqCtx.app.version,
    client,
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
  client: Client | undefined,
  postData: Readonly<DevvitPostData> | undefined
): Context {
  return {
    appName: webViewCtx.appName,
    appSlug: webViewCtx.appName,
    appVersion: webViewCtx.appVersion,
    client,
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

/** @internal */
export function getClient(bridge: Readonly<BridgeContext>): Client | undefined {
  if (
    (bridge.client !== ClientName.ANDROID && bridge.client !== ClientName.IOS) ||
    !bridge.nativeVersion
  )
    return;
  return {
    name: bridge.client === ClientName.ANDROID ? 'ANDROID' : ('IOS' as const),
    version: bridge.nativeVersion,
  };
}
