import { type MediaService, MediaServiceDefinition, type Metadata } from '@devvit/protos';
import { context } from '@devvit/server';
import { getDevvitConfig } from '@devvit/shared-types/server/get-devvit-config.js';

import type { MediaAsset, UploadMediaOptions } from './types/media.js';

export class MediaClient {
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
    return getDevvitConfig().use(MediaServiceDefinition);
  }
}
