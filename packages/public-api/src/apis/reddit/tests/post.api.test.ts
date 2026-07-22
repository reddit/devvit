import type { Metadata } from '@devvit/protos/lib/Types.js';
import { Header } from '@devvit/shared-types/Header.js';
import { describe, expect, test, vi } from 'vitest';

import { Devvit } from '../../../devvit/Devvit.js';
import { GraphQL } from '../graphql/GraphQL.js';
import { GalleryMediaStatus, Post } from '../models/Post.js';
import { createTestRedditApiClient } from './utils/createTestRedditApiClient.js';

describe('Post API', () => {
  const defaultPostData = {
    id: 'qwerty',
    title: 'My First Post',
    createdUtc: Date.parse('2022-01-04'),
    author: 'my-user',
    subreddit: 'askReddit',
    subredditId: 't5_abcdef',
    url: 'fake-url//',
    permalink: 'fake-permalink//',
    allAwardings: [],
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
    linkFlairBackgroundColor: '#aaa',
    linkFlairTextColor: '#ccc',
    linkFlairCssClass: 'custom-css-class',
    linkFlairRichtext: [
      { e: 'text', t: 'Need advice' },
      { a: ':doge:', u: 'http://reddit.com' },
    ],
    awarders: [],
    modReports: [['This is spam', 'spez']],
    treatmentTags: [],
    userReports: [['This is bad post', 'spez']],
    modPermissions: [],
    spoiler: false,
    secureMedia: {
      type: 'youtube.com',
      oembed: {
        type: 'video',
        title: 'lofi hip hop radio 📚 - beats to relax/study to',
        providerName: 'YouTube',
        providerUrl: 'https://www.youtube.com/',
        version: '1.0',
        thumbnailWidth: 480,
        thumbnailHeight: 360,
        thumbnailUrl: 'https://i.ytimg.com/vi/jfKfPfyJRdk/hqdefault.jpg',
        html: '<iframe width="267" height="200" src="https://www.youtube.com/embed/jfKfPfyJRdk?feature=oembed&enablejsapi=1" title="lofi hip hop radio 📚 - beats to relax/study to"></iframe>',
        height: 200,
        width: 267,
        authorUrl: 'https://www.youtube.com/@LofiGirl',
        authorName: 'Lofi Girl',
      },
      redditVideo: {
        bitrateKbps: 450,
        fallbackUrl: 'https://v.redd.it/12345678/DASH_270.mp4?source=fallback',
        height: 480,
        width: 270,
        scrubberMediaUrl: 'https://v.redd.it/12345678/DASH_96.mp4',
        dashUrl: 'https://v.redd.it/12345678/DASHPlaylist.mpd',
        duration: 21,
        hlsUrl: 'https://v.redd.it/12345678/HLSPlaylist.m3u8',
        isGif: false,
        transcodingStatus: 'completed',
      },
    },
    gallery: [
      {
        url: 'https://i.redd.it/12345678.jpg',
        width: 1080,
        height: 1080,
        status: GalleryMediaStatus.VALID,
      },
    ],
  };

  describe('RedditAPIClient', () => {
    test('Post matches JSON snapshot', () => {
      const metadata: Metadata = {
        [Header.AppUser]: { values: ['t2_appuser'] },
      };

      const post = new Post({ ...defaultPostData }, metadata);

      expect(post.toJSON()).toMatchSnapshot();
    });

    test('maps moderator report reasons and authors', () => {
      const post = new Post({ ...defaultPostData }, undefined);

      expect(post.modReports).toStrictEqual([{ reason: 'This is spam', author: 'spez' }]);
      expect(post.modReportReasons).toStrictEqual(['This is spam']);
    });

    test('report()', async () => {
      const { reddit, metadata } = createTestRedditApiClient();

      const spyPlugin = vi.spyOn(Devvit.redditAPIPlugins.LinksAndComments, 'Report');
      spyPlugin.mockImplementationOnce(async () => ({}));

      const post = new Post({ ...defaultPostData }, metadata);

      await reddit.report(post, {
        reason: 'This is spam!',
      });

      expect(spyPlugin).toHaveBeenCalledWith(
        {
          reason: 'This is spam!',
          srName: 'askReddit',
          thingId: 't3_qwerty',
          usernames: 'my-user',
        },
        metadata
      );
    });

    test('filter() filters a post', async () => {
      const { reddit, metadata } = createTestRedditApiClient();

      const spyPlugin = vi.spyOn(Devvit.redditAPIPlugins.Moderation, 'Filter');
      spyPlugin.mockImplementationOnce(async () => ({}));

      await reddit.filter('t3_qwerty', {
        reason: 'contains sensitive content',
        keep: false,
      });

      expect(spyPlugin).toHaveBeenCalledWith(
        {
          id: 't3_qwerty',
          reason: 'contains sensitive content',
          keep: false,
        },
        metadata
      );
    });

    test('filter() filters a comment', async () => {
      const { reddit, metadata } = createTestRedditApiClient();

      const spyPlugin = vi.spyOn(Devvit.redditAPIPlugins.Moderation, 'Filter');
      spyPlugin.mockImplementationOnce(async () => ({}));

      await reddit.filter('t1_commentid');

      expect(spyPlugin).toHaveBeenCalledWith(
        {
          id: 't1_commentid',
          reason: undefined,
          keep: undefined,
        },
        metadata
      );
    });

    test('Post.filter() filters and updates state', async () => {
      const { metadata } = createTestRedditApiClient();
      const spyPlugin = vi.spyOn(Devvit.redditAPIPlugins.Moderation, 'Filter');
      spyPlugin.mockImplementationOnce(async () => ({}));
      const post = new Post(
        {
          ...defaultPostData,
          approved: true,
          removed: false,
          spam: true,
        },
        metadata
      );

      await post.filter({ reason: 'contains sensitive content' });

      expect(spyPlugin).toHaveBeenCalledWith(
        {
          id: 't3_qwerty',
          reason: 'contains sensitive content',
          keep: undefined,
        },
        metadata
      );
      expect(post.removed).toBe(true);
      expect(post.spam).toBe(false);
      expect(post.approved).toBe(false);
    });
  });

  describe('setSuggestedCommentSort()', () => {
    test('sets custom post preview', async () => {
      const { metadata } = createTestRedditApiClient();
      const selftext =
        '# DX_Bundle:\n\n    Gm85Mzk0OTZkZi00NDBmLTQ1NDUtOTFiNC02MjM0ODczNThlODUudGVzdG9sZHJlZGRpdC0tMC5tYWluLnJlZGRpdC1zZXJ2aWNlLWRldnZpdC1nYXRld2F5LmFkYW0tZ3Jvc3NtYW4uc25vby5kZXYiuAQKLGRldnZpdC5yZWRkaXQuY3VzdG9tX3Bvc3QudjFhbHBoYS5DdXN0b21Qb3N0ErEBCjgvZGV2dml0LnJlZGRpdC5jdXN0b21fcG9zdC52MWFscGhhLkN1c3RvbVBvc3QvUmVuZGVyUG9zdBIKUmVuZGVyUG9zdCozZGV2dml0LnJlZGRpdC5jdXN0b21fcG9zdC52MWFscGhhLlJlbmRlclBvc3RSZXF1ZXN0MjRkZXZ2aXQucmVkZGl0LmN1c3RvbV9wb3N0LnYxYWxwaGEuUmVuZGVyUG9zdFJlc3BvbnNlEqEBCj8vZGV2dml0LnJlZGRpdC5jdXN0b21fcG9zdC52MWFscGhhLkN1c3RvbVBvc3QvUmVuZGVyUG9zdENvbnRlbnQSEVJlbmRlclBvc3RDb250ZW50KiRkZXZ2aXQudWkuYmxvY2tfa2l0LnYxYmV0YS5VSVJlcXVlc3QyJWRldnZpdC51aS5ibG9ja19raXQudjFiZXRhLlVJUmVzcG9uc2USowEKQC9kZXZ2aXQucmVkZGl0LmN1c3RvbV9wb3N0LnYxYWxwaGEuQ3VzdG9tUG9zdC9SZW5kZXJQb3N0Q29tcG9zZXISElJlbmRlclBvc3RDb21wb3NlciokZGV2dml0LnVpLmJsb2NrX2tpdC52MWJldGEuVUlSZXF1ZXN0MiVkZXZ2aXQudWkuYmxvY2tfa2l0LnYxYmV0YS5VSVJlc3BvbnNlGgpDdXN0b21Qb3N0IuIBCidkZXZ2aXQudWkuZXZlbnRzLnYxYWxwaGEuVUlFdmVudEhhbmRsZXISpgEKNi9kZXZ2aXQudWkuZXZlbnRzLnYxYWxwaGEuVUlFdmVudEhhbmRsZXIvSGFuZGxlVUlFdmVudBINSGFuZGxlVUlFdmVudCotZGV2dml0LnVpLmV2ZW50cy52MWFscGhhLkhhbmRsZVVJRXZlbnRSZXF1ZXN0Mi5kZXZ2aXQudWkuZXZlbnRzLnYxYWxwaGEuSGFuZGxlVUlFdmVudFJlc3BvbnNlGg5VSUV2ZW50SGFuZGxlcjJQEg4KBG5vZGUSBjIyLjUuMRIcCg5AZGV2dml0L3Byb3RvcxIKMC4xMS4xLWRldhIgChJAZGV2dml0L3B1YmxpYy1hcGkSCjAuMTEuMS1kZXY=\n\n# DX_Config:\n\n    EgA=\n\n# DX_Cached:\n\n    GkUKQwo+CAEqEhIHCgUNAADIQhoHCgUNAADIQhomEiQIAhIaCAIaFhoUChBBIGN1c3RvbSBwb3N0ISEhWAEiBAgBEAEQwAI=\n\n# DX_RichtextFallback:\n\n    This is a text fallback';

      const mockedPost = new Post({ ...defaultPostData, selftext }, metadata);

      const spyPlugin = vi.spyOn(GraphQL, 'query');
      spyPlugin.mockImplementationOnce(async () => ({
        data: {
          setSuggestedSort: {
            ok: true,
          },
        },
        errors: [],
      }));

      await mockedPost.setSuggestedCommentSort('NEW');

      expect(spyPlugin).toHaveBeenCalledWith(
        'SetSuggestedSort',
        'cf6052acc7fefaa65b710625b81dba8041f258313aafe9730e2a3dc855e5d10d',
        {
          input: {
            postId: 't3_qwerty',
            subredditId: 't5_abcdef',
            sort: 'NEW',
          },
        },
        {
          'devvit-app-user': {
            values: ['t2_appuser'],
          },
          'devvit-subreddit': {
            values: ['t5_0'],
          },
        }
      );
    });
  });

  describe('getEnrichedThumbnail', () => {
    test('gets EnrichedThumbnail through thumbnailV2', async () => {
      const { metadata } = createTestRedditApiClient();
      const selftext =
        '# DX_Bundle:\n\n    Gm85Mzk0OTZkZi00NDBmLTQ1NDUtOTFiNC02MjM0ODczNThlODUudGVzdG9sZHJlZGRpdC0tMC5tYWluLnJlZGRpdC1zZXJ2aWNlLWRldnZpdC1nYXRld2F5LmFkYW0tZ3Jvc3NtYW4uc25vby5kZXYiuAQKLGRldnZpdC5yZWRkaXQuY3VzdG9tX3Bvc3QudjFhbHBoYS5DdXN0b21Qb3N0ErEBCjgvZGV2dml0LnJlZGRpdC5jdXN0b21fcG9zdC52MWFscGhhLkN1c3RvbVBvc3QvUmVuZGVyUG9zdBIKUmVuZGVyUG9zdCozZGV2dml0LnJlZGRpdC5jdXN0b21fcG9zdC52MWFscGhhLlJlbmRlclBvc3RSZXF1ZXN0MjRkZXZ2aXQucmVkZGl0LmN1c3RvbV9wb3N0LnYxYWxwaGEuUmVuZGVyUG9zdFJlc3BvbnNlEqEBCj8vZGV2dml0LnJlZGRpdC5jdXN0b21fcG9zdC52MWFscGhhLkN1c3RvbVBvc3QvUmVuZGVyUG9zdENvbnRlbnQSEVJlbmRlclBvc3RDb250ZW50KiRkZXZ2aXQudWkuYmxvY2tfa2l0LnYxYmV0YS5VSVJlcXVlc3QyJWRldnZpdC51aS5ibG9ja19raXQudjFiZXRhLlVJUmVzcG9uc2USowEKQC9kZXZ2aXQucmVkZGl0LmN1c3RvbV9wb3N0LnYxYWxwaGEuQ3VzdG9tUG9zdC9SZW5kZXJQb3N0Q29tcG9zZXISElJlbmRlclBvc3RDb21wb3NlciokZGV2dml0LnVpLmJsb2NrX2tpdC52MWJldGEuVUlSZXF1ZXN0MiVkZXZ2aXQudWkuYmxvY2tfa2l0LnYxYmV0YS5VSVJlc3BvbnNlGgpDdXN0b21Qb3N0IuIBCidkZXZ2aXQudWkuZXZlbnRzLnYxYWxwaGEuVUlFdmVudEhhbmRsZXISpgEKNi9kZXZ2aXQudWkuZXZlbnRzLnYxYWxwaGEuVUlFdmVudEhhbmRsZXIvSGFuZGxlVUlFdmVudBINSGFuZGxlVUlFdmVudCotZGV2dml0LnVpLmV2ZW50cy52MWFscGhhLkhhbmRsZVVJRXZlbnRSZXF1ZXN0Mi5kZXZ2aXQudWkuZXZlbnRzLnYxYWxwaGEuSGFuZGxlVUlFdmVudFJlc3BvbnNlGg5VSUV2ZW50SGFuZGxlcjJQEg4KBG5vZGUSBjIyLjUuMRIcCg5AZGV2dml0L3Byb3RvcxIKMC4xMS4xLWRldhIgChJAZGV2dml0L3B1YmxpYy1hcGkSCjAuMTEuMS1kZXY=\n\n# DX_Config:\n\n    EgA=\n\n# DX_Cached:\n\n    GkUKQwo+CAEqEhIHCgUNAADIQhoHCgUNAADIQhomEiQIAhIaCAIaFhoUChBBIGN1c3RvbSBwb3N0ISEhWAEiBAgBEAEQwAI=\n\n# DX_RichtextFallback:\n\n    This is a text fallback';

      const mockedPost = new Post({ ...defaultPostData, selftext }, metadata);

      const expectedThumbnailV2 = {
        attribution: 'artist',
        image: {
          url: 'image.url.com',
          dimensions: {
            height: 400,
            width: 600,
          },
        },
        isObfuscatedDefault: false,
        obfuscatedImage: {
          url: 'obfuscatedimage.url.com',
          dimensions: {
            height: 400,
            width: 600,
          },
        },
      };
      const spyPlugin = vi.spyOn(GraphQL, 'query');
      spyPlugin.mockImplementationOnce(async () => ({
        data: {
          postInfoById: {
            thumbnailV2: expectedThumbnailV2,
          },
        },
        errors: [],
      }));

      const enrichedThumbnail = await mockedPost.getEnrichedThumbnail();

      expect(spyPlugin).toHaveBeenCalledWith(
        'GetThumbnailV2',
        '81580ce4e23d748c5a59a1618489b559bf4518b6a73af41f345d8d074c8b2ce9',
        {
          id: mockedPost.id,
        },
        {
          'devvit-app-user': {
            values: ['t2_appuser'],
          },
          'devvit-subreddit': {
            values: ['t5_0'],
          },
        }
      );

      expect(enrichedThumbnail?.attribution).toBe(expectedThumbnailV2.attribution);
      expect(enrichedThumbnail?.image?.url).toBe(expectedThumbnailV2.image.url);
      expect(enrichedThumbnail?.image?.width).toBe(expectedThumbnailV2.image.dimensions.width);
      expect(enrichedThumbnail?.image?.height).toBe(expectedThumbnailV2.image.dimensions.height);
      expect(enrichedThumbnail?.isObfuscatedDefault).toBe(expectedThumbnailV2.isObfuscatedDefault);
      expect(enrichedThumbnail?.obfuscatedImage?.url).toBe(expectedThumbnailV2.obfuscatedImage.url);
      expect(enrichedThumbnail?.obfuscatedImage?.width).toBe(
        expectedThumbnailV2.obfuscatedImage.dimensions.width
      );
      expect(enrichedThumbnail?.obfuscatedImage?.height).toBe(
        expectedThumbnailV2.obfuscatedImage.dimensions.height
      );
    });
  });
});
