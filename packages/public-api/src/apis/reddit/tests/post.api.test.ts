import type { Metadata } from '@devvit/protos';
import { Header } from '@devvit/shared-types/Header.js';
import type { CodeBlockContext } from '@devvit/shared-types/richtext/contexts.js';
import { RichTextBuilder } from '@devvit/shared-types/richtext/RichTextBuilder.js';
import { describe, expect, test, vi } from 'vitest';

import { Devvit } from '../../../devvit/Devvit.js';
import { Post } from '../models/Post.js';
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
          // @ts-expect-error
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
            richtextFallback:
              '{"document":[{"e":"par","c":[{"e":"text","t":"This is a post with text as a fallback"}]}]}',
            thingId: 't3_qwerty',
          },
          metadata
        );
      });

      test('sets richtext as the richtext fallback', async () => {
        const { metadata } = createTestRedditApiClient();
        const selftext =
          '# DX_Bundle:\n\n    Gm9jYzZhYTIyMC0xNmQ1LTQyYzgtOWQwNS0zNmNiNzI3YzAxNjMudGVzdG9sZHJlZGRpdC0tMC5tYWluLnJlZGRpdC1zZXJ2aWNlLWRldnZpdC1nYXRld2F5LmFkYW0tZ3Jvc3NtYW4uc25vby5kZXYitQQKLGRldnZpdC5yZWRkaXQuY3VzdG9tX3Bvc3QudjFhbHBoYS5DdXN0b21Qb3N0ErABCjdkZXZ2aXQucmVkZGl0LmN1c3RvbV9wb3N0LnYxYWxwaGEuQ3VzdG9tUG9zdC5SZW5kZXJQb3N0EgpSZW5kZXJQb3N0KjNkZXZ2aXQucmVkZGl0LmN1c3RvbV9wb3N0LnYxYWxwaGEuUmVuZGVyUG9zdFJlcXVlc3QyNGRldnZpdC5yZWRkaXQuY3VzdG9tX3Bvc3QudjFhbHBoYS5SZW5kZXJQb3N0UmVzcG9uc2USoAEKPmRldnZpdC5yZWRkaXQuY3VzdG9tX3Bvc3QudjFhbHBoYS5DdXN0b21Qb3N0LlJlbmRlclBvc3RDb250ZW50EhFSZW5kZXJQb3N0Q29udGVudCokZGV2dml0LnVpLmJsb2NrX2tpdC52MWJldGEuVUlSZXF1ZXN0MiVkZXZ2aXQudWkuYmxvY2tfa2l0LnYxYmV0YS5VSVJlc3BvbnNlEqIBCj9kZXZ2aXQucmVkZGl0LmN1c3RvbV9wb3N0LnYxYWxwaGEuQ3VzdG9tUG9zdC5SZW5kZXJQb3N0Q29tcG9zZXISElJlbmRlclBvc3RDb21wb3NlciokZGV2dml0LnVpLmJsb2NrX2tpdC52MWJldGEuVUlSZXF1ZXN0MiVkZXZ2aXQudWkuYmxvY2tfa2l0LnYxYmV0YS5VSVJlc3BvbnNlGgpDdXN0b21Qb3N0IuEBCidkZXZ2aXQudWkuZXZlbnRzLnYxYWxwaGEuVUlFdmVudEhhbmRsZXISpQEKNWRldnZpdC51aS5ldmVudHMudjFhbHBoYS5VSUV2ZW50SGFuZGxlci5IYW5kbGVVSUV2ZW50Eg1IYW5kbGVVSUV2ZW50Ki1kZXZ2aXQudWkuZXZlbnRzLnYxYWxwaGEuSGFuZGxlVUlFdmVudFJlcXVlc3QyLmRldnZpdC51aS5ldmVudHMudjFhbHBoYS5IYW5kbGVVSUV2ZW50UmVzcG9uc2UaDlVJRXZlbnRIYW5kbGVyMoEBEg8KBG5vZGUSBzE4LjE5LjESNAoOQGRldnZpdC9wcm90b3MSIjAuMTEuMC1uZXh0LTIwMjQtMDctMTEtZTlmNGJiOWY2LjASOAoSQGRldnZpdC9wdWJsaWMtYXBpEiIwLjExLjAtbmV4dC0yMDI0LTA3LTExLWU5ZjRiYjlmNi4w\n\n# DX_Config:\n\n    EgA=\n\n# DX_Cached:\n\n    GkkKRwpCCAEqFhIJCgcNAACQQxABGgkKBw0AAKBDEAEaJhIkCAISGggCGhYaFAoQQSBjdXN0b20gcG9zdCEhIVgBIgQIARABEMAC';
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
  });
});
