import { context } from '@devvit/server';
import { describe, expect, test, vi } from 'vitest';

import { RedditClient } from '../RedditClient.js';
import { redditApiPlugins } from './utils/redditApiPluginsMock.js';
import { runWithTestContext } from './utils/runWithTestContext.js';

vi.mock('../getRedditApiPlugins.js', () => {
  return {
    getRedditApiPlugins: () => redditApiPlugins,
  };
});

describe('ModNote API', () => {
  const redditAPI = new RedditClient();

  describe('RedditAPIClient:ModNote', () => {
    test('addRemovalNote()', async () => {
      const spyPlugin = redditApiPlugins.ModNote.PostRemovalNote;
      spyPlugin.mockImplementationOnce(async () => ({}));

      await runWithTestContext(async () => {
        await redditAPI.addRemovalNote({
          itemIds: ['t3_abcdef'],
          reasonId: 'qwerty',
          modNote: 'This is spam!',
        });

        expect(spyPlugin).toHaveBeenCalledWith(
          {
            itemIds: ['t3_abcdef'],
            reasonId: 'qwerty',
            modNote: 'This is spam!',
          },
          context.metadata
        );
      });
    });
  });
});
