import type { Metadata } from '@devvit/protos';
import { Header } from '@devvit/shared-types/Header.js';
import { describe, expect, test, vi } from 'vitest';

import { Devvit } from '../../../devvit/Devvit.js';
import { MODERATOR_PERMISSIONS } from '../helpers/permissions.js';
import type { ModeratorPermission } from '../models/User.js';
import { User } from '../models/User.js';
import { RedditAPIClient } from '../RedditAPIClient.js';
import { createTestRedditApiClient } from './utils/createTestRedditApiClient.js';

describe('User API', () => {
  const subredditName = 'someTestSub';
  const username = 'bloop';
  let api: { reddit: RedditAPIClient; metadata: Metadata };

  beforeEach(() => {
    api = createTestRedditApiClient();
  });

  const mockUserFliar = {
    flairCssClass: undefined,
    flairText: 'Moderator',
    user: username,
  };

  const mockFlairListResponse = {
    users: [mockUserFliar],
  };

  describe('RedditAPIClient:getCurrentUsername()', () => {
    const currentUsername = 'test_user';
    const currentUserId = 't2_1234';

    test('can get username from metadata', async () => {
      api.metadata[Header.Username] = {
        values: [currentUsername],
      };
      const redditAPI = new RedditAPIClient(api.metadata);
      const username = await redditAPI.getCurrentUsername();

      expect(username).toStrictEqual(currentUsername);
    });

    test('can get username from r2 if not in metadata', async () => {
      api.metadata[Header.User] = {
        values: [currentUserId],
      };
      const redditAPI = new RedditAPIClient(api.metadata);

      const mockUserDataByAccountIdsResponse = {
        users: {
          [currentUserId]: {
            name: currentUsername,
          },
        },
      };

      const spyPlugin = vi.spyOn(Devvit.redditAPIPlugins.Users, 'UserDataByAccountIds');
      spyPlugin.mockImplementationOnce(async () => mockUserDataByAccountIdsResponse);

      let username = await redditAPI.getCurrentUsername();

      expect(spyPlugin).toHaveBeenCalledWith(
        {
          ids: currentUserId,
        },
        api.metadata
      );

      expect(username).toStrictEqual(currentUsername);

      // Calling getCurrentUsername again shouldn't call r2, since it should be stored in api.reddit
      username = await redditAPI.getCurrentUsername();

      expect(username).toStrictEqual(currentUsername);
    });
  });

  describe('RedditAPIClient:getCurrentUser()', () => {
    const currentUsername = 'test_user';
    const currentUserId = 't2_1234';

    test('only one call to r2 if username is in metadata', async () => {
      api.metadata[Header.Username] = {
        values: [currentUsername],
      };
      const redditAPI = new RedditAPIClient(api.metadata);

      // We don't mock UserDataByAccountIds because that RPC should not be called when the
      // username is in the metadata
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
      const spyPlugin = vi.spyOn(Devvit.redditAPIPlugins.Users, 'UserAbout');
      spyPlugin.mockImplementationOnce(async () => mockUserAboutResponse);

      const user = await redditAPI.getCurrentUser();

      expect(spyPlugin).toHaveBeenCalledWith(
        {
          username: currentUsername,
        },
        api.metadata
      );

      expect(user?.id).toStrictEqual(currentUserId);
      expect(user?.username).toStrictEqual(currentUsername);
      expect(user?.createdAt).toStrictEqual(createdAt);
      expect(user?.hasVerifiedEmail).toStrictEqual(true);
    });
  });

  describe('RedditAPIClient:getSnoovatarUrl()', () => {
    const currentUsername = 'test_user';
    const currentUserId = 't2_1234';
    const currentUserSnoovatarUrl = 'https://example.com/my-snoovatar.png';

    test('can get snoovatar of current user from metadata', async () => {
      api.metadata[Header.Username] = {
        values: [currentUsername],
      };
      api.metadata[Header.UserSnoovatarUrl] = {
        values: [currentUserSnoovatarUrl],
      };
      const redditAPI = new RedditAPIClient(api.metadata);
      const snoovatarUrl = await redditAPI.getSnoovatarUrl(currentUsername);

      expect(snoovatarUrl).toStrictEqual(currentUserSnoovatarUrl);
    });

    test('can get snoovatar of current user if avatar not in metadata', async () => {
      api.metadata[Header.Username] = {
        values: [currentUsername],
      };
      const redditAPI = new RedditAPIClient(api.metadata);

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

      const spyPlugin = vi.spyOn(Devvit.redditAPIPlugins.GraphQL, 'PersistedQuery');
      spyPlugin.mockImplementationOnce(async () => mockGetSnoovatarUrlResponse);

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
        api.metadata
      );

      expect(snoovatarUrl).toStrictEqual(currentUserSnoovatarUrl);
    });

    test('can get snoovatar of current user if username not in metadata', async () => {
      api.metadata[Header.User] = {
        values: [currentUserId],
      };
      const redditAPI = new RedditAPIClient(api.metadata);

      // Setup mock to retrieve username
      const mockUserDataByAccountIdsResponse = {
        users: {
          [currentUserId]: {
            name: currentUsername,
          },
        },
      };

      const userDataSpy = vi.spyOn(Devvit.redditAPIPlugins.Users, 'UserDataByAccountIds');
      userDataSpy.mockImplementationOnce(async () => mockUserDataByAccountIdsResponse);

      // Setup mock to retrieve snoovatar URL
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

      const gqlSpy = vi.spyOn(Devvit.redditAPIPlugins.GraphQL, 'PersistedQuery');
      gqlSpy.mockImplementationOnce(async () => mockGetSnoovatarUrlResponse);

      const snoovatarUrl = await redditAPI.getSnoovatarUrl(currentUsername);

      expect(userDataSpy).toHaveBeenCalledOnce();

      expect(gqlSpy).toHaveBeenCalledOnce();
      expect(gqlSpy).toHaveBeenCalledWith(
        {
          operationName: 'GetSnoovatarUrlByName',
          id: 'c47fd42345af268616d2d8904b56856acdc05cf61d3650380f539ad7d596ac0c',
          variables: {
            username: currentUsername,
          },
        },
        api.metadata
      );

      expect(snoovatarUrl).toStrictEqual(currentUserSnoovatarUrl);
    });

    test('can get snoovatar of other user', async () => {
      const otherUsername = 'other_user';
      const otherSnoovatarUrl = 'https://example.com/other-snoovatar.png';

      api.metadata[Header.Username] = {
        values: [currentUsername],
      };
      const redditAPI = new RedditAPIClient(api.metadata);

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

      const gqlSpy = vi.spyOn(Devvit.redditAPIPlugins.GraphQL, 'PersistedQuery');
      gqlSpy.mockImplementationOnce(async () => mockGetSnoovatarUrlResponse);

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
        api.metadata
      );

      expect(snoovatarUrl).toStrictEqual(otherSnoovatarUrl);
    });
  });

  describe('RedditAPIClient:User', () => {
    test('getUserFlairBySubreddit()', async () => {
      const user = new User(
        {
          id: 'someID',
          name: username,
          createdUtc: Date.now(),
          snoovatarSize: [1],
        },
        api.metadata
      );

      const spyPlugin = vi.spyOn(Devvit.redditAPIPlugins.Flair, 'FlairList');
      spyPlugin.mockImplementationOnce(async () => mockFlairListResponse);

      const userFlair = await user.getUserFlairBySubreddit(subredditName);

      expect(spyPlugin).toHaveBeenCalledWith(
        {
          subreddit: subredditName,
          name: username,
        },
        api.metadata
      );

      expect(userFlair).toEqual({
        flairCssClass: mockUserFliar.flairCssClass,
        user: mockUserFliar.user,
        flairText: mockUserFliar.flairText,
      });
    });

    test('modPermissions() works with new, unknown permissions', async () => {
      const user = new User(
        {
          id: 'someID',
          name: username,
          createdUtc: Date.now(),
          snoovatarSize: [1],
          modPermissions: { test: [MODERATOR_PERMISSIONS[0], 'something-unknown'] },
        },
        api.metadata
      );

      const understoodPermissions = new Map<string, ModeratorPermission[]>();
      understoodPermissions.set('test', [MODERATOR_PERMISSIONS[0] as ModeratorPermission]);

      expect(user.modPermissions).toEqual(understoodPermissions);
    });
  });
});
