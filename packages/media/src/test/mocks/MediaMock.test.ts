import { MediaServiceDefinition } from '@devvit/protos';
import { makeConfig } from '@devvit/shared-types/test/index.js';
import { describe, expect, it } from 'vitest';

import { MediaMock } from './MediaMock.js';

describe('MediaMock', () => {
  it('should upload media', async () => {
    const mediaMock = new MediaMock();
    const res = await mediaMock.Upload({ url: 'http://example.com/image.jpg', type: 'image/jpeg' });

    expect(res.mediaId).toBeDefined();
    expect(res.mediaUrl).toBeDefined();
    expect(res.mediaUrl).toContain(res.mediaId);
  });

  it('should clear uploads', async () => {
    const mock = new MediaMock();
    await mock.Upload({ url: 'http://example.com/1.jpg', type: 'image/jpeg' });

    mock.clear();
    expect(mock.uploads).toHaveLength(0);
  });

  it('should isolate uploads between instances', async () => {
    const mock1 = new MediaMock();
    const mock2 = new MediaMock();

    await mock1.Upload({ url: 'http://example.com/A.jpg', type: 'image/jpeg' });
    await mock2.Upload({ url: 'http://example.com/B.jpg', type: 'image/jpeg' });

    expect(mock1.uploads).toHaveLength(1);
    expect(mock1.uploads[0].url).toBe('http://example.com/A.jpg');

    expect(mock2.uploads).toHaveLength(1);
    expect(mock2.uploads[0].url).toBe('http://example.com/B.jpg');
  });

  it('should wire through makeConfig', async () => {
    const config = makeConfig({
      plugins: {
        [MediaServiceDefinition.fullName]: new MediaMock(),
      },
    });
    const mock = config.use(MediaServiceDefinition) as MediaMock;

    expect(mock).toBeInstanceOf(MediaMock);

    const res = await mock.Upload({ url: 'http://example.com/config.jpg', type: 'image/jpeg' });
    expect(res.mediaId).toBeDefined();
  });
});
