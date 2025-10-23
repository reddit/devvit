import { type JsonWrappedComment, type Metadata } from '@devvit/protos';
import { Scope } from '@devvit/protos';
import { Header } from '@devvit/shared-types/Header.js';
import { describe, expect, test } from 'vitest';

import { Devvit } from '../../../devvit/Devvit.js';
import { Comment } from '../models/Comment.js';
import type { RedditAPIClient } from '../RedditAPIClient.js';
import { createTestRedditApiClient } from './utils/createTestRedditApiClient.js';

describe('Commment API', () => {
  let api: { reddit: RedditAPIClient; metadata: Metadata };

  beforeAll(() => {
    api = createTestRedditApiClient();
  });

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
    authorFlairRichtext: [],
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

  describe('RedditAPIClient:Comment', () => {
    test('Comment matches JSON snapshot', () => {
      const metadata: Metadata = {
        [Header.AppUser]: { values: ['t2_appuser'] },
      };

      const comment = new Comment({ ...defaultCommentData }, metadata);

      expect(comment.toJSON()).toMatchSnapshot();
    });

    test('report()', async () => {
      const { reddit, metadata } = createTestRedditApiClient();

      const spyPlugin = vi.spyOn(Devvit.redditAPIPlugins.LinksAndComments, 'Report');
      spyPlugin.mockImplementationOnce(async () => ({}));

      const comment = new Comment({ ...defaultCommentData }, metadata);

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
        metadata
      );
    });

    test('submitComment() should return a new comment when successful', async () => {
      const { reddit } = api;

      const spyPlugin = vi.spyOn(Devvit.redditAPIPlugins.LinksAndComments, 'Comment');
      spyPlugin.mockImplementationOnce(async () => mockJsonWrappedComment);

      const resp = await reddit.submitComment({
        id: 't1_commentid',
        text: 'body',
      });
      expect(resp.toJSON()).toMatchSnapshot();
    });

    test('submitComment() should throw an error if it fails', async () => {
      const { reddit } = api;

      const spyPlugin = vi.spyOn(Devvit.redditAPIPlugins.LinksAndComments, 'Comment');
      spyPlugin.mockImplementationOnce(async () => mockJsonWrappedCommentWithErrors);

      await expect(
        reddit.submitComment({
          id: 't1_commentid',
          text: 'body',
        })
      ).rejects.toThrow('failed to reply to comment');
    });

    test('submitComment(): throws error when setting runAs: USER with userActions is disabled', async () => {
      const { reddit } = createTestRedditApiClient({
        redditAPI: true,
        userActions: { scopes: [] },
      });

      await expect(
        reddit.submitComment({
          id: 't1_commentid',
          text: 'body',
          runAs: 'USER',
        })
      ).rejects.toThrow(/UserActions is not enabled./);
    });

    test('reply(): throws error when setting runAs: USER with userActions is disabled', async () => {
      const { reddit } = createTestRedditApiClient({
        redditAPI: true,
        userActions: { scopes: [] },
      });

      const spyPlugin = vi.spyOn(Devvit.redditAPIPlugins.LinksAndComments, 'Comment');
      spyPlugin.mockImplementationOnce(async () => mockJsonWrappedComment);

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

  test('submitComment(): can set runAs: USER when userActions is enabled', async () => {
    const { reddit } = createTestRedditApiClient({
      redditAPI: true,
      userActions: { scopes: [Scope.SUBMIT_COMMENT] },
    });

    const spyPlugin = vi.spyOn(Devvit.userActionsPlugin, 'Comment');
    spyPlugin.mockImplementationOnce(async () => mockJsonWrappedComment);

    const resp = await reddit.submitComment({
      id: 't1_commentid',
      text: 'body',
      runAs: 'USER',
    });
    expect(resp.toJSON()).toMatchSnapshot();
  });

  test('submitComment(): does not throw when runAs: USER with userActions: true', async () => {
    const { reddit } = createTestRedditApiClient({
      redditAPI: true,
      userActions: true,
    });

    const spyPlugin = vi.spyOn(Devvit.userActionsPlugin, 'Comment');
    spyPlugin.mockImplementationOnce(async () => mockJsonWrappedComment);

    const resp = await reddit.submitComment({
      id: 't1_commentid',
      text: 'body',
      runAs: 'USER',
    });
    expect(resp.toJSON()).toMatchSnapshot();
  });

  test('submitComment(): does not throw when runAs: USER with userActions: { enabled: true }', async () => {
    const { reddit } = createTestRedditApiClient({
      redditAPI: true,
      userActions: { enabled: true },
    });

    const spyPlugin = vi.spyOn(Devvit.userActionsPlugin, 'Comment');
    spyPlugin.mockImplementationOnce(async () => mockJsonWrappedComment);

    const resp = await reddit.submitComment({
      id: 't1_commentid',
      text: 'body',
      runAs: 'USER',
    });
    expect(resp.toJSON()).toMatchSnapshot();
  });
});
