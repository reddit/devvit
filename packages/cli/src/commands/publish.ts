import {
  type AppVersionUpdateRequest,
  type FullAppInfo,
  type FullAppVersionInfo,
  NutritionCategory,
} from '@devvit/protos/community.js';
import {
  AppPublishRequestVisibility,
  InstallationType,
  VersionVisibility,
} from '@devvit/protos/community.js';
import { AppPublishRequestStatus } from '@devvit/protos/types/devvit/dev_portal/app_publish_request/app_publish_request.js';
import { PaymentsVerificationStatus } from '@devvit/protos/types/devvit/dev_portal/payments/payments_verification.js';
import { appCapabilitiesFromLinkedBundle } from '@devvit/shared-types/AppCapabilities.js';
import { StringUtil } from '@devvit/shared-types/StringUtil.js';
import { DevvitVersion } from '@devvit/shared-types/Version.js';
import { Args, Flags, ux } from '@oclif/core';
import chalk from 'chalk';
import open from 'open';

import { isCurrentUserEmployee } from '../lib/http/gql.js';
import { getAccessToken } from '../util/auth.js';
import {
  createAppClient,
  createAppPublishRequestClient,
  createAppVersionClient,
  createDeveloperSettingsClient,
} from '../util/clientGenerators.js';
import { ProjectCommand } from '../util/commands/ProjectCommand.js';
import { getVersionByNumber } from '../util/common-actions/getVersionByNumber.js';
import { DEVVIT_PORTAL_URL } from '../util/config.js';
import { getAppBySlug } from '../util/getAppBySlug.js';
import { readLine } from '../util/input-util.js';
import { handleTwirpError } from '../util/twirp-error-handler.js';

const appCapabilityToReviewRequirementMessage: Record<
  NutritionCategory.CUSTOM_POST | NutritionCategory.PAYMENTS,
  string
> = {
  [NutritionCategory.CUSTOM_POST]: 'Creates custom posts',
  [NutritionCategory.PAYMENTS]: 'Sells digital goods or services',
};

const DEVELOPER_SETTINGS_PATH = `${DEVVIT_PORTAL_URL}/my/settings`;

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
  } as const;

  static override flags = {
    public: Flags.boolean({
      description: 'Submit the app for review to be published publicly',
      required: false,
    }),
    withdraw: Flags.boolean({
      description: 'Withdraw the publish request (if it exists and is pending)',
      required: false,
    }),
  } as const;

  readonly #appClient = createAppClient();
  readonly #appVersionClient = createAppVersionClient();
  readonly #appPRClient = createAppPublishRequestClient();
  readonly #developerSettingsClient = createDeveloperSettingsClient();

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Publish);
    const inferredParams = await this.inferAppNameAndVersion(args.appWithVersion);

    await this.checkIfUserLoggedIn();
    await this.checkDeveloperAccount();

    ux.action.start(`Finding ${inferredParams.appName}@${inferredParams.version}`);
    let appInfo: FullAppInfo | undefined;
    try {
      appInfo = await getAppBySlug(this.#appClient, {
        slug: inferredParams.appName,
        hidePrereleaseVersions: true,
      });
    } catch (err) {
      this.error(
        `App ${inferredParams.appName} is not found. Please run 'devvit upload' and try again.\n${StringUtil.caughtToString(err, 'message')}`
      );
    }

    if (!appInfo?.app) {
      this.error(
        `App ${inferredParams.appName} is not found. Please run 'devvit upload' and try again.`
      );
    }

    const appVersion = getVersionByNumber(inferredParams.version, appInfo.versions);
    ux.action.stop();

    if (flags.withdraw) {
      if (flags.public) {
        this.error(
          'Do not use --public and --withdraw together - if you want to withdraw a public request, just use --withdraw by itself.'
        );
      }
      // If we're just withdrawing the request, do that & exit early
      await this.#withdrawRequest(appVersion.id);
      return;
    }

    const devvitVersion = new DevvitVersion(
      appVersion.majorVersion,
      appVersion.minorVersion,
      appVersion.patchVersion,
      appVersion.prereleaseVersion
    );

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

    let visibility: AppPublishRequestVisibility = AppPublishRequestVisibility.UNLISTED;
    if (flags.public) {
      visibility = AppPublishRequestVisibility.PUBLIC;
    }

    const appCapabilities = appCapabilitiesFromLinkedBundle(bundle);
    const appSettingsURL = `${appDetailsUrl}/developer-settings`;

    if (
      appCapabilities.includes(NutritionCategory.HTTP) &&
      (!appInfo.app.termsAndConditions || !appInfo.app.privacyPolicy)
    ) {
      this.log(
        'Apps that use the http plugin must have terms & conditions and a privacy policy linked before publishing. Add these links on the app details page and run `devvit publish` again.'
      );
      await this.#promptOpenURL(appSettingsURL);
    }

    if (appCapabilities.includes(NutritionCategory.PAYMENTS)) {
      if (!appInfo.app.termsAndConditions) {
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
          this.log(
            `${verificationErrorPrefix} Your payments verification is pending. Please wait for it to complete before publishing.`
          );
          return;
        }

        if (verificationStatusResp.status !== PaymentsVerificationStatus.VERIFICATION_SUCCESS) {
          this.log(
            `${verificationErrorPrefix} You need to complete payments verification or remove payments features before you can publish your app. Verify your account here: `
          );
          await this.#promptOpenURL(DEVELOPER_SETTINGS_PATH);
        }
      }
    }

    await this.#submitForReview(appVersion.id, devvitVersion, visibility);

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

    await this.#updateVersion(appVersion.id, devvitVersion);

    this.log("Your app is now unlisted. You can install it anywhere you're a moderator!");

    if (visibility === AppPublishRequestVisibility.PUBLIC) {
      this.log("You'll receive an email when your app has been approved.");
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

  async #promptOpenURL(url: string): Promise<void> {
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

  async #withdrawRequest(appVersionId: string) {
    ux.action.start('Withdrawing publish request');
    try {
      await this.#appPRClient.Update({
        appVersionId,
        status: AppPublishRequestStatus.WITHDRAWN,
      });
    } catch (err) {
      ux.action.stop('Error');
      if (err && typeof err === 'object' && 'code' in err && err.code === 'not_found') {
        this.error('No publish request found to withdraw!');
      }
      this.error(StringUtil.caughtToString(err, 'message'));
    }
    ux.action.stop();
  }
}
