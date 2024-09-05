import type { Metadata } from '@devvit/protos';
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
