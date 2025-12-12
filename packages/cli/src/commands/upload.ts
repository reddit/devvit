import { exec } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

import {
  AppVersionInfo,
  FullAppInfo,
  FullInstallationInfo,
  VersionVisibility,
} from '@devvit/protos/community.js';
import type { Bundle } from '@devvit/protos/types/devvit/plugin/buildpack/buildpack_common.js';
import {
  ACTOR_SRC_PRIMARY_NAME,
  MAX_ALLOWED_SUBSCRIBER_COUNT,
} from '@devvit/shared-types/constants.js';
import { StringUtil } from '@devvit/shared-types/StringUtil.js';
import { DevvitVersion, VersionBumpType } from '@devvit/shared-types/Version.js';
import { Flags, ux } from '@oclif/core';
import type { CommandError } from '@oclif/core/lib/interfaces/index.js';
import chalk from 'chalk';

import type { StoredToken } from '../lib/auth/StoredToken.js';
import { REDDIT_DESKTOP } from '../lib/config.js';
import { isCurrentUserEmployee } from '../lib/http/gql.js';
import { AppVersionUploader } from '../util/AppVersionUploader.js';
import { getAccessTokenAndLoginIfNeeded } from '../util/auth.js';
import { Bundler } from '../util/Bundler.js';
import {
  createAppClient,
  createAppVersionClient,
  createInstallationsClient,
} from '../util/clientGenerators.js';
import { DevvitCommand } from '../util/commands/DevvitCommand.js';
import { installOnSubreddit } from '../util/common-actions/installOnSubreddit.js';
import { DEVVIT_PORTAL_URL } from '../util/config.js';
import { getAppBySlug } from '../util/getAppBySlug.js';
import { sendEvent } from '../util/metrics.js';
import {
  getCodeFromWizard,
  gitInitIfNeeded,
  installAppDependencies,
  unpackCode,
  updatePackageJSON,
} from './init.js';

export default class Upload extends DevvitCommand {
  static override description = `Upload the app to the App Directory. Uploaded apps are only visible to you (the app owner) and can only be installed to a small test subreddit with less than ${MAX_ALLOWED_SUBSCRIBER_COUNT} subscribers`;

  static override flags = {
    bump: Flags.custom<VersionBumpType>({
      description: 'Type of version bump (major|minor|patch|prerelease)',
      required: false,
      options: [
        VersionBumpType.Major,
        VersionBumpType.Minor,
        VersionBumpType.Patch,
        VersionBumpType.Prerelease,
      ],
    })(),
    version: Flags.custom<DevvitVersion>({
      description: 'Explicit version number (e.g: 1.0.1)',
      required: false,
      multiple: false,
      parse: async (version) => DevvitVersion.fromString(version),
      exclusive: ['bump'],
    })(),
    'employee-update': Flags.boolean({
      aliases: ['employeeUpdate'],
      description:
        "I'm an employee and I want to update someone else's app. (This will only work if you're an employee.)",
      required: false,
      hidden: true,
    }),
    'just-do-it': Flags.boolean({
      aliases: ['justDoIt'],
      description: "Don't ask any questions, just use defaults & continue. (Useful for testing.)",
      required: false,
      hidden: true,
    }),
    'copy-paste': Flags.boolean({
      aliases: ['copyPaste'],
      description: 'Copy-paste the auth code instead of opening a browser',
      default: false,
    }),
    verbose: Flags.boolean({
      char: 'v',
      description: 'Include more details about discovered assets',
      default: false,
      hidden: true,
    }),
  } as const;

  readonly #appClient = createAppClient();
  readonly #installationsClient = createInstallationsClient();

  #event = {
    source: 'devplatform_cli',
    action: 'ran',
    noun: 'upload',
    devplatform: {
      cli_raw_command_line: 'devvit ' + process.argv.slice(2).join(' '),
      cli_is_valid_command: true,
      cli_command: 'upload',
    } as Record<string, string | boolean | undefined>,
  };
  #eventSent = false;

  async run(): Promise<void> {
    const { flags } = await this.parse(Upload);

    await this.#checkDependencies(flags['just-do-it']);

    const token = await getAccessTokenAndLoginIfNeeded(
      flags['copy-paste'] ? 'CopyPaste' : 'LocalSocket'
    );
    const username = await this.getUserDisplayName(token);

    await this.checkDeveloperAccount();

    let appInfo: FullAppInfo | undefined;
    try {
      appInfo = await getAppBySlug(this.#appClient, {
        slug: this.project.name,
        hidePrereleaseVersions: true,
        limit: 1, // fetched version limit; we only need the latest one
      });
    } catch (e) {
      this.error(StringUtil.caughtToString(e, 'message'));
    }

    let shouldCreateNewApp = false;
    let shouldCreatePlaytestSubreddit = !this.project.getSubreddit('Dev');

    const isOwner = appInfo?.app?.owner?.displayName === username;
    if (!isOwner) {
      shouldCreateNewApp = true;
      // Unless...
      if (flags['employee-update'] || flags['just-do-it']) {
        const isEmployee = await isCurrentUserEmployee(token);
        if (!isEmployee) {
          this.error(`You're not an employee, so you can't playtest someone else's app.`);
        }
        // Else, we're an employee, so we can update someone else's app
        this.warn(`Overriding ownership check because you're an employee and told me to!`);
        shouldCreateNewApp = false;
      }
    }

    ux.action.start('Verifying app builds');
    // Version is unknown until upload. Use a fake one for build verification.
    await this.#bundleActors(username, '0.0.0');
    ux.action.stop();

    if (shouldCreateNewApp || !appInfo) {
      const appName = await this.#initApp();

      try {
        // Reload the project since the name updated
        appInfo = await getAppBySlug(this.#appClient, {
          slug: appName,
          hidePrereleaseVersions: true,
          limit: 1, // fetched version limit; we only need the latest one
        });
      } catch (e) {
        this.error(StringUtil.caughtToString(e, 'message'));
      }

      shouldCreatePlaytestSubreddit = true; // If we need to create a new app, we always need to create a playtest subreddit.
      this.#event.devplatform.cli_upload_is_initial = true;
      this.#event.devplatform.cli_upload_is_nsfw = appInfo?.app?.isNsfw;
      this.#event.devplatform.app_name = appInfo?.app?.slug;
    } else {
      this.#event.devplatform.cli_upload_is_initial = false;
      this.#event.devplatform.cli_upload_is_nsfw = appInfo.app?.isNsfw;
      this.#event.devplatform.app_name = appInfo.app?.name;
    }

    if (!appInfo?.app) {
      this.error(
        `We couldn't find the app ${this.project.name}. Please run \`npx devvit init\` first.`
      );
    }

    let appVersionNumber = flags.version;

    if (!appVersionNumber) {
      appVersionNumber = await this.#getNextVersionNumber(appInfo, flags.bump);
    }

    this.#event.devplatform.app_version_number = appVersionNumber.toString();
    ux.action.start('Building');
    const bundles = await this.#bundleActors(username, appVersionNumber.toString());
    ux.action.stop();

    try {
      const appVersionUploader = new AppVersionUploader(this, { verbose: flags.verbose });

      if (shouldCreatePlaytestSubreddit) {
        this.log(chalk.green(`We'll create a default playtest subreddit for your app!`));
      }
      const latestVersion = await appVersionUploader.createVersion(
        {
          appId: appInfo.app.id,
          appSlug: appInfo.app.slug,
          appSemver: appVersionNumber,
          visibility: VersionVisibility.PRIVATE,
        },
        bundles,
        !shouldCreatePlaytestSubreddit
      );

      // Install the app to the default playtest subreddit, if it was created.
      if (shouldCreatePlaytestSubreddit) {
        const installationInfo = await this.#installOnDefaultPlaytestSubreddit(
          token,
          latestVersion
        );
        if (installationInfo) {
          const devSubredditName = installationInfo.installation?.location?.name;
          if (devSubredditName) {
            const playtestUrl = chalk.bold.green(`${REDDIT_DESKTOP}/r/${devSubredditName}`);
            this.log(`We have created a playtest subreddit for you at ${playtestUrl}`);
            this.project.setSubreddit(devSubredditName, 'Dev');
            ux.action.stop();
          }
        } else {
          this.warn(
            `We couldn't install your app to the new playtest subreddit, but you can still do so manually.`
          );
        }
      }
    } catch (err) {
      const errMessage = StringUtil.caughtToString(err, 'message');
      if (err instanceof Error) {
        this.error(errMessage);
      } else {
        this.error(`An unknown error occurred when creating the app version.\n${errMessage}`);
      }
    }

    this.log(
      `\n✨ Visit ${chalk.cyan.bold(
        `${DEVVIT_PORTAL_URL}/apps/${appInfo.app?.slug}`
      )} to view your app!`
    );

    await this.#sendEventIfNotSent();

    process.exit(0);
  }

  /**
   * If we're not just doing it, check and make sure there's a chance our build will succeed.
   */
  async #checkDependencies(justDoIt: boolean): Promise<void> {
    if (justDoIt) {
      return;
    }

    if (
      !fs.existsSync(path.join(this.project.root, '.pnp.cjs')) &&
      !(await this.#canImport('devvit')) &&
      !(await this.#canImport('@devvit/client')) &&
      !(await this.#canImport('@devvit/server')) &&
      !(await this.#canImport('@devvit/public-api'))
    ) {
      this.error(
        `It looks like you don't have dependencies installed. Please run 'npm install' (or yarn, if you're using yarn) and try again.`
      );
    }
  }

  #canImport(module: string): Promise<boolean> {
    // Run a node command in the project directory to check if we can import public-api
    return new Promise<boolean>((resolve, reject) => {
      const checkImportCommand = `node --input-type=module -e "await import('${module}')"`;
      // Run this as a child process
      // eslint-disable-next-line security/detect-child-process
      const process = exec(checkImportCommand, { cwd: this.project.root }, (error) => {
        // If there was an error creating the child process, reject the promise
        if (error) {
          reject(error);
        }
      });
      process.on('exit', (code) => {
        resolve(code === 0);
      });
    });
  }

  async #getNextVersionNumber(
    appInfo: FullAppInfo,
    bump: VersionBumpType | undefined
  ): Promise<DevvitVersion> {
    const appVersion = findLatestVersion(appInfo.versions) ?? new DevvitVersion(0, 0, 0);
    if (bump) {
      appVersion.bumpVersion(bump);
    } else {
      appVersion.bumpVersion(VersionBumpType.Patch);
      this.log('Automatically bumped app version to:', appVersion.toString());
    }

    return appVersion;
  }

  async #bundleActors(username: string, version: string): Promise<Bundle[]> {
    const bundler = new Bundler();
    const actorSpec = {
      name: ACTOR_SRC_PRIMARY_NAME,
      owner: username,
      version: version,
    };

    try {
      return await bundler.bundle(this.project, actorSpec);
    } catch (err) {
      this.error(StringUtil.caughtToString(err, 'message'));
    }
  }

  async #sendEventIfNotSent(): Promise<void> {
    if (!this.#eventSent) {
      this.#eventSent = true;
      await sendEvent(this.#event);
    }
  }

  override async catch(err: CommandError): Promise<unknown> {
    this.#event.devplatform.cli_upload_is_successful = false;
    this.#event.devplatform.cli_upload_failure_reason = err.message;
    await this.#sendEventIfNotSent();
    return super.catch(err);
  }

  // Install the app to the default playtest subreddit, if it was created.
  // For convenience, returns the name of the subreddit if the app is successfully installed.
  async #installOnDefaultPlaytestSubreddit(
    token: StoredToken,
    appVersion: AppVersionInfo
  ): Promise<FullInstallationInfo | undefined> {
    const appInfo = await getAppBySlug(this.#appClient, {
      slug: this.project.name,
      hidePrereleaseVersions: true,
      limit: 1, // fetched version limit; we only need the latest one
    });
    if (!appInfo?.app) {
      this.error(
        `Something went wrong: couldn't find the app ${this.project.name} after creating a playtest subreddit.`
      );
    } else if (!appInfo.app.defaultPlaytestSubredditId) {
      this.warn(
        `We couldn't find the default playtest subreddit for ${this.project.name}, but one will be created during your next ${'`devvit upload`'} or ${'`devvit playtest`'}.`
      );
      return undefined;
    }

    try {
      ux.action.start('Installing app to default playtest subreddit');

      const userT2Id = await this.getUserT2Id(token);
      const installationInfo = await installOnSubreddit(
        this,
        createAppVersionClient(),
        this.#installationsClient,
        userT2Id,
        appVersion,
        appInfo.app.defaultPlaytestSubredditId
      );

      ux.action.stop();
      return installationInfo;
    } catch (err: unknown) {
      ux.action.stop('Warning');
      this.warn(
        `We couldn't install your app to the new playtest subreddit at ${appInfo.app.defaultPlaytestSubredditId}, but you can still do so manually. ${StringUtil.caughtToString(err, 'message')}`
      );
    }
    return undefined;
  }

  async #initApp(): Promise<string> {
    const code = await getCodeFromWizard(undefined, undefined, this);
    const initAppParams = unpackCode(code);

    if (!initAppParams?.appName) {
      this.error(
        `Your code was missing an app name. Please run 'npx devvit init' to get a new code.`
      );
    }

    // Update app name and ignore provided template, if any
    this.project.name = initAppParams.appName;
    this.log(
      `We've updated the app name to "${this.project.name}" in your ${this.project.filename}.`
    );

    await gitInitIfNeeded(this.project.root);
    await updatePackageJSON(this.project.root, this.project.name);
    await installAppDependencies(this.project.root, this);

    return initAppParams.appName;
  }
}

function findLatestVersion(
  versions: readonly Readonly<AppVersionInfo>[]
): DevvitVersion | undefined {
  return versions
    .map(
      (v) => new DevvitVersion(v.majorVersion, v.minorVersion, v.patchVersion, v.prereleaseVersion)
    )
    .sort((lhs, rhs) => lhs.compare(rhs))
    .at(-1);
}
