import assert from 'node:assert/strict';
// eslint-disable-next-line implicitDependencies/no-implicit -- node:test is built into Node.js.
import { test, type TestContext } from 'node:test';

import {
  Context,
  type GetPostsOptions,
  type Post,
  reddit,
  runWithContext,
  settings,
  type SubredditModeratorUser,
} from '@devvit/web/server';

import { onCronUninstallCleanup } from './uninstall-cleanup.ts';

const HOUR_MS = 60 * 60 * 1000;

type ReviewPost = Pick<Post, 'id' | 'authorName' | 'createdAt' | 'removed' | 'remove'>;
type ReviewModerator = Pick<SubredditModeratorUser, 'username' | 'date' | 'createdAt'>;

test('removes moderator posts only after one hour', async (t) => {
  const fix = fixture(t);
  fix.addModerator({ username: 'devvit-reviewer' });
  const old = fix.addPost();
  fix.addPost({ createdAt: new Date(fix.now - HOUR_MS) });
  fix.addPost({ createdAt: new Date(fix.now - HOUR_MS + 1) });
  await fix.run();
  assert.deepEqual(fix.removed, [old.id]);
});

test('removes recent non-moderator posts and preserves current moderators regardless of case', async (t) => {
  const fix = fixture(t);
  fix.addModerator({ username: 'devvit-reviewer' });
  const orphan = fix.addPost({ authorName: 'uninstalled-app', createdAt: new Date(fix.now) });
  fix.addPost({ authorName: 'DeVvIt-ReViEwEr', createdAt: new Date(fix.now) });
  await fix.run();
  assert.deepEqual(fix.removed, [orphan.id]);
});

test('uses moderator tenure rather than account age for the one-hour cutoff', async (t) => {
  const fix = fixture(t);
  const old = fix.addModerator();
  fix.addModerator({ date: new Date(fix.now - HOUR_MS) });
  fix.addModerator({ date: new Date(fix.now - HOUR_MS + 1) });
  await fix.run();
  assert.deepEqual(fix.unmodded, [old.username]);
});

test('uses the configured maximum age for posts and moderators while removing orphaned posts immediately', async (t) => {
  const fix = fixture(t);
  t.mock.method(settings, 'get', async () => 2 * HOUR_MS);
  fix.addModerator({ username: 'devvit-reviewer' });
  const oldMod = fix.addModerator({ date: new Date(fix.now - 2 * HOUR_MS - 1) });
  fix.addModerator();
  const oldPost = fix.addPost({ createdAt: new Date(fix.now - 2 * HOUR_MS - 1) });
  fix.addPost();
  const orphan = fix.addPost({ authorName: 'uninstalled-app', createdAt: new Date(fix.now) });
  await fix.run();
  assert.deepEqual(fix.unmodded, [oldMod.username]);
  assert.deepEqual(fix.removed, [oldPost.id, orphan.id]);
});

test('rejects invalid maximum ages before cleaning up', async (t) => {
  const fix = fixture(t);
  fix.addModerator();
  fix.addPost();
  for (const maxAgeMs of [0, -1, NaN, Infinity]) {
    t.mock.method(settings, 'get', async () => maxAgeMs);
    await assert.rejects(fix.run(), /max-age-ms must be a positive finite number/);
  }
  assert.deepEqual(fix.unmodded, []);
  assert.deepEqual(fix.removed, []);
});

test('skips already removed posts', async (t) => {
  const fix = fixture(t);
  const post = fix.addPost({ removed: true });
  t.mock.method(
    reddit,
    'getNewPosts',
    () => ({ all: async () => [post] }) as ReturnType<typeof reddit.getNewPosts>
  );
  await fix.run();
  assert.deepEqual(fix.removed, []);
});

test('logs the post count and each successful removal', async (t) => {
  const fix = fixture(t);
  fix.addModerator({ username: 'devvit-reviewer' });
  const old = fix.addPost();
  fix.addPost({ createdAt: new Date(fix.now) });
  await fix.run();
  assert.deepEqual(fix.logs, [
    'Processing 1 mods',
    'Processing 2 posts',
    `Removed ${old.id} by ${old.authorName}`,
  ]);
});

test('cleans up the subreddit supplied by the invocation', async (t) => {
  const fix = fixture(t);
  fix.ctx.subredditName = 'another_review_subreddit';
  fix.addPost();
  fix.addModerator();
  await fix.run();
  assert.deepEqual(fix.removed, ['t3_0']);
  assert.deepEqual(fix.unmodded, ['review-app-0']);
});

test('continues after a failed removal and retries it on the next run', async (t) => {
  const fix = fixture(t);
  const failed = fix.addPost();
  const removed = fix.addPost();
  fix.failures.add(failed.id);
  await fix.run();
  assert.deepEqual(fix.removed, [removed.id]);
  assert.equal(fix.errors.length, 1);
  fix.failures.clear();
  await fix.run();
  assert.deepEqual(fix.removed, [removed.id, failed.id]);
});

test('leaves remaining posts for the next run when the time budget is exhausted', async (t) => {
  const fix = fixture(t);
  const first = fix.addPost();
  const remove = first.remove;
  t.mock.method(first, 'remove', async (isSpam?: boolean) => {
    await remove(isSpam);
    fix.advanceTime(20_000);
  });
  fix.addPost();
  await fix.run();
  assert.deepEqual(fix.removed, ['t3_0']);
  await fix.run();
  assert.deepEqual(fix.removed, ['t3_0', 't3_1']);
});

test('uses a fixed age cutoff for each run', async (t) => {
  const fix = fixture(t);
  fix.addModerator({ username: 'devvit-reviewer' });
  const first = fix.addPost();
  fix.addPost({ createdAt: new Date(fix.now - HOUR_MS + 1000) });
  const remove = first.remove;
  t.mock.method(first, 'remove', async (isSpam?: boolean) => {
    await remove(isSpam);
    fix.advanceTime(2000);
  });
  await fix.run();
  assert.deepEqual(fix.removed, ['t3_0']);
  await fix.run();
  assert.deepEqual(fix.removed, ['t3_0', 't3_1']);
});

test('unmods old moderators and logs each removal even when there are no posts', async (t) => {
  const fix = fixture(t);
  const mod = fix.addModerator();
  await fix.run();
  assert.deepEqual(fix.unmodded, [mod.username]);
  assert.deepEqual(fix.logs, [
    'Processing 1 mods',
    `Unmodded ${mod.username} in r/devvit_review`,
    'Processing 0 posts',
  ]);
});

test('preserves all excluded moderators and itself regardless of case', async (t) => {
  const fix = fixture(t);
  fix.ctx.appSlug = 'another-app';
  for (const username of [
    'DEVVIT-DEV-BOT',
    'Devvit-Reviewer',
    'Stephenoid',
    'SnooSnek',
    'SlowCooked99',
    'DEVVIT-REVIEW-BOT',
    'ANOTHER-APP',
  ]) {
    fix.addModerator({ username });
  }
  const eligible = fix.addModerator();
  await fix.run();
  assert.deepEqual(fix.unmodded, [eligible.username]);
});

test('preserves a moderator with an invalid relationship date', async (t) => {
  const fix = fixture(t);
  fix.addModerator({ date: new Date(NaN) });
  await fix.run();
  assert.deepEqual(fix.unmodded, []);
});

test('removes posts immediately after a successful unmod and retries failures next run', async (t) => {
  const fix = fixture(t);
  const failed = fix.addModerator();
  const removed = fix.addModerator();
  const failedPost = fix.addPost({ authorName: failed.username, createdAt: new Date(fix.now) });
  const removedPost = fix.addPost({ authorName: removed.username, createdAt: new Date(fix.now) });
  fix.unmodFailures.add(failed.username);
  await fix.run();
  assert.deepEqual(fix.unmodded, [removed.username]);
  assert.deepEqual(fix.removed, [removedPost.id]);
  assert.equal(fix.errors.length, 1);
  fix.unmodFailures.clear();
  await fix.run();
  assert.deepEqual(fix.unmodded, [removed.username, failed.username]);
  assert.deepEqual(fix.removed, [removedPost.id, failedPost.id]);
});

test('leaves remaining work for the next run when unmodding exhausts the budget', async (t) => {
  const fix = fixture(t);
  const first = fix.addModerator();
  const second = fix.addModerator();
  fix.addPost();
  const remove = reddit.removeModerator.bind(reddit);
  t.mock.method(reddit, 'removeModerator', async (username: string, subredditName: string) => {
    await remove(username, subredditName);
    fix.advanceTime(20_000);
  });
  await fix.run();
  assert.deepEqual(fix.unmodded, [first.username]);
  assert.deepEqual(fix.removed, []);
  assert.equal(fix.getPosts.mock.callCount(), 0);
  await fix.run();
  assert.deepEqual(fix.unmodded, [first.username, second.username]);
  assert.deepEqual(fix.removed, []);
  await fix.run();
  assert.deepEqual(fix.removed, ['t3_0']);
});

/** Mocks Reddit for one cleanup test. */
function fixture(t: TestContext) {
  const posts: ReviewPost[] = [];
  const moderators: ReviewModerator[] = [];
  const unmodded: string[] = [];
  const unmodFailures = new Set<string>();
  const removed: string[] = [];
  const failures = new Set<string>();
  const errors: unknown[] = [];
  const logs: string[] = [];
  let clock = 2 * HOUR_MS;
  const ctx = Context({
    'devvit-app': 'devvit-review-bot',
    'devvit-subreddit': 't5_test',
    'devvit-subreddit-name': 'devvit_review',
  });
  t.mock.method(settings, 'get', async (name: string) => {
    assert.equal(name, 'max-age-ms');
    return undefined;
  });
  t.mock.method(Date, 'now', () => clock);
  t.mock.method(console, 'error', (...args: unknown[]) => errors.push(args));
  t.mock.method(console, 'log', (msg: string) => logs.push(msg));
  const getPosts = t.mock.method(
    reddit,
    'getNewPosts',
    ({ subredditName, limit, pageSize }: GetPostsOptions) => {
      assert.equal(subredditName, ctx.subredditName);
      assert.equal(limit, 100);
      assert.equal(pageSize, 100);
      return {
        all: async () => posts.filter((post) => !post.removed).slice(0, limit),
      } as ReturnType<typeof reddit.getNewPosts>;
    }
  );
  t.mock.method(reddit, 'getModerators', (options: Parameters<typeof reddit.getModerators>[0]) => {
    assert.deepEqual(options, { subredditName: ctx.subredditName });
    return {
      all: async () => moderators.filter((mod) => !unmodded.includes(mod.username)),
    } as ReturnType<typeof reddit.getModerators>;
  });
  t.mock.method(reddit, 'removeModerator', async (username: string, subredditName: string) => {
    assert.equal(subredditName, ctx.subredditName);
    if (unmodFailures.has(username)) throw new Error('Reddit temporarily unavailable');
    unmodded.push(username);
  });
  /** Adds a moderator with an old account and moderator relationship. */
  const addModerator = (overrides: Partial<ReviewModerator> = {}): ReviewModerator => {
    const mod: ReviewModerator = {
      username: `review-app-${moderators.length}`,
      date: new Date(clock - HOUR_MS - 1),
      createdAt: new Date(0),
      ...overrides,
    };
    moderators.push(mod);
    return mod;
  };
  /** Adds a review post. */
  const addPost = (overrides: Partial<ReviewPost> = {}): ReviewPost => {
    let isRemoved = false;
    const post: ReviewPost = {
      id: `t3_${posts.length}`,
      authorName: 'devvit-reviewer',
      createdAt: new Date(clock - HOUR_MS - 1),
      get removed() {
        return isRemoved;
      },
      remove: async (isSpam) => {
        assert.equal(isSpam, false);
        if (failures.has(post.id)) throw new Error('Reddit temporarily unavailable');
        removed.push(post.id);
        isRemoved = true;
      },
      ...overrides,
    };
    posts.push(post);
    return post;
  };
  return {
    ctx,
    now: clock,
    removed,
    unmodded,
    unmodFailures,
    failures,
    errors,
    logs,
    addPost,
    addModerator,
    getPosts,
    run: () => runWithContext(ctx, onCronUninstallCleanup),
    advanceTime: (ms: number) => {
      clock += ms;
    },
  };
}
