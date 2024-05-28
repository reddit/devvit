import type { Metadata, UIRequest } from '@devvit/protos';
import { Devvit } from '../../../Devvit.js';
import { useState } from './useState.js';
import { useInterval } from './useInterval.js';
import { ModLogClient } from '../../../../apis/modLog/ModLogClient.js';
import { KeyValueStorage } from '../../../../apis/key-value-storage/KeyValueStorage.js';
import { RedisClient } from '../../../../apis/redis/RedisClient.js';
import { SchedulerClient } from '../../../../apis/scheduler/SchedulerClient.js';
import { RedditAPIClient } from '../../../../apis/reddit/RedditAPIClient.js';
import { SettingsClient } from '../../../../apis/settings/SettingsClient.js';
import { MediaClient } from '../../../../apis/media/MediaClient.js';
import { AssetsClient } from '../../../../apis/AssetsClient/AssetsClient.js';
import { RealtimeClient } from '../../../../apis/realtime/RealtimeClient.js';
import type { ContextAPIClients } from '../../../../types/context.js';
import { getContextFromMetadata } from '../../context.js';
import { UIClient } from './UIClient.js';
import type { RenderContext } from './RenderContext.js';
import { useForm } from './useForm.js';
import { Header } from '@devvit/shared-types/Header.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const UnimplementedProxy: any = new Proxy(
  {},
  {
    get: function (_target, prop, _receiver) {
      throw new Error(`Unimplemented API: ${String(prop)}`);
    },
  }
);

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
    const assets = new AssetsClient(metadata, () => Devvit.assetsPlugin);
    const realtime = new RealtimeClient(metadata);
    const cache = UnimplementedProxy;
    const useChannel = UnimplementedProxy;
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
      useForm,
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
