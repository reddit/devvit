import {
  type MediaService,
  type MediaUploadRequest,
  type MediaUploadResponse,
  type Metadata,
} from '@devvit/protos';

export class MediaMock implements MediaService {
  private _uploads: MediaUploadRequest[] = [];

  async Upload(request: MediaUploadRequest, _metadata?: Metadata): Promise<MediaUploadResponse> {
    this._uploads.push(request);

    const mediaId = `media-${this._uploads.length}`;

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
    return this._uploads;
  }

  clear(): void {
    this._uploads = [];
  }
}
