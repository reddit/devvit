import { media } from '@devvit/media';
import { scheduler } from '@devvit/scheduler';
import { settings } from '@devvit/settings';

import { cache } from '../devvit/internals/cache.js';
import type { ContextAPIClients } from '../index.js';
import { AssetsClient } from './AssetsClient/AssetsClient.js';
import { reddit } from './reddit/RedditAPIClient.js';
import { redis } from './redis/RedisClient.js';
import { UIClient } from './ui/UIClient.js';

export type MakeAPIClientsOptions = {
  ui?: boolean;
};

export function makeAPIClients({ ui }: MakeAPIClientsOptions = {}): ContextAPIClients {
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
