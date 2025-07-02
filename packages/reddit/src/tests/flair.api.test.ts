import { context } from '@devvit/server';
import { describe, expect, vi } from 'vitest';

import type { SetUserFlairBatchConfig } from '../models/index.js';
import { RedditClient } from '../RedditClient.js';
import { redditApiPlugins } from './utils/redditApiPluginsMock.js';
import { runWithTestContext } from './utils/runWithTestContext.js';

vi.mock('../getRedditApiPlugins.js', () => {
  return {
    getRedditApiPlugins: () => redditApiPlugins,
  };
});

describe('Flair API', () => {
  const redditAPI = new RedditClient();

  describe('setUserFlairBatch', () => {
    it('does nothing if empty array is passed', async () => {
      const spyPlugin = redditApiPlugins.Flair.FlairCsv;

      await runWithTestContext(async () => {
        await redditAPI.setUserFlairBatch('test_subreddit', []);

        expect(spyPlugin).not.toHaveBeenCalled();
      });
    });

    it('constructs a csv input for the r2 call when all args are passed', async () => {
      const spyPlugin = redditApiPlugins.Flair.FlairCsv;

      const successResponse = {
        status: 'added flair for user userA',
        ok: true,
        errors: { css: undefined, row: undefined, user: undefined },
        warnings: { text: undefined },
      };

      spyPlugin.mockResolvedValue({ result: [successResponse] });

      await runWithTestContext(async () => {
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
          context.debug.metadata
        );

        expect(response).toStrictEqual([successResponse]);
      });
    });

    it('replaces empty values with empty string', async () => {
      const spyPlugin = redditApiPlugins.Flair.FlairCsv;
      spyPlugin.mockResolvedValue({ result: [] });

      await runWithTestContext(async () => {
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
          context.debug.metadata
        );
      });
    });

    it('throws an error if coma is present in config', async () => {
      const spyPlugin = redditApiPlugins.Flair.FlairCsv;
      spyPlugin.mockResolvedValue({ result: [] });

      const comaInUsername: SetUserFlairBatchConfig = { username: 'user,B' };
      const comaInFlairText: SetUserFlairBatchConfig = { username: 'user', text: 'a,b' };
      const comaInCssClass: SetUserFlairBatchConfig = { username: 'user', cssClass: 'width,100' };

      await runWithTestContext(async () => {
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
    });

    it('Appends multiple values with \\n as delimiters', async () => {
      const spyPlugin = redditApiPlugins.Flair.FlairCsv;
      spyPlugin.mockResolvedValue({ result: [] });

      await runWithTestContext(async () => {
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
          context.debug.metadata
        );
      });
    });

    it('throws an error when more than 100 entries are provided', async () => {
      const spyPlugin = redditApiPlugins.Flair.FlairCsv;
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

      await runWithTestContext(async () => {
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
});
