import {
  type BridgeContext,
  Client,
  type DevvitPostData,
  type WebViewContext,
} from '@devvit/protos/json/devvit/ui/effects/web_view/v1alpha/context.js';
import { _initContext } from '@devvit/web-view-scripts/init-context.js';
import { expect, test } from 'vitest';

import { context } from './clientContext.js';

const testContext: Readonly<WebViewContext> = {
  subredditId: 't5_testSubreddit',
  userId: 't2_testUserId',
  subredditName: 'testSubredditName',
  appName: 'testAppName',
  appVersion: 'testAppVersion',
  postId: 't3_testPost',
};
const testPostData: Readonly<DevvitPostData> = {
  developerData: {
    leaderboard: {
      topScore: 100,
      user: 'batman',
    },
  },
};
const testBridgeCtx: Readonly<BridgeContext> = {
  webbitToken:
    'eyJhbGciOiJIUzI1NiIsImtpZCI6IjRkZjhhM2U1LTcwYmYtNWM5Zi05NzYwLTQyZGQ4ZWVjZmY1NyIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJkZXZ2aXQtZ2F0ZXdheS5zaGFubm9uLWZlbmcuc25vby5kZXYiLCJhdWQiOlsiODlkMjJiODAtNzljNi00NWJiLTk1ZDctZWY2YTlhOWVkMGQxLTEtMC0xLXdlYnZpZXcuZGV2dml0Lm5ldCJdLCJleHAiOjE3NTM0ODk5MDYsIm5iZiI6MTc1MzQwMzUwNiwiaWF0IjoxNzUzNDAzNTA2LCJqdGkiOiIyMTJmMmQ3OC1kZjUyLTRjYTMtODlkMi1jNGFlYzg3OTdjNjQiLCJkZXZ2aXQtcG9zdC1pZCI6InQzXzF3IiwiZGV2dml0LXBvc3QtZGF0YSI6eyJkZXZlbG9wZXJEYXRhIjp7ImxlYWRlcmJvYXJkIjp7InRvcFNjb3JlIjoxMDAsInVzZXIiOiJiYXRtYW4ifX19LCJkZXZ2aXQtdXNlci1pZCI6InQyXzEiLCJkZXZ2aXQtaW5zdGFsbGF0aW9uIjoiODlkMjJiODAtNzljNi00NWJiLTk1ZDctZWY2YTlhOWVkMGQxIn0.LQ_E9AFli0iIyRv01eL_qoNrBijfjoWOZOJkRzxSPlE',
  webViewContext: testContext,
  devvitDebug: 'hello',
  client: Client.SHREDDIT,
  appPermissionState: undefined,
};

describe('get context', () => {
  test('context is correctly populated using BridgeContext', async () => {
    const mockContext = JSON.stringify(testContext);
    const mockSearch = `?context=${encodeURIComponent(mockContext)}`;

    const bridgeCtxProto = testBridgeCtx as BridgeContext;
    const mockHash = `#${encodeURIComponent(JSON.stringify(bridgeCtxProto))}`;

    _initContext(getMockLocation(mockSearch, mockHash));

    expect(context).toStrictEqual({
      ...testContext,
      postData: testPostData.developerData,
    });
  });

  test('context is correctly populated when webbit_token param containing devvit-post-data is present', async () => {
    const webbitToken =
      'eyJhbGciOiJIUzI1NiIsImtpZCI6IjRkZjhhM2U1LTcwYmYtNWM5Zi05NzYwLTQyZGQ4ZWVjZmY1NyIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJkZXZ2aXQtZ2F0ZXdheS5zaGFubm9uLWZlbmcuc25vby5kZXYiLCJhdWQiOlsiODlkMjJiODAtNzljNi00NWJiLTk1ZDctZWY2YTlhOWVkMGQxLTEtMC0xLXdlYnZpZXcuZGV2dml0Lm5ldCJdLCJleHAiOjE3NTM0ODk5MDYsIm5iZiI6MTc1MzQwMzUwNiwiaWF0IjoxNzUzNDAzNTA2LCJqdGkiOiIyMTJmMmQ3OC1kZjUyLTRjYTMtODlkMi1jNGFlYzg3OTdjNjQiLCJkZXZ2aXQtcG9zdC1pZCI6InQzXzF3IiwiZGV2dml0LXBvc3QtZGF0YSI6eyJkZXZlbG9wZXJEYXRhIjp7ImxlYWRlcmJvYXJkIjp7InRvcFNjb3JlIjoxMDAsInVzZXIiOiJiYXRtYW4ifX19LCJkZXZ2aXQtdXNlci1pZCI6InQyXzEiLCJkZXZ2aXQtaW5zdGFsbGF0aW9uIjoiODlkMjJiODAtNzljNi00NWJiLTk1ZDctZWY2YTlhOWVkMGQxIn0.LQ_E9AFli0iIyRv01eL_qoNrBijfjoWOZOJkRzxSPlE';
    const mockContext = JSON.stringify(testContext);
    const mockSearch = `?webbit_token=${webbitToken}&context=${encodeURIComponent(mockContext)}`;

    _initContext(getMockLocation(mockSearch));

    expect(context).toStrictEqual({
      ...testContext,
      postData: testPostData.developerData,
    });
  });

  test('context is correctly populated when webbit_token param does not contain devvit-post-data', async () => {
    const webbitToken =
      'eyJhbGciOiJIUzI1NiIsImtpZCI6ImVlYzJjOWUzLWM0NTctNTM3Zi05NThmLTI5MDg3N2U4NjNlYyIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJkZXZ2aXQtZ2F0ZXdheS5yZWRkaXQuY29tIiwiYXVkIjpbIjZiYmMzOTVmLTM3NTktNGMwNi04ZjU1LTFkOGJkN2M5YzY1ZS0wLTAtMS0xNDItd2Vidmlldy5kZXZ2aXQubmV0Il0sImV4cCI6MTc1MzM4MDc4OSwibmJmIjoxNzUzMjk0Mzg5LCJpYXQiOjE3NTMyOTQzODksImp0aSI6IjlmM2ZhOGRhLWI1YWQtNDFjMS1iNzhlLWZkZDA0ZDhkNGYzMyIsImRldnZpdC1wb3N0LWlkIjoidDNfMW03Z281OCIsImRldnZpdC1wb3N0LWRhdGEiOnt9LCJkZXZ2aXQtdXNlci1pZCI6InQyXzExdDUxMjE2YnUiLCJkZXZ2aXQtaW5zdGFsbGF0aW9uIjoiNmJiYzM5NWYtMzc1OS00YzA2LThmNTUtMWQ4YmQ3YzljNjVlIn0.li8evUl1T3oxqMx49ePteupoq8x4fwEmE3RafRRY1oU';
    const mockContext = JSON.stringify(testContext);
    const mockSearch = `?webbit_token=${webbitToken}&context=${encodeURIComponent(mockContext)}`;

    _initContext(getMockLocation(mockSearch));

    expect(context).toStrictEqual({
      ...testContext,
      postData: undefined,
    });
  });
});

function getMockLocation(search: string, hash?: string): Location {
  return {
    href: `https://example.com${search}`,
    search,
    hash: hash ?? '',
    toString: () => `https://example.com${search}`,
  } as Location;
}
