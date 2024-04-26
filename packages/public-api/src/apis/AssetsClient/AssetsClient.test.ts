import { describe, expect, test } from 'vitest';
import { AssetsClient } from './AssetsClient.js';
import type {
  AssetResolver,
  GetAssetURLRequest,
  GetAssetURLResponse,
  GetMultipleAssetURLsRequest,
  GetMultipleAssetURLsResponse,
} from '@devvit/protos';

describe('AssetsClient', () => {
  test('should work when getting a single asset URL', async () => {
    const client = new AssetsClient({}, makeMockkAssetResolver());

    const path = await client.getURL('test.png');
    expect(path).toBe(`https://i.redd.it/test.png`);
  });
  test('should work when getting multiple asset URLs', async () => {
    const client = new AssetsClient({}, makeMockkAssetResolver());

    const path = await client.getURL(['test1.png', 'test2.jpg']);
    expect(path['test1.png']).toBe(`https://i.redd.it/test1.png`);
    expect(path['test2.jpg']).toBe(`https://i.redd.it/test2.jpg`);
  });
});

function makeMockkAssetResolver(): () => AssetResolver {
  return () => ({
    async GetAssetURL(request: GetAssetURLRequest): Promise<GetAssetURLResponse> {
      return {
        found: true,
        url: `https://i.redd.it/${request.path}`,
      };
    },

    async GetAssetURLs(
      request: GetMultipleAssetURLsRequest
    ): Promise<GetMultipleAssetURLsResponse> {
      const retval: GetMultipleAssetURLsResponse = {
        urls: {},
      };

      for (const path of request.paths) {
        retval.urls[path] = {
          found: true,
          paths: [`https://i.redd.it/${path}`],
        };
      }

      return retval;
    },
  });
}
