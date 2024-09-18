import type { JsonWrappedComment, Metadata } from '@devvit/protos';
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
  });
});
