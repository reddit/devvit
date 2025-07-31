import { context } from '@devvit/server';
import type { CodeBlockContext } from '@devvit/shared-types/richtext/contexts.js';
import { RichTextBuilder } from '@devvit/shared-types/richtext/RichTextBuilder.js';
import { describe, expect, test, vi } from 'vitest';

import { RunAs } from '../common.js';
import { GraphQL } from '../graphql/GraphQL.js';
import { GalleryMediaStatus, Post } from '../models/Post.js';
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

vi.mock('@devvit/redis', () => {
  return {
    redis: {
      hSet: vi.fn().mockResolvedValue(undefined),
    },
  };
});

describe('Post API', () => {
  const reddit = new RedditClient();

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
    gallery: [
      {
        url: 'https://i.redd.it/12345678.jpg',
        width: 1080,
        height: 1080,
        status: GalleryMediaStatus.VALID,
      },
    ],
  };

  describe('RedditClient', () => {
    test('Post matches JSON snapshot', () => {
      const post = new Post({ ...defaultPostData });

      expect(post.toJSON()).toMatchSnapshot();
    });

    test('report()', async () => {
      const spyPlugin = redditApiPlugins.LinksAndComments.Report;
      spyPlugin.mockImplementationOnce(async () => ({}));

      const post = new Post({ ...defaultPostData });

      await runWithTestContext(async () => {
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
          context.metadata
        );
      });
    });

    describe('submit()', () => {
      const commonPostFields = {
        kind: 'custom',
        richtextJson: '',
        sr: 'askReddit',
        subredditName: 'askReddit',
        title: 'My First Post',
      };

      test('submit(): can set runAs: USER when userActions enabled', async () => {
        const mockedPost = new Post({ ...defaultPostData });

        const spyPlugin = userActionsPlugin.SubmitCustomPost;
        spyPlugin.mockImplementationOnce(async () => ({
          json: { data: { id: 'post' }, errors: [] },
        }));

        vi.spyOn(Post, 'getById').mockResolvedValueOnce(mockedPost);

        await runWithTestContext(async () => {
          await reddit.submitPost({
            title: mockedPost.title,
            subredditName: mockedPost.subredditName,
            postData: { abc: 'def' },
            splash: {
              appDisplayName: 'appDisplayName',
              appIconUri: 'appIconUri',
              backgroundUri: 'backgroundUri',
              buttonLabel: 'buttonLabel',
              description: 'description',
              entryUri: 'entryUri',
              height: 'tall',
            },
            runAs: 'USER',
            userGeneratedContent: { text: 'some ugc text', imageUrls: ['image.png'] },
          });

          expect(spyPlugin).toHaveBeenCalledWith(
            {
              ...commonPostFields,
              richtextJson:
                'GkgKRgpBCAQqEhIHCgUNAADIQhoHCgUNAADIQhopKicQgBAYgAgiHWFwcERpc3BsYXlOYW1lIGxvYWRpbmcgc2NyZWVuKAIQgAQ=',
              richtextFallback: '',
              runAs: RunAs.USER,
              userGeneratedContent: { text: 'some ugc text', imageUrls: ['image.png'] },
              splash: {
                appDisplayName: 'appDisplayName',
                appIconUri: 'appIconUri',
                backgroundUri: 'backgroundUri',
                buttonLabel: 'buttonLabel',
                description: 'description',
                entryUri: 'entryUri',
                height: 'tall',
              },
              postData: {
                developerData: { abc: 'def' },
                splash: {
                  appDisplayName: 'appDisplayName',
                  appIconUri: 'appIconUri',
                  backgroundUri: 'backgroundUri',
                  buttonLabel: 'buttonLabel',
                  description: 'description',
                  entryUri: 'entryUri',
                  height: 2,
                  title: 'My First Post',
                },
              },
            },
            context.metadata
          );
        });
      });

      test.skip('submit(): throws error when runAs: USER with userActions disabled', async () => {
        await runWithTestContext(async () => {
          await expect(
            reddit.submitPost({
              title: 'Some post title',
              subredditName: 'askReddit',
              splash: { appDisplayName: 'appDisplayName' },
              runAs: 'USER',
              userGeneratedContent: { text: 'some ugc text', imageUrls: ['image.png'] },
            })
          ).rejects.toThrow(/UserActions is not enabled./);
        });
      });

      test('submit(): throws error when runAs: USER without userGeneratedContent for experience post', async () => {
        await runWithTestContext(async () => {
          await expect(
            reddit.submitPost({
              title: 'Some post title',
              subredditName: 'askReddit',
              splash: { appDisplayName: 'appDisplayName' },
              runAs: 'USER',
            })
          ).rejects.toThrow(/userGeneratedContent must be set/);
        });
      });

      test('sets plain text as the richtext fallback', async () => {
        const mockedPost = new Post({ ...defaultPostData });

        const spyPlugin = redditApiPlugins.LinksAndComments.SubmitCustomPost;
        spyPlugin.mockImplementationOnce(async () => ({
          json: { data: { id: 'post' }, errors: [] },
        }));

        vi.spyOn(Post, 'getById').mockResolvedValueOnce(mockedPost);

        await runWithTestContext(async () => {
          await reddit.submitPost({
            title: mockedPost.title,
            subredditName: mockedPost.subredditName,
            splash: { appDisplayName: 'appDisplayName' },
            textFallback: { text: 'This is a post with text as a fallback' },
          });

          expect(spyPlugin).toHaveBeenCalledWith(
            {
              ...commonPostFields,
              richtextJson:
                'Gm0KawpmCAQqEhIHCgUNAADIQhoHCgUNAADIQhpOKkwKI2h0dHBzOi8vaS5yZWRkLml0L2Nwc3h6YnA5NnBkZjEucG5nEIAQGIAIIh1hcHBEaXNwbGF5TmFtZSBsb2FkaW5nIHNjcmVlbigCEMAC',
              richtextFallback: 'This is a post with text as a fallback',
              runAs: RunAs.APP,
              splash: { appDisplayName: 'appDisplayName' },
              postData: {
                developerData: undefined,
                splash: {
                  appDisplayName: 'appDisplayName',
                  appIconUri: undefined,
                  backgroundUri: undefined,
                  buttonLabel: undefined,
                  description: undefined,
                  entryUri: undefined,
                  height: 1,
                  title: 'My First Post',
                },
              },
            },
            context.metadata
          );
        });
      });

      test('builds the richtext object', async () => {
        const mockedPost = new Post({ ...defaultPostData });

        const spyPlugin = redditApiPlugins.LinksAndComments.SubmitCustomPost;
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

        await runWithTestContext(async () => {
          await reddit.submitPost({
            title: mockedPost.title,
            subredditName: mockedPost.subredditName,
            splash: { appDisplayName: 'appDisplayName' },
            textFallback: { richtext: textFallbackRichtext },
          });

          expect(spyPlugin).toHaveBeenCalledWith(
            {
              ...commonPostFields,
              richtextJson:
                'Gm0KawpmCAQqEhIHCgUNAADIQhoHCgUNAADIQhpOKkwKI2h0dHBzOi8vaS5yZWRkLml0L2Nwc3h6YnA5NnBkZjEucG5nEIAQGIAIIh1hcHBEaXNwbGF5TmFtZSBsb2FkaW5nIHNjcmVlbigCEMAC',
              richtextFallback:
                '{"document":[{"e":"h","l":1,"c":[{"e":"raw","t":"Hello world"}]},{"e":"code","c":[{"e":"raw","t":"This post was created via the Devvit API"}]}]}',
              runAs: RunAs.APP,
              splash: { appDisplayName: 'appDisplayName' },
              postData: {
                developerData: undefined,
                splash: {
                  appDisplayName: 'appDisplayName',
                  appIconUri: undefined,
                  backgroundUri: undefined,
                  buttonLabel: undefined,
                  description: undefined,
                  entryUri: undefined,
                  height: 1,
                  title: 'My First Post',
                },
              },
            },
            context.metadata
          );
        });
      });

      test('adds the built richtext string to the submitPost call', async () => {
        const mockedPost = new Post({ ...defaultPostData });

        const spyPlugin = redditApiPlugins.LinksAndComments.SubmitCustomPost;
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

        await runWithTestContext(async () => {
          await reddit.submitPost({
            title: mockedPost.title,
            subredditName: mockedPost.subredditName,
            splash: { appDisplayName: 'appDisplayName' },
            textFallback: { richtext: textFallbackRichtext },
          });

          expect(spyPlugin).toHaveBeenCalledWith(
            {
              ...commonPostFields,
              richtextJson:
                'Gm0KawpmCAQqEhIHCgUNAADIQhoHCgUNAADIQhpOKkwKI2h0dHBzOi8vaS5yZWRkLml0L2Nwc3h6YnA5NnBkZjEucG5nEIAQGIAIIh1hcHBEaXNwbGF5TmFtZSBsb2FkaW5nIHNjcmVlbigCEMAC',
              richtextFallback:
                '{"document":[{"e":"h","l":1,"c":[{"e":"raw","t":"Hello world"}]},{"e":"code","c":[{"e":"raw","t":"This post was created via the Devvit API"}]}]}',
              runAs: RunAs.APP,
              splash: { appDisplayName: 'appDisplayName' },
              postData: {
                developerData: undefined,
                splash: {
                  appDisplayName: 'appDisplayName',
                  appIconUri: undefined,
                  backgroundUri: undefined,
                  buttonLabel: undefined,
                  description: undefined,
                  entryUri: undefined,
                  height: 1,
                  title: 'My First Post',
                },
              },
            },
            context.metadata
          );
        });
      });
    });

    describe('setTextFallback()', () => {
      test('throws error if no fallback was set', async () => {
        const selftext =
          '# DX_Bundle:\n\n    Gm9jYzZhYTIyMC0xNmQ1LTQyYzgtOWQwNS0zNmNiNzI3YzAxNjMudGVzdG9sZHJlZGRpdC0tMC5tYWluLnJlZGRpdC1zZXJ2aWNlLWRldnZpdC1nYXRld2F5LmFkYW0tZ3Jvc3NtYW4uc25vby5kZXYitQQKLGRldnZpdC5yZWRkaXQuY3VzdG9tX3Bvc3QudjFhbHBoYS5DdXN0b21Qb3N0ErABCjdkZXZ2aXQucmVkZGl0LmN1c3RvbV9wb3N0LnYxYWxwaGEuQ3VzdG9tUG9zdC5SZW5kZXJQb3N0EgpSZW5kZXJQb3N0KjNkZXZ2aXQucmVkZGl0LmN1c3RvbV9wb3N0LnYxYWxwaGEuUmVuZGVyUG9zdFJlcXVlc3QyNGRldnZpdC5yZWRkaXQuY3VzdG9tX3Bvc3QudjFhbHBoYS5SZW5kZXJQb3N0UmVzcG9uc2USoAEKPmRldnZpdC5yZWRkaXQuY3VzdG9tX3Bvc3QudjFhbHBoYS5DdXN0b21Qb3N0LlJlbmRlclBvc3RDb250ZW50EhFSZW5kZXJQb3N0Q29udGVudCokZGV2dml0LnVpLmJsb2NrX2tpdC52MWJldGEuVUlSZXF1ZXN0MiVkZXZ2aXQudWkuYmxvY2tfa2l0LnYxYmV0YS5VSVJlc3BvbnNlEqIBCj9kZXZ2aXQucmVkZGl0LmN1c3RvbV9wb3N0LnYxYWxwaGEuQ3VzdG9tUG9zdC5SZW5kZXJQb3N0Q29tcG9zZXISElJlbmRlclBvc3RDb21wb3NlciokZGV2dml0LnVpLmJsb2NrX2tpdC52MWJldGEuVUlSZXF1ZXN0MiVkZXZ2aXQudWkuYmxvY2tfa2l0LnYxYmV0YS5VSVJlc3BvbnNlGgpDdXN0b21Qb3N0IuEBCidkZXZ2aXQudWkuZXZlbnRzLnYxYWxwaGEuVUlFdmVudEhhbmRsZXISpQEKNWRldnZpdC51aS5ldmVudHMudjFhbHBoYS5VSUV2ZW50SGFuZGxlci5IYW5kbGVVSUV2ZW50Eg1IYW5kbGVVSUV2ZW50Ki1kZXZ2aXQudWkuZXZlbnRzLnYxYWxwaGEuSGFuZGxlVUlFdmVudFJlcXVlc3QyLmRldnZpdC51aS5ldmVudHMudjFhbHBoYS5IYW5kbGVVSUV2ZW50UmVzcG9uc2UaDlVJRXZlbnRIYW5kbGVyMoEBEg8KBG5vZGUSBzE4LjE5LjESNAoOQGRldnZpdC9wcm90b3MSIjAuMTEuMC1uZXh0LTIwMjQtMDctMTEtZTlmNGJiOWY2LjASOAoSQGRldnZpdC9wdWJsaWMtYXBpEiIwLjExLjAtbmV4dC0yMDI0LTA3LTExLWU5ZjRiYjlmNi4w\n\n# DX_Config:\n\n    EgA=\n\n# DX_Cached:\n\n    GkkKRwpCCAEqFhIJCgcNAACQQxABGgkKBw0AAKBDEAEaJhIkCAISGggCGhYaFAoQQSBjdXN0b20gcG9zdCEhIVgBIgQIARABEMAC';
        const mockedPost = new Post({ ...defaultPostData, selftext });

        const spyPlugin = redditApiPlugins.LinksAndComments.EditCustomPost;
        spyPlugin.mockImplementationOnce(async () => ({
          json: { data: { things: [{ kind: 'post' }] }, errors: [] },
        }));

        vi.spyOn(Post, 'getById').mockResolvedValueOnce(mockedPost);

        await runWithTestContext(async () => {
          try {
            // @ts-expect-error test bad type.
            await mockedPost.setTextFallback({ otherParam: '' });
            expect.unreachable('setTextFallback should throw an error if no fallback was set');
          } catch (testError: unknown) {
            expect(testError).toBeDefined();
          }
        });
      });

      test('sets plain text as the richtext fallback', async () => {
        const selftext =
          '# DX_Bundle:\n\n    Gm9jYzZhYTIyMC0xNmQ1LTQyYzgtOWQwNS0zNmNiNzI3YzAxNjMudGVzdG9sZHJlZGRpdC0tMC5tYWluLnJlZGRpdC1zZXJ2aWNlLWRldnZpdC1nYXRld2F5LmFkYW0tZ3Jvc3NtYW4uc25vby5kZXYitQQKLGRldnZpdC5yZWRkaXQuY3VzdG9tX3Bvc3QudjFhbHBoYS5DdXN0b21Qb3N0ErABCjdkZXZ2aXQucmVkZGl0LmN1c3RvbV9wb3N0LnYxYWxwaGEuQ3VzdG9tUG9zdC5SZW5kZXJQb3N0EgpSZW5kZXJQb3N0KjNkZXZ2aXQucmVkZGl0LmN1c3RvbV9wb3N0LnYxYWxwaGEuUmVuZGVyUG9zdFJlcXVlc3QyNGRldnZpdC5yZWRkaXQuY3VzdG9tX3Bvc3QudjFhbHBoYS5SZW5kZXJQb3N0UmVzcG9uc2USoAEKPmRldnZpdC5yZWRkaXQuY3VzdG9tX3Bvc3QudjFhbHBoYS5DdXN0b21Qb3N0LlJlbmRlclBvc3RDb250ZW50EhFSZW5kZXJQb3N0Q29udGVudCokZGV2dml0LnVpLmJsb2NrX2tpdC52MWJldGEuVUlSZXF1ZXN0MiVkZXZ2aXQudWkuYmxvY2tfa2l0LnYxYmV0YS5VSVJlc3BvbnNlEqIBCj9kZXZ2aXQucmVkZGl0LmN1c3RvbV9wb3N0LnYxYWxwaGEuQ3VzdG9tUG9zdC5SZW5kZXJQb3N0Q29tcG9zZXISElJlbmRlclBvc3RDb21wb3NlciokZGV2dml0LnVpLmJsb2NrX2tpdC52MWJldGEuVUlSZXF1ZXN0MiVkZXZ2aXQudWkuYmxvY2tfa2l0LnYxYmV0YS5VSVJlc3BvbnNlGgpDdXN0b21Qb3N0IuEBCidkZXZ2aXQudWkuZXZlbnRzLnYxYWxwaGEuVUlFdmVudEhhbmRsZXISpQEKNWRldnZpdC51aS5ldmVudHMudjFhbHBoYS5VSUV2ZW50SGFuZGxlci5IYW5kbGVVSUV2ZW50Eg1IYW5kbGVVSUV2ZW50Ki1kZXZ2aXQudWkuZXZlbnRzLnYxYWxwaGEuSGFuZGxlVUlFdmVudFJlcXVlc3QyLmRldnZpdC51aS5ldmVudHMudjFhbHBoYS5IYW5kbGVVSUV2ZW50UmVzcG9uc2UaDlVJRXZlbnRIYW5kbGVyMoEBEg8KBG5vZGUSBzE4LjE5LjESNAoOQGRldnZpdC9wcm90b3MSIjAuMTEuMC1uZXh0LTIwMjQtMDctMTEtZTlmNGJiOWY2LjASOAoSQGRldnZpdC9wdWJsaWMtYXBpEiIwLjExLjAtbmV4dC0yMDI0LTA3LTExLWU5ZjRiYjlmNi4w\n\n# DX_Config:\n\n    EgA=\n\n# DX_Cached:\n\n    GkkKRwpCCAEqFhIJCgcNAACQQxABGgkKBw0AAKBDEAEaJhIkCAISGggCGhYaFAoQQSBjdXN0b20gcG9zdCEhIVgBIgQIARABEMAC';
        const mockedPost = new Post({ ...defaultPostData, selftext });

        const spyPlugin = redditApiPlugins.LinksAndComments.EditCustomPost;
        spyPlugin.mockImplementationOnce(async () => ({
          json: { data: { things: [{ kind: 'post' }] }, errors: [] },
        }));

        vi.spyOn(Post, 'getById').mockResolvedValueOnce(mockedPost);

        await runWithTestContext(async () => {
          await mockedPost.setTextFallback({ text: 'This is a post with text as a fallback' });

          expect(spyPlugin).toHaveBeenCalledWith(
            {
              richtextFallback: 'This is a post with text as a fallback',
              thingId: 't3_qwerty',
            },
            context.metadata
          );
        });
      });

      test('sets markdown text as the richtext fallback', async () => {
        const selftext =
          '# DX_Bundle:\n\n    Gm9jYzZhYTIyMC0xNmQ1LTQyYzgtOWQwNS0zNmNiNzI3YzAxNjMudGVzdG9sZHJlZGRpdC0tMC5tYWluLnJlZGRpdC1zZXJ2aWNlLWRldnZpdC1nYXRld2F5LmFkYW0tZ3Jvc3NtYW4uc25vby5kZXYitQQKLGRldnZpdC5yZWRkaXQuY3VzdG9tX3Bvc3QudjFhbHBoYS5DdXN0b21Qb3N0ErABCjdkZXZ2aXQucmVkZGl0LmN1c3RvbV9wb3N0LnYxYWxwaGEuQ3VzdG9tUG9zdC5SZW5kZXJQb3N0EgpSZW5kZXJQb3N0KjNkZXZ2aXQucmVkZGl0LmN1c3RvbV9wb3N0LnYxYWxwaGEuUmVuZGVyUG9zdFJlcXVlc3QyNGRldnZpdC5yZWRkaXQuY3VzdG9tX3Bvc3QudjFhbHBoYS5SZW5kZXJQb3N0UmVzcG9uc2USoAEKPmRldnZpdC5yZWRkaXQuY3VzdG9tX3Bvc3QudjFhbHBoYS5DdXN0b21Qb3N0LlJlbmRlclBvc3RDb250ZW50EhFSZW5kZXJQb3N0Q29udGVudCokZGV2dml0LnVpLmJsb2NrX2tpdC52MWJldGEuVUlSZXF1ZXN0MiVkZXZ2aXQudWkuYmxvY2tfa2l0LnYxYmV0YS5VSVJlc3BvbnNlEqIBCj9kZXZ2aXQucmVkZGl0LmN1c3RvbV9wb3N0LnYxYWxwaGEuQ3VzdG9tUG9zdC5SZW5kZXJQb3N0Q29tcG9zZXISElJlbmRlclBvc3RDb21wb3NlciokZGV2dml0LnVpLmJsb2NrX2tpdC52MWJldGEuVUlSZXF1ZXN0MiVkZXZ2aXQudWkuYmxvY2tfa2l0LnYxYmV0YS5VSVJlc3BvbnNlGgpDdXN0b21Qb3N0IuIBCidkZXZ2aXQudWkuZXZlbnRzLnYxYWxwaGEuVUlFdmVudEhhbmRsZXISpQEKNWRldnZpdC51aS5ldmVudHMudjFhbHBoYS5VSUV2ZW50SGFuZGxlci5IYW5kbGVVSUV2ZW50Eg1IYW5kbGVVSUV2ZW50Ki1kZXZ2aXQudWkuZXZlbnRzLnYxYWxwaGEuSGFuZGxlVUlFdmVudFJlcXVlc3QyLmRldnZpdC51aS5ldmVudHMudjFhbHBoYS5IYW5kbGVVSUV2ZW50UmVzcG9uc2UaDlVJRXZlbnRIYW5kbGVyMoEBEg8KBG5vZGUSBzE4LjE5LjESNAoOQGRldnZpdC9wcm90b3MSIjAuMTEuMC1uZXh0LTIwMjQtMDctMTEtZTlmNGJiOWY2LjASOAoSQGRldnZpdC9wdWJsaWMtYXBpEiIwLjExLjAtbmV4dC0yMDI0LTA3LTExLWU5ZjRiYjlmNi4w\n\n# DX_Config:\n\n    EgA=\n\n# DX_Cached:\n\n    GkkKRwpCCAEqFhIJCgcNAACQQxABGgkKBw0AAKBDEAEaJhIkCAISGggCGhYaFAoQQSBjdXN0b20gcG9zdCEhIVgBIgQIARABEMAC';
        const mockedPost = new Post({ ...defaultPostData, selftext });

        const spyPlugin = redditApiPlugins.LinksAndComments.EditCustomPost;
        spyPlugin.mockImplementationOnce(async () => ({
          json: { data: { things: [{ kind: 'post' }] }, errors: [] },
        }));

        vi.spyOn(Post, 'getById').mockResolvedValueOnce(mockedPost);

        await runWithTestContext(async () => {
          await mockedPost.setTextFallback({
            text: '**[Megathread](https://www.reddit.com)** ^([View this post on Reddit redesign for more options](https://www.reddit.com/))',
          });

          expect(spyPlugin).toHaveBeenCalledWith(
            {
              richtextFallback:
                '**[Megathread](https://www.reddit.com)** ^([View this post on Reddit redesign for more options](https://www.reddit.com/))',
              thingId: 't3_qwerty',
            },
            context.metadata
          );
        });
      });

      test('sets richtext builder content as the richtext fallback', async () => {
        const selftext =
          '# DX_Bundle:\n\n    Gm9jYzZhYTIyMC0xNmQ1LTQyYzgtOWQwNS0zNmNiNzI3YzAxNjMudGVzdG9sZHJlZGRpdC0tMC5tYWluLnJlZGRpdC1zZXJ2aWNlLWRldnZpdC1nYXRld2F5LmFkYW0tZ3Jvc3NtYW4uc25vby5kZXYitQQKLGRldnZpdC5yZWRkaXQuY3VzdG9tX3Bvc3QudjFhbHBoYS5DdXN0b21Qb3N0ErABCjdkZXZ2aXQucmVkZGl0LmN1c3RvbV9wb3N0LnYxYWxwaGEuQ3VzdG9tUG9zdC5SZW5kZXJQb3N0EgpSZW5kZXJQb3N0KjNkZXZ2aXQucmVkZGl0LmN1c3RvbV9wb3N0LnYxYWxwaGEuUmVuZGVyUG9zdFJlcXVlc3QyNGRldnZpdC5yZWRkaXQuY3VzdG9tX3Bvc3QudjFhbHBoYS5SZW5kZXJQb3N0UmVzcG9uc2USoAEKPmRldnZpdC5yZWRkaXQuY3VzdG9tX3Bvc3QudjFhbHBoYS5DdXN0b21Qb3N0LlJlbmRlclBvc3RDb250ZW50EhFSZW5kZXJQb3N0Q29udGVudCokZGV2dml0LnVpLmJsb2NrX2tpdC52MWJldGEuVUlSZXF1ZXN0MiVkZXZ2aXQudWkuYmxvY2tfa2l0LnYxYmV0YS5VSVJlc3BvbnNlEqIBCj9kZXZ2aXQucmVkZGl0LmN1c3RvbV9wb3N0LnYxYWxwaGEuQ3VzdG9tUG9zdC5SZW5kZXJQb3N0Q29tcG9zZXISElJlbmRlclBvc3RDb21wb3NlciokZGV2dml0LnVpLmJsb2NrX2tpdC52MWJldGEuVUlSZXF1ZXN0MiVkZXZ2aXQudWkuYmxvY2tfa2l0LnYxYmV0YS5VSVJlc3BvbnNlGgpDdXN0b21Qb3N0IuIBCidkZXZ2aXQudWkuZXZlbnRzLnYxYWxwaGEuVUlFdmVudEhhbmRsZXISpQEKNWRldnZpdC51aS5ldmVudHMudjFhbHBoYS5VSUV2ZW50SGFuZGxlci5IYW5kbGVVSUV2ZW50Eg1IYW5kbGVVSUV2ZW50Ki1kZXZ2aXQudWkuZXZlbnRzLnYxYWxwaGEuSGFuZGxlVUlFdmVudFJlcXVlc3QyLmRldnZpdC51aS5ldmVudHMudjFhbHBoYS5IYW5kbGVVSUV2ZW50UmVzcG9uc2UaDlVJRXZlbnRIYW5kbGVyMoEBEg8KBG5vZGUSBzE4LjE5LjESNAoOQGRldnZpdC9wcm90b3MSIjAuMTEuMC1uZXh0LTIwMjQtMDctMTEtZTlmNGJiOWY2LjASOAoSQGRldnZpdC9wdWJsaWMtYXBpEiIwLjExLjAtbmV4dC0yMDI0LTA3LTExLWU5ZjRiYjlmNi4w\n\n# DX_Config:\n\n    EgA=\n\n# DX_Cached:\n\n    GkkKRwpCCAEqFhIJCgcNAACQQxABGgkKBw0AAKBDEAEaJhIkCAISGggCGhYaFAoQQSBjdXN0b20gcG9zdCEhIVgBIgQIARABEMAC';
        const mockedPost = new Post({ ...defaultPostData, selftext });

        const spyPlugin = redditApiPlugins.LinksAndComments.EditCustomPost;
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

        await runWithTestContext(async () => {
          await mockedPost.setTextFallback({ richtext: textFallbackRichtext });

          expect(spyPlugin).toHaveBeenCalledWith(
            {
              richtextFallback:
                '{"document":[{"e":"h","l":1,"c":[{"e":"raw","t":"Hello world"}]},{"e":"code","c":[{"e":"raw","t":"This post was created via the Devvit API"}]}]}',
              thingId: 't3_qwerty',
            },
            context.metadata
          );
        });
      });
    });

    describe('setSplash()', () => {
      test('sets custom post splash', async () => {
        const selftext =
          '# DX_Bundle:\n\n    Gm85Mzk0OTZkZi00NDBmLTQ1NDUtOTFiNC02MjM0ODczNThlODUudGVzdG9sZHJlZGRpdC0tMC5tYWluLnJlZGRpdC1zZXJ2aWNlLWRldnZpdC1nYXRld2F5LmFkYW0tZ3Jvc3NtYW4uc25vby5kZXYiuAQKLGRldnZpdC5yZWRkaXQuY3VzdG9tX3Bvc3QudjFhbHBoYS5DdXN0b21Qb3N0ErEBCjgvZGV2dml0LnJlZGRpdC5jdXN0b21fcG9zdC52MWFscGhhLkN1c3RvbVBvc3QvUmVuZGVyUG9zdBIKUmVuZGVyUG9zdCozZGV2dml0LnJlZGRpdC5jdXN0b21fcG9zdC52MWFscGhhLlJlbmRlclBvc3RSZXF1ZXN0MjRkZXZ2aXQucmVkZGl0LmN1c3RvbV9wb3N0LnYxYWxwaGEuUmVuZGVyUG9zdFJlc3BvbnNlEqEBCj8vZGV2dml0LnJlZGRpdC5jdXN0b21fcG9zdC52MWFscGhhLkN1c3RvbVBvc3QvUmVuZGVyUG9zdENvbnRlbnQSEVJlbmRlclBvc3RDb250ZW50KiRkZXZ2aXQudWkuYmxvY2tfa2l0LnYxYmV0YS5VSVJlcXVlc3QyJWRldnZpdC51aS5ibG9ja19raXQudjFiZXRhLlVJUmVzcG9uc2USowEKQC9kZXZ2aXQucmVkZGl0LmN1c3RvbV9wb3N0LnYxYWxwaGEuQ3VzdG9tUG9zdC9SZW5kZXJQb3N0Q29tcG9zZXISElJlbmRlclBvc3RDb21wb3NlciokZGV2dml0LnVpLmJsb2NrX2tpdC52MWJldGEuVUlSZXF1ZXN0MiVkZXZ2aXQudWkuYmxvY2tfa2l0LnYxYmV0YS5VSVJlc3BvbnNlGgpDdXN0b21Qb3N0IuIBCidkZXZ2aXQudWkuZXZlbnRzLnYxYWxwaGEuVUlFdmVudEhhbmRsZXISpgEKNi9kZXZ2aXQudWkuZXZlbnRzLnYxYWxwaGEuVUlFdmVudEhhbmRsZXIvSGFuZGxlVUlFdmVudBINSGFuZGxlVUlFdmVudCotZGV2dml0LnVpLmV2ZW50cy52MWFscGhhLkhhbmRsZVVJRXZlbnRSZXF1ZXN0Mi5kZXZ2aXQudWkuZXZlbnRzLnYxYWxwaGEuSGFuZGxlVUlFdmVudFJlc3BvbnNlGg5VSUV2ZW50SGFuZGxlcjJQEg4KBG5vZGUSBjIyLjUuMRIcCg5AZGV2dml0L3Byb3RvcxIKMC4xMS4xLWRldhIgChJAZGV2dml0L3B1YmxpYy1hcGkSCjAuMTEuMS1kZXY=\n\n# DX_Config:\n\n    EgA=\n\n# DX_Cached:\n\n    GkUKQwo+CAEqEhIHCgUNAADIQhoHCgUNAADIQhomEiQIAhIaCAIaFhoUChBBIGN1c3RvbSBwb3N0ISEhWAEiBAgBEAEQwAI=\n\n# DX_RichtextFallback:\n\n    This is a text fallback';

        const mockedPost = new Post({ ...defaultPostData, selftext });

        const spyGql = vi.spyOn(GraphQL, 'query');
        spyGql.mockImplementationOnce(async () => ({
          data: {
            postInfoById: {
              devvit: {
                postData: '{"developerData":{"riddle":"hello"}}',
              },
            },
          },
          errors: [],
        }));

        const spyPlugin = redditApiPlugins.LinksAndComments.EditCustomPost;
        spyPlugin.mockImplementationOnce(async () => ({
          json: { data: { things: [{ kind: 'post' }] }, errors: [] },
        }));

        await runWithTestContext(async () => {
          await mockedPost.setSplash({ appDisplayName: 'appDisplayName' });

          expect(spyPlugin).toHaveBeenCalledWith(
            {
              thingId: 't3_qwerty',
              postData: {
                developerData: { riddle: 'hello' },
                splash: {
                  appDisplayName: 'appDisplayName',
                  appIconUri: undefined,
                  backgroundUri: undefined,
                  buttonLabel: undefined,
                  description: undefined,
                  entryUri: undefined,
                  height: 1,
                  title: 'My First Post',
                },
              },
            },
            context.metadata
          );
        });
      });
    });
  });

  describe('setSuggestedCommentSort()', () => {
    test('sets custom post sort', async () => {
      const selftext =
        '# DX_Bundle:\n\n    Gm85Mzk0OTZkZi00NDBmLTQ1NDUtOTFiNC02MjM0ODczNThlODUudGVzdG9sZHJlZGRpdC0tMC5tYWluLnJlZGRpdC1zZXJ2aWNlLWRldnZpdC1nYXRld2F5LmFkYW0tZ3Jvc3NtYW4uc25vby5kZXYiuAQKLGRldnZpdC5yZWRkaXQuY3VzdG9tX3Bvc3QudjFhbHBoYS5DdXN0b21Qb3N0ErEBCjgvZGV2dml0LnJlZGRpdC5jdXN0b21fcG9zdC52MWFscGhhLkN1c3RvbVBvc3QvUmVuZGVyUG9zdBIKUmVuZGVyUG9zdCozZGV2dml0LnJlZGRpdC5jdXN0b21fcG9zdC52MWFscGhhLlJlbmRlclBvc3RSZXF1ZXN0MjRkZXZ2aXQucmVkZGl0LmN1c3RvbV9wb3N0LnYxYWxwaGEuUmVuZGVyUG9zdFJlc3BvbnNlEqEBCj8vZGV2dml0LnJlZGRpdC5jdXN0b21fcG9zdC52MWFscGhhLkN1c3RvbVBvc3QvUmVuZGVyUG9zdENvbnRlbnQSEVJlbmRlclBvc3RDb250ZW50KiRkZXZ2aXQudWkuYmxvY2tfa2l0LnYxYmV0YS5VSVJlcXVlc3QyJWRldnZpdC51aS5ibG9ja19raXQudjFiZXRhLlVJUmVzcG9uc2USowEKQC9kZXZ2aXQucmVkZGl0LmN1c3RvbV9wb3N0LnYxYWxwaGEuQ3VzdG9tUG9zdC9SZW5kZXJQb3N0Q29tcG9zZXISElJlbmRlclBvc3RDb21wb3NlciokZGV2dml0LnVpLmJsb2NrX2tpdC52MWJldGEuVUlSZXF1ZXN0MiVkZXZ2aXQudWkuYmxvY2tfa2l0LnYxYmV0YS5VSVJlc3BvbnNlGgpDdXN0b21Qb3N0IuIBCidkZXZ2aXQudWkuZXZlbnRzLnYxYWxwaGEuVUlFdmVudEhhbmRsZXISpgEKNi9kZXZ2aXQudWkuZXZlbnRzLnYxYWxwaGEuVUlFdmVudEhhbmRsZXIvSGFuZGxlVUlFdmVudBINSGFuZGxlVUlFdmVudCotZGV2dml0LnVpLmV2ZW50cy52MWFscGhhLkhhbmRsZVVJRXZlbnRSZXF1ZXN0Mi5kZXZ2aXQudWkuZXZlbnRzLnYxYWxwaGEuSGFuZGxlVUlFdmVudFJlc3BvbnNlGg5VSUV2ZW50SGFuZGxlcjJQEg4KBG5vZGUSBjIyLjUuMRIcCg5AZGV2dml0L3Byb3RvcxIKMC4xMS4xLWRldhIgChJAZGV2dml0L3B1YmxpYy1hcGkSCjAuMTEuMS1kZXY=\n\n# DX_Config:\n\n    EgA=\n\n# DX_Cached:\n\n    GkUKQwo+CAEqEhIHCgUNAADIQhoHCgUNAADIQhomEiQIAhIaCAIaFhoUChBBIGN1c3RvbSBwb3N0ISEhWAEiBAgBEAEQwAI=\n\n# DX_RichtextFallback:\n\n    This is a text fallback';

      const mockedPost = new Post({ ...defaultPostData, selftext });

      const spyPlugin = vi.spyOn(GraphQL, 'query');
      spyPlugin.mockImplementationOnce(async () => ({
        data: {
          setSuggestedSort: {
            ok: true,
          },
        },
        errors: [],
      }));

      await runWithTestContext(async () => {
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
          }
        );
      });
    });
  });

  describe('getEnrichedThumbnail', () => {
    test('gets EnrichedThumbnail through thumbnailV2', async () => {
      const selftext =
        '# DX_Bundle:\n\n    Gm85Mzk0OTZkZi00NDBmLTQ1NDUtOTFiNC02MjM0ODczNThlODUudGVzdG9sZHJlZGRpdC0tMC5tYWluLnJlZGRpdC1zZXJ2aWNlLWRldnZpdC1nYXRld2F5LmFkYW0tZ3Jvc3NtYW4uc25vby5kZXYiuAQKLGRldnZpdC5yZWRkaXQuY3VzdG9tX3Bvc3QudjFhbHBoYS5DdXN0b21Qb3N0ErEBCjgvZGV2dml0LnJlZGRpdC5jdXN0b21fcG9zdC52MWFscGhhLkN1c3RvbVBvc3QvUmVuZGVyUG9zdBIKUmVuZGVyUG9zdCozZGV2dml0LnJlZGRpdC5jdXN0b21fcG9zdC52MWFscGhhLlJlbmRlclBvc3RSZXF1ZXN0MjRkZXZ2aXQucmVkZGl0LmN1c3RvbV9wb3N0LnYxYWxwaGEuUmVuZGVyUG9zdFJlc3BvbnNlEqEBCj8vZGV2dml0LnJlZGRpdC5jdXN0b21fcG9zdC52MWFscGhhLkN1c3RvbVBvc3QvUmVuZGVyUG9zdENvbnRlbnQSEVJlbmRlclBvc3RDb250ZW50KiRkZXZ2aXQudWkuYmxvY2tfa2l0LnYxYmV0YS5VSVJlcXVlc3QyJWRldnZpdC51aS5ibG9ja19raXQudjFiZXRhLlVJUmVzcG9uc2USowEKQC9kZXZ2aXQucmVkZGl0LmN1c3RvbV9wb3N0LnYxYWxwaGEuQ3VzdG9tUG9zdC9SZW5kZXJQb3N0Q29tcG9zZXISElJlbmRlclBvc3RDb21wb3NlciokZGV2dml0LnVpLmJsb2NrX2tpdC52MWJldGEuVUlSZXF1ZXN0MiVkZXZ2aXQudWkuYmxvY2tfa2l0LnYxYmV0YS5VSVJlc3BvbnNlGgpDdXN0b21Qb3N0IuIBCidkZXZ2aXQudWkuZXZlbnRzLnYxYWxwaGEuVUlFdmVudEhhbmRsZXISpQEKNWRldnZpdC51aS5ldmVudHMudjFhbHBoYS5VSUV2ZW50SGFuZGxlci5IYW5kbGVVSUV2ZW50Eg1IYW5kbGVVSUV2ZW50Ki1kZXZ2aXQudWkuZXZlbnRzLnYxYWxwaGEuSGFuZGxlVUlFdmVudFJlcXVlc3QyLmRldnZpdC51aS5ldmVudHMudjFhbHBoYS5IYW5kbGVVSUV2ZW50UmVzcG9uc2UaDlVJRXZlbnRIYW5kbGVyMoEBEg8KBG5vZGUSBzE4LjE5LjESNAoOQGRldnZpdC9wcm90b3MSIjAuMTEuMC1uZXh0LTIwMjQtMDctMTEtZTlmNGJiOWY2LjASOAoSQGRldnZpdC9wdWJsaWMtYXBpEiIwLjExLjAtbmV4dC0yMDI0LTA3LTExLWU5ZjRiYjlmNi4w\n\n# DX_Config:\n\n    EgA=\n\n# DX_Cached:\n\n    GkUKQwo+CAEqEhIHCgUNAADIQhoHCgUNAADIQhomEiQIAhIaCAIaFhoUChBBIGN1c3RvbSBwb3N0ISEhWAEiBAgBEAEQwAI=\n\n# DX_RichtextFallback:\n\n    This is a text fallback';

      const mockedPost = new Post({ ...defaultPostData, selftext });

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

      await runWithTestContext(async () => {
        const enrichedThumbnail = await mockedPost.getEnrichedThumbnail();

        expect(spyPlugin).toHaveBeenCalledWith(
          'GetThumbnailV2',
          '81580ce4e23d748c5a59a1618489b559bf4518b6a73af41f345d8d074c8b2ce9',
          {
            id: mockedPost.id,
          }
        );

        expect(enrichedThumbnail?.attribution).toBe(expectedThumbnailV2.attribution);
        expect(enrichedThumbnail?.image?.url).toBe(expectedThumbnailV2.image.url);
        expect(enrichedThumbnail?.image?.width).toBe(expectedThumbnailV2.image.dimensions.width);
        expect(enrichedThumbnail?.image?.height).toBe(expectedThumbnailV2.image.dimensions.height);
        expect(enrichedThumbnail?.isObfuscatedDefault).toBe(
          expectedThumbnailV2.isObfuscatedDefault
        );
        expect(enrichedThumbnail?.obfuscatedImage?.url).toBe(
          expectedThumbnailV2.obfuscatedImage.url
        );
        expect(enrichedThumbnail?.obfuscatedImage?.width).toBe(
          expectedThumbnailV2.obfuscatedImage.dimensions.width
        );
        expect(enrichedThumbnail?.obfuscatedImage?.height).toBe(
          expectedThumbnailV2.obfuscatedImage.dimensions.height
        );
      });
    });
  });
});
