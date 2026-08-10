import { Header } from '../Header.js';
import { fakeContextJwt } from '../test/fake-jwt.js';
import { BaseContextFromMetadata } from './base-context.js';

test('decodes request context from metadata', () => {
  const ctx = BaseContextFromMetadata(
    {
      [Header.App]: { values: ['test-app'] },
      [Header.Context]: {
        values: [
          fakeContextJwt({
            comment: { id: 't1_testcomment' },
            post: { author: 't2_testauthor', id: 't3_testpost' },
            user: { devvitLoid: 'test-loid' },
          }),
        ],
      },
      [Header.Subreddit]: { values: ['t5_testsub'] },
      [Header.SubredditName]: { values: ['testsub'] },
      [Header.User]: { values: ['t2_testuser'] },
      [Header.Version]: { values: ['0.0.0-test'] },
    },
    undefined,
    undefined
  );

  expect(ctx).toStrictEqual({
    appName: 'test-app',
    appSlug: 'test-app',
    appVersion: '0.0.0-test',
    commentId: 't1_testcomment',
    loid: 'test-loid',
    postData: undefined,
    postId: 't3_testpost',
    snoovatar: undefined,
    subredditId: 't5_testsub',
    subredditName: 'testsub',
    userId: 't2_testuser',
    username: undefined,
  });
});

test('prefers request context IDs to explicit IDs', () => {
  const ctx = BaseContextFromMetadata(
    {
      [Header.Context]: {
        values: [
          fakeContextJwt({
            comment: { id: 't1_context-comment' },
            post: { author: 't2_testauthor', id: 't3_context-post' },
          }),
        ],
      },
      [Header.Subreddit]: { values: ['t5_testsub'] },
    },
    't3_explicit-post',
    't1_explicit-comment'
  );

  expect(ctx.postId).toBe('t3_context-post');
  expect(ctx.commentId).toBe('t1_context-comment');
});

test('uses explicit IDs when request context IDs are absent', () => {
  const ctx = BaseContextFromMetadata(
    {
      [Header.Context]: { values: [fakeContextJwt({ user: { devvitLoid: 'test-loid' } })] },
      [Header.Subreddit]: { values: ['t5_testsub'] },
    },
    't3_explicit-post',
    't1_explicit-comment'
  );

  expect(ctx.postId).toBe('t3_explicit-post');
  expect(ctx.commentId).toBe('t1_explicit-comment');
});

test('uses request context IDs when explicit IDs are empty', () => {
  const ctx = BaseContextFromMetadata(
    {
      [Header.Context]: {
        values: [
          fakeContextJwt({
            comment: { id: 't1_context-comment' },
            post: { author: 't2_testauthor', id: 't3_context-post' },
          }),
        ],
      },
      [Header.Subreddit]: { values: ['t5_testsub'] },
    },
    '',
    ''
  );

  expect(ctx.postId).toBe('t3_context-post');
  expect(ctx.commentId).toBe('t1_context-comment');
});
