import type {
  Listing as ListingProto,
  Metadata,
  SubredditAboutResponse_AboutData,
} from '@devvit/protos';
import { describe, expect, test, vi } from 'vitest';

import { Devvit } from '../../../devvit/Devvit.js';
import { AboutLocations, Subreddit } from '../models/Subreddit.js';
import type { RedditAPIClient } from '../RedditAPIClient.js';
import { createTestRedditApiClient } from './utils/createTestRedditApiClient.js';

function createTestSub(
  options: Partial<SubredditAboutResponse_AboutData>,
  metadata: Metadata
): Subreddit {
  return new Subreddit(
    {
      id: 'someId',
      displayName: 'askReddit',
      subredditType: 'public',
      createdUtc: Date.parse('2022-01-03'),
      lang: 'en',
      allowedMediaInComments: [],
      userFlairRichtext: [],
      submissionType: 'any',
      ...options,
    },
    metadata
  );
}

describe('Subreddit API', () => {
  const username = 'unusual_setup';
  const subredditId = 't5_abc123';
  let api: { reddit: RedditAPIClient; metadata: Metadata };

  beforeAll(() => {
    api = createTestRedditApiClient();
  });

  const mockListingWithPostsAndComments: ListingProto = {
    kind: 'Listing',
    data: {
      children: [
        {
          kind: 't1',
          data: {
            id: 'abc123',
            body: 'This is a comment',
            createdUtc: Date.parse('2022-01-01'),
            author: username,
            parentId: 't3_abc123',
            subreddit: 'pics',
            subredditId: subredditId,
            linkId: 't3_abc123',
            permalink: 'permalink://',
            allAwardings: [],
            authorFlairRichtext: [],
            awarders: [],
            treatmentTags: [],
            modPermissions: [],
            linkFlairRichtext: [],
            spoiler: false,
            modReports: [],
            userReports: [],
          },
        },
        {
          kind: 't3',
          data: {
            id: 'abc123',
            title: 'This is a post',
            createdUtc: Date.parse('2022-01-02'),
            author: username,
            subreddit: 'pics',
            subredditId: subredditId,
            url: 'url://',
            permalink: 'permalink://',
            removed: true,
            removedBy: 'spez',
            removedByCategory: 'moderator',
            allAwardings: [],
            authorFlairRichtext: [],
            awarders: [],
            treatmentTags: [],
            modPermissions: [],
            linkFlairRichtext: [],
            spoiler: false,
            modReports: [],
            userReports: [],
          },
        },
      ],
    },
  };

  describe('RedditAPIClient:Subreddit', () => {
    test('getCommentsAndPostsByUser()', async () => {
      const spyPlugin = vi.spyOn(Devvit.redditAPIPlugins.Users, 'UserWhere');
      spyPlugin.mockImplementationOnce(async () => mockListingWithPostsAndComments);

      const result = api.reddit.getCommentsAndPostsByUser({
        username,
      });

      const items = await result.all();

      expect(spyPlugin).toHaveBeenCalledWith(
        {
          after: undefined,
          before: undefined,
          limit: 100,
          more: undefined,
          username: 'unusual_setup',
          where: 'overview',
        },
        api.metadata
      );

      expect(items).toMatchSnapshot();
    });

    test('getSubredditRemovalReasons()', async () => {
      const removalReasonId = 'uuid-abc';
      const spyPlugin = vi.spyOn(Devvit.redditAPIPlugins.Subreddits, 'SubredditGetRemovalReasons');
      spyPlugin.mockImplementationOnce(async () => {
        return {
          data: {
            [removalReasonId]: {
              id: removalReasonId,
              title: 'Spam',
              message: 'This is spam!',
            },
          },
          order: [removalReasonId],
        };
      });

      const result = await api.reddit.getSubredditRemovalReasons('askReddit');

      expect(spyPlugin).toHaveBeenCalledWith({ subreddit: 'askReddit' }, api.metadata);

      expect(result).toMatchSnapshot();
    });

    test('addSubredditRemovalReason()', async () => {
      const spyPlugin = vi.spyOn(Devvit.redditAPIPlugins.Subreddits, 'SubredditAddRemovalReason');
      spyPlugin.mockImplementationOnce(async () => {
        return {
          id: 'uuid-abc',
        };
      });

      const result = await api.reddit.addSubredditRemovalReason('askReddit', {
        title: 'Spam',
        message: 'This is spam!',
      });

      expect(spyPlugin).toHaveBeenCalledWith(
        {
          message: 'This is spam!',
          subreddit: 'askReddit',
          title: 'Spam',
        },
        api.metadata
      );

      expect(result).toEqual('uuid-abc');
    });
  });

  describe('Subreddit api model', () => {
    test('getCommentsAndPostsByIds()', async () => {
      const subreddit = new Subreddit(
        {
          id: subredditId,
          displayName: 'askReddit',
          subredditType: 'public',
          createdUtc: Date.parse('2022-01-03'),
          lang: 'en',
          allowedMediaInComments: [],
          userFlairRichtext: [],
          submissionType: 'any',
        },
        api.metadata
      );

      const spyPlugin = vi.spyOn(Devvit.redditAPIPlugins.LinksAndComments, 'Info');
      spyPlugin.mockImplementationOnce(async () => mockListingWithPostsAndComments);

      const listing = subreddit.getCommentsAndPostsByIds(['t3_abc123', 't1_xyz123']);
      const items = await listing.all();

      expect(spyPlugin).toHaveBeenCalledWith(
        {
          subreddits: ['t5_t5_abc123'],
          thingIds: ['t3_abc123', 't1_xyz123'],
        },
        api.metadata
      );

      expect(items).toMatchSnapshot();
    });

    test('getUserFlair()', async () => {
      const subredditName = 'askReddit';
      const subreddit = createTestSub({ name: subredditName }, api.metadata);

      const mockUserFliar = {
        flairCssClass: undefined,
        flairText: 'Moderator',
        user: username,
      };

      const mockFlairListResponse = {
        users: [mockUserFliar],
      };

      const spyPlugin = vi.spyOn(Devvit.redditAPIPlugins.Flair, 'FlairList');
      spyPlugin.mockImplementationOnce(async () => mockFlairListResponse);

      const response = await subreddit.getUserFlair();

      expect(spyPlugin).toHaveBeenCalledWith(
        {
          subreddit: subredditName,
        },
        api.metadata
      );

      expect(response.users).toEqual([
        {
          flairCssClass: mockUserFliar.flairCssClass,
          user: mockUserFliar.user,
          flairText: mockUserFliar.flairText,
        },
      ]);
    });

    test('getUserFlair({ usernames: ["user1, user2"] })', async () => {
      const subredditName = 'askReddit';
      const subreddit = createTestSub({ name: subredditName }, api.metadata);

      const mockUserFliar1 = {
        flairCssClass: undefined,
        flairText: 'Moderator',
        user: 'user1',
      };

      const mockUserFliar2 = {
        flairCssClass: undefined,
        flairText: 'Moderator',
        user: 'user2',
      };

      const spyPlugin = vi.spyOn(Devvit.redditAPIPlugins.Flair, 'FlairList');
      spyPlugin.mockImplementation(async ({ name }) => ({
        users: [
          {
            flairCssClass: undefined,
            flairText: 'Moderator',
            user: name,
          },
        ],
      }));

      const response = await subreddit.getUserFlair({ usernames: ['user1', 'user2'] });

      expect(spyPlugin).toHaveBeenNthCalledWith(
        1,
        {
          subreddit: subredditName,
          name: 'user1',
        },
        api.metadata
      );

      expect(spyPlugin).toHaveBeenNthCalledWith(
        2,
        {
          subreddit: subredditName,
          name: 'user2',
        },
        api.metadata
      );

      expect(response.users).toEqual([
        {
          flairCssClass: mockUserFliar1.flairCssClass,
          user: mockUserFliar1.user,
          flairText: mockUserFliar1.flairText,
        },
        {
          flairCssClass: mockUserFliar2.flairCssClass,
          user: mockUserFliar2.user,
          flairText: mockUserFliar2.flairText,
        },
      ]);
    });

    test('getModqueue()', async () => {
      const subredditName = 'askReddit';
      const subreddit = createTestSub({ name: subredditName }, api.metadata);

      const spyPlugin = vi.spyOn(Devvit.redditAPIPlugins.Moderation, 'AboutLocation');
      spyPlugin.mockImplementationOnce(async () => mockListingWithPostsAndComments);

      const listing = subreddit.getModQueue();
      await listing.all();

      expect(spyPlugin).toHaveBeenCalledWith(
        {
          subreddit: subredditName,
          location: AboutLocations.Modqueue,
          type: 'all',
          limit: 100,
          after: undefined,
          before: undefined,
          more: undefined,
          only: undefined,
        },
        api.metadata
      );
    });

    test('getModqueue({ type: "post" })', async () => {
      const subredditName = 'askReddit';
      const subreddit = createTestSub({ name: subredditName }, api.metadata);

      const spyPlugin = vi.spyOn(Devvit.redditAPIPlugins.Moderation, 'AboutLocation');
      spyPlugin.mockImplementationOnce(async () => mockListingWithPostsAndComments);

      const listing = subreddit.getModQueue({ type: 'post' });
      await listing.all();

      expect(spyPlugin).toHaveBeenCalledWith(
        {
          subreddit: subredditName,
          location: AboutLocations.Modqueue,
          type: 'post',
          only: 'links',
          limit: 100,
          after: undefined,
          before: undefined,
          more: undefined,
        },
        api.metadata
      );
    });

    test('getModqueue({ type: "comment" })', async () => {
      const subredditName = 'askReddit';
      const subreddit = createTestSub({ name: subredditName }, api.metadata);

      const spyPlugin = vi.spyOn(Devvit.redditAPIPlugins.Moderation, 'AboutLocation');
      spyPlugin.mockImplementationOnce(async () => mockListingWithPostsAndComments);

      const listing = subreddit.getModQueue({ type: 'comment' });
      await listing.all();

      expect(spyPlugin).toHaveBeenCalledWith(
        {
          subreddit: subredditName,
          location: AboutLocations.Modqueue,
          type: 'comment',
          only: 'comments',
          limit: 100,
          after: undefined,
          before: undefined,
          more: undefined,
        },
        api.metadata
      );
    });
  });
});
