import { Bundle } from '@devvit/protos/types/devvit/plugin/buildpack/buildpack_common.js';

import { modifyBundleVersions } from '../commands/playtest.js';

test('bundle has a version and is modified', () => {
  const bundle: Bundle = { assetIds: {}, code: '', webviewAssetIds: {} };

  modifyBundleVersions([bundle], '1.2.3.4');

  expect(bundle?.dependencies?.actor?.version).toBe('1.2.3.4');
});
