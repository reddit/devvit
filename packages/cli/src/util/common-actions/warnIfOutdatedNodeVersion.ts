import { TargetRuntime } from '@devvit/protos/json/devvit/runtime/bundle.js';
// eslint-disable-next-line no-restricted-imports
import type { Bundle } from '@devvit/protos/types/devvit/plugin/buildpack/buildpack_common.js';
import semver from 'semver';

import { MIN_RECOMMENDED_NODE_MAJOR } from '../../constants/Environment.js';
import type { DevvitCommand } from '../commands/DevvitCommand.js';

const NODE_INSTALL_DOCS_URL = 'https://docs.npmjs.com/downloading-and-installing-node-js-and-npm';

/**
 * Warns (non-blocking) if the app was built with an outdated Node.js version.
 * The Node.js version is read from the universal bundle's BuildInfo, which
 * records the version the CLI ran under at build time. No-op if there's no
 * universal bundle or no recorded/outdated version.
 */
export function warnIfOutdatedNodeVersion(command: DevvitCommand, bundles: Bundle[]): void {
  const mainBundle = bundles.find(
    (bundle) => bundle.buildInfo?.targetRuntime === TargetRuntime.UNIVERSAL
  );
  if (!mainBundle) {
    return;
  }

  const nodeVersion = mainBundle.buildInfo?.dependencies?.node;
  if (!nodeVersion) {
    return;
  }
  if (isNodeVersionOutdated(nodeVersion)) {
    command.warn(nodeVersionWarning(nodeVersion));
  }
}

/**
 * Returns true if the given Node.js version is older than the minimum
 * recommended major (see MIN_RECOMMENDED_NODE_MAJOR). Returns false for missing
 * or unparseable versions so we never warn on bad data.
 * @arg nodeVersion The recorded Node.js version, eg "22.1.0" or "v22.1.0".
 */
export function isNodeVersionOutdated(nodeVersion: string): boolean {
  const parsed = semver.parse(nodeVersion);
  if (!parsed) {
    return false;
  }
  return parsed.major < MIN_RECOMMENDED_NODE_MAJOR;
}

/** The warning message shown when an app was built with an outdated Node.js version. */
export function nodeVersionWarning(nodeVersion: string): string {
  return (
    `This app was built with Node.js ${nodeVersion}, which is outdated. ` +
    `We recommend Node.js ${MIN_RECOMMENDED_NODE_MAJOR}. ` +
    `See ${NODE_INSTALL_DOCS_URL} for how to upgrade.`
  );
}
