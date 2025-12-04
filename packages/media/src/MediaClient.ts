import { type MediaService, MediaServiceDefinition, type Metadata } from '@devvit/protos';
import { context } from '@devvit/server';
import type { Config } from '@devvit/shared-types/Config.js';
import { getDevvitConfig } from '@devvit/shared-types/server/get-devvit-config.js';

import type { MediaAsset, UploadMediaOptions } from './types/media.js';

export class MediaClient {
  #pluginCache = new WeakMap<Config, MediaService>();

  async upload(opts: UploadMediaOptions): Promise<MediaAsset> {
    const response = await this.#plugin.Upload(opts, this.#metadata);
    if (!response.mediaId) {
      throw new Error('unable to get mediaId via uploads');
    }
    return { mediaId: response.mediaId, mediaUrl: response.mediaUrl };
  }

  get #metadata(): Metadata {
    return context.metadata;
  }

  get #plugin(): MediaService {
    const config = getDevvitConfig();
    const cached = this.#pluginCache.get(config);
    if (cached) {
      return cached;
    }
    const plugin = config.use<MediaService>(MediaServiceDefinition);
    this.#pluginCache.set(config, plugin);
    return plugin;
  }
}
