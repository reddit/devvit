import type { Metadata } from '@devvit/protos';
import { describe, expect, test, vi } from 'vitest';
import { Devvit } from '../../../devvit/Devvit.js';
import type { RedditAPIClient } from '../RedditAPIClient.js';
import { createTestRedditApiClient } from './utils/createTestRedditApiClient.js';
import { User } from '../models/User.js';

describe('User API', () => {
  const subredditName = 'someTestSub';
  const username = 'bloop';
  let api: { reddit: RedditAPIClient; metadata: Metadata };

  beforeAll(() => {
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
  });
});
