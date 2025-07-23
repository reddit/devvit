import { type MediaService, MediaServiceDefinition, type Metadata } from '@devvit/protos';
import { context } from '@devvit/server';
import { getDevvitConfig } from '@devvit/server/get-devvit-config.js';

import type { MediaAsset, UploadMediaOptions } from './types/media.js';

export class MediaClient {
  readonly #mediaPlugin: MediaService;

  constructor() {
    this.#mediaPlugin = getDevvitConfig().use<MediaService>(MediaServiceDefinition);
  }

  async upload(opts: UploadMediaOptions): Promise<MediaAsset> {
    const response = await this.#mediaPlugin.Upload(opts, this.#metadata);
    if (!response.mediaId) {
      throw new Error('unable to get mediaId via uploads');
    }
    return { mediaId: response.mediaId, mediaUrl: response.mediaUrl };
  }

  get #metadata(): Metadata {
    return context.metadata;
  }
}

export const media = new MediaClient();
