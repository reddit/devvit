import type { JsonWrappedComment } from '@devvit/protos/json/devvit/plugin/redditapi/linksandcomments/linksandcomments_msg.js';
import { context } from '@devvit/server';
import { describe, expect, test, vi } from 'vitest';

import { assertUserScope } from '../common.js';
import { Comment } from '../models/Comment.js';
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

describe('Commment API', () => {
  const reddit = new RedditClient();

  const defaultCommentData = {
    id: 'commentid',
    parentId: 't1_t3_parentid',
    authorId: 't2_authorid',
    authorName: 'current-user',
    body: 'body',
    createdUtc: Date.parse('2022-01-04'),
    author: 'my-user',
    linkId: 't3_linkid',
    permalink: 'fake-permalink//',
    subreddit: 'askReddit',
    subredditId: 't5_subredditid',
    allAwardings: [
      {
        resizedIcons: [],
        resizedStaticIcons: [],
        awarders: [],
      },
    ],
    modReports: [],
    reportReasons: [],
    treatmentTags: [],
    userReports: [],
    children: [],
    authorFlairBackgroundColor: '',
    authorFlairRichtext: [
      {
        e: 'emoji',
        a: ':stonks:',
        u: 'https://emoji.redditmedia.com/inqlseapworc1_t5_3acsi/stonks',
      },
      {
        e: 'text',
        t: ' 1 share',
      },
    ],
    authorFlairText: ':stonks: 1 share',
    authorFlairTextColor: 'dark',
    authorFlairType: 'richtext',
    awarders: [],
  };

  const mockJsonWrappedComment: JsonWrappedComment = {
    json: {
      errors: [],
      data: {
        things: [
          {
            kind: '',
            data: defaultCommentData,
          },
        ],
      },
    },
  };

  const mockJsonWrappedCommentWithErrors: JsonWrappedComment = {
    json: {
      errors: ['comment failed'],
      data: {
        things: [
          {
            kind: '',
            data: defaultCommentData,
          },
        ],
      },
    },
  };

  describe('RedditClient:Comment', () => {
    test('Comment matches JSON snapshot', () => {
      const comment = new Comment({ ...defaultCommentData });

      expect(comment.toJSON()).toMatchSnapshot();
    });

    test('report()', async () => {
      const spyPlugin = redditApiPlugins.LinksAndComments.Report;
      spyPlugin.mockImplementationOnce(async () => ({}));

      const comment = new Comment({ ...defaultCommentData });

      await runWithTestContext(async () => {
        await reddit.report(comment, {
          reason: 'This is spam!',
        });

        expect(spyPlugin).toHaveBeenCalledWith(
          {
            reason: 'This is spam!',
            srName: 'askReddit',
            thingId: 't1_commentid',
            usernames: 'my-user',
          },
          context.metadata
        );
      });
    });

    test('submitComment() should return a new comment when successful', async () => {
      const spyPlugin = redditApiPlugins.LinksAndComments.Comment;
      spyPlugin.mockImplementationOnce(async () => mockJsonWrappedComment);

      await runWithTestContext(async () => {
        const resp = await reddit.submitComment({
          id: 't1_commentid',
          text: 'body',
        });
        expect(resp.toJSON()).toMatchSnapshot();
      });
    });

    test('submitComment() should throw an error if it fails', async () => {
      const spyPlugin = redditApiPlugins.LinksAndComments.Comment;
      spyPlugin.mockImplementationOnce(async () => mockJsonWrappedCommentWithErrors);

      await runWithTestContext(async () => {
        await expect(
          reddit.submitComment({
            id: 't1_commentid',
            text: 'body',
          })
        ).rejects.toThrow('failed to reply to comment');
      });
    });

    test('submitComment(): can set runAs: USER when userActions is enabled', async () => {
      const spyPlugin = userActionsPlugin.Comment;
      spyPlugin.mockImplementationOnce(async () => mockJsonWrappedComment);

      const mockAssertUserScope = vi.mocked(assertUserScope);
      mockAssertUserScope.mockImplementation(() => {});

      await runWithTestContext(async () => {
        const resp = await reddit.submitComment({
          id: 't1_commentid',
          text: 'body',
          runAs: 'USER',
        });
        expect(resp.toJSON()).toMatchSnapshot();
      });
    });

    test.skip('submitComment(): throws error when setting runAs: USER with userActions is disabled', async () => {
      await runWithTestContext(async () => {
        await expect(
          reddit.submitComment({
            id: 't1_commentid',
            text: 'body',
            runAs: 'USER',
          })
        ).rejects.toThrow(/UserActions is not enabled./);
      });
    });

    test.skip('reply(): throws error when setting runAs: USER with userActions is disabled', async () => {
      const spyPlugin = redditApiPlugins.LinksAndComments.Comment;
      spyPlugin.mockImplementationOnce(async () => mockJsonWrappedComment);

      await runWithTestContext(async () => {
        const comment = await reddit.submitComment({
          id: 't1_commentid',
          text: 'body',
        });

        await expect(
          comment.reply({
            text: 'some reply',
            runAs: 'USER',
          })
        ).rejects.toThrow(/UserActions is not enabled./);
      });
    });
  });
});
