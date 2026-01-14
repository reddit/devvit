import type { SocialLinkType } from '@devvit/reddit';
import { reddit } from '@devvit/reddit';
import { context } from '@devvit/server';
import { expect, vi } from 'vitest';

import { createDevvitTest } from './devvitTest.js';

const test = createDevvitTest();

test('can add and retrieve a user', async ({ mocks }) => {
  mocks.reddit.users.addUser({
    id: 't2_user',
    name: 'test_user',
    createdUtc: 100,
    linkKarma: 10,
    commentKarma: 5,
    over18: false,
    isEmployee: false,
    isGold: false,
    isMod: false,
    isSuspended: false,
    hasVerifiedEmail: true,
    iconImg: 'img',
    snoovatarSize: [],
  });

  const user = await reddit.getUserByUsername('test_user');
  expect(user).toBeDefined();
  expect(user?.id).toBe('t2_user');
  expect(user?.username).toBe('test_user');
  expect(user?.createdAt.getTime()).toBe(100 * 1000);
  expect(user?.linkKarma).toBe(10);
  expect(user?.commentKarma).toBe(5);
});

test('can retrieve current user', async () => {
  const user = await reddit.getCurrentUser();
  expect(user).toBeDefined();
  expect(user?.username).toBe('testuser');
  expect(user?.id).toBe('t2_testuser');
});

test('can retrieve current username', async () => {
  const username = await reddit.getCurrentUsername();
  expect(username).toBe('testuser');
});

test('can retrieve current subreddit', async () => {
  const subreddit = await reddit.getCurrentSubreddit();
  expect(subreddit).toBeDefined();
  expect(subreddit.name).toBe('testsub');
  expect(subreddit.id).toBe('t5_testsub');
});

test('throws helpful error for unimplemented plugin methods', async () => {
  await expect(reddit.approve('t3_12345')).rejects.toThrowErrorMatchingInlineSnapshot(`
    [Error: Reddit API plugin Moderation is not implemented in the test harness.
    For more information, visit https://developers.reddit.com/docs/guides/tools/devvit_test]
  `);
});

test('throws helpful error for unimplemented plugins', () => {
  expect(reddit.getWikiPage(context.subredditName, 'test_page')).rejects
    .toThrowErrorMatchingInlineSnapshot(`
    [Error: Reddit API plugin Wiki is not implemented in the test harness.
    For more information, visit https://developers.reddit.com/docs/guides/tools/devvit_test]
  `);
});

test('throws helpful error for unimplemented methods on an existing mock', async ({ mocks }) => {
  mocks.reddit.users.addUser({
    id: 't2_user',
    name: 'test_user',
  });

  await expect(reddit.approveUser('test_user', 'some_sub')).rejects
    .toThrowErrorMatchingInlineSnapshot(`
    [Error: Reddit API method Users.Friend is not implemented in the test harness.
    For more information, visit https://developers.reddit.com/docs/guides/tools/devvit_test]
  `);
});

test('throws a helpful error for unimplemented methods on a returning object', async ({
  mocks,
}) => {
  mocks.reddit.users.addUser({
    id: 't2_user',
    name: 'test_user',
  });

  const user = await reddit.getUserByUsername('test_user');
  if (!user) {
    throw new Error('User not found');
  }

  await expect(user.getSocialLinks()).rejects.toThrowErrorMatchingInlineSnapshot(`
    [Error: Reddit API method User.getSocialLinks is not implemented in the test harness.
    For more information, visit https://developers.reddit.com/docs/guides/tools/devvit_test]
  `);
});

test('throws a helpful error for unimplemented listing on a returning object', async ({
  mocks,
}) => {
  mocks.reddit.users.addUser({
    id: 't2_user',
    name: 'test_user',
  });

  const user = await reddit.getUserByUsername('test_user');
  if (!user) {
    throw new Error('User not found');
  }

  const posts = user.getPosts({});

  await expect(posts.all()).rejects.toThrowErrorMatchingInlineSnapshot(`
    [Error: Reddit API method Users.UserWhere is not implemented in the test harness.
    For more information, visit https://developers.reddit.com/docs/guides/tools/devvit_test]
  `);
});

test('can mock method on a returning object', async ({ mocks }) => {
  mocks.reddit.users.addUser({
    id: 't2_user',
    name: 'test_user',
  });

  const user = await reddit.getUserByUsername('test_user');
  if (!user) {
    throw new Error('User not found');
  }

  vi.spyOn(user, 'getSocialLinks').mockResolvedValue([
    {
      id: '1',
      outboundUrl: 'https://example.com',
      type: 'REDDIT' as SocialLinkType,
      title: 'Example',
    },
  ]);

  await expect(user.getSocialLinks()).resolves.toStrictEqual([
    { id: '1', outboundUrl: 'https://example.com', type: 'REDDIT', title: 'Example' },
  ]);
});

test('can mock method for all users', async ({ mocks }) => {
  mocks.reddit.users.addUser({
    id: 't2_user',
    name: 'test_user',
  });

  const user = await reddit.getCurrentUser();
  if (!user) {
    throw new Error('User not found');
  }

  const userPrototype = Object.getPrototypeOf(user);
  vi.spyOn(userPrototype, 'getSocialLinks').mockResolvedValue([
    {
      id: '1',
      outboundUrl: 'https://example.com',
      type: 'REDDIT' as SocialLinkType,
      title: 'Example',
    },
  ]);

  await expect((await reddit.getCurrentUser())!.getSocialLinks()).resolves.toStrictEqual([
    { id: '1', outboundUrl: 'https://example.com', type: 'REDDIT', title: 'Example' },
  ]);
});

test('can submit a custom post', async () => {
  const post = await reddit.submitCustomPost({
    title: 'My Custom Post',
    subredditName: 'testsub',
  });

  expect(post).toBeDefined();
  expect(post.id).toMatch(/^t3_/);
  expect(post.title).toBe('My Custom Post');
  expect(post.subredditName).toBe('testsub');
  expect(post.authorName).toBe('testuser');
  expect(post.url).toContain('testsub');

  const retrieved = await reddit.getPostById(post.id);
  expect(retrieved.id).toBe(post.id);
  expect(retrieved.title).toBe('My Custom Post');
});

test('can set, get, and update postData', async () => {
  const post = await reddit.submitCustomPost({
    title: 'Post Data Test',
    subredditName: 'testsub',
  });

  expect(await post.getPostData()).toBeUndefined();

  await post.setPostData({ count: 1, message: 'hello' });
  expect(await post.getPostData()).toStrictEqual({ count: 1, message: 'hello' });

  const retrieved = await reddit.getPostById(post.id);
  expect(await retrieved.getPostData()).toStrictEqual({ count: 1, message: 'hello' });

  await retrieved.setPostData({ count: 2 });
  expect(await post.getPostData()).toStrictEqual({ count: 2 });
});

test('can add and retrieve a subreddit', async ({ mocks }) => {
  mocks.reddit.subreddits.addSubreddit({
    id: 't5_test',
    displayName: 'other_sub',
    title: 'Other Subreddit',
    subscribers: 100,
  });

  const subreddit = await reddit.getSubredditByName('other_sub');
  expect(subreddit).toBeDefined();
  expect(subreddit.id).toBe('t5_test');
  expect(subreddit.name).toBe('other_sub');
  expect(subreddit.title).toBe('Other Subreddit');
  expect(subreddit.numberOfSubscribers).toBe(100);
});
