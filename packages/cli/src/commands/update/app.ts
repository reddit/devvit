import fs from 'node:fs';
import fsp, { readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';

import { isDevvitDependency } from '@devvit/shared-types/isDevvitDependency.js';
import { ux } from '@oclif/core';
import type { Tree } from '@oclif/core/lib/cli-ux/styled/tree.js';
import chalk from 'chalk';
import inquirer from 'inquirer';
import type { SemVer } from 'semver';
import semver from 'semver';
import glob from 'tiny-glob';

import { ProjectCommand } from '../../util/commands/ProjectCommand.js';
import type { PackageJSON } from '../../util/package-managers/package-util.js';

const require = createRequire(import.meta.url);

// eslint-disable-next-line security/detect-non-literal-require
const cliPackageJSON = require(require.resolve(`@devvit/cli/package.json`));

export default class UpdateApp extends ProjectCommand {
  static override description =
    "Update @devvit project dependencies to the currently installed CLI's version";

  static override examples = ['$ devvit update app'];

  protected override async init(): Promise<void> {
    await this.assertProject();

    const devvitVersion = semver.parse(cliPackageJSON.version);
    const result = await matchDevvitPackageVersions(this.projectRoot, devvitVersion!, true);

    if (!result.success) {
      this.exit(1);
      // `this.exit` never returns, but it's typed as `void` not `never`, so we need to return for type safety
      return;
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
          ux.action.start(`Attempting to ${action.description}...`);
          await action.run(this);
          ux.action.stop('done!');
        } catch (err) {
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

type UpdateAction = {
  description: string;
  shouldRun: (oldestVersion: semver.SemVer) => boolean | Promise<boolean>;
  run: (cmd: UpdateApp) => void | Promise<void>;
};

const UPDATE_ACTIONS: UpdateAction[] = [
  {
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
  },
  {
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
  },
];

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
      `Found devvit dependencies that need to be synced to the local devvit version (${devvitVersion.version}): `
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
  const devvitDependencies = Object.entries(dependencies).filter(([depName]) =>
    isDevvitDependency(depName)
  );

  for (const [depName, version] of devvitDependencies) {
    if (forceUpdate || needsSync(version, devvitVersion)) {
      dependencies![depName] = devvitVersion.version;
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
    if (isDevvitDependency(dep)) {
      if (v === devvitVersion.version) {
        return tree;
      }

      if (forceUpdate || needsSync(v, devvitVersion)) {
        const vAsSemver = semver.parse(v);

        if (!vAsSemver) {
          // version was a range that's not parsable
          tree.insert(`${dep} (${chalk.gray(v)}) -> (${chalk.green(devvitVersion)})`);
        } else {
          const warnColor = semver.gt(vAsSemver, devvitVersion) ? chalk.red : chalk.yellow;
          tree.insert(`${dep} (${warnColor(vAsSemver)}) -> (${chalk.green(devvitVersion)})`);
        }
      }
    }
  }
  return tree;
}
