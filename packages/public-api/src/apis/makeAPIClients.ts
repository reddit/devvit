import type { Metadata } from '@devvit/protos/lib/Types.js';

import { makeCache } from '../devvit/internals/cache.js';
import type { ContextAPIClients } from '../index.js';
import { AssetsClient } from './AssetsClient/AssetsClient.js';
import { MediaClient } from './media/MediaClient.js';
import { RedditAPIClient } from './reddit/RedditAPIClient.js';
import { RedisClient } from './redis/RedisClient.js';
import { SchedulerClient } from './scheduler/SchedulerClient.js';
import { SettingsClient } from './settings/SettingsClient.js';
import { UIClient } from './ui/UIClient.js';

export type MakeAPIClientsOptions = {
  metadata: Metadata;
  ui?: boolean;
};

export function makeAPIClients({ metadata, ui }: MakeAPIClientsOptions): ContextAPIClients {
  const redis = new RedisClient(metadata);
  const cache = makeCache(redis, {});
  const reddit = new RedditAPIClient(metadata);
  const scheduler = new SchedulerClient(metadata);
  const settings = new SettingsClient(metadata);
  const uiClient = ui ? new UIClient() : undefined;
  const media = new MediaClient(metadata);
  const assets = new AssetsClient();

  return {
    redis,
    reddit,
    scheduler,
    settings,
    media,
    assets,
    get cache() {
      return (
        cache ??
        (() => {
          throw new Error('cache() is unavailable');
        })
      );
    },
    get ui() {
      if (!uiClient) {
        throw new Error('ui client is not available');
      }
      return uiClient;
    },
  };
}
