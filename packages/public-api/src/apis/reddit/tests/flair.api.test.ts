import type { Metadata } from '@devvit/protos';
import { describe, expect, vi } from 'vitest';

import { Devvit } from '../../../devvit/Devvit.js';
import type { SetUserFlairBatchConfig } from '../models/index.js';
import { RedditAPIClient } from '../RedditAPIClient.js';
import { createTestRedditApiClient } from './utils/createTestRedditApiClient.js';

describe('Flair API', () => {
  let api: { reddit: RedditAPIClient; metadata: Metadata };

  beforeEach(() => {
    api = createTestRedditApiClient();
  });

  describe('setUserFlairBatch', () => {
    it('does nothing if empty array is passed', async () => {
      const redditAPI = new RedditAPIClient(api.metadata);
      const spyPlugin = vi.spyOn(Devvit.redditAPIPlugins.Flair, 'FlairCsv');

      await redditAPI.setUserFlairBatch('test_subreddit', []);

      expect(spyPlugin).not.toHaveBeenCalled();
    });

    it('constructs a csv input for the r2 call when all args are passed', async () => {
      const redditAPI = new RedditAPIClient(api.metadata);
      const spyPlugin = vi.spyOn(Devvit.redditAPIPlugins.Flair, 'FlairCsv');

      const successResponse = {
        status: 'added flair for user userA',
        ok: true,
        errors: { css: undefined, row: undefined, user: undefined },
        warnings: { text: undefined },
      };

      spyPlugin.mockResolvedValue({ result: [successResponse] });

      const response = await redditAPI.setUserFlairBatch('test_subreddit', [
        {
          username: 'userA',
          text: 'nice bike',
          cssClass: 'miami',
        },
      ]);

      expect(spyPlugin).toHaveBeenCalledWith(
        {
          subreddit: 'test_subreddit',
          flairCsv: 'userA,nice bike,miami',
        },
        api.metadata
      );

      expect(response).toStrictEqual([successResponse]);
    });

    it('replaces empty values with empty string', async () => {
      const redditAPI = new RedditAPIClient(api.metadata);
      const spyPlugin = vi.spyOn(Devvit.redditAPIPlugins.Flair, 'FlairCsv');
      spyPlugin.mockResolvedValue({ result: [] });

      await redditAPI.setUserFlairBatch('test_subreddit', [
        {
          username: 'userB',
          text: '',
        },
      ]);

      expect(spyPlugin).toHaveBeenCalledWith(
        {
          subreddit: 'test_subreddit',
          flairCsv: 'userB,,',
        },
        api.metadata
      );
    });

    it('throws an error if coma is present in config', async () => {
      const redditAPI = new RedditAPIClient(api.metadata);
      const spyPlugin = vi.spyOn(Devvit.redditAPIPlugins.Flair, 'FlairCsv');
      spyPlugin.mockResolvedValue({ result: [] });

      const comaInUsername: SetUserFlairBatchConfig = { username: 'user,B' };
      const comaInFlairText: SetUserFlairBatchConfig = { username: 'user', text: 'a,b' };
      const comaInCssClass: SetUserFlairBatchConfig = { username: 'user', cssClass: 'width,100' };

      try {
        await redditAPI.setUserFlairBatch('test_subreddit', [comaInUsername]);
      } catch (error) {
        expect((error as Error).message).toBe(
          'Unexpected input: username cannot contain the "," character'
        );
      }
      try {
        await redditAPI.setUserFlairBatch('test_subreddit', [comaInFlairText]);
      } catch (error) {
        expect((error as Error).message).toBe(
          'Unexpected input: text cannot contain the "," character'
        );
      }
      try {
        await redditAPI.setUserFlairBatch('test_subreddit', [comaInCssClass]);
      } catch (error) {
        expect((error as Error).message).toBe(
          'Unexpected input: cssClass cannot contain the "," character'
        );
      }
      expect(spyPlugin).not.toHaveBeenCalled();
    });

    it('Appends multiple values with \\n as delimiters', async () => {
      const redditAPI = new RedditAPIClient(api.metadata);
      const spyPlugin = vi.spyOn(Devvit.redditAPIPlugins.Flair, 'FlairCsv');
      spyPlugin.mockResolvedValue({ result: [] });

      await redditAPI.setUserFlairBatch('test_subreddit', [
        {
          username: 'userA',
          text: 'nice bike',
          cssClass: 'miami',
        },
        {
          username: 'userB',
          cssClass: '',
        },
      ]);

      expect(spyPlugin).toHaveBeenCalledWith(
        {
          subreddit: 'test_subreddit',
          flairCsv: 'userA,nice bike,miami\nuserB,,',
        },
        api.metadata
      );
    });

    it('throws an error when more than 100 entries are provided', async () => {
      const redditAPI = new RedditAPIClient(api.metadata);
      const spyPlugin = vi.spyOn(Devvit.redditAPIPlugins.Flair, 'FlairCsv');
      // returning the ok response for each line in the csv

      const sampleFlairConfig: SetUserFlairBatchConfig = {
        username: 'userA',
        text: 'nice bike',
        cssClass: 'miami',
      };
      const largeFlairRequestData: SetUserFlairBatchConfig[] = [];
      for (let i = 0; i < 250; i++) {
        largeFlairRequestData.push(sampleFlairConfig);
      }

      try {
        await redditAPI.setUserFlairBatch('test_subreddit', largeFlairRequestData);
      } catch (error) {
        expect((error as Error).message).toBe(
          'Unexpected input: flairs array cannot be longer than 100 entries.'
        );
      }
      expect(spyPlugin).not.toHaveBeenCalled();
    });
  });
});
