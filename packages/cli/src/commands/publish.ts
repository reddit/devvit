import type { LinkedBundle } from '@devvit/protos';
import type {
  AppInfo,
  FullAppInfo,
  FullAppVersionInfo,
  OptionalVersionVisibility,
} from '@devvit/protos/community.js';
import {
  AppVersionUpdateRequest,
  GetAppBySlugRequest,
  InstallationType,
  VersionVisibility,
} from '@devvit/protos/community.js';
import { StringUtil } from '@devvit/shared-types/StringUtil.js';
import { DevvitVersion } from '@devvit/shared-types/Version.js';
import { Args, ux } from '@oclif/core';
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

  readonly #appClient = createAppClient();
  readonly #appVersionClient = createAppVersionClient();
  readonly #appPRClient = createAppPublishRequestClient();

  async run(): Promise<void> {
    const { args } = await this.parse(Publish);
    const appWithVersion = await this.inferAppNameAndVersion(args.appWithVersion);

    await this.checkIfUserLoggedIn();
    await this.checkDevvitTermsAndConditions();

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

    const resp = await this.#appVersionClient.GetAppVersionBundle({
      id: appVersion.id,
    });
    const bundle = resp.actorBundles[0].bundle;
    if (!bundle) {
      this.error(`There was an error getting the bundles for that app version.`);
    }

    const appCreatesCustomPost = await this.#checkIfAppCreatesCustomPost(bundle);
    if (appCreatesCustomPost) {
      this.log(
        "Custom post apps need to be approved before they can be published, so I'll submit your app for review!"
      );
      await this.#submitForReview(appVersion.id, devvitVersion);
      return;
    }

    const appUsesFetch = await this.#checkIfAppUsesFetch(bundle);
    const appDetailsUrl = `${DEVVIT_PORTAL_URL}/apps/${appInfo.app.slug}`;

    if (appUsesFetch) {
      await this.checkAppVersionTermsAndConditions(appInfo.app, appDetailsUrl);
    }

    if (appVersion.visibility !== VersionVisibility.PRIVATE) {
      this.log(
        `Version "${devvitVersion}" has already been published.\n\n✨ Visit ${chalk.cyan.bold(
          `${appDetailsUrl}`
        )} to view your app!`
      );
      return;
    }

    await this.#updateVersion(appVersion.id, devvitVersion);
    this.log(`\n✨ Visit ${chalk.cyan.bold(`${appDetailsUrl}`)} to view your app!`);
  }

  async #updateVersion(
    appVersionId: string,
    devvitVersion: DevvitVersion
  ): Promise<FullAppVersionInfo> {
    const visibility: OptionalVersionVisibility = {
      value: VersionVisibility.UNLISTED,
    };

    const appVersionUpdateRequest = AppVersionUpdateRequest.fromPartial({
      id: appVersionId,
      visibility,
      validInstallTypes: [InstallationType.SUBREDDIT],
    });

    ux.action.start(`Publishing version "${devvitVersion.toString()}" to Reddit...`);
    try {
      const appVersionInfo = await this.#appVersionClient.Update(appVersionUpdateRequest);
      ux.action.stop(`Success! ✅`);

      await this.#submitForReview(appVersionId, devvitVersion);

      return appVersionInfo;
    } catch (error) {
      return handleTwirpError(error, (message: string) => this.error(message));
    }
  }

  /**
   * throws error if the app is not found, or if the user doesn't have permission to view the app
   */
  async getAppBySlug(slug: string): Promise<FullAppInfo> {
    try {
      return await this.#appClient.GetBySlug(GetAppBySlugRequest.fromPartial({ slug }));
    } catch (err) {
      this.error(StringUtil.caughtToString(err));
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

  async #submitForReview(appVersionId: string, devvitVersion: DevvitVersion): Promise<void> {
    ux.action.start(`Submitting version "${devvitVersion.toString()}" for review...`);
    try {
      await this.#appPRClient.Submit({ appVersionId });
      ux.action.stop(`Success! ✅ You'll receive a DM when your app has been reviewed.`);
      return;
    } catch (err) {
      if (err && typeof err === 'object' && 'code' in err && err.code === 'already_exists') {
        this.error('This version has already been submitted for review.');
      }
      this.error(StringUtil.caughtToString(err));
    }
  }
}
