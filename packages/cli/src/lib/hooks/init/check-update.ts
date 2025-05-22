import type { Hook } from '@oclif/core';
import { ux } from '@oclif/core';
import type { SemVer } from 'semver';
import semver from 'semver';

import HelpCommand from '../../../commands/help.js';
import InstallCommand from '../../../commands/install.js';
import LoginCommand from '../../../commands/login.js';
import LogoutCommand from '../../../commands/logout.js';
import MetricsCommand from '../../../commands/metrics.js';
import PlaytestCommand from '../../../commands/playtest.js';
import PublishCommand from '../../../commands/publish.js';
import SettingsSetCommand from '../../../commands/settings/set.js';
import UninstallCommand from '../../../commands/uninstall.js';
import UpdateAppCommand from '../../../commands/update/app.js';
import UploadCommand from '../../../commands/upload.js';
import VersionCommand from '../../../commands/version.js';
import WhoamiCommand from '../../../commands/whoami.js';

const NPM_REGISTRY_DIST_TAGS_URL = 'https://registry.npmjs.org/-/package/@devvit/cli/dist-tags';

// Commands that should always check for updates - stuff that writes to portal
const COMMANDS_TO_FORCE_UPDATES = [
  InstallCommand.id,
  PlaytestCommand.id,
  SettingsSetCommand.id,
  PublishCommand.id,
  UninstallCommand.id,
  UpdateAppCommand.id,
  UploadCommand.id,
];

// Commands that don't need to check for updates - stuff that doesn't talk to portal & can be out
// of date and still work
const COMMANDS_TO_SKIP_UPDATE_CHECK = [
  HelpCommand.id,
  LoginCommand.id,
  LogoutCommand.id,
  MetricsCommand.id,
  VersionCommand.id,
  WhoamiCommand.id,
];

// Check updates before command execution
const hook: Hook<'init'> = async function (options) {
  // Skip update check for certain commands
  if (COMMANDS_TO_SKIP_UPDATE_CHECK.includes(options.id ?? '')) {
    return;
  }

  // Only error for specified commands, and only if --ignore-outdated is not applied
  const shouldErrorOnMismatch =
    COMMANDS_TO_FORCE_UPDATES.includes(options.id ?? '') &&
    !options.argv.includes(`--${UploadCommand.flags['ignore-outdated'].name}`);

  let latest: SemVer;
  try {
    ux.action.start('Checking for updates');
    latest = await fetchLatestPublishedVersion();
    ux.action.stop();
  } catch {
    ux.action.stop('Error');
    this.warn(
      'There was an error checking for devvit updates. The command will proceed, but you may be using an outdated version.'
    );
    // don't want to block the user if they are offline
    return;
  }

  const current = semver.parse(options.config.version) ?? semver.parse('0.0.0')!;

  if (shouldEnforceUpdate(latest, current)) {
    if (shouldErrorOnMismatch) {
      this.error(
        `The version of devvit you are using is out of date. The apps that you upload may not work as expected.\nPlease run \`npm i -g devvit\` to update.`
      );
    }
    this.warn(
      `A new version of devvit is available: ${latest}. You can run \`npm i -g devvit\` to update.`
    );
  } else if (shouldWarnUpdate(latest, current)) {
    this.warn(
      `A new version of devvit is available: ${latest}. You can run \`npm i -g devvit\` to update.`
    );
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
