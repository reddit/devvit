import { Header } from '@devvit/shared-types/Header.js';
import { fakeContextJwt } from '@devvit/shared-types/test/fake-jwt.js';

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

  test.each([
    ['camelCase devvitLoid', { devvitLoid: 'camel-loid' }, 'camel-loid'],
    ['snake_case devvit_loid', { devvit_loid: 'snake-loid' }, 'snake-loid'],
    ['missing loid', {}, undefined],
  ])('reads loid from %s', (_name, user, loid) => {
    const context = Context({
      [Header.AppUser]: 't2_appuser',
      [Header.Subreddit]: 't5_testsub',
      [Header.SubredditName]: 'testsub',
      [Header.Context]: fakeContextJwt({ user }),
    });

    expect(context.loid).toBe(loid);
  });
});
