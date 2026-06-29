import type { Metadata } from '@devvit/protos/lib/Types.js';
import { describe, expect, test, vi } from 'vitest';

import { Devvit } from '../../../devvit/Devvit.js';
import type { RedditAPIClient } from '../RedditAPIClient.js';
import { createTestRedditApiClient } from './utils/createTestRedditApiClient.js';

describe('ModNote API', () => {
  let api: { reddit: RedditAPIClient; metadata: Metadata };

  beforeAll(() => {
    api = createTestRedditApiClient();
  });

  describe('RedditAPIClient:ModNote', () => {
    test('getModNotes() maps modActionData to modAction', async () => {
      const spyPlugin = vi.spyOn(Devvit.redditAPIPlugins.ModNote, 'GetNotes');
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

      const notes = await api.reddit
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

    test('addRemovalNote()', async () => {
      const spyPlugin = vi.spyOn(Devvit.redditAPIPlugins.ModNote, 'PostRemovalNote');
      spyPlugin.mockImplementationOnce(async () => ({}));

      await api.reddit.addRemovalNote({
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
        api.metadata
      );
    });
  });
});
