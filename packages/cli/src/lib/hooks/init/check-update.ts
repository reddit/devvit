import type { Hook } from '@oclif/core';
import type { SemVer } from 'semver';
import semver from 'semver';
import fetch from 'node-fetch';
import { ux } from '@oclif/core';
import inquirer from 'inquirer';

import UploadCommand from '../../../commands/upload.js';
import StartCommand from '../../../commands/start.js';

const NPM_REGISTRY_DIST_TAGS_URL = 'https://registry.npmjs.org/-/package/@devvit/cli/dist-tags';

const COMMANDS_TO_CHECK_UPDATES = [UploadCommand.id, StartCommand.id];

const hook: Hook<'init'> = async function (options) {
  // Check updates
  if (COMMANDS_TO_CHECK_UPDATES.includes(options.id ?? '')) {
    let latest;
    try {
      ux.action.start('Checking for updates...');
      latest = await fetchLatestPublishedVersion();
      ux.action.stop('✅');
    } catch (e) {
      this.warn(
        'There was an error checking for devvit updates. The command will proceed, but you may be using an outdated version.'
      );
      // don't want to block the user if they are offline
      return;
    }

    const current = semver.parse(options.config.version) ?? semver.parse('0.0.0')!;

    if (shouldEnforceUpdate(latest, current)) {
      this.warn(
        `The version of devvit you are using is out of date. The apps that you upload may not work as expected. Please run \`npm i -g devvit\` to update.`
      );
      const { proceed } = await inquirer.prompt<{ proceed: boolean }>([
        {
          name: 'proceed',
          message: 'Do you want to proceed without upgrading devvit?',
          type: 'confirm',
          default: false,
        },
      ]);
      if (!proceed) {
        this.error('Please run `npm i -g devvit` to update.');
      }
    } else if (shouldWarnUpdate(latest, current)) {
      this.warn(
        `A new version of devvit is available: ${latest}. You can run \`npm i -g devvit\` to update.`
      );
    }
  }
};

// region util functions
async function fetchLatestPublishedVersion(): Promise<SemVer> {
  const rsp = await fetch(NPM_REGISTRY_DIST_TAGS_URL);
  const jsonResult = (await rsp.json()) as { latest: string };

  if (!rsp.ok) throw Error(`HTTP error ${rsp.status}: ${rsp.statusText}`);

  return semver.parse(jsonResult.latest)!;
}

export function shouldWarnUpdate(latest: SemVer, current: SemVer): boolean {
  return semver.gt(latest, current);
}

// implies that latest has introduced breaking changes
export function shouldEnforceUpdate(latest: SemVer, current: SemVer): boolean {
  // if current is greater or equal to the latest version, allow and skip update (e.g. if user is on @next)
  if (semver.gte(current, latest)) {
    return false;
  }
  return !semver.satisfies(current, semver.minVersion(latest.version)?.version ?? '0.0.0', {
    includePrerelease: true,
  });
}
// endregion

export default hook;
