import type { Metadata } from '@devvit/protos';
import { Header } from '@devvit/shared-types/Header.js';
import { describe, expect, test, vi } from 'vitest';
import { Devvit } from '../../../devvit/Devvit.js';
import { Post } from '../models/Post.js';
import { createTestRedditApiClient } from './utils/createTestRedditApiClient.js';
import { createPreview } from './utils/createTestPreview.js';
import { RichTextBuilder } from '@devvit/shared-types/richtext/RichTextBuilder.js';
import type { CodeBlockContext } from '@devvit/shared-types/richtext/contexts.js';

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
    authorFlairRichtext: [],
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
  };

  describe('RedditAPIClient', () => {
    test('Post matches JSON snapshot', () => {
      const metadata: Metadata = {
        [Header.AppUser]: { values: ['t2_appuser'] },
      };

      const post = new Post({ ...defaultPostData }, metadata);

      expect(post.toJSON()).toMatchSnapshot();
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

    describe('submit()', () => {
      const commonPostFields = {
        kind: 'custom',
        preview: {
          children: [
            {
              children: [],
              props: {
                description: 'Striped blue background',
                height: '100%',
                imageHeight: 1024,
                imageWidth: 1500,
                resizeMode: 'cover',
                url: 'background.png',
                width: '100%',
              },
              type: 'image',
            },
          ],
          props: {
            alignment: 'center middle',
            height: '100%',
            width: '100%',
          },
          type: 'zstack',
        },
        richtextJson: '',
        sr: 'askReddit',
        subredditName: 'askReddit',
        title: 'My First Post',
      };

      test('converts plain text to a richtext paragraph', async () => {
        const { reddit, metadata } = createTestRedditApiClient();
        const mockedPost = new Post({ ...defaultPostData }, metadata);

        const spyPlugin = vi.spyOn(Devvit.redditAPIPlugins.LinksAndComments, 'SubmitCustomPost');
        spyPlugin.mockImplementationOnce(async () => ({
          json: { data: { id: 'post' }, errors: [] },
        }));

        vi.spyOn(Post, 'getById').mockResolvedValueOnce(mockedPost);

        await reddit.submitPost({
          title: mockedPost.title,
          subredditName: mockedPost.subredditName,
          preview: createPreview(),
          textFallback: { text: 'This is a post with text as a fallback' },
        });

        expect(spyPlugin).toHaveBeenCalledWith(
          {
            ...commonPostFields,
            richtextJson:
              'GmYKZApfCAEqEhIHCgUNAADIQhoHCgUNAADIQhpHEkUIAhI7CAQqEhIHCgUNAADIQhoHCgUNAADIQhojKiEQ3AsYgAgiF1N0cmlwZWQgYmx1ZSBiYWNrZ3JvdW5kKAIiBAgBEAEQwAI=',
            richtextFallback:
              '{"document":[{"e":"par","c":[{"e":"text","t":"This is a post with text as a fallback"}]}]}',
          },
          metadata
        );
      });

      test('builds the richtext object', async () => {
        const { reddit, metadata } = createTestRedditApiClient();
        const mockedPost = new Post({ ...defaultPostData }, metadata);

        const spyPlugin = vi.spyOn(Devvit.redditAPIPlugins.LinksAndComments, 'SubmitCustomPost');
        spyPlugin.mockImplementationOnce(async () => ({
          json: { data: { id: 'post' }, errors: [] },
        }));

        vi.spyOn(Post, 'getById').mockResolvedValueOnce(mockedPost);

        const textFallbackRichtext = new RichTextBuilder()
          .heading({ level: 1 }, (h) => {
            h.rawText('Hello world');
          })
          .codeBlock({}, (cb: CodeBlockContext) =>
            cb.rawText('This post was created via the Devvit API')
          );

        await reddit.submitPost({
          title: mockedPost.title,
          subredditName: mockedPost.subredditName,
          preview: createPreview(),
          textFallback: { richtext: textFallbackRichtext },
        });

        expect(spyPlugin).toHaveBeenCalledWith(
          {
            ...commonPostFields,
            richtextJson:
              'GmYKZApfCAEqEhIHCgUNAADIQhoHCgUNAADIQhpHEkUIAhI7CAQqEhIHCgUNAADIQhoHCgUNAADIQhojKiEQ3AsYgAgiF1N0cmlwZWQgYmx1ZSBiYWNrZ3JvdW5kKAIiBAgBEAEQwAI=',
            richtextFallback:
              '{"document":[{"e":"h","l":1,"c":[{"e":"raw","t":"Hello world"}]},{"e":"code","c":[{"e":"raw","t":"This post was created via the Devvit API"}]}]}',
          },
          metadata
        );
      });

      test('adds the built richtext string to the submitPost call', async () => {
        const { reddit, metadata } = createTestRedditApiClient();
        const mockedPost = new Post({ ...defaultPostData }, metadata);

        const spyPlugin = vi.spyOn(Devvit.redditAPIPlugins.LinksAndComments, 'SubmitCustomPost');
        spyPlugin.mockImplementationOnce(async () => ({
          json: { data: { id: 'post' }, errors: [] },
        }));

        vi.spyOn(Post, 'getById').mockResolvedValueOnce(mockedPost);

        const textFallbackRichtext = new RichTextBuilder()
          .heading({ level: 1 }, (h) => {
            h.rawText('Hello world');
          })
          .codeBlock({}, (cb: CodeBlockContext) =>
            cb.rawText('This post was created via the Devvit API')
          )
          .build();

        await reddit.submitPost({
          title: mockedPost.title,
          subredditName: mockedPost.subredditName,
          preview: createPreview(),
          textFallback: { richtext: textFallbackRichtext },
        });

        expect(spyPlugin).toHaveBeenCalledWith(
          {
            ...commonPostFields,
            richtextJson:
              'GmYKZApfCAEqEhIHCgUNAADIQhoHCgUNAADIQhpHEkUIAhI7CAQqEhIHCgUNAADIQhoHCgUNAADIQhojKiEQ3AsYgAgiF1N0cmlwZWQgYmx1ZSBiYWNrZ3JvdW5kKAIiBAgBEAEQwAI=',
            richtextFallback:
              '{"document":[{"e":"h","l":1,"c":[{"e":"raw","t":"Hello world"}]},{"e":"code","c":[{"e":"raw","t":"This post was created via the Devvit API"}]}]}',
          },
          metadata
        );
      });
    });
  });
});
