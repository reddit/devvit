import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';

import semver from 'semver';

import type { UpdateAction } from '../types.js';

export const migrateTsconfigToPublicAPI: UpdateAction = {
  description: 'migrate @devvit/tsconfig references to @devvit/public-api',
  shouldRun: (oldestVersion) => {
    const runIfBeforeVersion = semver.parse('0.10.9')!;
    try {
      return semver.gt(runIfBeforeVersion, oldestVersion);
    } catch {
      return false;
    }
  },
  run: async (cmd) => {
    const tsconfigPath = path.join(cmd.projectRoot, 'tsconfig.json');
    if (fs.existsSync(tsconfigPath)) {
      try {
        const tsconfig = await fsp.readFile(tsconfigPath, 'utf8');
        await fsp.writeFile(
          tsconfigPath,
          tsconfig.replaceAll(
            '@devvit/tsconfig/devvit.tsconfig.json',
            '@devvit/public-api/devvit.tsconfig.json'
          )
        );
      } catch (err) {
        console.error(
          `skipping failed migration: ${err instanceof Error ? err.message : String(err)}`
        );
      }
    }
  },
};
