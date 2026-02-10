import { exec } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

import {
  AppInfo,
  AppPublishRequestVisibility,
  AppVersionInfo,
  type AppVersionUpdateRequest,
  FullAppInfo,
  type FullAppVersionInfo,
  FullInstallationInfo,
  InstallationType,
  NutritionCategory,
  VersionVisibility,
} from '@devvit/protos/community.js';
import { AppPublishRequestStatus } from '@devvit/protos/types/devvit/dev_portal/app_publish_request/app_publish_request.js';
import { PaymentsVerificationStatus } from '@devvit/protos/types/devvit/dev_portal/payments/payments_verification.js';
import type { Bundle } from '@devvit/protos/types/devvit/plugin/buildpack/buildpack_common.js';
import { appCapabilitiesFromBundle } from '@devvit/shared-types/AppCapabilities.js';
import { ACTOR_SRC_PRIMARY_NAME } from '@devvit/shared-types/constants.js';
import { StringUtil } from '@devvit/shared-types/StringUtil.js';
import { DevvitVersion, VersionBumpType } from '@devvit/shared-types/Version.js';
import { Flags, ux } from '@oclif/core';
import type { CommandError } from '@oclif/core/lib/interfaces/index.js';
import chalk from 'chalk';
import { execaCommand, type StdoutStderrOption } from 'execa';
import inquirer from 'inquirer';
import open from 'open';

import type { StoredToken } from '../lib/auth/StoredToken.js';
import { DEVVIT_ALLOW_SOURCE_UPLOAD, REDDIT_DESKTOP } from '../lib/config.js';
import { isCurrentUserEmployee } from '../lib/http/gql.js';
import { AppVersionUploader } from '../util/AppVersionUploader.js';
import { getAccessToken, getAccessTokenAndLoginIfNeeded } from '../util/auth.js';
import { Bundler } from '../util/Bundler.js';
import {
  createAppClient,
  createAppPublishRequestClient,
  createAppVersionClient,
  createDeveloperSettingsClient,
  createInstallationsClient,
} from '../util/clientGenerators.js';
import { DevvitCommand } from '../util/commands/DevvitCommand.js';
import { installOnSubreddit } from '../util/common-actions/installOnSubreddit.js';
import { waitUntilVersionBuildComplete } from '../util/common-actions/waitUntilVersionBuildComplete.js';
import { DEVVIT_PORTAL_URL } from '../util/config.js';
import { getAppBySlug } from '../util/getAppBySlug.js';
import { getAppSourceZip } from '../util/getAppSourceZip.js';
import { readLine } from '../util/input-util.js';
import { sendEvent } from '../util/metrics.js';
import { handleTwirpError } from '../util/twirp-error-handler.js';

const DEVELOPER_SETTINGS_PATH = `${DEVVIT_PORTAL_URL}/my/settings`;

const appCapabilityToReviewRequirementMessage: Record<
  NutritionCategory.CUSTOM_POST | NutritionCategory.PAYMENTS,
  string
> = {
  [NutritionCategory.CUSTOM_POST]: 'Creates custom posts',
  [NutritionCategory.PAYMENTS]: 'Sells digital goods or services',
};

export default class Publish extends DevvitCommand {
  static override hidden = true;

  static override description = `Creates a new app version, uploads it along with your source for review, and then files a publish request for you app.`;

  static override flags = {
    bump: Flags.custom<VersionBumpType>({
      description: 'Type of version bump (major|minor|patch). Patch by default.',
      required: false,
      options: [
        VersionBumpType.Major,
        VersionBumpType.Minor,
        VersionBumpType.Patch,
        // VersionBumpType.Prerelease isn't a valid choice!
      ],
      exclusive: ['version'],
    })(),
    version: Flags.custom<DevvitVersion>({
      description:
        'Explicit version number (e.g: 1.0.1). Note that prerelease versions are not allowed to be published.',
      required: false,
      multiple: false,
      parse: async (version) => {
        const devvitVersion = DevvitVersion.fromString(version);
        if (devvitVersion.prerelease !== undefined) {
          throw new Error('Prerelease versions are not allowed to be published.');
        }
        return devvitVersion;
      },
      exclusive: ['bump'],
    })(),
    'copy-paste': Flags.boolean({
      aliases: ['copyPaste'],
      description: 'Copy-paste the auth code instead of opening a browser',
      default: false,
    }),
    verbose: Flags.boolean({
      char: 'v',
      description: 'Enable verbose logging',
      default: false,
    }),
    public: Flags.boolean({
      description:
        'Submit the app for review to be published publicly (as opposed to unlisted, the default)',
      required: false,
      exclusive: ['withdraw'],
    }),
    withdraw: Flags.boolean({
      description:
        'Withdraw the most recent publish request for your app (if it exists and is pending)',
      required: false,
      exclusive: ['public'],
    }),
    // TODO: Remove completely next release cycle; see DR-231
    'disable-direct-upload': Flags.boolean({
      description: 'Disable direct web view asset uploading',
      default: false,
    }),
  } as const;

  readonly #appClient = createAppClient();
  readonly #appVersionClient = createAppVersionClient();
  readonly #installationsClient = createInstallationsClient();
  readonly #appPRClient = createAppPublishRequestClient();
  readonly #developerSettingsClient = createDeveloperSettingsClient();

  #event = {
    source: 'devplatform_cli',
    action: 'ran',
    noun: 'upload', // even though the command is publish, we need to log the event for an upload
    devplatform: {
      cli_raw_command_line: 'devvit ' + process.argv.slice(2).join(' '),
      cli_is_valid_command: true,
      cli_command: 'publish',
    } as Record<string, string | boolean | undefined>,
  };
  #eventSent = false;

  protected override async init(): Promise<void> {
    // Dynamic mode allows configs that reference build outputs that don't exist
    // yet; upload will run scripts.build (if configured) before bundling.
    await super.init('Dynamic');
  }

  async run(): Promise<void> {
    const { flags } = await this.parse(Publish);

    // If this is just a withdraw request, do it early & bail
    if (flags.withdraw) {
      if (flags.public) {
        this.error(
          'Do not use --public and --withdraw together - if you want to withdraw a public request, just use --withdraw by itself.'
        );
      }
      // If we're just withdrawing the request, do that & exit early
      await this.#withdrawRequest();
      return;
    }

    // Otherwise, start doing app upload stuff
    await this.#checkDependencies();

    await this.#runBuildScriptIfConfigured(Boolean(flags.verbose));

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

    if (!appInfo || !appInfo.app) {
      this.error(
        `We couldn't find the app ${this.project.name}. Please run \`npx devvit init\` first.`
      );
      return;
    }
    this.#event.devplatform.cli_upload_is_initial = false;
    this.#event.devplatform.cli_upload_is_nsfw = appInfo.app.isNsfw;
    this.#event.devplatform.app_name = appInfo.app.name;

    const shouldCreatePlaytestSubreddit = !this.project.getSubreddit('Dev');

    const isOwner = appInfo.app.owner?.displayName === username;
    if (!isOwner) {
      this.error(
        `You are not the owner of the app "${this.project.name}". Please check that you are logged in as the correct user (${appInfo.app.owner?.displayName ?? '<unknown>'}).`
      );
    }

    if (flags.verbose) {
      ux.action.start('Verifying app builds');
    }

    // Version is unknown until upload. Use a fake one for build verification.
    await this.#bundleActors(username, '0.0.0');
    ux.action.stop();

    let appVersionNumber = flags.version;

    if (!appVersionNumber) {
      appVersionNumber = await this.#getNextVersionNumber(appInfo, flags.bump);
    }

    this.#event.devplatform.app_version_number = appVersionNumber.toString();
    ux.action.start('Building');
    const bundles = await this.#bundleActors(username, appVersionNumber.toString());
    ux.action.stop();

    // We used to do this by downloading the linked bundle & checking it; instead, we can
    // just check the Bundle we already have!
    const appCapabilities = await this.#verifyAppCapabilities(appInfo.app, bundles[0]);

    // New! Create the app source bundle, so we know the size when uploading the app version.
    await this.#promptForSourceUploadConsent();

    ux.action.start(`Creating app source zip for version "${appVersionNumber.toString()}"`);
    const appSourceBuffer = await getAppSourceZip(this);
    ux.action.stop();

    let latestVersion: AppVersionInfo;
    try {
      const appVersionUploader = new AppVersionUploader(this, {
        verbose: flags.verbose,
        experimentalDirectUpload: !flags['disable-direct-upload'],
      });

      if (shouldCreatePlaytestSubreddit) {
        this.log(chalk.green(`We'll create a default playtest subreddit for your app!`));
      }
      const shouldShowUploadingAction = !flags.verbose;
      if (shouldShowUploadingAction) {
        ux.action.start('Uploading');
      }
      latestVersion = await appVersionUploader.createVersion(
        {
          appId: appInfo.app.id,
          appSlug: appInfo.app.slug,
          appSemver: appVersionNumber,
          visibility: VersionVisibility.PRIVATE,
          appSourceBuffer, // Handles the source upload for us!
        },
        bundles,
        !shouldCreatePlaytestSubreddit
      );
      if (shouldShowUploadingAction) {
        ux.action.stop();
      }

      // Hold, until this is fully processed on the backend
      ux.action.start('Waiting for build to complete remotely...');
      await waitUntilVersionBuildComplete(
        this,
        this.#appVersionClient,
        latestVersion,
        flags.verbose
      );
      ux.action.stop();

      // Install the app to the default playtest subreddit, if it was created.
      if (shouldCreatePlaytestSubreddit) {
        const installationInfo = await this.#installOnDefaultPlaytestSubreddit(
          token,
          latestVersion,
          flags.verbose
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
        this.error(
          `An unknown error occurred when creating the app version to publish.\n${errMessage}`
        );
      }
    }

    await this.#sendEventIfNotSent();

    // Now, publish the app version after upload
    let visibility: AppPublishRequestVisibility = AppPublishRequestVisibility.UNLISTED;
    if (flags.public) {
      visibility = AppPublishRequestVisibility.PUBLIC;
    }

    await this.#submitForReview(latestVersion.id, appVersionNumber, visibility);

    const appCapabilitiesForReview = appCapabilities.filter(
      (capability): capability is keyof typeof appCapabilityToReviewRequirementMessage =>
        capability === NutritionCategory.CUSTOM_POST || capability === NutritionCategory.PAYMENTS
    );

    if (appCapabilitiesForReview.length > 0) {
      this.log(
        'Apps that meet the following criteria must be reviewed before they can be published:'
      );
      appCapabilitiesForReview.forEach((capability) => {
        this.log(`  - ${appCapabilityToReviewRequirementMessage[capability]}`);
      });
      this.log("You'll receive an email when your app has been approved.");
      this.log("Once approved, you'll be able to install your app anywhere you're a moderator!");

      // Early return
      return;
    }

    await this.#updateVersionToUnlisted(latestVersion.id, appVersionNumber);

    this.log("Your app is now unlisted. You can install it anywhere you're a moderator!");

    if (visibility === AppPublishRequestVisibility.PUBLIC) {
      this.log("You'll receive an email when your app has been approved.");
      this.log(
        'Once approved, you (and everyone else!) will be able to install your app anywhere they moderate!'
      );
    }

    this.log(
      `\n✨ Visit ${chalk.cyan.bold(
        `${DEVVIT_PORTAL_URL}/apps/${appInfo.app?.slug}`
      )} to view your app!`
    );

    process.exit(0);
  }

  async #verifyAppCapabilities(appInfo: AppInfo, bundle: Bundle) {
    const appCapabilities = appCapabilitiesFromBundle(bundle);
    const appSettingsURL = `${DEVVIT_PORTAL_URL}/apps/${appInfo.slug}/developer-settings`;

    if (
      appCapabilities.includes(NutritionCategory.HTTP) &&
      (!appInfo.termsAndConditions || !appInfo.privacyPolicy)
    ) {
      this.log(
        'Apps that use the http plugin must have terms & conditions and a privacy policy linked before publishing. Add these links on the app details page and run `devvit publish` again.'
      );
      await this.#promptOpenURL(appSettingsURL);
    }

    if (appCapabilities.includes(NutritionCategory.PAYMENTS)) {
      if (!appInfo.termsAndConditions) {
        this.log(
          'Apps that sell goods must have terms & conditions linked before publishing. Add this link on the app details page and run `devvit publish` again.'
        );
        await this.#promptOpenURL(appSettingsURL);
      }

      const token = await getAccessToken();
      const isEmployee = token && (await isCurrentUserEmployee(token));

      // If the user is not an employee, check if they have completed payments verification.
      if (!isEmployee) {
        const verificationStatusResp =
          await this.#developerSettingsClient.GetPaymentsVerificationStatus({});

        const verificationErrorPrefix = 'This app sells products.';
        if (verificationStatusResp.status === PaymentsVerificationStatus.VERIFICATION_PENDING) {
          this.error(
            `${verificationErrorPrefix} Your payments verification is pending. Please wait for it to complete before publishing.`
          );
        }

        if (verificationStatusResp.status !== PaymentsVerificationStatus.VERIFICATION_SUCCESS) {
          this.log(
            `${verificationErrorPrefix} You need to complete payments verification or remove payments features before you can publish your app. Verify your account here: `
          );
          await this.#promptOpenURL(DEVELOPER_SETTINGS_PATH);
        }
      }
    }

    return appCapabilities;
  }

  async #submitForReview(
    appVersionId: string,
    devvitVersion: DevvitVersion,
    visibility: AppPublishRequestVisibility
  ): Promise<void> {
    ux.action.start(`Submitting version "${devvitVersion.toString()}" for review`);
    try {
      await this.#appPRClient.Submit({ appVersionId, visibility });
      ux.action.stop();
      return;
    } catch (err) {
      ux.action.stop('Error');
      if (err && typeof err === 'object' && 'code' in err && err.code === 'already_exists') {
        this.error('This version has already been submitted for review.');
      }
      this.error(StringUtil.caughtToString(err, 'message'));
    }
  }

  async #updateVersionToUnlisted(
    appVersionId: string,
    devvitVersion: DevvitVersion
  ): Promise<FullAppVersionInfo> {
    const appVersionUpdateRequest: AppVersionUpdateRequest = {
      id: appVersionId,
      visibility: {
        // Regardless of what you requested, we give you UNLISTED for free immediately
        value: VersionVisibility.UNLISTED,
      },
      validInstallTypes: [InstallationType.SUBREDDIT],
      pool: 0, // Don't change the pool
    };

    ux.action.start(`Publishing version "${devvitVersion.toString()}" to Reddit`);
    try {
      const appVersionInfo = await this.#appVersionClient.Update(appVersionUpdateRequest);
      ux.action.stop();

      return appVersionInfo;
    } catch (error) {
      ux.action.stop('Error');
      return handleTwirpError(error, (message: string) => this.error(message));
    }
  }

  async #promptOpenURL(url: string): Promise<never> {
    this.log(`${url} \n(press enter to open, control-c to quit)`);

    if (await readLine()) {
      try {
        await open(url);
      } catch {
        this.error(`An error occurred when opening the URL: ${url}`);
      }
    }
    process.exit(0);
  }

  async #runBuildScriptIfConfigured(streamOutput: boolean): Promise<void> {
    const buildCommand = this.project.appConfig?.scripts?.build;
    if (!buildCommand) return;

    const truncatedCommand =
      buildCommand.length > 60 ? buildCommand.substr(0, 60) + '…' : buildCommand;
    ux.action.start(`Running build command: "${truncatedCommand}"`);
    try {
      const stdout: StdoutStderrOption = streamOutput ? ['pipe', 'inherit'] : 'pipe';
      const stderr: StdoutStderrOption = streamOutput ? ['pipe', 'inherit'] : 'pipe';

      await execaCommand(buildCommand, {
        cwd: this.project.root,
        preferLocal: true,
        shell: true,
        stdout,
        stderr,
      });
    } catch (err) {
      ux.action.stop('Error');
      this.error(`scripts.build failed: ${StringUtil.caughtToString(err, 'message')}`);
    }
    ux.action.stop();
  }

  /**
   * Check and make sure there's a chance our build will succeed.
   */
  async #checkDependencies(): Promise<void> {
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
    appVersion: AppVersionInfo,
    verbose: boolean
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
        appInfo.app.defaultPlaytestSubredditId,
        verbose
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

  async #promptForSourceUploadConsent(): Promise<void> {
    if (DEVVIT_ALLOW_SOURCE_UPLOAD()) {
      return;
    }

    this.log('To publish your app, you need to upload a source code zip. This zip is only');
    this.log('used by the Devvit team for the app review process and will not be shared with');
    this.log('third parties. The CLI will automatically generate the zip from your current');
    this.log('project directory and will respect your root .gitignore file.');
    this.log('');
    const { action } = await inquirer.prompt<{ action: 'stop' | 'continue' | 'neverAskAgain' }>({
      name: 'action',
      message: 'What would you like to do?',
      type: 'list',
      choices: [
        {
          name: 'Stop for now - I want to clean up my project first!',
          value: 'stop',
        },
        {
          name: 'Continue with the source code upload, and ask me every time.',
          value: 'continue',
        },
        {
          name: `Continue with the source code upload, and don't ask me again for this app.`,
          value: 'neverAskAgain',
        },
      ],
    });

    if (action === 'stop') {
      this.log('Please make any necessary changes, then run the publish command again.');
      this.exit();
    }

    if (action === 'continue') {
      return;
    }

    // Else, set the .env var to skip future prompts & continue
    this.log('Noted! Setting the DEVVIT_ALLOW_SOURCE_UPLOAD environment variable to skip this');
    this.log('prompt in the future. Edit your `.env` file to change this behavior.');
    this.project.setEnvVariable('DEVVIT_ALLOW_SOURCE_UPLOAD', '1');
  }

  async #withdrawRequest() {
    ux.action.start('Withdrawing publish request');
    try {
      const pendingPRs = await this.#appPRClient.FindMany({
        appName: this.project.name,
        statuses: [AppPublishRequestStatus.PENDING],
        sort: {
          field: 'createdAt',
          asc: false,
        },
      });
      if (pendingPRs.requests.length === 0) {
        ux.action.stop('Error');
        this.error('No pending publish request found to withdraw!');
      }
      const mostRecentPR = pendingPRs.requests[0];
      await this.#appPRClient.Update({
        publishRequestId: mostRecentPR.id,
        status: AppPublishRequestStatus.WITHDRAWN,
      });
      ux.action.stop(
        `Withdrawn publish request for version ${
          mostRecentPR.appVersionInfo
            ? DevvitVersion.fromProtoAppVersionInfo(mostRecentPR.appVersionInfo).toString()
            : '<unknown>'
        }`
      );
    } catch (err) {
      ux.action.stop('Error');
      if (err && typeof err === 'object' && 'code' in err && err.code === 'not_found') {
        this.error('No publish request found to withdraw!');
      }
      this.error(StringUtil.caughtToString(err, 'message'));
    }
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
