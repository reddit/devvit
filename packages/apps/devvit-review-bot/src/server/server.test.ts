import assert from 'node:assert/strict';
import { IncomingMessage, ServerResponse } from 'node:http';
import { Socket } from 'node:net';
// eslint-disable-next-line implicitDependencies/no-implicit -- node:test is built into Node.js.
import { test } from 'node:test';

import {
  Context,
  type Post,
  reddit,
  runWithContext,
  settings,
  type SubredditModeratorUser,
} from '@devvit/web/server';

import { Endpoint } from '../shared/api.ts';
import { onReq } from './server.ts';

for (const [name, method, url, expectedStatus, expectedCalls] of [
  ['scheduler callback', 'POST', `/${Endpoint.OnCronUninstallCleanup}`, 200, 1],
  ['wrong method', 'GET', `/${Endpoint.OnCronUninstallCleanup}`, 404, 0],
  ['public endpoint', 'POST', '/api/uninstall-cleanup', 404, 0],
] as const) {
  test(name, async (t) => {
    t.mock.method(settings, 'get', async () => undefined);
    const req = new IncomingMessage(new Socket());
    req.method = method;
    req.url = url;
    const rsp = new ServerResponse(req);
    const end = t.mock.method(rsp, 'end');
    const posts = t.mock.method(
      reddit,
      'getNewPosts',
      () => ({ all: async (): Promise<Post[]> => [] }) as ReturnType<typeof reddit.getNewPosts>
    );
    const moderators = t.mock.method(
      reddit,
      'getModerators',
      () =>
        ({ all: async (): Promise<SubredditModeratorUser[]> => [] }) as ReturnType<
          typeof reddit.getModerators
        >
    );
    const ctx = Context({
      'devvit-app': 'devvit-review-bot',
      'devvit-subreddit': 't5_test',
      'devvit-subreddit-name': 'devvit_review',
    });
    await runWithContext(ctx, () => onReq(req, rsp));
    assert.equal(rsp.statusCode, expectedStatus);
    assert.equal(rsp.writableEnded, true);
    assert.deepEqual(
      JSON.parse(String(end.mock.calls[0]?.arguments[0])),
      expectedStatus === 200 ? {} : { error: 'not found', status: 404 }
    );
    assert.equal(posts.mock.callCount(), expectedCalls);
    assert.equal(moderators.mock.callCount(), expectedCalls);
  });
}

test('returns a failure status when scheduled cleanup fails', async (t) => {
  t.mock.method(settings, 'get', async () => undefined);
  t.mock.method(console, 'error', () => {});
  t.mock.method(reddit, 'getModerators', () => {
    throw new Error('Reddit unavailable');
  });
  const req = new IncomingMessage(new Socket());
  req.method = 'POST';
  req.url = `/${Endpoint.OnCronUninstallCleanup}`;
  const rsp = new ServerResponse(req);
  const ctx = Context({
    'devvit-app': 'devvit-review-bot',
    'devvit-subreddit': 't5_test',
    'devvit-subreddit-name': 'devvit_review',
  });
  await runWithContext(ctx, () => onReq(req, rsp));
  assert.equal(rsp.statusCode, 500);
  assert.equal(rsp.writableEnded, true);
});
