import { readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';

import {
  isDependencyManagedByDevvit,
  isDevvitDependency,
} from '@devvit/shared-types/isDevvitDependency.js';
import { ux } from '@oclif/core';
import type { Tree } from '@oclif/core/lib/cli-ux/styled/tree.js';
import chalk from 'chalk';
import inquirer from 'inquirer';
import type { SemVer } from 'semver';
import semver from 'semver';
import glob from 'tiny-glob';

import { UPDATE_ACTIONS } from '../../updateActions/index.js';
import { DevvitCommand } from '../../util/commands/DevvitCommand.js';
import type { PackageJSON } from '../../util/package-managers/package-util.js';

const require = createRequire(import.meta.url);

// eslint-disable-next-line security/detect-non-literal-require
const cliPackageJSON = require(require.resolve(`@devvit/cli/package.json`));

export default class UpdateApp extends DevvitCommand {
  static override description =
    "Update @devvit project dependencies to the currently installed CLI's version";

  static override examples = ['$ devvit update app'];

  protected override async init(): Promise<void> {
    await super.init();

    const devvitVersion = semver.parse(cliPackageJSON.version);
    const result = await matchDevvitPackageVersions(this.projectRoot, devvitVersion!, true);

    if (!result.success) {
      process.exit(1);
    }

    await this.doUpdatesSince(result.oldestVersion);
  }

  async doUpdatesSince(oldestVersion: semver.SemVer): Promise<void> {
    let isFirstAction = true;
    let isSuccess = true;

    for (const action of UPDATE_ACTIONS) {
      if (await action.shouldRun(oldestVersion)) {
        try {
          if (isFirstAction) {
            this.log('Performing update actions:');
            isFirstAction = false;
          }
          ux.action.start(`Attempting to ${action.description}`);
          await action.run(this);
          ux.action.stop();
        } catch (err) {
          ux.action.stop('Error');
          isSuccess = false;
          this.warn(`An error occurred while attempting to ${action.description}:`);
          this.warn(err as Error);
          this.warn(
            `You should manually check and verify that this update has been performed correctly.`
          );
        }
      }
    }
    if (!isSuccess) {
      return;
    }
    this.log('Update successful!');
    this.log(`Please run ${chalk.cyan('`npm i` or `yarn`')} to install the updated dependencies.`);
  }

  async run(): Promise<void> {}
}

export type VersionUpgradeResult =
  | {
      success: false;
      oldestVersion: undefined;
    }
  | {
      success: true;
      oldestVersion: SemVer;
    };

/**
 * @param projectRoot the path to the root of the project
 * @param devvitVersion the version of currently installed devvit to match
 * @param forceUpdate set to true if we want to update without prompting the user
 */
export async function matchDevvitPackageVersions(
  projectRoot: string,
  devvitVersion: SemVer,
  forceUpdate: boolean = false
): Promise<VersionUpgradeResult> {
  const packageJsons = await findPackageJsonPaths(projectRoot);

  const tree = ux.tree();
  for (const pkgJsonPath of packageJsons) {
    const pkgJson: PackageJSON = JSON.parse(await readFile(pkgJsonPath, 'utf8'));
    pkgJson.dependencies ??= {};
    pkgJson.devDependencies ??= {};

    const pkgJsonSubtree = ux.tree();
    const dependenciesNeedingSyncSubtree = makeDepsSubtree(
      pkgJson.dependencies,
      devvitVersion,
      forceUpdate
    );
    const devDependenciesNeedingSyncSubtree = makeDepsSubtree(
      pkgJson.devDependencies,
      devvitVersion,
      forceUpdate
    );

    if (Object.keys(dependenciesNeedingSyncSubtree.nodes ?? {}).length) {
      pkgJsonSubtree.insert('dependencies', dependenciesNeedingSyncSubtree);
    }
    if (Object.keys(devDependenciesNeedingSyncSubtree.nodes ?? {}).length) {
      pkgJsonSubtree.insert('devDependencies', devDependenciesNeedingSyncSubtree);
    }

    if (Object.keys(pkgJsonSubtree.nodes ?? {}).length) {
      tree.insert(pkgJsonPath, pkgJsonSubtree);
    }
  }

  if (!Object.keys(tree.nodes ?? {}).length) {
    // There's nothing older than the current version :+1:
    return { success: true, oldestVersion: devvitVersion };
  }

  console.log(
    chalk.bold(
      `Found dependencies that need to be synced to the local devvit version (${devvitVersion.version}): `
    )
  );
  tree.display();

  const { action } = await inquirer.prompt([
    {
      name: 'action',
      message: 'What would you like to do?',
      type: 'list',
      choices: [
        {
          name: 'Sync all devvit dependencies to the current devvit version (recommended)',
          value: 'sync',
        },
        {
          name: 'Resolve manually',
          value: 'manual',
        },
      ],
    },
  ]);
  if (action === 'manual') {
    console.log('Please resolve your @devvit versions manually and re-run this command.');
    return { success: false, oldestVersion: undefined };
  }

  const confirmationMessage =
    'Are you sure? This will change devvit dependencies, which may introduce breaking changes to your app:\n';

  const { confirm } = await inquirer.prompt([
    {
      name: 'confirm',
      message: confirmationMessage,
      type: 'confirm',
    },
  ]);

  if (!confirm) {
    console.log('Please resolve your @devvit versions manually and re-run this command.');
    return { success: false, oldestVersion: undefined };
  }
  try {
    const oldestVersion = await syncDevvitDependencies(devvitVersion, packageJsons, forceUpdate);

    return { success: true, oldestVersion: oldestVersion ?? semver.parse('0.0.0')! };
  } catch (err) {
    if (forceUpdate) {
      return { success: true, oldestVersion: semver.parse('0.0.0')! };
    }
    console.log('Could not determine @devvit library versions in package.json', err);
    return { success: false, oldestVersion: undefined };
  }
}

async function syncDevvitDependencies(
  devvitVersion: SemVer,
  packageJsons: string[],
  forceUpdate: boolean
): Promise<SemVer | null> {
  let oldestVersion: SemVer | null = null;

  for (const pkgJsonPath of packageJsons) {
    const pkgJson: PackageJSON = JSON.parse(await readFile(pkgJsonPath, 'utf8'));
    pkgJson.dependencies ??= {};
    pkgJson.devDependencies ??= {};

    overwriteDependencies(devvitVersion, forceUpdate, pkgJson.dependencies);
    overwriteDependencies(devvitVersion, forceUpdate, pkgJson.devDependencies);

    await writeFile(pkgJsonPath, JSON.stringify(pkgJson, null, 2));

    // If this has a valid semver version, and it's either less than our current oldest or we don't
    // have a current oldest, update our oldest to this version
    const thisVersion = semver.parse(pkgJson.version);
    if (thisVersion && (!oldestVersion || semver.lt(thisVersion, oldestVersion))) {
      oldestVersion = thisVersion;
    }
  }

  return oldestVersion;
}

function overwriteDependencies(
  devvitVersion: semver.SemVer,
  forceUpdate: boolean,
  dependencies: { [packageName: string]: string }
): void {
  const dependenciesWeManage = Object.entries(dependencies).filter(([depName]) =>
    isDependencyManagedByDevvit(depName)
  );

  for (const [depName, version] of dependenciesWeManage) {
    const newSemVer = getTargetSemVer(devvitVersion, depName);

    if (isDevvitDependency(depName) || forceUpdate || needsSync(version, newSemVer)) {
      // If this is an @devvit dependency, or we're forcing an update, or the version needs to be
      // updated, update the version.
      dependencies![depName] = newSemVer.version;
    }
  }
}

/**
 * @param projectRoot the path to the root of the project
 * @returns a list of paths to package jsons
 */
async function findPackageJsonPaths(projectRoot: string): Promise<string[]> {
  // is there a better way to glob package.jsons and exclude those nested in node_modules?
  const allPackageJsons = await glob(`${projectRoot}/**/package.json`);
  return allPackageJsons.filter((path) => !/node_modules/.test(path));
}

/**
 * @param version the version of the package in package.json
 * @param devvitVersion the version of currently installed devvit to match
 */
function needsSync(version: string, devvitVersion: SemVer): boolean {
  const minVersionToSatisfyRange = semver.minVersion(version);
  const nonBreakingRange = `^${minVersionToSatisfyRange?.version ?? '0.0.0'}`;
  return !semver.satisfies(devvitVersion, nonBreakingRange, {
    includePrerelease: true,
  });
}

function makeDepsSubtree(
  dependencies: Readonly<Record<string, string>>,
  devvitVersion: Readonly<SemVer>,
  forceUpdate: boolean
): Tree {
  const tree = ux.tree();
  for (const [dep, v] of Object.entries(dependencies)) {
    if (isDependencyManagedByDevvit(dep)) {
      // For most dependencies, we want to target the version of devvit that the CLI is using
      const targetSemVer = getTargetSemVer(devvitVersion, dep);

      if (v === targetSemVer.version) {
        continue;
      }

      if (forceUpdate || needsSync(v, targetSemVer)) {
        const vAsSemver = semver.parse(v);

        if (!vAsSemver) {
          // version was a range that's not parsable
          tree.insert(`${dep} (${chalk.gray(v)}) -> (${chalk.green(targetSemVer)})`);
        } else {
          const warnColor = semver.gt(vAsSemver, targetSemVer) ? chalk.red : chalk.yellow;
          tree.insert(`${dep} (${warnColor(vAsSemver)}) -> (${chalk.green(targetSemVer)})`);
        }
      }
    }
  }
  return tree;
}

function getTargetSemVer(devvitVersion: SemVer, dep: string): SemVer {
  // For `@devvit` dependencies, we want to target the version of devvit that the CLI is using
  if (isDevvitDependency(dep)) {
    return devvitVersion;
  }

  // But this is a managed dependency that isn't a devvit one - target the version that the CLI is using
  const parsedSemVer = semver.parse(
    cliPackageJSON.dependencies[dep] ?? cliPackageJSON.devDependencies[dep]
  );
  if (!parsedSemVer) {
    throw new Error(
      "Couldn't find the CLI's dependency for " +
        dep +
        " in `@devvit/cli`'s package.json - this should never happen, tell a Reddit dev!"
    );
  }
  return parsedSemVer;
}
