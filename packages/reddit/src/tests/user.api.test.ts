import { context } from '@devvit/server';
import { describe, expect, test, vi } from 'vitest';

import { MODERATOR_PERMISSIONS } from '../helpers/permissions.js';
import type { ModeratorPermission } from '../models/User.js';
import { User } from '../models/User.js';
import { RedditClient } from '../RedditClient.js';
import { redditApiPlugins } from './utils/redditApiPluginsMock.js';
import { runWithTestContext } from './utils/runWithTestContext.js';

vi.mock('../getRedditApiPlugins.js', () => {
  return {
    getRedditApiPlugins: () => redditApiPlugins,
  };
});

describe('User API', () => {
  const redditAPI = new RedditClient();
  const subredditName = 'someTestSub';
  const username = 'bloop';

  const mockUserFliar = {
    flairCssClass: undefined,
    flairText: 'Moderator',
    user: username,
  };

  const mockFlairListResponse = {
    users: [mockUserFliar],
  };

  describe('RedditAPIClient:getCurrentUser()', () => {
    const currentUsername = 'test_user';
    const currentUserId = 't2_1234';

    test('only one call to r2 if username is in metadata', async () => {
      const createdUtc = new Date().getUTCDate();
      const createdAt = new Date(0);
      createdAt.setUTCSeconds(createdUtc);
      const mockUserAboutResponse = {
        data: {
          id: currentUserId,
          name: currentUsername,
          createdUtc: createdUtc,
          snoovatarSize: [],
          hasVerifiedEmail: true,
        },
      };
      const spyPlugin = redditApiPlugins.Users.UserAbout;
      spyPlugin.mockImplementationOnce(async () => mockUserAboutResponse);

      // Setup mock to retrieve username
      const mockUserDataByAccountIdsResponse = {
        users: {
          [currentUserId]: {
            name: currentUsername,
          },
        },
      };

      const userDataSpy = redditApiPlugins.Users.UserDataByAccountIds;
      userDataSpy.mockImplementationOnce(async () => mockUserDataByAccountIdsResponse);

      await runWithTestContext(async () => {
        const user = await redditAPI.getCurrentUser();

        expect(spyPlugin).toHaveBeenCalledWith(
          {
            username: currentUsername,
          },
          context.debug.metadata
        );

        expect(user?.id).toStrictEqual(currentUserId);
        expect(user?.username).toStrictEqual(currentUsername);
        expect(user?.createdAt).toStrictEqual(createdAt);
        expect(user?.hasVerifiedEmail).toStrictEqual(true);

        // Also check the username while we're here

        const username = await redditAPI.getCurrentUsername();
        expect(username).toStrictEqual(currentUsername);
      });
    });
  });

  describe('RedditAPIClient:getSnoovatarUrl()', () => {
    const currentUsername = 'test_user';
    const currentUserSnoovatarUrl = 'https://example.com/my-snoovatar.png';

    test('can get snoovatar of current user', async () => {
      const mockGetSnoovatarUrlResponse = {
        data: {
          redditorInfoByName: {
            snoovatarIcon: {
              url: currentUserSnoovatarUrl,
            },
          },
        },
        errors: [],
      };

      const spyPlugin = redditApiPlugins.GraphQL.PersistedQuery;
      spyPlugin.mockImplementationOnce(async () => mockGetSnoovatarUrlResponse);

      await runWithTestContext(async () => {
        const snoovatarUrl = await redditAPI.getSnoovatarUrl(currentUsername);

        expect(spyPlugin).toHaveBeenCalledOnce();
        expect(spyPlugin).toHaveBeenCalledWith(
          {
            operationName: 'GetSnoovatarUrlByName',
            id: 'c47fd42345af268616d2d8904b56856acdc05cf61d3650380f539ad7d596ac0c',
            variables: {
              username: currentUsername,
            },
          },
          context.debug.metadata
        );

        expect(snoovatarUrl).toStrictEqual(currentUserSnoovatarUrl);
      });
    });

    test('can get snoovatar of other user', async () => {
      const otherUsername = 'other_user';
      const otherSnoovatarUrl = 'https://example.com/other-snoovatar.png';

      // Setup mock to retrieve snoovatar URL
      const mockGetSnoovatarUrlResponse = {
        data: {
          redditorInfoByName: {
            snoovatarIcon: {
              url: otherSnoovatarUrl,
            },
          },
        },
        errors: [],
      };

      const gqlSpy = redditApiPlugins.GraphQL.PersistedQuery;
      gqlSpy.mockImplementationOnce(async () => mockGetSnoovatarUrlResponse);

      await runWithTestContext(async () => {
        const snoovatarUrl = await redditAPI.getSnoovatarUrl(otherUsername);

        expect(gqlSpy).toHaveBeenCalledOnce();
        expect(gqlSpy).toHaveBeenCalledWith(
          {
            id: 'c47fd42345af268616d2d8904b56856acdc05cf61d3650380f539ad7d596ac0c',
            operationName: 'GetSnoovatarUrlByName',
            variables: {
              username: otherUsername,
            },
          },
          context.debug.metadata
        );

        expect(snoovatarUrl).toStrictEqual(otherSnoovatarUrl);
      });
    });
  });

  describe('RedditAPIClient:User', () => {
    test('getUserFlairBySubreddit()', async () => {
      const user = new User({
        id: 'someID',
        name: username,
        createdUtc: Date.now(),
        snoovatarSize: [1],
      });

      const spyPlugin = redditApiPlugins.Flair.FlairList;
      spyPlugin.mockImplementationOnce(async () => mockFlairListResponse);

      await runWithTestContext(async () => {
        const userFlair = await user.getUserFlairBySubreddit(subredditName);

        expect(spyPlugin).toHaveBeenCalledWith(
          {
            subreddit: subredditName,
            name: username,
          },
          context.debug.metadata
        );

        expect(userFlair).toEqual({
          flairCssClass: mockUserFliar.flairCssClass,
          user: mockUserFliar.user,
          flairText: mockUserFliar.flairText,
        });
      });
    });

    test('modPermissions() works with new, unknown permissions', () => {
      const user = new User({
        id: 'someID',
        name: username,
        createdUtc: Date.now(),
        snoovatarSize: [1],
        modPermissions: { test: [MODERATOR_PERMISSIONS[0], 'something-unknown'] },
      });

      const understoodPermissions = new Map<string, ModeratorPermission[]>();
      understoodPermissions.set('test', [MODERATOR_PERMISSIONS[0] as ModeratorPermission]);

      expect(user.modPermissions).toStrictEqual(understoodPermissions);
    });
  });
});
