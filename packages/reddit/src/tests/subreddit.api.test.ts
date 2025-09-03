import type { Listing as ListingProto, SubredditAboutResponse_AboutData } from '@devvit/protos';
import { context } from '@devvit/server';
import { describe, expect, test, vi } from 'vitest';

import { AboutLocations, Subreddit } from '../models/Subreddit.js';
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

vi.mock('../common.js', () => {
  return {
    assertUserScope: vi.fn(),
    RunAs: {
      APP: 0,
      USER: 1,
      UNSPECIFIED: 2,
    },
  };
});

function createTestSub(options: Partial<SubredditAboutResponse_AboutData>): Subreddit {
  return new Subreddit({
    id: 'someId',
    displayName: 'askReddit',
    subredditType: 'public',
    createdUtc: Date.parse('2022-01-03'),
    lang: 'en',
    allowedMediaInComments: [],
    userFlairRichtext: [],
    submissionType: 'any',
    ...options,
  });
}

describe('Subreddit API', () => {
  const redditAPI = new RedditClient();
  const username = 'unusual_setup';
  const subredditId = 't5_abc123';

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
            gallery: [],
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
            gallery: [],
          },
        },
      ],
    },
  };

  describe('RedditClient:Subreddit', () => {
    test('getCommentsAndPostsByUser()', async () => {
      const spyPlugin = redditApiPlugins.Users.UserWhere;
      spyPlugin.mockImplementationOnce(async () => mockListingWithPostsAndComments);

      await runWithTestContext(async () => {
        const result = redditAPI.getCommentsAndPostsByUser({
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
          context.metadata
        );

        expect(items).toMatchSnapshot();
      });
    });

    test('getSubredditRemovalReasons()', async () => {
      const removalReasonId = 'uuid-abc';
      const spyPlugin = redditApiPlugins.Subreddits.SubredditGetRemovalReasons;
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

      await runWithTestContext(async () => {
        const result = await redditAPI.getSubredditRemovalReasons('askReddit');

        expect(spyPlugin).toHaveBeenCalledWith({ subreddit: 'askReddit' }, context.metadata);

        expect(result).toMatchSnapshot();
      });
    });

    test('addSubredditRemovalReason()', async () => {
      const spyPlugin = redditApiPlugins.Subreddits.SubredditAddRemovalReason;
      spyPlugin.mockImplementationOnce(async () => {
        return {
          id: 'uuid-abc',
        };
      });

      await runWithTestContext(async () => {
        const result = await redditAPI.addSubredditRemovalReason('askReddit', {
          title: 'Spam',
          message: 'This is spam!',
        });

        expect(spyPlugin).toHaveBeenCalledWith(
          {
            message: 'This is spam!',
            subreddit: 'askReddit',
            title: 'Spam',
          },
          context.metadata
        );

        expect(result).toEqual('uuid-abc');
      });
    });

    test('subscribe()', async () => {
      const subreddit = new Subreddit({
        id: subredditId,
        displayName: 'askReddit',
        subredditType: 'public',
        createdUtc: Date.parse('2022-01-03'),
        lang: 'en',
        allowedMediaInComments: [],
        userFlairRichtext: [],
        submissionType: 'any',
      });
      vi.spyOn(Subreddit, 'getFromMetadata').mockImplementationOnce(async () => {
        return subreddit;
      });

      const spyPlugin = redditApiPlugins.Subreddits.Subscribe;
      spyPlugin.mockImplementationOnce(async () => {
        return {};
      });

      await runWithTestContext(async () => {
        await redditAPI.subscribeToCurrentSubreddit();

        expect(spyPlugin).toHaveBeenCalledWith(
          {
            action: 'sub',
            actionSource: '',
            srName: 'askReddit',
            sr: '',
            skipInitialDefaults: true,
          },
          context.metadata
        );
      });
    });

    test('unsubscribe()', async () => {
      const subreddit = new Subreddit({
        id: subredditId,
        displayName: 'askReddit',
        subredditType: 'public',
        createdUtc: Date.parse('2022-01-03'),
        lang: 'en',
        allowedMediaInComments: [],
        userFlairRichtext: [],
        submissionType: 'any',
      });
      vi.spyOn(Subreddit, 'getFromMetadata').mockImplementationOnce(async () => {
        return subreddit;
      });

      const spyPlugin = redditApiPlugins.Subreddits.Subscribe;
      spyPlugin.mockImplementationOnce(async () => {
        return {};
      });

      await runWithTestContext(async () => {
        await redditAPI.unsubscribeFromCurrentSubreddit();

        expect(spyPlugin).toHaveBeenCalledWith(
          {
            action: 'unsub',
            actionSource: '',
            srName: 'askReddit',
            sr: '',
            skipInitialDefaults: false,
          },
          context.metadata
        );
      });
    });
  });

  describe('Subreddit api model', () => {
    test('getCommentsAndPostsByIds()', async () => {
      const subreddit = new Subreddit({
        id: subredditId,
        displayName: 'askReddit',
        subredditType: 'public',
        createdUtc: Date.parse('2022-01-03'),
        lang: 'en',
        allowedMediaInComments: [],
        userFlairRichtext: [],
        submissionType: 'any',
      });

      const spyPlugin = redditApiPlugins.LinksAndComments.Info;
      spyPlugin.mockImplementationOnce(async () => mockListingWithPostsAndComments);

      await runWithTestContext(async () => {
        const listing = subreddit.getCommentsAndPostsByIds(['t3_abc123', 't1_xyz123']);
        const items = await listing.all();

        expect(spyPlugin).toHaveBeenCalledWith(
          {
            subreddits: ['t5_t5_abc123'],
            thingIds: ['t3_abc123', 't1_xyz123'],
          },
          context.metadata
        );

        expect(items).toMatchSnapshot();
      });
    });

    test('getUserFlair()', async () => {
      const subredditName = 'askReddit';
      const subreddit = createTestSub({ name: subredditName });

      const mockUserFliar = {
        flairCssClass: undefined,
        flairText: 'Moderator',
        user: username,
      };

      const mockFlairListResponse = {
        users: [mockUserFliar],
      };

      const spyPlugin = redditApiPlugins.Flair.FlairList;
      spyPlugin.mockImplementationOnce(async () => mockFlairListResponse);

      await runWithTestContext(async () => {
        const response = await subreddit.getUserFlair();

        expect(spyPlugin).toHaveBeenCalledWith(
          {
            subreddit: subredditName,
          },
          context.metadata
        );

        expect(response.users).toEqual([
          {
            flairCssClass: mockUserFliar.flairCssClass,
            user: mockUserFliar.user,
            flairText: mockUserFliar.flairText,
          },
        ]);
      });
    });

    test('getUserFlair({ usernames: ["user1, user2"] })', async () => {
      const subredditName = 'askReddit';
      const subreddit = createTestSub({ name: subredditName });

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

      const spyPlugin = redditApiPlugins.Flair.FlairList;
      spyPlugin.mockImplementation(async ({ name }) => ({
        users: [
          {
            flairCssClass: undefined,
            flairText: 'Moderator',
            user: name,
          },
        ],
      }));

      await runWithTestContext(async () => {
        const response = await subreddit.getUserFlair({ usernames: ['user1', 'user2'] });

        expect(spyPlugin).toHaveBeenNthCalledWith(
          1,
          {
            subreddit: subredditName,
            name: 'user1',
          },
          context.metadata
        );

        expect(spyPlugin).toHaveBeenNthCalledWith(
          2,
          {
            subreddit: subredditName,
            name: 'user2',
          },
          context.metadata
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
    });

    test('getModqueue()', async () => {
      const subredditName = 'askReddit';
      const subreddit = createTestSub({ name: subredditName });

      const spyPlugin = redditApiPlugins.Moderation.AboutLocation;
      spyPlugin.mockImplementationOnce(async () => mockListingWithPostsAndComments);

      await runWithTestContext(async () => {
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
          context.metadata
        );
      });
    });

    test('getModqueue({ type: "post" })', async () => {
      const subredditName = 'askReddit';
      const subreddit = createTestSub({ name: subredditName });

      const spyPlugin = redditApiPlugins.Moderation.AboutLocation;
      spyPlugin.mockImplementationOnce(async () => mockListingWithPostsAndComments);

      await runWithTestContext(async () => {
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
          context.metadata
        );
      });
    });

    test('getModqueue({ type: "comment" })', async () => {
      const subredditName = 'askReddit';
      const subreddit = createTestSub({ name: subredditName });

      const spyPlugin = redditApiPlugins.Moderation.AboutLocation;
      spyPlugin.mockImplementationOnce(async () => mockListingWithPostsAndComments);

      await runWithTestContext(async () => {
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
          context.metadata
        );
      });
    });
  });
});
