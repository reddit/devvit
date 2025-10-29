/**
 * @import { BridgeContext, WebViewClientData } from '@devvit/protos/json/devvit/ui/effects/web_view/v1alpha/context.js';
 */

/** @type {BridgeContext} */ const bridge = {
  appPermissionState: { consentStatus: 0, requestedScopes: [], grantedScopes: [] },
  client: 3,
  devvitDebug: '',
  postData: {
    splash: {
      appDisplayName: 'appDisplayName',
      backgroundUri: 'https://i.redd.it/cpsxzbp96pdf1.png',
      entry: 'default',
      title: 'title',
    },
    developerData: { hello: 'world' },
  },
  shredditVersion: { major: 1, minor: 2, patch: 3, version: '1.2.3' },
  signedRequestContext:
    'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJkZXZ2aXQtZ2F0ZXdheS5yZWRkaXQuY29tIiwiYXVkIjpbInBsdWdpbnMuZGV2dml0Lm5ldCJdLCJleHAiOjE3NjAxMzUyNzUsIm5iZiI6MTc2MDEzMTY3NSwiaWF0IjoxNzYwMTMxNjc1LCJqdGkiOiI2NmY3ZmQ0YS1hODJjLTQwYzQtOWExOC0zYmNhMTNhYWFkZDAiLCJkZXZ2aXQiOnsiaW5zdGFsbGF0aW9uIjp7ImlkIjoiOGUwZTBlYjctNzQ3OC00ZWYxLWE0ZmYtOTk1OWYxOTNmY2QwIn0sImFwcCI6eyJpZCI6ImNvcnJpZG9yLWdhbWUiLCJuYW1lIjoiY29ycmlkb3ItZ2FtZSIsInZlcnNpb24iOiIwLjAuOSIsInN0YXR1cyI6MX0sInBvc3QiOnsiaWQiOiJ0M18xbTB3eWVjIiwiYXV0aG9yIjoidDJfMWdqdjIwcGFmaiJ9LCJzdWJyZWRkaXQiOnsibmFtZSI6ImNvcnJpZG9yZ2FtZSIsImlkIjoidDVfY3NpcGM0In0sInVzZXIiOnsibmFtZSI6InN0ZXBoZW5vaWQiLCJpZCI6InQyX2s2bGRiamgzIiwic25vb3ZhdGFyIjoiaHR0cHM6Ly9pLnJlZGQuaXQvc25vb3ZhdGFyL2F2YXRhcnMvYTY3YThhMDktZmI0NC00MDQxLTgwNzMtMjJlODkyMTA5NjFkLnBuZyJ9fX0.eF9MsEzlzM_Iieal2FBaQVJ5vM5Iise26CfAPAsJlqpPHdCJoNY6Pm1x8-1gwsQRF0Nv5vA1djWgDIEG6x_kRdKPhYObHZ6mXXeQfu1sS_7lCN_8fEk17QeVJxFrBB4KcCjKNlh3fXTlsc7xu-CkwV3cuXdoEs2Q3_oBLrGHqVkQhR0HaNmoQhRv60nmYRbef-DTCh0OWnJQrimypsAWBlaQs5U3B5njKtRhoZqkmnufmOTXwCTOQczHu1a65UX8CcOYWe8qphBvue-Khdb4BgREaJpK_khjZ1sqOXPOZbarRJgHteaIo7vHjuYOmg6tr_-UUgYcPMCK8B-wtWKkfw',
  webViewClientData: /** @type {WebViewClientData} */ ({
    appConfig: {
      entrypoints: {
        default: 'https://snntest20250827a-fgcm25-0-0-2-120-webview.devvit.net/index.html',
        leaderboard:
          'https://snntest20250827a-fgcm25-0-0-2-120-webview.devvit.net/leaderboard.html',
      },
    },
  }),
  viewMode: 1,
  webbitToken:
    'eyJhbGciOiJIUzI1NiIsImtpZCI6ImVlYzJjOWUzLWM0NTctNTM3Zi05NThmLTI5MDg3N2U4NjNlYyIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJkZXZ2aXQtZ2F0ZXdheS5yZWRkaXQuY29tIiwiYXVkIjpbIjk5MDEzNmEyLTQwMTgtNDdlNS1hMjFlLTVlOTU1ODdlOWE4Ni0wLTAtMi03NS13ZWJ2aWV3LmRldnZpdC5uZXQiXSwiZXhwIjoxNzU5ODY3ODg1LCJuYmYiOjE3NTk3ODE0ODUsImlhdCI6MTc1OTc4MTQ4NSwianRpIjoiZmI2ZmFlNjUtYmFmMC00YTYxLWE4YjctMzc4ODhjM2JkNWY1IiwiZGV2dml0LXBvc3QtaWQiOiJ0M18xbmptc3BvIiwiZGV2dml0LXBvc3QtZGF0YSI6eyJzcGxhc2giOnsiZW50cnkiOiJkZWZhdWx0IiwidGl0bGUiOiJzbm50ZXN0MjAyNTA4MjdhIiwiYmFja2dyb3VuZFVyaSI6Imh0dHBzOi8vaS5yZWRkLml0L2Nwc3h6YnA5NnBkZjEucG5nIiwiYXBwRGlzcGxheU5hbWUiOiJzbm50ZXN0MjAyNTA4MjdhIn19LCJkZXZ2aXQtdXNlci1pZCI6InQyX2s2bGRiamgzIiwiZGV2dml0LWluc3RhbGxhdGlvbiI6Ijk5MDEzNmEyLTQwMTgtNDdlNS1hMjFlLTVlOTU1ODdlOWE4NiJ9.gv_BzIO-kHfWleALML6-52DYMchG-Frlr5iPQwtS8a4',
  webViewContext: {
    appName: 'appName',
    appVersion: '1.2.3.4',
    postId: 't3_123',
    subredditId: 't5_123',
    subredditName: 'subredditName',
    userId: 't2_123',
  },
};

const json = JSON.stringify(bridge);
if (new URL(location.href).searchParams.has('hash')) {
  // See packages/ui-renderer/library/src/client/web-view.ts.
  const hash = `#${encodeURIComponent(json)}`;
  // eslint-disable-next-line security/detect-possible-timing-attacks
  if (location.hash !== hash) {
    location.hash = hash;
    location.reload();
  }
} else window.name = json;
