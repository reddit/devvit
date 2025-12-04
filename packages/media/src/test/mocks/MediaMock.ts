import {
  type MediaService,
  type MediaUploadRequest,
  type MediaUploadResponse,
  type Metadata,
} from '@devvit/protos';

export class MediaMock implements MediaService {
  // Static store to persist uploads across instances, scoped by installationId
  private static _store = new Map<string, MediaUploadRequest[]>();
  private readonly _installationId: string;

  constructor(installationId?: string) {
    this._installationId = installationId ?? '';
    if (this._installationId && !MediaMock._store.has(this._installationId)) {
      MediaMock._store.set(this._installationId, []);
    }
  }

  async Upload(request: MediaUploadRequest, _metadata?: Metadata): Promise<MediaUploadResponse> {
    const uploads = this._getUploads();
    uploads.push(request);

    const mediaId = `media-${uploads.length}`;

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

  get uploads(): MediaUploadRequest[] {
    return this._getUploads();
  }

  private _getUploads(): MediaUploadRequest[] {
    return MediaMock._store.get(this._installationId) ?? [];
  }
}
