import type { Bundle, LinkedBundle } from '@devvit/protos';
import type {
  AppAccountExistsResponse,
  AppInfo,
  AppVersionInfo,
  AppVersionUpdateRequest,
  FullAppInfo,
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
import {
  APP_SLUG_BASE_MAX_LENGTH,
  isRandomSlug,
  makeSlug,
  sluggable,
} from '@devvit/shared-types/slug.js';
import { getCaptcha } from '../util/captcha.js';
import { Bundler } from '../util/Bundler.js';
import { ACTOR_SRC_PRIMARY_NAME } from '@devvit/shared-types/constants.js';
import { updateDevvitConfig } from '../util/devvitConfig.js';

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
    let { appInfo, appVersion } = await getInfoForSlugString(appWithVersion, this.#appClient);
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
    let appDetailsUrl = `${DEVVIT_PORTAL_URL}/apps/${appInfo.app.slug}`;

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

    // If this is a temporary app name, rename it to a permanent one.
    if (isRandomSlug(appInfo.app.slug)) {
      // parentheses around this are necessary because of the destructuring; see TS2809
      ({ appInfo, appVersion } = await this.#renameApp(appInfo, appVersion));
      if (!appInfo.app) {
        this.error('There was an error retrieving the new app info; this should never happen?!');
      }

      appDetailsUrl = `${DEVVIT_PORTAL_URL}/apps/${appInfo.app.slug}`;
      this.log(
        `Your app has been renamed successfully.\n✨ Visit ${chalk.cyan.bold(
          `${appDetailsUrl}`
        )} to view your new app!`
      );
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

    if (await this.#checkIfAppUsesFetch(bundle)) {
      await this.#checkAppVersionTermsAndConditions(appInfo.app, appDetailsUrl);
    }

    await this.#submitForReview(appVersion.id, devvitVersion, visibility);

    if (await this.#checkIfAppCreatesCustomPost(bundle)) {
      this.log('Custom post apps need to be approved before they can be published');
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

  async #checkIfAppCreatesCustomPost(bundle: LinkedBundle): Promise<boolean> {
    return !!bundle.provides.find((provision) => provision.name === 'CustomPost');
  }

  async #checkIfAppUsesFetch(bundle: LinkedBundle): Promise<boolean> {
    return !!bundle.uses.find((use) => use.hostname === 'http.plugins.local');
  }

  async #checkAppVersionTermsAndConditions(app: AppInfo, appDetailsUrl: string): Promise<void> {
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

  async #renameApp(
    appInfo: FullAppInfo,
    appVersion: AppVersionInfo
  ): Promise<{ appInfo: FullAppInfo; appVersion: AppVersionInfo }> {
    // Prompt for a new app name
    const newName = await this.#promptForNewSlug(appInfo.app!.slug);

    // Create new app
    const captcha = await getCaptcha({ copyPaste: false });
    const newApp = await this.#appClient.Create({
      name: newName,
      description: appInfo.app!.description,
      isNsfw: appInfo.app!.isNsfw,
      categories: appInfo.app!.categories,
      autogenerateName: false,
      captcha,
    });

    // Update devvit.yaml with new app name
    await updateDevvitConfig(this.projectRoot, this.configFile, {
      name: newName,
    });

    // Build new actor bundle
    const bundler = new Bundler(false);
    let actorBundles: Bundle[];

    try {
      actorBundles = [
        await bundler.bundle(this.projectRoot, {
          name: ACTOR_SRC_PRIMARY_NAME,
          owner: newApp.owner!.displayName,
          version: DevvitVersion.fromProtoAppVersionInfo(appVersion).toString(),
        }),
      ];
    } catch (err) {
      this.error(StringUtil.caughtToString(err));
    }

    // Upload version of app
    const newAppVersion = await this.#appVersionClient.Create({
      appId: newApp.id,
      visibility: VersionVisibility.PRIVATE,
      validInstallTypes: appVersion.validInstallTypes,
      majorVersion: appVersion.majorVersion,
      minorVersion: appVersion.minorVersion,
      patchVersion: appVersion.patchVersion,
      prereleaseVersion: appVersion.prereleaseVersion,
      about: appVersion.about,
      actorBundles,
    });

    // Archive old app
    await this.#appClient.Unpublish({
      slug: appInfo.app!.slug,
      shouldDelist: false,
    });

    // Return new app & version info
    return {
      appInfo: {
        app: newApp,
        versions: [newAppVersion], // we just made the app this is a safe assumption
      },
      appVersion: newAppVersion,
    };
  }

  async #promptForNewSlug(oldSlug: string): Promise<string> {
    this.log(`The app name "${oldSlug}" is temporary, and must be changed before publishing.`);
    let appSlug = '';

    for (;;) {
      const rsp = await inquirer.prompt([
        {
          default: appSlug,
          name: 'appSlug',
          type: 'input',
          message: 'Pick a name for your app:',
          validate: async (input: string) => {
            if (!sluggable(input)) {
              return `The name of your app must be between 3 and ${APP_SLUG_BASE_MAX_LENGTH} characters long, and contains only alphanumeric characters, spaces, and dashes.`;
            }
            return true;
          },
          filter: (input: string) => {
            return makeSlug(input.trim().toLowerCase());
          },
        },
      ]);
      appSlug = rsp.appSlug;
      if (appSlug) {
        const isAvailableResponse = await this.#checkAppNameAvailability(appSlug);
        if (!isAvailableResponse.exists) {
          // Doesn't exist, we're good
          return appSlug;
        }
        this.warn(`The app name "${appSlug}" is unavailable.`);
        if (isAvailableResponse.suggestions.length > 0) {
          this.log(
            `Here's some suggestions:\n  * ${isAvailableResponse.suggestions.join('\n  * ')}`
          );
          appSlug = isAvailableResponse.suggestions[0];
        }
      }
    }
  }

  async #checkAppNameAvailability(name: string): Promise<AppAccountExistsResponse> {
    const [appAccountExistsRes, appExistsRes] = await Promise.all([
      this.#appClient.AppAccountExists({ accountName: name }),
      this.#appClient.Exists({ slug: name }),
    ]);

    return {
      exists: appAccountExistsRes.exists || appExistsRes.exists,
      suggestions: appAccountExistsRes.suggestions,
    };
  }
}
