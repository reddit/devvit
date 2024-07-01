import type { Metadata, UIRequest } from '@devvit/protos';
import { Header } from '@devvit/shared-types/Header.js';
import { AssetsClient } from '../../../../apis/AssetsClient/AssetsClient.js';
import { KeyValueStorage } from '../../../../apis/key-value-storage/KeyValueStorage.js';
import { MediaClient } from '../../../../apis/media/MediaClient.js';
import { ModLogClient } from '../../../../apis/modLog/ModLogClient.js';
import { RealtimeClient } from '../../../../apis/realtime/RealtimeClient.js';
import { RedditAPIClient } from '../../../../apis/reddit/RedditAPIClient.js';
import { RedisClient } from '../../../../apis/redis/RedisClient.js';
import { SchedulerClient } from '../../../../apis/scheduler/SchedulerClient.js';
import { SettingsClient } from '../../../../apis/settings/SettingsClient.js';
import type { ContextAPIClients } from '../../../../types/context.js';
import type { Devvit } from '../../../Devvit.js';
import { getContextFromMetadata } from '../../context.js';
import type { RenderContext } from './RenderContext.js';
import { UIClient } from './UIClient.js';
import { useChannel } from './useChannel.js';
import { useForm } from './useForm.js';
import { useInterval } from './useInterval.js';
import { useState } from './useState.js';
import { makeCache } from './cache.js';

export class ContextBuilder {
  public buildContext(
    renderContext: RenderContext,
    request: UIRequest,
    metadata: Metadata
  ): Devvit.Context {
    const modLog = new ModLogClient(metadata);
    const kvStore = new KeyValueStorage(metadata);
    const redis = new RedisClient(metadata);
    const reddit = new RedditAPIClient(metadata);
    const scheduler = new SchedulerClient(metadata);
    const settings = new SettingsClient(metadata);
    const ui = new UIClient(renderContext);
    const media = new MediaClient(metadata);
    const assets = new AssetsClient();
    const realtime = new RealtimeClient(metadata);
    const cache = makeCache(redis, renderContext._state);
    const apiClients: ContextAPIClients = {
      modLog,
      kvStore,
      redis,
      reddit,
      scheduler,
      settings,
      media,
      assets,
      realtime,
      ui,
      useState,
      useChannel,
      useInterval,
      useForm: useForm as ContextAPIClients['useForm'],
      cache,
      dimensions: request.env?.dimensions,
      uiEnvironment: {
        timezone: metadata[Header.Timezone]?.values[0],
        locale: metadata[Header.Language]?.values[0],
        dimensions: request.env?.dimensions,
      },
    };

    // TODO: Would commentId ever be needed for the blocks handler context?
    // You'd want something like....
    // const baseContext = getContextFromMetadata(metadata, request.props?.postId, request.props?.commentId);
    const baseContext = getContextFromMetadata(metadata, request.props?.postId);
    baseContext.debug.effects = renderContext;
    return { ...baseContext, ...apiClients };
  }
}
