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
    test('getModNotes() maps modActionData to modAction', async () => {
      const spyPlugin = redditApiPlugins.ModNote.GetNotes;
      spyPlugin.mockImplementationOnce(async () => ({
        modNotes: [
          {
            id: 'ModNote_test',
            createdAt: 1_709_251_200,
            type: 'MOD_ACTION',
            subreddit: 'testsub',
            subredditId: 't5_test',
            user: 'test-user',
            userId: 't2_user',
            operator: 'test-mod',
            operatorId: 't2_mod',
            userNoteData: {},
            modActionData: {
              action: 'banuser',
              details: '14 day ban',
              description: 'Second ban',
              redditId: 't2_target',
            },
          },
        ],
        hasNextPage: false,
      }));

      await runWithTestContext(async () => {
        const notes = await redditAPI
          .getModNotes({
            subreddit: 'testsub',
            user: 'test-user',
            filter: 'MOD_ACTION',
            limit: 100,
          })
          .all();

        expect(notes).toHaveLength(1);
        expect(notes[0]?.modAction).toEqual({
          action: 'banuser',
          description: 'Second ban',
          details: '14 day ban',
          redditId: 't2_target',
        });
      });
    });

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
