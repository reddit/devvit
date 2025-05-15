import { exec } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

import { AppVersionInfo, FullAppInfo, VersionVisibility } from '@devvit/protos/community.js';
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

import { isCurrentUserEmployee } from '../lib/http/gql.js';
import { AppUploader } from '../util/AppUploader.js';
import { AppVersionUploader } from '../util/AppVersionUploader.js';
import { getAccessTokenAndLoginIfNeeded } from '../util/auth.js';
import { Bundler } from '../util/Bundler.js';
import { createAppClient } from '../util/clientGenerators.js';
import { DevvitCommand } from '../util/commands/DevvitCommand.js';
import { DEVVIT_PORTAL_URL } from '../util/config.js';
import { getAppBySlug } from '../util/getAppBySlug.js';
import { sendEvent } from '../util/metrics.js';

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
    // Used in packages/cli/src/lib/hooks/init/check-update.ts
    'ignore-outdated': Flags.boolean({
      aliases: ['ignoreOutdated'],
      description: 'Skip CLI version check. The apps that you upload may not work as expected',
      required: false,
      hidden: false,
    }),
    'disable-typecheck': Flags.boolean({
      aliases: ['disableTypecheck'],
      char: 't',
      description: 'Disable typechecking before uploading',
      default: false,
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

    const token = await getAccessTokenAndLoginIfNeeded();
    const username = await this.getUserDisplayName(token);

    await this.checkDeveloperAccount();

    let appInfo: FullAppInfo | undefined;
    try {
      appInfo = await getAppBySlug(this.#appClient, {
        slug: this.projectConfig.name,
        hidePrereleaseVersions: true,
        limit: 1, // fetched version limit; we only need the latest one
      });
    } catch (e) {
      this.error(StringUtil.caughtToString(e, 'message'));
    }

    let shouldCreateNewApp = false;

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
    await this.#bundleActors(username, '0.0.0', !flags['disable-typecheck']);
    ux.action.stop();

    if (shouldCreateNewApp || !appInfo) {
      const appUploader = new AppUploader(this);

      appInfo = await appUploader.createNewApp(
        this.projectConfig,
        flags['copy-paste'],
        flags['just-do-it']
      );

      this.#event.devplatform.cli_upload_is_initial = true;
      this.#event.devplatform.cli_upload_is_nsfw = appInfo.app?.isNsfw;
      this.#event.devplatform.app_name = appInfo.app?.slug;
    } else {
      this.#event.devplatform.cli_upload_is_initial = false;
      this.#event.devplatform.cli_upload_is_nsfw = appInfo.app?.isNsfw;
      this.#event.devplatform.app_name = appInfo.app?.name;
    }

    if (!appInfo?.app) {
      this.error(`App ${this.projectConfig.name} is not found`);
    }

    // Now, create a new version.
    const appVersionNumber = await this.#getNextVersionNumber(appInfo, flags.bump);

    this.#event.devplatform.app_version_number = appVersionNumber.toString();

    ux.action.start('Building');
    const bundles = await this.#bundleActors(
      username,
      appVersionNumber.toString(),
      !flags['disable-typecheck']
    );
    ux.action.stop();

    try {
      const appVersionUploader = new AppVersionUploader(this, { verbose: flags.verbose });
      await appVersionUploader.createVersion(
        {
          appId: appInfo.app.id,
          appSlug: appInfo.app.slug,
          appSemver: appVersionNumber,
          visibility: VersionVisibility.PRIVATE,
        },
        bundles
      );
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
      !fs.existsSync(path.join(this.projectRoot, '.pnp.cjs')) &&
      !(await this.#canImportPublicAPI())
    ) {
      this.error(
        `It looks like you don't have dependencies installed. Please run 'npm install' (or yarn, if you're using yarn) and try again.`
      );
    }
  }

  #canImportPublicAPI(): Promise<boolean> {
    // Run a node command in the project directory to check if we can import public-api
    return new Promise<boolean>((resolve, reject) => {
      const checkImportCommand = `node --input-type=module -e "await import('@devvit/public-api')"`;
      // Run this as a child process
      const process = exec(checkImportCommand, { cwd: this.projectRoot }, (error) => {
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

  async #bundleActors(
    username: string,
    version: string,
    typecheck: boolean = true
  ): Promise<Bundle[]> {
    const bundler = new Bundler(typecheck);
    const actorSpec = {
      name: ACTOR_SRC_PRIMARY_NAME,
      owner: username,
      version: version,
    };

    try {
      return await bundler.bundle(this.projectRoot, actorSpec);
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
