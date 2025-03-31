import os from 'node:os';

import type {
  FullAppInfo,
  FullInstallationInfo,
  MultipleInstallationsResponse,
} from '@devvit/protos/community.js';
import { InstallationType, NutritionCategory } from '@devvit/protos/community.js';
import { StringUtil } from '@devvit/shared-types/StringUtil.js';
import { DevvitVersion } from '@devvit/shared-types/Version.js';
import { Args, ux } from '@oclif/core';
import { TwirpError } from 'twirp-ts/build/twirp/errors.js';

import { getAccessTokenAndLoginIfNeeded } from '../util/auth.js';
import {
  createAppClient,
  createAppVersionClient,
  createInstallationsClient,
} from '../util/clientGenerators.js';
import { DevvitCommand, toLowerCaseArgParser } from '../util/commands/DevvitCommand.js';
import { getSubredditNameWithoutPrefix } from '../util/common-actions/getSubredditNameWithoutPrefix.js';
import { getVersionByNumber } from '../util/common-actions/getVersionByNumber.js';
import { getAppBySlug } from '../util/getAppBySlug.js';

export default class Install extends DevvitCommand {
  static override description =
    'Install an app from the App Directory to a subreddit that you moderate. Specify the version you want to install, or default to @latest';

  static override examples = [
    '$ devvit install <subreddit> [app-name][@version]',
    '$ devvit install r/MyTestSubreddit',
    '$ devvit install MyOtherTestSubreddit my-app',
    '$ devvit install r/SomeOtherSubreddit my-app@1.2.3',
    '$ devvit install r/AnotherSubreddit @1.2.3',
  ];

  static override args = {
    subreddit: Args.string({
      description:
        'Provide the name of the subreddit where you want to install. The "r/" prefix is optional',
      required: true,
      parse: toLowerCaseArgParser,
    }),
    appWithVersion: Args.string({
      description:
        'Provide the name of the app you want to install (defaults to working directory app) and version (defaults to latest)',
      required: false,
      parse: toLowerCaseArgParser,
    }),
  };

  readonly #appClient = createAppClient();
  readonly #appVersionClient = createAppVersionClient();
  readonly #installationsClient = createInstallationsClient();

  async run(): Promise<void> {
    const { args } = await this.parse(Install);
    const subreddit = getSubredditNameWithoutPrefix(args.subreddit);

    const inferredParams = await this.inferAppNameAndVersion(args.appWithVersion);

    await this.checkIfUserLoggedIn();
    await this.checkDeveloperAccount();

    const token = await getAccessTokenAndLoginIfNeeded();
    const userT2Id = await this.getUserT2Id(token);

    let appInfo: FullAppInfo | undefined;
    try {
      appInfo = await getAppBySlug(this.#appClient, {
        slug: inferredParams.appName,
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

    const appVersion = await getVersionByNumber(inferredParams.version, appInfo?.versions);

    const name = appInfo.app!.slug;
    const version = DevvitVersion.fromProtoAppVersionInfo(appVersion).toString();
    ux.action.start(`Requesting installation details on ${name}`);
    const [existingInstallInfo, nutrition] = await Promise.all([
      this.#findExistingInstallation({
        subreddit: subreddit!,
        appId: appInfo.app!.id,
      }),
      this.#appVersionClient.GetNutritionByNameVersion({ name, version }),
    ]);
    if (existingInstallInfo) {
      ux.action.stop(
        `Currently on version ${DevvitVersion.fromProtoAppVersionInfo(
          existingInstallInfo.appVersion!
        ).toString()}`
      );
    }

    this.log(nutritionCategoriesToString(name, nutrition.categories));

    ux.action.start(`Installing ${name} to r/${subreddit}`);
    let installationInfo: FullInstallationInfo;
    try {
      if (existingInstallInfo) {
        if (existingInstallInfo.appVersion && appVersion.id === existingInstallInfo.appVersion.id) {
          // exit gracefully if the current app version is already installed
          ux.action.stop(
            `Version ${DevvitVersion.fromProtoAppVersionInfo(
              existingInstallInfo.appVersion!
            ).toString()} has already been installed.`
          );
          return;
        } else {
          installationInfo = await this.#installationsClient.Upgrade({
            appVersionId: appVersion.id,
            id: existingInstallInfo.installation?.id ?? '',
          });
        }
      } else {
        installationInfo = await this.#installationsClient.Create({
          appVersionId: appVersion.id,
          runAs: userT2Id,
          type: InstallationType.SUBREDDIT,
          location: subreddit,
          upgradeStrategy: 0,
        });
      }
      ux.action.stop(
        `Successfully installed version ${DevvitVersion.fromProtoAppVersionInfo(
          installationInfo.appVersion!
        ).toString()}!`
      );
    } catch (err: unknown) {
      ux.action.stop('Error');
      this.error(
        `An error occurred while installing your app: ${StringUtil.caughtToString(err, 'message')}`
      );
    }
  }

  async #findExistingInstallation({
    subreddit,
    appId,
  }: {
    subreddit: string;
    appId: string;
  }): Promise<FullInstallationInfo | undefined> {
    let existingInstalls: MultipleInstallationsResponse = { installations: [] };
    try {
      existingInstalls = await this.#installationsClient.GetAllWithInstallLocation({
        location: subreddit,
        type: InstallationType.SUBREDDIT,
      });
    } catch (err) {
      if (err instanceof TwirpError) {
        if (err.code === 'not_found') {
          this.error(`Community '${subreddit}' not found.`);
        }
      }
      throw err;
    }

    const fullInstallInfoList = await Promise.all(
      existingInstalls.installations.map((install) => {
        // TODO I'm not a fan of having to re-fetch these installs to get the app IDs
        // TODO we should update the protobuf to include the app and app version IDs
        return this.#installationsClient.GetByUUID({ id: install.id });
      })
    );

    return fullInstallInfoList.find((install) => {
      return install.app?.id === appId;
    });
  }
}

function nutritionCategoriesToString(name: string, cats: readonly NutritionCategory[]): string {
  if (!cats.length) return `${name} requires no permissions!`;
  return `${name} may:\n${cats
    .map(
      (cat) =>
        ` • ${
          nutritionCategoryToString[cat] ??
          nutritionCategoryToString[NutritionCategory.UNRECOGNIZED]
        }`
    )
    .join(os.EOL)}`;
}

const nutritionCategoryToString: Readonly<Record<NutritionCategory, string>> = {
  [NutritionCategory.UNCATEGORIZED]: 'Use uncategorized permissions.',
  [NutritionCategory.APP_TRIGGERS]: 'Execute when installed or upgraded.',
  [NutritionCategory.ASSETS]: 'Present predefined audio-visual media.',
  [NutritionCategory.DATA]: 'Read and write _app_ data to Reddit servers.',
  [NutritionCategory.HTTP]: 'Read and write _any_ data to and from the internet.',
  [NutritionCategory.MODERATOR]:
    "Appear and act as a moderator on subreddits where it's installed.",
  [NutritionCategory.MODLOG]: 'Read and write to Reddit moderator logs.',
  [NutritionCategory.PAYMENTS]: 'Sell digital goods or services.',
  [NutritionCategory.REDDIT_API]: 'Read and write _any_ Reddit data.',
  [NutritionCategory.REDDIT_TRIGGERS]:
    'Observe Reddit events such as post creation, comment deletion, and more.',
  [NutritionCategory.SCHEDULER]: 'Schedule itself for later execution.',
  [NutritionCategory.UI]: 'Appear in subreddit, post, and comment menu entries, and custom posts.',
  [NutritionCategory.UNRECOGNIZED]: 'Use unknown permissions.',
  [NutritionCategory.WEBVIEW]: 'Embed webapps to display rich content.',
  [NutritionCategory.CUSTOM_POST]: 'Can create a custom post.',
};
