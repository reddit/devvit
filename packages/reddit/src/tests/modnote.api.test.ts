import { context } from '@devvit/server';
import { describe, expect, test, vi } from 'vitest';

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

describe('ModNote API', () => {
  const redditAPI = new RedditClient();

  describe('RedditClient:ModNote', () => {
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
