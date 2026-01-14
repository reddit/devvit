import type { RequestContext } from '@devvit/protos/json/devvit/platform/v1/request_context.js';
import {
  type BridgeContext,
  Client,
} from '@devvit/protos/json/devvit/ui/effects/web_view/v1alpha/context.js';
import { WebViewImmersiveMode } from '@devvit/protos/json/devvit/ui/effects/web_view/v1alpha/immersive_mode.js';
import type { DevvitGlobal } from '@devvit/shared-types/client/devvit-global.js';
import { noWebbitToken } from '@devvit/shared-types/webbit.js';
import { describe, expect, test } from 'vitest';

import {
  contextFromRequestContext,
  contextFromWebViewContext,
  getBridgeContext,
  getClient,
  initDevvitGlobal,
} from './devvit-global.js';

describe('getBridgeContext()', () => {
  test('hash', () => {
    const testBridgeContext: BridgeContext = {
      webbitToken: noWebbitToken,
      webViewContext: {
        subredditId: 't5_subredditId',
        subredditName: 'subredditName',
        userId: 't2_userId',
        appName: 'test-app-123',
        appVersion: '1.0.0',
        postId: 't3_postId',
      },
      devvitDebug: 'hello',
      client: Client.SHREDDIT,
    };
    const hash = `#${encodeURIComponent(JSON.stringify(testBridgeContext))}`;
    const result = getBridgeContext('', hash);
    expect(result).toStrictEqual(testBridgeContext);
  });

  test('Window.name is favored to hash', () => {
    const testBridgeContext: BridgeContext = {
      webbitToken: noWebbitToken,
      webViewContext: {
        subredditId: 't5_subredditId',
        subredditName: 'subredditName',
        userId: 't2_userId',
        appName: 'test-app-123',
        appVersion: '1.0.0',
        postId: 't3_postId',
      },
      devvitDebug: 'hello',
      client: Client.SHREDDIT,
    };
    const json = JSON.stringify(testBridgeContext);
    const result = getBridgeContext(json, '#invalid');
    expect(result).toStrictEqual(testBridgeContext);
  });

  test('should throw when there is no name and no hash', () => {
    expect(() => getBridgeContext('', '')).toThrowErrorMatchingInlineSnapshot(
      `[Error: no bridge context]`
    );
  });
});

describe('contextFromRequestContext()', () => {
  test('creates context from request context', () => {
    const reqCtx: RequestContext = {
      app: {
        id: 'app123',
        name: 'test-app-123',
        version: '1.0.0',
        status: 1,
        slug: 'test-app-123',
      },
      subreddit: { id: 't5_123', name: 'testSubreddit' },
      user: { id: 't2_456', name: 'testUser', snoovatar: 'https://avatar' },
      post: { id: 't3_789', author: 't2_400' },
    };

    const result = contextFromRequestContext(reqCtx, undefined, {
      developerData: { score: 42 },
    });

    expect(result).toMatchInlineSnapshot(`
      {
        "appName": "test-app-123",
        "appSlug": "test-app-123",
        "appVersion": "1.0.0",
        "client": undefined,
        "postAuthorId": "t2_400",
        "postData": {
          "score": 42,
        },
        "postId": "t3_789",
        "snoovatar": "https://avatar",
        "subredditId": "t5_123",
        "subredditName": "testSubreddit",
        "userId": "t2_456",
        "username": "testUser",
      }
    `);
  });

  test('handles logged out user', () => {
    const reqCtx: RequestContext = {
      app: {
        id: 'app123',
        name: 'test-app-123',
        version: '1.0.0',
        status: 1,
        slug: 'test-app-123',
      },
      subreddit: { id: 't5_123', name: 'testSubreddit' },
      post: { id: 't3_789', author: 't2_400' },
    };

    const result = contextFromRequestContext(reqCtx, undefined, undefined);

    expect(result.userId).toBeUndefined();
    expect(result.username).toBeUndefined();
    expect(result.snoovatar).toBeUndefined();
  });
});

describe('contextFromWebViewContext()', () => {
  test('creates context from web view context', () => {
    const result = contextFromWebViewContext(
      {
        subredditId: 't5_123',
        subredditName: 'testSubreddit',
        userId: 't2_456',
        appName: 'test-app-123',
        appVersion: '1.0.0',
        postId: 't3_789',
      },
      undefined,
      { developerData: { score: 42 } }
    );

    expect(result).toMatchInlineSnapshot(`
      {
        "appName": "test-app-123",
        "appSlug": "test-app-123",
        "appVersion": "1.0.0",
        "client": undefined,
        "postAuthorId": undefined,
        "postData": {
          "score": 42,
        },
        "postId": "t3_789",
        "snoovatar": undefined,
        "subredditId": "t5_123",
        "subredditName": "testSubreddit",
        "userId": "t2_456",
        "username": undefined,
      }
    `);
  });

  test('handles logged out user', () => {
    const result = contextFromWebViewContext(
      {
        subredditId: 't5_123',
        subredditName: 'testSubreddit',
        userId: '',
        appName: 'test-app-123',
        appVersion: '1.0.0',
        postId: 't3_789',
      },
      undefined,
      undefined
    );

    expect(result.userId).toBeUndefined();
  });
});

describe('initContext()', () => {
  afterEach(() => {
    delete (globalThis as { devvit?: DevvitGlobal }).devvit;
  });

  test('context is unpacked', async () => {
    const bridge: BridgeContext = {
      devvitDebug: '',
      client: Client.CLIENT_UNSPECIFIED,
      postData: {
        developerData: {
          leaderboard: {
            topScore: 100,
            user: 'batman',
          },
        },
      },
      webViewContext: {
        subredditId: 't5_123',
        subredditName: 'subredditName',
        userId: 't2_123',
        appName: 'test-app-123',
        appVersion: '1.2.3',
        postId: 't3_123',
      },
      webbitToken:
        'eyJhbGciOiJIUzI1NiIsImtpZCI6IjRkZjhhM2U1LTcwYmYtNWM5Zi05NzYwLTQyZGQ4ZWVjZmY1NyIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJkZXZ2aXQtZ2F0ZXdheS5zaGFubm9uLWZlbmcuc25vby5kZXYiLCJhdWQiOlsiODlkMjJiODAtNzljNi00NWJiLTk1ZDctZWY2YTlhOWVkMGQxLTEtMC0xLXdlYnZpZXcuZGV2dml0Lm5ldCJdLCJleHAiOjE3NTM0ODk5MDYsIm5iZiI6MTc1MzQwMzUwNiwiaWF0IjoxNzUzNDAzNTA2LCJqdGkiOiIyMTJmMmQ3OC1kZjUyLTRjYTMtODlkMi1jNGFlYzg3OTdjNjQiLCJkZXZ2aXQtcG9zdC1pZCI6InQzXzF3IiwiZGV2dml0LXBvc3QtZGF0YSI6eyJkZXZlbG9wZXJEYXRhIjp7ImxlYWRlcmJvYXJkIjp7InRvcFNjb3JlIjoxMDAsInVzZXIiOiJiYXRtYW4ifX19LCJkZXZ2aXQtdXNlci1pZCI6InQyXzEiLCJkZXZ2aXQtaW5zdGFsbGF0aW9uIjoiODlkMjJiODAtNzljNi00NWJiLTk1ZDctZWY2YTlhOWVkMGQxIn0.LQ_E9AFli0iIyRv01eL_qoNrBijfjoWOZOJkRzxSPlE',
    };

    initDevvitGlobal(
      { currentScript: null },
      { hash: `#${encodeURIComponent(JSON.stringify(bridge))}` },
      { name: '' }
    );

    expect(devvit.context).toMatchInlineSnapshot(`
      {
        "appName": "test-app-123",
        "appSlug": "test-app-123",
        "appVersion": "1.2.3",
        "client": undefined,
        "postAuthorId": undefined,
        "postData": {
          "leaderboard": {
            "topScore": 100,
            "user": "batman",
          },
        },
        "postId": "t3_123",
        "snoovatar": undefined,
        "subredditId": "t5_123",
        "subredditName": "subredditName",
        "userId": "t2_123",
        "username": undefined,
      }
    `);
  });

  test('context is unpacked from Window.name', async () => {
    const bridge: BridgeContext = {
      devvitDebug: '',
      client: Client.CLIENT_UNSPECIFIED,
      postData: {
        developerData: {
          leaderboard: {
            topScore: 100,
            user: 'batman',
          },
        },
      },
      webViewContext: {
        subredditId: 't5_123',
        subredditName: 'subredditName',
        userId: 't2_123',
        appName: 'test-app-123',
        appVersion: '1.2.3',
        postId: 't3_123',
      },
      webbitToken:
        'eyJhbGciOiJIUzI1NiIsImtpZCI6IjRkZjhhM2U1LTcwYmYtNWM5Zi05NzYwLTQyZGQ4ZWVjZmY1NyIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJkZXZ2aXQtZ2F0ZXdheS5zaGFubm9uLWZlbmcuc25vby5kZXYiLCJhdWQiOlsiODlkMjJiODAtNzljNi00NWJiLTk1ZDctZWY2YTlhOWVkMGQxLTEtMC0xLXdlYnZpZXcuZGV2dml0Lm5ldCJdLCJleHAiOjE3NTM0ODk5MDYsIm5iZiI6MTc1MzQwMzUwNiwiaWF0IjoxNzUzNDAzNTA2LCJqdGkiOiIyMTJmMmQ3OC1kZjUyLTRjYTMtODlkMi1jNGFlYzg3OTdjNjQiLCJkZXZ2aXQtcG9zdC1pZCI6InQzXzF3IiwiZGV2dml0LXBvc3QtZGF0YSI6eyJkZXZlbG9wZXJEYXRhIjp7ImxlYWRlcmJvYXJkIjp7InRvcFNjb3JlIjoxMDAsInVzZXIiOiJiYXRtYW4ifX19LCJkZXZ2aXQtdXNlci1pZCI6InQyXzEiLCJkZXZ2aXQtaW5zdGFsbGF0aW9uIjoiODlkMjJiODAtNzljNi00NWJiLTk1ZDctZWY2YTlhOWVkMGQxIn0.LQ_E9AFli0iIyRv01eL_qoNrBijfjoWOZOJkRzxSPlE',
    };

    initDevvitGlobal(
      { currentScript: null },
      { hash: `#invalid` },
      { name: JSON.stringify(bridge) }
    );

    expect(devvit.context).toMatchInlineSnapshot(`
      {
        "appName": "test-app-123",
        "appSlug": "test-app-123",
        "appVersion": "1.2.3",
        "client": undefined,
        "postAuthorId": undefined,
        "postData": {
          "leaderboard": {
            "topScore": 100,
            "user": "batman",
          },
        },
        "postId": "t3_123",
        "snoovatar": undefined,
        "subredditId": "t5_123",
        "subredditName": "subredditName",
        "userId": "t2_123",
        "username": undefined,
      }
    `);
  });

  test('userId is undefined for logged out users', () => {
    const bridge: BridgeContext = {
      devvitDebug: '',
      client: Client.SHREDDIT,
      webViewContext: {
        subredditId: 't5_123',
        subredditName: 'subredditName',
        appName: 'test-app-123',
        appVersion: '1.2.3',
        postId: 't3_123',
        userId: '',
      },
      webbitToken: noWebbitToken,
    };

    initDevvitGlobal({ currentScript: null }, { hash: '' }, { name: JSON.stringify(bridge) });

    expect(devvit.context.userId).toBeUndefined();
  });

  test('signedRequestContext is decoded and used', () => {
    const bridge: BridgeContext = {
      devvitDebug: '',
      client: Client.SHREDDIT,
      signedRequestContext:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkZXZ2aXQiOnsiYXBwIjp7ImlkIjoiYXBwMTIzIiwibmFtZSI6InRlc3QtYXBwLXNsdWciLCJ2ZXJzaW9uIjoiMS4yLjMiLCJzdGF0dXMiOjEsInNsdWciOiJ0ZXN0LWFwcC1zbHVnIn0sInN1YnJlZGRpdCI6eyJpZCI6InQ1XzEyMyIsIm5hbWUiOiJzdWJyZWRkaXROYW1lIn0sInVzZXIiOnsiaWQiOiJ0Ml80NTYiLCJuYW1lIjoidXNlcm5hbWUiLCJzbm9vdmF0YXIiOiJodHRwczovL2ltYWdlIn0sInBvc3QiOnsiaWQiOiJ0M183ODkiLCJhdXRob3IiOiJ0Ml80MDAifX0sImlzcyI6InRlc3QifQ.signature',
      webbitToken: noWebbitToken,
    };

    initDevvitGlobal({ currentScript: null }, { hash: '' }, { name: JSON.stringify(bridge) });

    expect(devvit.context).toMatchInlineSnapshot(`
      {
        "appName": "test-app-slug",
        "appSlug": "test-app-slug",
        "appVersion": "1.2.3",
        "client": undefined,
        "postAuthorId": "t2_400",
        "postData": undefined,
        "postId": "t3_789",
        "snoovatar": "https://image",
        "subredditId": "t5_123",
        "subredditName": "subredditName",
        "userId": "t2_456",
        "username": "username",
      }
    `);
  });

  test('signedRequestContext is preferred', () => {
    const bridge: BridgeContext = {
      devvitDebug: '',
      client: Client.SHREDDIT,
      signedRequestContext:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkZXZ2aXQiOnsiYXBwIjp7ImlkIjoiYXBwMTIzIiwibmFtZSI6ImZyb21Kd3QiLCJ2ZXJzaW9uIjoiMi4wLjAiLCJzdGF0dXMiOjEsInNsdWciOiJmcm9tSnd0In0sInN1YnJlZGRpdCI6eyJpZCI6InQ1XzEyMyIsIm5hbWUiOiJmcm9tSnd0In0sInVzZXIiOnsiaWQiOiJ0Ml80NTYifSwicG9zdCI6eyJpZCI6InQzXzc4OSIsImF1dGhvciI6InQyXzQwMCJ9fSwiaXNzIjoidGVzdCJ9.signature',
      webViewContext: {
        subredditId: 't5_999',
        subredditName: 'fromContext',
        appName: 'fromContext',
        appVersion: '0.0.1',
        postId: 't3_999',
        userId: 't2_999',
      },
      webbitToken: noWebbitToken,
    };

    initDevvitGlobal({ currentScript: null }, { hash: '' }, { name: JSON.stringify(bridge) });

    expect(devvit.context).toMatchInlineSnapshot(`
      {
        "appName": "fromJwt",
        "appSlug": "fromJwt",
        "appVersion": "2.0.0",
        "client": undefined,
        "postAuthorId": "t2_400",
        "postData": undefined,
        "postId": "t3_789",
        "snoovatar": undefined,
        "subredditId": "t5_123",
        "subredditName": "fromJwt",
        "userId": "t2_456",
        "username": undefined,
      }
    `);
  });

  test('share parameter is set', () => {
    const bridge: BridgeContext = {
      devvitDebug: '',
      client: Client.SHREDDIT,
      webViewContext: {
        subredditId: 't5_123',
        subredditName: 'subredditName',
        appName: 'test-app-123',
        appVersion: '1.0.0',
        postId: 't3_123',
        userId: 't2_123',
      },
      shareParam: { path: '', params: {}, hash: '', userData: 'shareData' },
      webbitToken: noWebbitToken,
    };

    initDevvitGlobal({ currentScript: null }, { hash: '' }, { name: JSON.stringify(bridge) });

    expect(devvit.share).toStrictEqual({ userData: 'shareData' });
  });

  test('webViewMode is set', () => {
    const bridge: BridgeContext = {
      devvitDebug: '',
      client: Client.SHREDDIT,
      webViewContext: {
        subredditId: 't5_123',
        subredditName: 'subredditName',
        appName: 'test-app-123',
        appVersion: '1.0.0',
        postId: 't3_123',
        userId: 't2_123',
      },
      viewMode: WebViewImmersiveMode.INLINE_MODE,
      webbitToken: noWebbitToken,
    };

    initDevvitGlobal({ currentScript: null }, { hash: '' }, { name: JSON.stringify(bridge) });

    expect(devvit.webViewMode).toBe(WebViewImmersiveMode.INLINE_MODE);
  });

  test('token uses signedRequestContext when available', () => {
    const signedRequestContext =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHAiOnsibmFtZSI6ImFwcCJ9fQ.test';
    const bridge: BridgeContext = {
      devvitDebug: '',
      client: Client.SHREDDIT,
      signedRequestContext,
      webViewContext: {
        subredditId: 't5_123',
        subredditName: 'subredditName',
        appName: 'test-app-123',
        appVersion: '1.0.0',
        postId: 't3_123',
        userId: 't2_123',
      },
      webbitToken: 'webbitToken',
    };

    initDevvitGlobal({ currentScript: null }, { hash: '' }, { name: JSON.stringify(bridge) });

    expect(devvit.token).toBe(signedRequestContext);
  });

  test('token falls back to webbitToken', () => {
    const bridge: BridgeContext = {
      devvitDebug: '',
      client: Client.SHREDDIT,
      webViewContext: {
        subredditId: 't5_123',
        subredditName: 'subredditName',
        appName: 'test-app-123',
        appVersion: '1.0.0',
        postId: 't3_123',
        userId: 't2_123',
      },
      webbitToken: 'webbitToken',
    };

    initDevvitGlobal({ currentScript: null }, { hash: '' }, { name: JSON.stringify(bridge) });

    expect(devvit.token).toBe('webbitToken');
  });
});

describe('getClient()', () => {
  test('Android client', () => {
    const bridge: BridgeContext = {
      devvitDebug: '',
      client: Client.ANDROID,
      nativeVersion: { yyyy: 2025, release: 10, attempt: 0, number: 1234 },
      webbitToken: noWebbitToken,
    };
    const result = getClient(bridge);
    expect(result).toMatchInlineSnapshot(`
      {
        "name": "ANDROID",
        "version": {
          "attempt": 0,
          "number": 1234,
          "release": 10,
          "yyyy": 2025,
        },
      }
    `);
  });

  test('iOS client', () => {
    const bridge: BridgeContext = {
      devvitDebug: '',
      client: Client.IOS,
      nativeVersion: { yyyy: 2025, release: 10, attempt: 0, number: 1234 },
      webbitToken: noWebbitToken,
    };
    const result = getClient(bridge);
    expect(result).toMatchInlineSnapshot(`
      {
        "name": "IOS",
        "version": {
          "attempt": 0,
          "number": 1234,
          "release": 10,
          "yyyy": 2025,
        },
      }
    `);
  });

  test('undefined for non-mobile clients', () => {
    const bridge: BridgeContext = {
      devvitDebug: '',
      client: Client.SHREDDIT,
      webbitToken: noWebbitToken,
    };
    const result = getClient(bridge);
    expect(result).toBeUndefined();
  });
});
