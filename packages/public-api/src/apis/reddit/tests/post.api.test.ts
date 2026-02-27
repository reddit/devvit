import type { Metadata } from '@devvit/protos';
import { Scope } from '@devvit/protos';
import { Header } from '@devvit/shared-types/Header.js';
import type { CodeBlockContext } from '@devvit/shared-types/richtext/contexts.js';
import { RichTextBuilder } from '@devvit/shared-types/richtext/RichTextBuilder.js';
import { describe, expect, test, vi } from 'vitest';

import { Devvit } from '../../../devvit/Devvit.js';
import { RunAs } from '../common.js';
import { GraphQL } from '../graphql/GraphQL.js';
import { GalleryMediaStatus, Post } from '../models/Post.js';
import { createPreview } from './utils/createTestPreview.js';
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

      test('submit(): throws error when runAs: USER with userActions disabled', async () => {
        const { reddit } = createTestRedditApiClient({
          redditAPI: true,
          userActions: { scopes: [] },
        });

        await expect(
          reddit.submitPost({
            title: 'Some post title',
            subredditName: 'askReddit',
            preview: createPreview(),
            runAs: 'USER',
            userGeneratedContent: { text: 'some ugc text', imageUrls: ['image.png'] },
          })
        ).rejects.toThrow(/UserActions is not enabled./);
      });

      test('submit(): throws error when runAs: USER without userGeneratedContent for experience post', async () => {
        const { reddit } = createTestRedditApiClient({
          redditAPI: true,
          userActions: { scopes: [Scope.SUBMIT_POST] },
        });

        await expect(
          reddit.submitPost({
            title: 'Some post title',
            subredditName: 'askReddit',
            preview: createPreview(),
            runAs: 'USER',
          })
        ).rejects.toThrow(/userGeneratedContent must be set/);
      });

      test('submit(): does not throw when runAs: USER with userActions: true', async () => {
        const { reddit, metadata } = createTestRedditApiClient({
          redditAPI: true,
          userActions: true,
        });
        const mockedPost = new Post({ ...defaultPostData }, metadata);

        const spyPlugin = vi.spyOn(Devvit.userActionsPlugin, 'SubmitCustomPost');
        spyPlugin.mockImplementationOnce(async () => ({
          json: { data: { id: 'post' }, errors: [] },
        }));
        vi.spyOn(Post, 'getById').mockResolvedValueOnce(mockedPost);

        await expect(
          reddit.submitPost({
            title: 'Some post title',
            subredditName: 'askReddit',
            preview: createPreview(),
            runAs: 'USER',
            userGeneratedContent: { text: 'some ugc text', imageUrls: ['image.png'] },
          })
        ).resolves.not.toThrow();
      });

      test('submit(): does not throw when runAs: USER with userActions: {enabled: true}', async () => {
        const { reddit, metadata } = createTestRedditApiClient({
          redditAPI: true,
          userActions: { enabled: true },
        });
        const mockedPost = new Post({ ...defaultPostData }, metadata);

        const spyPlugin = vi.spyOn(Devvit.userActionsPlugin, 'SubmitCustomPost');
        spyPlugin.mockImplementationOnce(async () => ({
          json: { data: { id: 'post' }, errors: [] },
        }));
        vi.spyOn(Post, 'getById').mockResolvedValueOnce(mockedPost);

        await expect(
          reddit.submitPost({
            title: 'Some post title',
            subredditName: 'askReddit',
            preview: createPreview(),
            runAs: 'USER',
            userGeneratedContent: { text: 'some ugc text', imageUrls: ['image.png'] },
          })
        ).resolves.not.toThrow();
      });

      test('sets plain text as the richtext fallback', async () => {
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
            richtextFallback: 'This is a post with text as a fallback',
            runAs: RunAs.APP,
          },
          metadata
        );
      });

      test('submit(): can set runAs: USER when userActions enabled', async () => {
        const { reddit, metadata } = createTestRedditApiClient({
          redditAPI: true,
          userActions: { scopes: [Scope.SUBMIT_POST] },
        });
        const mockedPost = new Post({ ...defaultPostData }, metadata);

        const spyPlugin = vi.spyOn(Devvit.userActionsPlugin, 'SubmitCustomPost');
        spyPlugin.mockImplementationOnce(async () => ({
          json: { data: { id: 'post' }, errors: [] },
        }));

        vi.spyOn(Post, 'getById').mockResolvedValueOnce(mockedPost);

        await reddit.submitPost({
          title: mockedPost.title,
          subredditName: mockedPost.subredditName,
          preview: createPreview(),
          runAs: 'USER',
          userGeneratedContent: { text: 'some ugc text', imageUrls: ['image.png'] },
        });

        expect(spyPlugin).toHaveBeenCalledWith(
          {
            ...commonPostFields,
            richtextJson:
              'GmYKZApfCAEqEhIHCgUNAADIQhoHCgUNAADIQhpHEkUIAhI7CAQqEhIHCgUNAADIQhoHCgUNAADIQhojKiEQ3AsYgAgiF1N0cmlwZWQgYmx1ZSBiYWNrZ3JvdW5kKAIiBAgBEAEQwAI=',
            richtextFallback: '',
            runAs: RunAs.USER,
            userGeneratedContent: { text: 'some ugc text', imageUrls: ['image.png'] },
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
            runAs: RunAs.APP,
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
            runAs: RunAs.APP,
          },
          metadata
        );
      });

      test('submitPost(): throws error with decoded message when postData exceeds size limit', async () => {
        const { reddit } = createTestRedditApiClient();
        const expectedErrMessage =
          'rpc error: code = Unknown desc = custom post data size 2687 exceeds the limit of 2000 bytes';

        // Error bytes captured from actual GQL error response
        const errBytes = new Uint8Array([
          10, 91, 114, 112, 99, 32, 101, 114, 114, 111, 114, 58, 32, 99, 111, 100, 101, 32, 61, 32,
          85, 110, 107, 110, 111, 119, 110, 32, 100, 101, 115, 99, 32, 61, 32, 99, 117, 115, 116,
          111, 109, 32, 112, 111, 115, 116, 32, 100, 97, 116, 97, 32, 115, 105, 122, 101, 32, 50,
          54, 56, 55, 32, 101, 120, 99, 101, 101, 100, 115, 32, 116, 104, 101, 32, 108, 105, 109,
          105, 116, 32, 111, 102, 32, 50, 48, 48, 48, 32, 98, 121, 116, 101, 115,
        ]);

        const spyPlugin = vi.spyOn(Devvit.redditAPIPlugins.LinksAndComments, 'SubmitCustomPost');
        spyPlugin.mockImplementationOnce(async () => ({
          json: {
            data: { id: undefined },
            errors: [
              {
                typeUrl: 'type.googleapis.com/google.protobuf.StringValue',
                value: errBytes,
              },
            ],
          },
        }));

        await expect(
          reddit.submitPost({
            title: 'Test Post',
            subredditName: 'askReddit',
            preview: createPreview(),
          })
        ).rejects.toThrow(expectedErrMessage);
      });
    });
    test('submit(): can create gallery post with multiple images', async () => {
      const { reddit, metadata } = createTestRedditApiClient();
      const mockedPost = new Post(
        {
          ...defaultPostData,
          gallery: [
            {
              url: 'https://example.com/1.jpg',
              width: 1080,
              height: 1080,
              status: GalleryMediaStatus.VALID,
            },
            {
              url: 'https://example.com/2.jpg',
              width: 1080,
              height: 1080,
              status: GalleryMediaStatus.VALID,
            },
          ],
        },
        metadata
      );

      const spyPlugin = vi.spyOn(Devvit.redditAPIPlugins.LinksAndComments, 'Submit');
      spyPlugin.mockImplementationOnce(async () => ({
        json: { data: { id: 'post' }, errors: [] },
      }));

      vi.spyOn(Post, 'getById').mockResolvedValueOnce(mockedPost);

      const imageUrls = ['https://example.com/1.jpg', 'https://example.com/2.jpg'];

      await reddit.submitPost({
        title: 'My Gallery Post',
        subredditName: 'askReddit',
        kind: 'image',
        imageUrls,
      });

      expect(spyPlugin).toHaveBeenCalledWith(
        expect.objectContaining({
          kind: 'image',
          imageUrls,
        
        }),
        metadata
      );
    });
  });
    describe('setTextFallback()', () => {
      test('throws error if no fallback was set', async () => {
        const { metadata } = createTestRedditApiClient();
        const selftext =
          '# DX_Bundle:\n\n    Gm9jYzZhYTIyMC0xNmQ1LTQyYzgtOWQwNS0zNmNiNzI3YzAxNjMudGVzdG9sZHJlZGRpdC0tMC5tYWluLnJlZGRpdC1zZXJ2aWNlLWRldnZpdC1nYXRld2F5LmFkYW0tZ3Jvc3NtYW4uc25vby5kZXYitQQKLGRldnZpdC5yZWRkaXQuY3VzdG9tX3Bvc3QudjFhbHBoYS5DdXN0b21Qb3N0ErABCjdkZXZ2aXQucmVkZGl0LmN1c3RvbV9wb3N0LnYxYWxwaGEuQ3VzdG9tUG9zdC5SZW5kZXJQb3N0EgpSZW5kZXJQb3N0KjNkZXZ2aXQucmVkZGl0LmN1c3RvbV9wb3N0LnYxYWxwaGEuUmVuZGVyUG9zdFJlcXVlc3QyNGRldnZpdC5yZWRkaXQuY3VzdG9tX3Bvc3QudjFhbHBoYS5SZW5kZXJQb3N0UmVzcG9uc2USoAEKPmRldnZpdC5yZWRkaXQuY3VzdG9tX3Bvc3QudjFhbHBoYS5DdXN0b21Qb3N0LlJlbmRlclBvc3RDb250ZW50EhFSZW5kZXJQb3N0Q29udGVudCokZGV2dml0LnVpLmJsb2NrX2tpdC52MWJldGEuVUlSZXF1ZXN0MiVkZXZ2aXQudWkuYmxvY2tfa2l0LnYxYmV0YS5VSVJlc3BvbnNlEqIBCj9kZXZ2aXQucmVkZGl0LmN1c3RvbV9wb3N0LnYxYWxwaGEuQ3VzdG9tUG9zdC5SZW5kZXJQb3N0Q29tcG9zZXISElJlbmRlclBvc3RDb21wb3NlciokZGV2dml0LnVpLmJsb2NrX2tpdC52MWJldGEuVUlSZXF1ZXN0MiVkZXZ2aXQudWkuYmxvY2tfa2l0LnYxYmV0YS5VSVJlc3BvbnNlGgpDdXN0b21Qb3N0IuEBCidkZXZ2aXQudWkuZXZlbnRzLnYxYWxwaGEuVUlFdmVudEhhbmRsZXISpQEKNWRldnZpdC51aS5ldmVudHMudjFhbHBoYS5VSUV2ZW50SGFuZGxlci5IYW5kbGVVSUV2ZW50Eg1IYW5kbGVVSUV2ZW50Ki1kZXZ2aXQudWkuZXZlbnRzLnYxYWxwaGEuSGFuZGxlVUlFdmVudFJlcXVlc3QyLmRldnZpdC51aS5ldmVudHMudjFhbHBoYS5IYW5kbGVVSUV2ZW50UmVzcG9uc2UaDlVJRXZlbnRIYW5kbGVyMoEBEg8KBG5vZGUSBzE4LjE5LjESNAoOQGRldnZpdC9wcm90b3MSIjAuMTEuMC1uZXh0LTIwMjQtMDctMTEtZTlmNGJiOWY2LjASOAoSQGRldnZpdC9wdWJsaWMtYXBpEiIwLjExLjAtbmV4dC0yMDI0LTA3LTExLWU5ZjRiYjlmNi4w\n\n# DX_Config:\n\n    EgA=\n\n# DX_Cached:\n\n    GkkKRwpCCAEqFhIJCgcNAACQQxABGgkKBw0AAKBDEAEaJhIkCAISGggCGhYaFAoQQSBjdXN0b20gcG9zdCEhIVgBIgQIARABEMAC';
        const mockedPost = new Post({ ...defaultPostData, selftext }, metadata);

        const spyPlugin = vi.spyOn(Devvit.redditAPIPlugins.LinksAndComments, 'EditCustomPost');
        spyPlugin.mockImplementationOnce(async () => ({
          json: { data: { things: [{ kind: 'post' }] }, errors: [] },
        }));

        vi.spyOn(Post, 'getById').mockResolvedValueOnce(mockedPost);

        try {
          // @ts-expect-error test bad type.
          await mockedPost.setTextFallback({ otherParam: '' });
        } catch (testError: unknown) {
          expect(testError).toBeDefined();
        }
      });

      test('sets plain text as the richtext fallback', async () => {
        const { metadata } = createTestRedditApiClient();
        const selftext =
          '# DX_Bundle:\n\n    Gm9jYzZhYTIyMC0xNmQ1LTQyYzgtOWQwNS0zNmNiNzI3YzAxNjMudGVzdG9sZHJlZGRpdC0tMC5tYWluLnJlZGRpdC1zZXJ2aWNlLWRldnZpdC1nYXRld2F5LmFkYW0tZ3Jvc3NtYW4uc25vby5kZXYitQQKLGRldnZpdC5yZWRkaXQuY3VzdG9tX3Bvc3QudjFhbHBoYS5DdXN0b21Qb3N0ErABCjdkZXZ2aXQucmVkZGl0LmN1c3RvbV9wb3N0LnYxYWxwaGEuQ3VzdG9tUG9zdC5SZW5kZXJQb3N0EgpSZW5kZXJQb3N0KjNkZXZ2aXQucmVkZGl0LmN1c3RvbV9wb3N0LnYxYWxwaGEuUmVuZGVyUG9zdFJlcXVlc3QyNGRldnZpdC5yZWRkaXQuY3VzdG9tX3Bvc3QudjFhbHBoYS5SZW5kZXJQb3N0UmVzcG9uc2USoAEKPmRldnZpdC5yZWRkaXQuY3VzdG9tX3Bvc3QudjFhbHBoYS5DdXN0b21Qb3N0LlJlbmRlclBvc3RDb250ZW50EhFSZW5kZXJQb3N0Q29udGVudCokZGV2dml0LnVpLmJsb2NrX2tpdC52MWJldGEuVUlSZXF1ZXN0MiVkZXZ2aXQudWkuYmxvY2tfa2l0LnYxYmV0YS5VSVJlc3BvbnNlEqIBCj9kZXZ2aXQucmVkZGl0LmN1c3RvbV9wb3N0LnYxYWxwaGEuQ3VzdG9tUG9zdC5SZW5kZXJQb3N0Q29tcG9zZXISElJlbmRlclBvc3RDb21wb3NlciokZGV2dml0LnVpLmJsb2NrX2tpdC52MWJldGEuVUlSZXF1ZXN0MiVkZXZ2aXQudWkuYmxvY2tfa2l0LnYxYmV0YS5VSVJlc3BvbnNlGgpDdXN0b21Qb3N0IuEBCidkZXZ2aXQudWkuZXZlbnRzLnYxYWxwaGEuVUlFdmVudEhhbmRsZXISpQEKNWRldnZpdC51aS5ldmVudHMudjFhbHBoYS5VSUV2ZW50SGFuZGxlci5IYW5kbGVVSUV2ZW50Eg1IYW5kbGVVSUV2ZW50Ki1kZXZ2aXQudWkuZXZlbnRzLnYxYWxwaGEuSGFuZGxlVUlFdmVudFJlcXVlc3QyLmRldnZpdC51aS5ldmVudHMudjFhbHBoYS5IYW5kbGVVSUV2ZW50UmVzcG9uc2UaDlVJRXZlbnRIYW5kbGVyMoEBEg8KBG5vZGUSBzE4LjE5LjESNAoOQGRldnZpdC9wcm90b3MSIjAuMTEuMC1uZXh0LTIwMjQtMDctMTEtZTlmNGJiOWY2LjASOAoSQGRldnZpdC9wdWJsaWMtYXBpEiIwLjExLjAtbmV4dC0yMDI0LTA3LTExLWU5ZjRiYjlmNi4w\n\n# DX_Config:\n\n    EgA=\n\n# DX_Cached:\n\n    GkkKRwpCCAEqFhIJCgcNAACQQxABGgkKBw0AAKBDEAEaJhIkCAISGggCGhYaFAoQQSBjdXN0b20gcG9zdCEhIVgBIgQIARABEMAC';
        const mockedPost = new Post({ ...defaultPostData, selftext }, metadata);

        const spyPlugin = vi.spyOn(Devvit.redditAPIPlugins.LinksAndComments, 'EditCustomPost');
        spyPlugin.mockImplementationOnce(async () => ({
          json: { data: { things: [{ kind: 'post' }] }, errors: [] },
        }));

        vi.spyOn(Post, 'getById').mockResolvedValueOnce(mockedPost);

        await mockedPost.setTextFallback({ text: 'This is a post with text as a fallback' });

        expect(spyPlugin).toHaveBeenCalledWith(
          {
            richtextFallback: 'This is a post with text as a fallback',
            thingId: 't3_qwerty',
          },
          metadata
        );
      });

      test('sets markdown text as the richtext fallback', async () => {
        const { metadata } = createTestRedditApiClient();
        const selftext =
          '# DX_Bundle:\n\n    Gm9jYzZhYTIyMC0xNmQ1LTQyYzgtOWQwNS0zNmNiNzI3YzAxNjMudGVzdG9sZHJlZGRpdC0tMC5tYWluLnJlZGRpdC1zZXJ2aWNlLWRldnZpdC1nYXRld2F5LmFkYW0tZ3Jvc3NtYW4uc25vby5kZXYitQQKLGRldnZpdC5yZWRkaXQuY3VzdG9tX3Bvc3QudjFhbHBoYS5DdXN0b21Qb3N0ErABCjdkZXZ2aXQucmVkZGl0LmN1c3RvbV9wb3N0LnYxYWxwaGEuQ3VzdG9tUG9zdC5SZW5kZXJQb3N0EgpSZW5kZXJQb3N0KjNkZXZ2aXQucmVkZGl0LmN1c3RvbV9wb3N0LnYxYWxwaGEuUmVuZGVyUG9zdFJlcXVlc3QyNGRldnZpdC5yZWRkaXQuY3VzdG9tX3Bvc3QudjFhbHBoYS5SZW5kZXJQb3N0UmVzcG9uc2USoAEKPmRldnZpdC5yZWRkaXQuY3VzdG9tX3Bvc3QudjFhbHBoYS5DdXN0b21Qb3N0LlJlbmRlclBvc3RDb250ZW50EhFSZW5kZXJQb3N0Q29udGVudCokZGV2dml0LnVpLmJsb2NrX2tpdC52MWJldGEuVUlSZXF1ZXN0MiVkZXZ2aXQudWkuYmxvY2tfa2l0LnYxYmV0YS5VSVJlc3BvbnNlEqIBCj9kZXZ2aXQucmVkZGl0LmN1c3RvbV9wb3N0LnYxYWxwaGEuQ3VzdG9tUG9zdC5SZW5kZXJQb3N0Q29tcG9zZXISElJlbmRlclBvc3RDb21wb3NlciokZGV2dml0LnVpLmJsb2NrX2tpdC52MWJldGEuVUlSZXF1ZXN0MiVkZXZ2aXQudWkuYmxvY2tfa2l0LnYxYmV0YS5VSVJlc3BvbnNlGgpDdXN0b21Qb3N0IuEBCidkZXZ2aXQudWkuZXZlbnRzLnYxYWxwaGEuVUlFdmVudEhhbmRsZXISpQEKNWRldnZpdC51aS5ldmVudHMudjFhbHBoYS5VSUV2ZW50SGFuZGxlci5IYW5kbGVVSUV2ZW50Eg1IYW5kbGVVSUV2ZW50Ki1kZXZ2aXQudWkuZXZlbnRzLnYxYWxwaGEuSGFuZGxlVUlFdmVudFJlcXVlc3QyLmRldnZpdC51aS5ldmVudHMudjFhbHBoYS5IYW5kbGVVSUV2ZW50UmVzcG9uc2UaDlVJRXZlbnRIYW5kbGVyMoEBEg8KBG5vZGUSBzE4LjE5LjESNAoOQGRldnZpdC9wcm90b3MSIjAuMTEuMC1uZXh0LTIwMjQtMDctMTEtZTlmNGJiOWY2LjASOAoSQGRldnZpdC9wdWJsaWMtYXBpEiIwLjExLjAtbmV4dC0yMDI0LTA3LTExLWU5ZjRiYjlmNi4w\n\n# DX_Config:\n\n    EgA=\n\n# DX_Cached:\n\n    GkkKRwpCCAEqFhIJCgcNAACQQxABGgkKBw0AAKBDEAEaJhIkCAISGggCGhYaFAoQQSBjdXN0b20gcG9zdCEhIVgBIgQIARABEMAC';
        const mockedPost = new Post({ ...defaultPostData, selftext }, metadata);

        const spyPlugin = vi.spyOn(Devvit.redditAPIPlugins.LinksAndComments, 'EditCustomPost');
        spyPlugin.mockImplementationOnce(async () => ({
          json: { data: { things: [{ kind: 'post' }] }, errors: [] },
        }));

        vi.spyOn(Post, 'getById').mockResolvedValueOnce(mockedPost);

        await mockedPost.setTextFallback({
          text: '**[Megathread](https://www.reddit.com)** ^([View this post on Reddit redesign for more options](https://www.reddit.com/))',
        });

        expect(spyPlugin).toHaveBeenCalledWith(
          {
            richtextFallback:
              '**[Megathread](https://www.reddit.com)** ^([View this post on Reddit redesign for more options](https://www.reddit.com/))',
            thingId: 't3_qwerty',
          },
          metadata
        );
      });

      test('sets richtext builder content as the richtext fallback', async () => {
        const { metadata } = createTestRedditApiClient();
        const selftext =
          '# DX_Bundle:\n\n    Gm9jYzZhYTIyMC0xNmQ1LTQyYzgtOWQwNS0zNmNiNzI3YzAxNjMudGVzdG9sZHJlZGRpdC0tMC5tYWluLnJlZGRpdC1zZXJ2aWNlLWRldnZpdC1nYXRld2F5LmFkYW0tZ3Jvc3NtYW4uc25vby5kZXYitQQKLGRldnZpdC5yZWRkaXQuY3VzdG9tX3Bvc3QudjFhbHBoYS5DdXN0b21Qb3N0ErABCjdkZXZ2aXQucmVkZGl0LmN1c3RvbV9wb3N0LnYxYWxwaGEuQ3VzdG21Qb3N0ErABCjdkZXZ2aXQucmVkZGl0LmN1c3RvbV9wb3N0LnYxYWxwaGEuUmVuZGVyUG9zdFJlcXVlc3QyNGRldnZpdC5yZWRkaXQuY3VzdG9tX3Bvc3QudjFhbHBoYS5SZW5kZXJQb3N0UmVzcG9uc2USoAEKPmRldnZpdC5yZWRkaXQuY3VzdG9tX3Bvc3QudjFhbHBoYS5DdXN0b21Qb3N0LlJlbmRlclBvc3RDb250ZW50EhFSZW5kZXJQb3N0Q29udGVudCokZGV2dml0LnVpLmJsb2NrX2tpdC52MWJldGEuVUlSZXF1ZXN0MiVkZXZ2aXQudWkuYmxvY2tfa2l0LnYxYmV0YS5VSVJlc3BvbnNlEqIBCj9kZXZ2aXQucmVkZGl0LmN1c3RvbV9wb3N0LnYxYWxwaGEuQ3VzdG9tUG9zdC5SZW5kZXJQb3N0Q29tcG9zZXISElJlbmRlclBvc3RDb21wb3NlciokZGV2dml0LnVpLmJsb2NrX2tpdC52MWJldGEuVUlSZXF1ZXN0MiVkZXZ2aXQudWkuYmxvY2tfa2l0LnYxYmV0YS5VSVJlc3BvbnNlGgpDdXN0b21Qb3N0IuEBCidkZXZ2aXQudWkuZXZlbnRzLnYxYWxwaGEuVUlFdmVudEhhbmRsZXISpQEKNWRldnZpdC51aS5ldmVudHMudjFhbHBoYS5VSUV2ZW50SGFuZGxlci5IYW5kbGVVSUV2ZW50Eg1IYW5kbGVVSUV2ZW50Ki1kZXZ2aXQudWkuZXZlbnRzLnYxYWxwaGEuSGFuZGxlVUlFdmVudFJlcXVlc3QyLmRldnZpdC51aS5ldmVudHMudjFhbHBoYS5IYW5kbGVVSUV2ZW50UmVzcG9uc2UaDlVJRXZlbnRIYW5kbGVyMoEBEg8KBG5vZGUSBzE4LjE5LjESNAoOQGRldnZpdC9wcm90b3MSIjAuMTEuMC1uZXh0LTIwMjQtMDctMTEtZTlmNGJiOWY2LjASOAoSQGRldnZpdC9wdWJsaWMtYXBpEiIwLjExLjAtbmV4dC0yMDI0LTA3LTExLWU5ZjRiYjlmNi4w\n\n# DX_Config:\n\n    EgA=\n\n# DX_Cached:\n\n    GkkKRwpCCAEqFhIJCgcNAACQQxABGgkKBw0AAKBDEAEaJhIkCAISGggCGhYaFAoQQSBjdXN0b20gcG9zdCEhIVgBIgQIARABEMAC';
        const mockedPost = new Post({ ...defaultPostData, selftext }, metadata);

        const spyPlugin = vi.spyOn(Devvit.redditAPIPlugins.LinksAndComments, 'EditCustomPost');
        spyPlugin.mockImplementationOnce(async () => ({
          json: { data: { things: [{ kind: 'post' }] }, errors: [] },
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

        await mockedPost.setTextFallback({ richtext: textFallbackRichtext });

        expect(spyPlugin).toHaveBeenCalledWith(
          {
            richtextFallback:
              '{"document":[{"e":"h","l":1,"c":[{"e":"raw","t":"Hello world"}]},{"e":"code","c":[{"e":"raw","t":"This post was created via the Devvit API"}]}]}',
            thingId: 't3_qwerty',
          },
          metadata
        );
      });
    });

    describe('setCustomPostPreview()', () => {
      test('sets custom post preview', async () => {
        const { metadata } = createTestRedditApiClient();
        const selftext =
          '# DX_Bundle:\n\n    Gm85Mzk0OTZkZi00NDBmLTQ1NDUtOTFiNC02MjM0ODczNThlODUudGVzdG9sZHJlZGRpdC0tMC5tYWluLnJlZGRpdC1zZXJ2aWNlLWRldnZpdC1nYXRld2F5LmFkYW0tZ3Jvc3NtYW4uc25vby5kZXYiuAQKLGRldnZpdC5yZWRkaXQuY3VzdG9tX3Bvc3QudjFhbHBoYS5DdXN0b21Qb3N0ErEBCjgvZGV2dml0LnJlZGRpdC5jdXN0b21fcG9zdC52MWFscGhhLkN1c3RvbVBvc3QvUmVuZGVyUG9zdBIKUmVuZGVyUG9zdCozZGV2dml0LnJlZGRpdC5jdXN0b21fcG9zdC52MWFscGhhLlJlbmRlclBvc3RSZXF1ZXN0MjRkZXZ2aXQucmVkZGl0LmN1c3RvbV9wb3N0LnYxYWxwaGEuUmVuZGVyUG9zdFJlc3BvbnNlEqEBCj8vZGV2dml0LnJlZGRpdC5jdXN0b21fcG9zdC52MWFscGhhLkN1c3RvbVBvc3QvUmVuZGVyUG9zdENvbnRlbnQSEVJlbmRlclBvc3RDb250ZW50KiRkZXZ2aXQudWkuYmxvY2tfa2l0LnYxYmV0YS5VSVJlcXVlc3QyJWRldnZpdC51aS5ibG9ja19raXQudjFiZXRhLlVJUmVzcG9uc2USowEKQC9kZXZ2aXQucmVkZGl0LmN1c3RvbV9wb3N0LnYxYWxwaGEuQ3VzdG9tUG9zdC9SZW5kZXJQb3N0Q29tcG9zZXISElJlbmRlclBvc3RDb21wb3NlciokZGV2dml0LnVpLmJsb2NrX2tpdC52MWJldGEuVUlSZXF1ZXN0MiVkZXZ2aXQudWkuYmxvY2tfa2l0LnYxYmV0YS5VSVJlc3BvbnNlGgpDdXN0b21Qb3N0IuIBCidkZXZ2aXQudWkuZXZlbnRzLnYxYWxwaGEuVUlFdmVudEhhbmRsZXISpgEKNi9kZXZ2aXQudWkuZXZlbnRzLnYxYWxwaGEuVUlFdmVudEhhbmRsZXIvSGFuZGxlVUlFdmVudBINSGFuZGxlVUlFdmVudCotZGV2dml0LnVpLmV2ZW50cy52MWFscGhhLkhhbmRsZVVJRXZlbnRSZXF1ZXN0Mi5kZXZ2aXQudWkuZXZlbnRzLnYxYWxwaGEuSGFuZGxlVUlFdmVudFJlc3BvbnNlGg5VSUV2ZW50SGFuZGxlcjJQEg4KBG5vZGUSBjIyLjUuMRIcCg5AZGV2dml0L3Byb3RvcxIKMC4xMS4xLWRldhIgChJAZGV2dml0L3B1YmxpYy1hcGkSCjAuMTEuMS1kZXY=\n\n# DX_Config:\n\n    EgA=\n\n# DX_Cached:\n\n    GkUKQwo+CAEqEhIHCgUNAADIQhoHCgUNAADIQhomEiQIAhIaCAIaFhoUChBBIGN1c3RvbSBwb3N0ISEhWAEiBAgBEAEQwAI=\n\n# DX_RichtextFallback:\n\n    This is a text fallback';

        const mockedPost = new Post({ ...defaultPostData, selftext }, metadata);

        const spyPlugin = vi.spyOn(
          Devvit.redditAPIPlugins.LinksAndComments,
          'SetCustomPostPreview'
        );
        spyPlugin.mockImplementationOnce(async () => ({}));

        await mockedPost.setCustomPostPreview(() => createPreview());

        expect(spyPlugin).toHaveBeenCalledWith(
          {
            blocksRenderContent:
              'GmkKZwpiCAEqEhIHCgUNAADIQhoHCgUNAADIQhpKEkgIAhI+CAQqEhIHCgUNAADIQhoHCgUNAADIQhojKiEQ3AsYgAgiF1N0cmlwZWQgYmx1ZSBiYWNrZ3JvdW5kKAI6ATAiBAgBEAEQwAI=',
            bodyType: 1,
            thingId: 't3_qwerty',
          },
          metadata
        );
      });
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
