import type { Metadata } from '@devvit/protos';
import type { BlocksReconciler } from '../devvit/internals/blocks/BlocksReconciler.js';
import { makeUseChannelHook } from '../devvit/internals/blocks/useChannel.js';
import { makeUseFormHook } from '../devvit/internals/blocks/useForm.js';
import { makeUseIntervalHook } from '../devvit/internals/blocks/useInterval.js';
import { makeUseStateHook } from '../devvit/internals/blocks/useState.js';
import type { ContextAPIClients } from '../index.js';
import { Devvit } from '../index.js';
import { AssetsClient } from './AssetsClient/AssetsClient.js';
import { KeyValueStorage } from './key-value-storage/KeyValueStorage.js';
import { MediaClient } from './media/MediaClient.js';
import { ModLogClient } from './modLog/ModLogClient.js';
import { RedditAPIClient } from './reddit/RedditAPIClient.js';
import { RedisClient } from './redis/RedisClient.js';
import { SchedulerClient } from './scheduler/SchedulerClient.js';
import { SettingsClient } from './settings/SettingsClient.js';
import { UIClient } from './ui/UIClient.js';
import { makeCache } from '../devvit/internals/cache.js';
import { RealtimeClient } from './realtime/RealtimeClient.js';

export type MakeAPIClientsOptions = {
  metadata: Metadata;
  ui?: boolean;
  hooks?: boolean;
  reconciler?: BlocksReconciler;
};

export function makeAPIClients({
  metadata,
  ui,
  hooks,
  reconciler,
}: MakeAPIClientsOptions): ContextAPIClients {
  const modLog = new ModLogClient(metadata);
  const kvStore = new KeyValueStorage(metadata);
  const redis = new RedisClient(metadata);
  const cache = makeCache(redis, reconciler ? reconciler.state : {});
  const reddit = new RedditAPIClient(metadata);
  const scheduler = new SchedulerClient(metadata);
  const settings = new SettingsClient(metadata);
  const uiClient = ui ? new UIClient(reconciler) : undefined;
  const media = new MediaClient(metadata);
  const assets = new AssetsClient(metadata, () => Devvit.assetsPlugin);
  const realtime = new RealtimeClient(metadata);
  const useState = hooks && reconciler ? makeUseStateHook(reconciler) : undefined;
  const useInterval = hooks && reconciler ? makeUseIntervalHook(reconciler) : undefined;
  const useForm = hooks && reconciler ? makeUseFormHook(reconciler) : undefined;
  const useChannel = hooks && reconciler ? makeUseChannelHook(reconciler) : undefined;

  return {
    modLog,
    kvStore,
    redis,
    reddit,
    scheduler,
    settings,
    media,
    assets,
    realtime,
    get useForm() {
      return (
        useForm ??
        (() => {
          throw new Error('useForm() is unavailable');
        })
      );
    },
    get cache() {
      return (
        cache ??
        (() => {
          throw new Error('cache() is unavailable');
        })
      );
    },
    get useState() {
      return (
        useState ??
        (() => {
          throw new Error('useState() is unavailable');
        })
      );
    },
    get useInterval() {
      return (
        useInterval ??
        (() => {
          throw new Error('useInterval() is unavailable');
        })
      );
    },
    get useChannel() {
      return (
        useChannel ??
        (() => {
          throw new Error('useChannel() is unavailable');
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
