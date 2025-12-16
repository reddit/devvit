import type {
  MediaUploadRequest,
  MediaUploadResponse,
} from '@devvit/protos/json/devvit/plugin/media/media.js';
import type { Metadata } from '@devvit/protos/lib/Types.js';
// eslint-disable-next-line no-restricted-imports
import type { MediaService } from '@devvit/protos/types/devvit/plugin/media/media.js';
import type { PluginMock } from '@devvit/shared-types/test/index.js';

type MediaStore = {
  uploads: MediaUploadRequest[];
};

export class MediaPluginMock implements MediaService {
  private readonly _store: MediaStore;

  constructor(store: MediaStore) {
    this._store = store;
  }

  async Upload(request: MediaUploadRequest, _metadata?: Metadata): Promise<MediaUploadResponse> {
    this._store.uploads.push(request);

    const mediaId = `media-${this._store.uploads.length}`;

    const extensionMap: Record<string, string> = {
      image: 'png',
      video: 'mp4',
      gif: 'gif',
    };
    const ext = extensionMap[request.type] ?? 'png';

    // Fake URL generation
    const mediaUrl = `https://i.redd.it/bogus-for-testing/${mediaId}.${ext}`;

    return {
      mediaId,
      mediaUrl,
    };
  }
}

export class MediaMock implements PluginMock<MediaService> {
  readonly plugin: MediaPluginMock;
  private readonly _store: MediaStore;

  constructor() {
    this._store = {
      uploads: [],
    };
    this.plugin = new MediaPluginMock(this._store);
  }

  /**
   * Returns the list of media upload requests that have been made.
   */
  get uploads(): MediaUploadRequest[] {
    return this._store.uploads;
  }

  /**
   * Clears all recorded uploads.
   */
  clear(): void {
    this._store.uploads = [];
  }
}
