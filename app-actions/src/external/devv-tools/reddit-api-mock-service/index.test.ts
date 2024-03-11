import type { RedditAPIClient } from '@devvit/public-api';
import { createDevvRedditApi, redditApiHandler } from './index.js';
import type { Mock } from 'vitest';
import type { Subreddit } from '@devvit/public-api';

describe('Reddit Api mock service', () => {
  const realRedditApi = {
    getSubredditById: vi.fn(),
    getCurrentUser: vi.fn(),
  } as unknown as RedditAPIClient;

  beforeEach(() => {
    (realRedditApi.getSubredditById as Mock).mockReset();
    (realRedditApi.getCurrentUser as Mock).mockReset();
  });

  describe('when no handlers provided', () => {
    it('uses vanilla reddit api', async () => {
      const devvRedditApi = createDevvRedditApi(realRedditApi, []);
      await devvRedditApi.getSubredditById('test_subreddit');
      expect(realRedditApi.getSubredditById).toBeCalledWith('test_subreddit');
    });
  });

  describe('with handlers provided', () => {
    it('calls the handler instead of original method', async () => {
      const devvRedditApi = createDevvRedditApi(realRedditApi, [
        redditApiHandler.getSubredditById((id: string) => {
          return { id } as Subreddit;
        }),
      ]);
      await devvRedditApi.getSubredditById('test_subreddit');
      expect(realRedditApi.getSubredditById).not.toBeCalled();
    });

    it('calls the handler instead of original method', async () => {
      const devvRedditApi = createDevvRedditApi(realRedditApi, [
        redditApiHandler.getSubredditById((id: string) => {
          return { id };
        }),
      ]);
      const result = await devvRedditApi.getSubredditById('test_subreddit');
      expect(realRedditApi.getSubredditById).not.toBeCalled();
      expect(result).toEqual({ id: 'test_subreddit' });
    });

    it('calls the original method if no handler is provided', async () => {
      (realRedditApi.getCurrentUser as Mock).mockResolvedValue({ name: 'real_user' });
      const devvRedditApi = createDevvRedditApi(realRedditApi, [
        redditApiHandler.getSubredditById((id: string) => {
          return { id };
        }),
      ]);
      const result = await devvRedditApi.getCurrentUser();
      expect(realRedditApi.getCurrentUser).toHaveBeenCalledOnce();
      expect(result).toEqual({ name: 'real_user' });
    });

    // it('has all methods defined', async () => {
    //     const devvRedditApi = createDevvRedditApi(realRedditApi, [
    //         redditApiHandler.getSubredditById((id: string) => {
    //             return {id}
    //         }),
    //     ]);
    //     expect(devvRedditApi.hasOwnProperty('getEdited')).toBeTruthy();
    // })
  });
});
