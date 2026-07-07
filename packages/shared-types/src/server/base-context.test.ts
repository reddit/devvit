import { Header } from '../Header.js';
import { fakeContextJwt } from '../test/fake-jwt.js';
import { BaseContextFromMetadata } from './base-context.js';

test('decodes request context from metadata', () => {
  const ctx = BaseContextFromMetadata(
    {
      [Header.App]: { values: ['test-app'] },
      [Header.Context]: { values: [fakeContextJwt({ user: { devvitLoid: 'test-loid' } })] },
      [Header.Subreddit]: { values: ['t5_testsub'] },
      [Header.SubredditName]: { values: ['testsub'] },
      [Header.User]: { values: ['t2_testuser'] },
      [Header.Version]: { values: ['0.0.0-test'] },
    },
    't3_testpost',
    't1_testcomment'
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
