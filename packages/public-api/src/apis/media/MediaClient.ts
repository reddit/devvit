import { Devvit } from '../../devvit/Devvit.js';
import type { MediaPlugin, MediaAsset, UploadMediaOptions } from '../../types/media.js';
import type { Metadata } from '@devvit/protos';

export class MediaClient implements MediaPlugin {
  readonly #metadata: Metadata;

  constructor(metadata: Metadata) {
    this.#metadata = metadata;
  }

  async upload(opts: UploadMediaOptions): Promise<MediaAsset> {
    const response = await Devvit.mediaPlugin.Upload(opts, this.#metadata);
    if (!response.mediaId) {
      throw new Error('unable to get mediaId via uploads');
    }
    return Promise.resolve({ mediaId: response.mediaId, mediaUrl: response.mediaUrl });
  }
}
