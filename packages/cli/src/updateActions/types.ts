import semver from 'semver';

import UpdateApp from '../commands/update/app.js';

export type UpdateAction = {
  description: string;
  shouldRun: (oldestVersion: semver.SemVer) => boolean | Promise<boolean>;
  run: (cmd: UpdateApp) => void | Promise<void>;
};
