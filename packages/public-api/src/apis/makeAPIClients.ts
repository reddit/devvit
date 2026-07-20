import { media } from '@devvit/media';
import type { Metadata } from '@devvit/protos/lib/Types.js';

import { cache } from '../devvit/internals/cache.js';
import type { ContextAPIClients } from '../index.js';
import { AssetsClient } from './AssetsClient/AssetsClient.js';
import { RedditAPIClient } from './reddit/RedditAPIClient.js';
import { redis } from './redis/RedisClient.js';
import { SchedulerClient } from './scheduler/SchedulerClient.js';
import { SettingsClient } from './settings/SettingsClient.js';
import { UIClient } from './ui/UIClient.js';

export type MakeAPIClientsOptions = {
  metadata: Metadata;
  ui?: boolean;
};

export function makeAPIClients({ metadata, ui }: MakeAPIClientsOptions): ContextAPIClients {
  const reddit = new RedditAPIClient(metadata);
  const scheduler = new SchedulerClient(metadata);
  const settings = new SettingsClient(metadata);
  const uiClient = ui ? new UIClient() : undefined;
  const assets = new AssetsClient();

  return {
    redis,
    reddit,
    scheduler,
    settings,
    media,
    assets,
    cache,
    get ui() {
      if (!uiClient) {
        throw new Error('ui client is not available');
      }
      return uiClient;
    },
  };
}
