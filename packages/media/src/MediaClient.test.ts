import '@devvit/shared-types/shared/devvit-worker-global.js';

import { MediaServiceDefinition } from '@devvit/protos';
import { Context, runWithContext } from '@devvit/server';
import { installGlobalConfig, makeConfig, MOCK_HEADERS } from '@devvit/shared-types/test/index.js';
import { beforeAll, expect, test } from 'vitest';

import { MediaClient } from './MediaClient.js';
import { MediaMock } from './test/mocks/MediaMock.js';

const media = new MediaClient();

beforeAll(() => {
  const config = makeConfig({
    plugins: {
      [MediaServiceDefinition.fullName]: new MediaMock(),
    },
  });
  installGlobalConfig(config);
});

test('Can upload media', async () => {
  await runWithContext(Context(MOCK_HEADERS), async () => {
    const result = await media.upload({
      url: 'https://example.com/image.png',
      type: 'image',
    });

    expect(result).toStrictEqual({
      mediaId: expect.any(String),
      mediaUrl: expect.any(String),
    });
  });
});
