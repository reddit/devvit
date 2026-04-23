import { Header } from '@devvit/shared-types/Header.js';

import { Context } from './server-context.js';

describe('Context()', () => {
  test('reads commentId from metadata headers', () => {
    const context = Context({
      [Header.AppUser]: 't2_appuser',
      [Header.Subreddit]: 't5_testsub',
      [Header.SubredditName]: 'testsub',
      [Header.Post]: 't3_testpost',
      [Header.Comment]: 't1_testcomment',
    });

    expect(context.commentId).toBe('t1_testcomment');
    expect(context.postId).toBe('t3_testpost');
  });
});
