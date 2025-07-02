import { WebViewContext } from '@devvit/protos/types/devvit/ui/effects/web_view/v1alpha/context.js';
import { _initContext } from '@devvit/web-view-scripts/init-context.js';
import { expect, test } from 'vitest';

import { context } from './context.js';

describe('get context', () => {
  test('context is correctly populated', async () => {
    const testContext: WebViewContext = {
      subredditId: 't5_testSubreddit',
      userId: 't2_testUserId',
      subredditName: 'testSubredditName',
      appName: 'testAppName',
      appVersion: 'testAppVersion',
      postId: 't3_testPost',
    };

    const proto = WebViewContext.fromJSON(testContext);
    const mockContext = JSON.stringify(proto);
    const mockSearch = `?context=${encodeURIComponent(mockContext)}`;

    Object.defineProperty(globalThis, 'location', {
      value: {
        href: `https://example.com${mockSearch}`,
        search: mockSearch,
        toString: () => `https://example.com${mockSearch}`,
      },
      writable: true,
    });

    _initContext(globalThis.location);

    expect(context).toStrictEqual(testContext);
  });
});
