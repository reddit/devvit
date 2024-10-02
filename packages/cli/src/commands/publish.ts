import type { AppVersionUpdateRequest, FullAppVersionInfo } from '@devvit/protos/community.js';
import {
  AppPublishRequestVisibility,
  InstallationType,
  VersionVisibility,
} from '@devvit/protos/community.js';
import {
  appCapabilitiesFromLinkedBundle,
  AppCapability,
} from '@devvit/shared-types/AppCapabilities.js';
import { StringUtil } from '@devvit/shared-types/StringUtil.js';
import { DevvitVersion } from '@devvit/shared-types/Version.js';
import { Args, Flags, ux } from '@oclif/core';
import chalk from 'chalk';
import inquirer from 'inquirer';
import open from 'open';

import {
  createAppClient,
  createAppPublishRequestClient,
  createAppVersionClient,
} from '../util/clientGenerators.js';
import { ProjectCommand } from '../util/commands/ProjectCommand.js';
import { getInfoForSlugString } from '../util/common-actions/slugVersionStringToUUID.js';
import { DEVVIT_PORTAL_URL } from '../util/config.js';
import { readLine } from '../util/input-util.js';
import { handleTwirpError } from '../util/twirp-error-handler.js';

const appCapabilityToReviewRequirementMessage: Record<
  AppCapability.CustomPost | AppCapability.Payments,
  string
> = {
  [AppCapability.CustomPost]: 'Creates custom posts',
  [AppCapability.Payments]: 'Sells digital goods or services',
};

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
      const currentVisibility = VersionVisibility[appVersion.visibility].toLowerCase();
      const newVisibility = currentVisibility === 'unlisted' ? 'public' : 'unlisted';

      this.log(
        `Version "${devvitVersion}" has already been published and is ${currentVisibility}.\nTo make it ${newVisibility}, run ${chalk.cyan(`devvit upload`)} to create a new version. Then run ${chalk.cyan(`devvit publish --${newVisibility}`)}.\n\n✨ Visit ${chalk.cyan.bold(
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

    const appCapabilities = appCapabilitiesFromLinkedBundle(bundle);
    const appSettingsURL = `${appDetailsUrl}/developer-settings`;

    if (
      appCapabilities.includes(AppCapability.HTTP) &&
      (!appInfo.app.termsAndConditions || !appInfo.app.privacyPolicy)
    ) {
      this.log(
        'Apps that use the http plugin must have terms & conditions and a privacy policy linked before publishing. Add these links on the app details page and run `devvit publish` again.'
      );
      await this.#promptOpenURL(appSettingsURL);
    }

    if (appCapabilities.includes(AppCapability.Payments) && !appInfo.app.termsAndConditions) {
      this.log(
        'Apps that sell goods must have terms & conditions linked before publishing. Add this link on the app details page and run `devvit publish` again.'
      );
      await this.#promptOpenURL(appSettingsURL);
    }

    await this.#submitForReview(appVersion.id, devvitVersion, visibility);

    const appCapabilitiesForReview = appCapabilities.filter(
      (capability): capability is keyof typeof appCapabilityToReviewRequirementMessage =>
        capability === AppCapability.CustomPost || capability === AppCapability.Payments
    );

    if (appCapabilitiesForReview.length > 0) {
      this.log(
        'Apps that meet the following criteria must be reviewed before they can be published:'
      );
      appCapabilitiesForReview.forEach((capability) => {
        this.log(`  - ${appCapabilityToReviewRequirementMessage[capability]}`);
      });
      this.log("You'll receive a DM when your app has been reviewed.");
      this.log("Once approved, you'll be able to install your app anywhere you're a moderator!");

      // Early return
      return;
    }

    await this.#updateVersion(appVersion.id, devvitVersion);

    this.log("Your app is now unlisted. You can install it anywhere you're a moderator!");

    if (visibility === AppPublishRequestVisibility.PUBLIC) {
      this.log("You'll receive a DM when your app has been reviewed & made public.");
      this.log(
        'Once approved, you (and everyone else!) will be able to install your app anywhere they moderate!'
      );
    }
  }

  async #updateVersion(
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

    ux.action.start(`Publishing version "${devvitVersion.toString()}" to Reddit...`);
    try {
      const appVersionInfo = await this.#appVersionClient.Update(appVersionUpdateRequest);
      ux.action.stop('✅');

      return appVersionInfo;
    } catch (error) {
      return handleTwirpError(error, (message: string) => this.error(message));
    }
  }

  #getAppReviewRequirementMessage(
    appCapability: AppCapability.CustomPost | AppCapability.Payments
  ): string {
    switch (appCapability) {
      case AppCapability.CustomPost:
        return 'Creates custom posts';
      case AppCapability.Payments:
        return 'Sells digital goods or services';
    }
  }

  async #promptOpenURL(url: string): Promise<void> {
    this.log(`${url} \n(press enter to open, control-c to quit)`);

    if (await readLine()) {
      try {
        await open(url);
      } catch (_err) {
        this.error(`An error occurred when opening the URL: ${url}`);
      }
    }
    process.exit();
  }

  async #submitForReview(
    appVersionId: string,
    devvitVersion: DevvitVersion,
    visibility: AppPublishRequestVisibility
  ): Promise<void> {
    ux.action.start(`Submitting version "${devvitVersion.toString()}" for review...`);
    try {
      await this.#appPRClient.Submit({ appVersionId, visibility });
      ux.action.stop('✅');
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
