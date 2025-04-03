import type { Metadata } from '@devvit/protos';
import { Header } from '@devvit/shared-types/Header.js';

import { Devvit } from '../../../../devvit/Devvit.js';
import type { Configuration } from '../../../../types/configuration.js';
import { RedditAPIClient } from '../../RedditAPIClient.js';

export function createTestRedditApiClient(config?: Configuration): {
  metadata: Metadata;
  reddit: RedditAPIClient;
} {
  const metadata: Metadata = {
    [Header.AppUser]: {
      values: ['t2_appuser'],
    },
    [Header.Subreddit]: { values: ['t5_0'] },
  };

  const reddit = new RedditAPIClient(metadata);

  Devvit.configure(
    config || {
      redditAPI: true,
    }
  );

  return { metadata, reddit };
}
