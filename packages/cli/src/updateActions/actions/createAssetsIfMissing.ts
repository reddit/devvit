import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';

import semver from 'semver';

import type { UpdateAction } from '../types.js';

export const createAssetsIfMissing: UpdateAction = {
  description: 'create "assets" folder if missing',
  shouldRun: (oldestVersion) => {
    const runIfBeforeVersion = semver.parse('0.10.3')!;
    try {
      return semver.gt(runIfBeforeVersion, oldestVersion);
    } catch {
      return false;
    }
  },
  run: async (cmd) => {
    const assetsDir = path.join(cmd.projectRoot, 'assets');
    if (!fs.existsSync(assetsDir)) {
      await fsp.mkdir(assetsDir);
    }
  },
};
