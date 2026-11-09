import { context } from '@devvit/server';
import { Header } from '@devvit/shared-types/Header.js';
import { describe, expect, test, vi } from 'vitest';

import { MODERATOR_PERMISSIONS } from '../helpers/permissions.js';
import type { ModeratorPermission } from '../models/User.js';
import { User } from '../models/User.js';
import { RedditClient } from '../RedditClient.js';
import { redditApiPlugins } from './utils/redditApiPluginsMock.js';
import { runWithTestContext } from './utils/runWithTestContext.js';
import { userActionsPlugin } from './utils/userActionsPluginMock.js';

vi.mock('../plugin.js', () => {
  return {
    getRedditApiPlugins: () => redditApiPlugins,
    getUserActionsPlugin: () => userActionsPlugin,
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

  describe('RedditClient:getCurrentUser()', () => {
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
          context.metadata
        );

        expect(user?.id).toStrictEqual(currentUserId);
        expect(user?.username).toStrictEqual(currentUsername);
        expect(user?.createdAt).toStrictEqual(createdAt);
        expect(user?.hasVerifiedEmail).toStrictEqual(true);
      });
    });
  });

  describe('RedditClient:getCurrentUsername()', () => {
    test.each([
      {
        name: 'logged-in user',
        headers: { [Header.User]: 't2_1234', [Header.Username]: 'test_user' },
        expected: 'test_user',
      },
      {
        name: 'logged-out user',
        headers: { [Header.User]: '' },
        expected: undefined,
      },
    ])(
      'returns the context username for a $name without fetching the user',
      async ({ headers, expected }) => {
        const getCurrentUser = vi.spyOn(redditAPI, 'getCurrentUser');

        await runWithTestContext(async () => {
          expect(await redditAPI.getCurrentUsername()).toBe(expected);
          expect(getCurrentUser).not.toHaveBeenCalled();
        }, headers);

        getCurrentUser.mockRestore();
      }
    );
  });

  describe('RedditClient:getSnoovatarUrl()', () => {
    const currentUsername = 'test_user';
    const currentUserSnoovatarUrl = 'https://example.com/my-snoovatar.png';

    test('can get snoovatar of current user', async () => {
      const spyPlugin = redditApiPlugins.Users.GetSnoovatarUrl;
      spyPlugin.mockResolvedValueOnce({ url: currentUserSnoovatarUrl });

      await runWithTestContext(async () => {
        const snoovatarUrl = await redditAPI.getSnoovatarUrl(currentUsername);

        expect(spyPlugin).toHaveBeenCalledOnce();
        expect(spyPlugin).toHaveBeenCalledWith({ username: currentUsername }, context.metadata);

        expect(snoovatarUrl).toStrictEqual(currentUserSnoovatarUrl);
      });
    });

    test('can get snoovatar of other user', async () => {
      const otherUsername = 'other_user';
      const otherSnoovatarUrl = 'https://example.com/other-snoovatar.png';

      const pluginSpy = redditApiPlugins.Users.GetSnoovatarUrl;
      pluginSpy.mockResolvedValueOnce({ url: otherSnoovatarUrl });

      await runWithTestContext(async () => {
        const snoovatarUrl = await redditAPI.getSnoovatarUrl(otherUsername);

        expect(pluginSpy).toHaveBeenCalledOnce();
        expect(pluginSpy).toHaveBeenCalledWith({ username: otherUsername }, context.metadata);

        expect(snoovatarUrl).toStrictEqual(otherSnoovatarUrl);
      });
    });

    test('returns undefined when the user has no Snoovatar image', async () => {
      redditApiPlugins.Users.GetSnoovatarUrl.mockResolvedValueOnce({ url: '' });

      await runWithTestContext(async () => {
        expect(await redditAPI.getSnoovatarUrl('no_snoovatar')).toBeUndefined();
      });
    });
  });

  describe('RedditClient:User', () => {
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
          context.metadata
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
