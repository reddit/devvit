import type { LinkedBundle } from '@devvit/protos';
import type {
  AppInfo,
  AppVersionUpdateRequest,
  FullAppVersionInfo,
} from '@devvit/protos/community.js';
import {
  AppPublishRequestVisibility,
  InstallationType,
  VersionVisibility,
} from '@devvit/protos/community.js';
import { StringUtil } from '@devvit/shared-types/StringUtil.js';
import { DevvitVersion } from '@devvit/shared-types/Version.js';
import { Args, Flags, ux } from '@oclif/core';
import chalk from 'chalk';
import open from 'open';
import {
  createAppClient,
  createAppVersionClient,
  createAppPublishRequestClient,
} from '../util/clientGenerators.js';
import { ProjectCommand } from '../util/commands/ProjectCommand.js';
import { getInfoForSlugString } from '../util/common-actions/slugVersionStringToUUID.js';
import { DEVVIT_PORTAL_URL } from '../util/config.js';
import { readLine } from '../util/input-util.js';
import { handleTwirpError } from '../util/twirp-error-handler.js';
import inquirer from 'inquirer';

export default class Publish extends ProjectCommand {
  static override description =
    'Publish any previously uploaded version of an app. In this state, only the app owner can find or install the app to a subreddit which they moderate.';

  static override examples = [
    '$ devvit publish',
    '$ devvit publish [app-name][@version]',
    '$ devvit publish my-app',
    '$ devvit publish my-app@1.2.3',
  ];

  static override args = {
    appWithVersion: Args.string({
      description:
        'App to install (defaults to working directory app) and version (defaults to latest)',
      required: false,
    }),
  };

  static override flags = {
    public: Flags.boolean({
      name: 'public',
      description: 'Submit the app for review to be published publicly',
      required: false,
    }),
    unlisted: Flags.boolean({
      name: 'unlisted',
      description:
        'Submit the app for review to be published unlisted (installable only by you, ' +
        'but removes subreddit size restrictions)',
      required: false,
    }),
  };

  readonly #appClient = createAppClient();
  readonly #appVersionClient = createAppVersionClient();
  readonly #appPRClient = createAppPublishRequestClient();

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Publish);
    const appWithVersion = await this.inferAppNameAndVersion(args.appWithVersion);

    await this.checkIfUserLoggedIn();
    await this.checkDeveloperAccount();

    ux.action.start(`Finding ${appWithVersion}...`);
    const { appInfo, appVersion } = await getInfoForSlugString(appWithVersion, this.#appClient);
    ux.action.stop(`✅`);

    const devvitVersion = new DevvitVersion(
      appVersion.majorVersion,
      appVersion.minorVersion,
      appVersion.patchVersion,
      appVersion.prereleaseVersion
    );

    if (!appInfo.app) {
      this.error('There was an error retrieving the app info.');
    }
    const appDetailsUrl = `${DEVVIT_PORTAL_URL}/apps/${appInfo.app.slug}`;

    const resp = await this.#appVersionClient.GetAppVersionBundle({
      id: appVersion.id,
    });
    const bundle = resp.actorBundles[0].bundle;
    if (!bundle) {
      this.error(`There was an error getting the bundles for that app version.`);
    }

    if (appVersion.visibility !== VersionVisibility.PRIVATE) {
      this.log(
        `Version "${devvitVersion}" has already been published.\n\n✨ Visit ${chalk.cyan.bold(
          `${appDetailsUrl}`
        )} to view your app!`
      );
      return;
    }

    let visibility: AppPublishRequestVisibility = AppPublishRequestVisibility.UNRECOGNIZED;
    if (flags['public'] && flags['unlisted']) {
      this.error('You cannot specify both --public and --unlisted flags - pick one!');
    }
    if (flags['public']) {
      visibility = AppPublishRequestVisibility.PUBLIC;
    }
    if (flags['unlisted']) {
      visibility = AppPublishRequestVisibility.UNLISTED;
    }
    if (visibility === AppPublishRequestVisibility.UNRECOGNIZED) {
      visibility = await this.#promptForVisibility();
    }

    const appCreatesCustomPost = await this.#checkIfAppCreatesCustomPost(bundle);
    if (appCreatesCustomPost) {
      this.log(
        "Custom post apps need to be approved before they can be published, so I'll submit your app for review!"
      );
      await this.#submitForReview(appVersion.id, devvitVersion, visibility);
      return;
    }

    const appUsesFetch = await this.#checkIfAppUsesFetch(bundle);

    if (appUsesFetch) {
      await this.checkAppVersionTermsAndConditions(appInfo.app, appDetailsUrl);
    }

    await this.#updateVersion(appVersion.id, devvitVersion, visibility);
    this.log(`\n✨ Visit ${chalk.cyan.bold(`${appDetailsUrl}`)} to view your app!`);
  }

  async #updateVersion(
    appVersionId: string,
    devvitVersion: DevvitVersion,
    visibility: AppPublishRequestVisibility
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

    ux.action.start(`Publishing version "${devvitVersion.toString()}" to Reddit...`);
    try {
      const appVersionInfo = await this.#appVersionClient.Update(appVersionUpdateRequest);
      ux.action.stop(`Success! ✅`);

      await this.#submitForReview(appVersionId, devvitVersion, visibility);

      return appVersionInfo;
    } catch (error) {
      return handleTwirpError(error, (message: string) => this.error(message));
    }
  }

  async #checkIfAppCreatesCustomPost(bundle: LinkedBundle): Promise<boolean> {
    return !!bundle.provides.find((provision) => provision.name === 'CustomPost');
  }

  async #checkIfAppUsesFetch(bundle: LinkedBundle): Promise<boolean> {
    return !!bundle.uses.find((use) => use.hostname === 'http.plugins.local');
  }

  protected checkAppVersionTermsAndConditions = async (
    app: AppInfo,
    appDetailsUrl: string
  ): Promise<void> => {
    const { termsAndConditions, privacyPolicy } = app;
    if (!termsAndConditions || !privacyPolicy) {
      this.log(
        'Apps that use the http plugin must have terms & conditions and a privacy policy linked before publishing. Add these links on the app details page and run `devvit publish` again.'
      );

      this.log(`${appDetailsUrl} \n(press enter to open, control-c to quit)`);

      if (await readLine()) {
        try {
          await open(appDetailsUrl);
        } catch (_err) {
          this.error('An error occurred when opening the app details page');
        }
      }
      process.exit();
    }
  };

  async #submitForReview(
    appVersionId: string,
    devvitVersion: DevvitVersion,
    visibility: AppPublishRequestVisibility
  ): Promise<void> {
    ux.action.start(`Submitting version "${devvitVersion.toString()}" for review...`);
    try {
      await this.#appPRClient.Submit({ appVersionId, visibility });
      ux.action.stop(`Success! ✅ You'll receive a DM when your app has been reviewed.`);
      return;
    } catch (err) {
      if (err && typeof err === 'object' && 'code' in err && err.code === 'already_exists') {
        this.error('This version has already been submitted for review.');
      }
      this.error(StringUtil.caughtToString(err));
    }
  }

  async #promptForVisibility(): Promise<AppPublishRequestVisibility> {
    const res = await inquirer.prompt<{ visibility: AppPublishRequestVisibility }>([
      {
        name: 'visibility',
        message: "What visibility would you like for your app once it's approved?",
        type: 'list',
        choices: [
          {
            name: 'Public',
            value: AppPublishRequestVisibility.PUBLIC,
            short: 'Publicly visible and installable by anyone',
          },
          {
            name: 'Unlisted',
            value: AppPublishRequestVisibility.UNLISTED,
            short: 'Installable only by you, but removes subreddit size restrictions',
          },
        ],
      },
    ]);
    return res.visibility;
  }
}
