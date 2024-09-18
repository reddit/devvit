import type { AssetMap } from '@devvit/shared-types/Assets.js';
import { beforeAll, describe, expect, test } from 'vitest';

import { Devvit } from '../../devvit/Devvit.js';
import { AssetsClient } from './AssetsClient.js';

const ASSET_1 = 'test1.jpg';
const ASSET_2 = 'test2.jpg';

const ASSETS: AssetMap = {
  [ASSET_1]: 'https://i.redd.it/test1.jpg',
  [ASSET_2]: 'https://i.redd.it/test2.jpg',
};

const DATA_URL = 'data:image/svg+xml;charset=UTF-8;base64,foo';

describe('AssetsClient', () => {
  beforeAll(() => {
    Object.keys(ASSETS).forEach((asset) => (Devvit.assets[asset] = ASSETS[asset]));
  });

  test('should work when getting a single asset URL', () => {
    const client = new AssetsClient();
    const path = client.getURL(ASSET_1);
    expect(path).toBe(ASSETS[ASSET_1]);
  });
  test('should work when getting multiple asset URLs', () => {
    const client = new AssetsClient();

    const path = client.getURL([ASSET_1, ASSET_2]);
    expect(path[ASSET_1]).toBe(ASSETS[ASSET_1]);
    expect(path[ASSET_2]).toBe(ASSETS[ASSET_2]);
  });
  test('should work when getting a data URL', () => {
    const client = new AssetsClient();

    const path = client.getURL(DATA_URL);
    expect(path).toBe(DATA_URL);
  });
  test('should fail when getting an invalid URL', () => {
    const client = new AssetsClient();

    const path = client.getURL('://foo');
    expect(path).toBeFalsy();
  });
});
