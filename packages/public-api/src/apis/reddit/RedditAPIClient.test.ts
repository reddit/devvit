import { type Post, RedditClient } from '@devvit/reddit';
import { Context, runWithContext } from '@devvit/server';
import { Header } from '@devvit/shared-types/Header.js';
import { expect, test, vi } from 'vitest';

import { reddit } from './RedditAPIClient.js';

test('getCurrentSubredditName reads the server context', async () => {
  const context = Context({
    [Header.Subreddit]: 't5_testsub',
    [Header.SubredditName]: 'testsub',
  });

  await runWithContext(context, async () => {
    await expect(reddit.getCurrentSubredditName()).resolves.toBe('testsub');
  });
});

test('classic string IDs delegate to the modern base client', async () => {
  const post = {} as Post;
  const getPostById = vi.spyOn(RedditClient.prototype, 'getPostById').mockResolvedValue(post);
  const postId: string = 't3_post';

  await expect(reddit.getPostById(postId)).resolves.toBe(post);
  expect(getPostById).toHaveBeenCalledWith(postId);
});

test('modern methods and accessors are inherited from the modern client', async () => {
  const getCurrentUser = vi
    .spyOn(RedditClient.prototype, 'getCurrentUser')
    .mockResolvedValue(undefined);

  expect(reddit).toBeInstanceOf(RedditClient);
  expect(reddit.modMail).toBeDefined();
  await expect(reddit.getCurrentUser()).resolves.toBeUndefined();
  expect(getCurrentUser).toHaveBeenCalledOnce();
});
