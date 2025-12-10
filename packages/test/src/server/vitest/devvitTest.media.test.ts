import { media } from '@devvit/media';
import { expect } from 'vitest';

import { createDevvitTest } from './devvitTest.js';

const test = createDevvitTest();

test('can upload media', async ({ mocks }) => {
  const response = await media.upload({
    url: 'https://example.com/image.png',
    type: 'image',
  });

  expect(response.mediaId).toBeDefined();
  expect(response.mediaUrl).toBeDefined();

  expect(mocks.media.uploads.length).toBe(1);
  expect(mocks.media.uploads[0].url).toBe('https://example.com/image.png');

  mocks.media.clear();
  expect(mocks.media.uploads).toHaveLength(0);
});
