import type { AppVersionInfo, FullInstallationInfo } from '@devvit/protos/community.js';
import {
  BuildStatus,
  type FullAppInfo,
  InstallationType,
  VersionVisibility,
} from '@devvit/protos/community.js';
import type { Bundle } from '@devvit/protos/types/devvit/plugin/buildpack/buildpack_common.js';
import { ASSET_DIRNAME, WEB_VIEW_ASSET_DIRNAME } from '@devvit/shared-types/Assets.js';
import {
  ACTOR_SRC_DIR,
  ACTOR_SRC_PRIMARY_NAME,
  MAX_ALLOWED_SUBSCRIBER_COUNT,
  PRODUCTS_JSON_FILE,
} from '@devvit/shared-types/constants.js';
import { StringUtil } from '@devvit/shared-types/StringUtil.js';
import { DevvitVersion, VersionBumpType } from '@devvit/shared-types/Version.js';
import { Args, Flags, ux } from '@oclif/core';
import type { FlagInput } from '@oclif/core/lib/interfaces/parser.js';
import chalk from 'chalk';
import chokidar from 'chokidar';
import path from 'path';
import type { Subscription } from 'rxjs';
import { map } from 'rxjs';

import Upload from '../commands/upload.js';
import { REDDIT_DESKTOP } from '../lib/config.js';
import { fetchSubredditSubscriberCount, isCurrentUserEmployee } from '../lib/http/gql.js';
import { playLockCheck, playLockRemove, playLockWrite } from '../lib/playtest-lockfile.js';
import { PlaytestServer } from '../lib/playtest-server.js';
import type { CommandFlags } from '../lib/types/oclif.js';
import { makeLogSubscription } from '../util/app-logs/make-log-subscription.js';
import { getAccessTokenAndLoginIfNeeded } from '../util/auth.js';
import { Bundler, type BundlerResult } from '../util/Bundler.js';
import { checkAppNameAvailability } from '../util/checkAppNameAvailability.js';
import { createInstallationsClient } from '../util/clientGenerators.js';
import { toLowerCaseArgParser } from '../util/commands/DevvitCommand.js';
import { getSubredditNameWithoutPrefix } from '../util/common-actions/getSubredditNameWithoutPrefix.js';
import { slugVersionStringToUUID } from '../util/common-actions/slugVersionStringToUUID.js';
import { updateDevvitConfig } from '../util/devvitConfig.js';
import { getAppBySlug } from '../util/utils.js';
import Logs from './logs.js';

export default class Playtest extends Upload {
  static override description =
    'Installs your app to your test subreddit and starts a playtest session where a new version is installed whenever you save changes to your app code, and logs are continuously streamed';

  static override examples = [
    '$ devvit playtest <subreddit>',
    '$ devvit playtest r/myTestSubreddit',
    '$ devvit playtest myOtherTestSubreddit',
  ];

  static override get flags(): FlagInput {
    return {
      ...Logs.flags,
      // to-do: delete. This only exists in case users dislike live-reload.
      'no-live-reload': Flags.boolean({
        description: 'Attempt to reload the subreddit being browsed automatically.',
      }),
      'employee-update': Flags.boolean({
        name: 'employee-update',
        description:
          "I'm an employee and I want to update someone else's app. (This will only work if you're an employee.)",
        required: false,
        hidden: true,
      }),
      'no-lockfile': Flags.boolean({
        name: 'no-lockfile',
        description: 'Disable process checking and lockfile generation.',
        required: false,
        hidden: true,
      }),
    };
  }

  static override args = {
    subreddit: Args.string({
      description: `Provide the name of a small test subreddit with <${MAX_ALLOWED_SUBSCRIBER_COUNT} members. The "r/" prefix is optional`,
      required: true,
      parse: toLowerCaseArgParser,
    }),
  };

  readonly #installationsClient = createInstallationsClient();
  #appLogSub?: Subscription;
  readonly #bundler: Bundler = new Bundler(true);
  #installationInfo?: FullInstallationInfo | undefined;
  #appInfo?: FullAppInfo | undefined;
  #version?: DevvitVersion;
  #lastBundles: Bundle[] | undefined;
  #lastQueuedBundles: Bundle[] | undefined;
  #isOnWatchExecuting: boolean = false;
  #server?: PlaytestServer;
  #flags?: CommandFlags<typeof Playtest>;
  #watchAssets?: chokidar.FSWatcher;

  #subreddit?: string;
  #appName?: string;

  async #getExistingInstallInfo(subreddit: string): Promise<FullInstallationInfo | undefined> {
    const existingInstalls = await this.#installationsClient.GetAllWithInstallLocation({
      location: subreddit,
      type: InstallationType.SUBREDDIT,
    });
    const fullInstallInfoList = await Promise.all(
      existingInstalls.installations.map((install) => {
        // TODO I'm not a fan of having to re-fetch these installs to get the app IDs
        // TODO we should update the protobuf to include the app and app version IDs
        return this.#installationsClient.GetByUUID({ id: install.id });
      })
    );

    return fullInstallInfoList.find((install) => {
      return install.app?.id === this.#appInfo?.app?.id;
    });
  }

  async #checkVersionBuildStatus(appVersionInfo: AppVersionInfo): Promise<boolean> {
    ux.action.start('App is building remotely');
    for (let i = 0; i < 20 && appVersionInfo.buildStatus === BuildStatus.BUILDING; i++) {
      // version is still building: wait and try again
      await sleep(2000);
      const info = await this.appVersionClient.Get({ id: appVersionInfo.id });

      if (!info.appVersion) {
        this.error('Something went wrong, no app version available.');
      }

      appVersionInfo = info.appVersion;

      if (i === 10) {
        this.log(`Your app's taking a while to build - sorry for the delay!`);
      }
    }
    if (appVersionInfo.buildStatus === BuildStatus.READY) {
      ux.action.stop();
    } else {
      this.warn('Something went wrong: the previous version did not build successfully.');
    }
    return appVersionInfo.buildStatus === BuildStatus.READY;
  }

  override async run(): Promise<void> {
    // Despite the name, finally() is only invoked on successful termination.
    process.on('SIGINT', () => {
      void this.#onExit();
    });

    const { args, flags } = await this.parse(Playtest);
    this.#flags = flags;
    this.#subreddit = args.subreddit;

    const projectConfig = await this.getProjectConfig();
    this.#appName = projectConfig.slug ?? projectConfig.name;

    if (!this.#flags?.['no-lockfile']) {
      await playLockCheck();
      await playLockWrite(this.#appName);
    }

    if (flags.connect) {
      this.#server = new PlaytestServer(
        { dateFormat: undefined, runtime: flags['log-runtime'], verbose: flags.verbose },
        this
      );
      this.#server.open();
    }

    const token = await getAccessTokenAndLoginIfNeeded();
    const username = await this.getUserDisplayName(token);
    await this.checkDeveloperAccount();

    const appInfo: FullAppInfo | undefined = await getAppBySlug(this.appClient, this.#appName);

    if (appInfo?.app?.owner?.displayName !== username) {
      if (flags['employee-update']) {
        const isEmployee = await isCurrentUserEmployee(token);
        if (!isEmployee) {
          this.error(`You're not an employee, so you can't playtest someone else's app.`);
        }
        // Else, we're an employee, so we can update someone else's app
        this.warn(`Overriding ownership check because you're an employee and told me to!`);
      } else {
        // Check if the app name is available, implying this is a first run
        const appExists = await checkAppNameAvailability(this.appClient, this.#appName);
        if (appExists.exists) {
          this.error(`That app already exists, and you can't playtest someone else's app!`);
        }

        // App doesn't exist - tell the user to run `devvit upload` first
        this.error(
          "Your app doesn't exist yet - you'll need to run 'devvit upload' once before you can playtest your app."
        );
      }
    }

    const subreddit = getSubredditNameWithoutPrefix(args.subreddit);

    this.#appInfo = await getAppBySlug(this.appClient, this.#appName);

    if (!this.#appInfo) {
      this.error(
        "Your app doesn't exist yet - you'll need to run 'devvit upload' before you can playtest your app."
      );
    }

    // alert user if they're about to run playtest in a large subreddit
    const subscriberCount = await fetchSubredditSubscriberCount(subreddit, token);

    if (subscriberCount > MAX_ALLOWED_SUBSCRIBER_COUNT) {
      this.error(
        `Playtest can only be used in a small test subreddit. Please try again in a community with less than ${MAX_ALLOWED_SUBSCRIBER_COUNT} members.`
      );
    }

    const v = this.#appInfo.versions[0];
    this.#version = new DevvitVersion(
      v.majorVersion,
      v.minorVersion,
      v.patchVersion,
      v.prereleaseVersion
    );

    const assetDir = path.join(this.projectRoot, ASSET_DIRNAME);
    const webViewAssetDir = path.join(this.projectRoot, WEB_VIEW_ASSET_DIRNAME);
    const productsJSON = path.join(this.projectRoot, ACTOR_SRC_DIR, PRODUCTS_JSON_FILE);

    const watchSrc = this.#bundler.watch(this.projectRoot, {
      name: ACTOR_SRC_PRIMARY_NAME,
      owner: username,
      version: projectConfig.version,
    });

    const assetPaths = [assetDir, webViewAssetDir, productsJSON];
    this.#watchAssets = chokidar.watch(assetPaths, { ignoreInitial: true });

    this.#watchAssets.on('all', () => {
      // asset changes don't result in a code change, so just re-send the last bundles
      void this.#onWatch({ bundles: this.#lastBundles }, subreddit);
    });

    // before starting playtest session, make sure app has been installed to the test subreddit:
    const appWithVersion = `${this.#appName}@${this.#version}`;
    const appVersionId = await slugVersionStringToUUID(appWithVersion, this.appClient);

    ux.action.start(`Checking for existing installation`);
    this.#installationInfo = await this.#getExistingInstallInfo(subreddit);

    if (!this.#installationInfo) {
      ux.action.stop(`No existing installation.`);

      const userT2Id = await this.getUserT2Id(token);

      ux.action.start(`Installing`);
      try {
        this.#installationInfo = await this.#installationsClient.Create({
          appVersionId,
          runAs: userT2Id,
          type: InstallationType.SUBREDDIT,
          location: subreddit,
          upgradeStrategy: 0,
        });
      } catch (err: unknown) {
        ux.action.stop('Error');
        this.error(
          `An error occurred while installing your app: ${StringUtil.caughtToString(err, 'message')}`
        );
      }
      ux.action.stop();
    } else {
      ux.action.stop(`Found!`);
    }

    this.#appLogSub = makeLogSubscription(
      {
        subreddit: this.#installationInfo.installation!.location!.id,
        appName: this.#appName,
      },
      this,
      flags as CommandFlags<typeof Logs>
    );

    // Async subscribers are
    // unsupported (https://github.com/ReactiveX/rxjs/issues/2827). Pipe all
    // bundles through an asynchronous observable and only open a subscription
    // for errors. We just dispose the source (bundler) to unsubscribe.
    watchSrc
      .pipe(map((result: BundlerResult) => this.#onWatch(result, subreddit)))
      .subscribe({ error: this.#onWatchError });

    // We don't know when the user is done. If connected to a terminal, end when
    // stdin is closed. Otherwise, close immediately to avoid the chance that
    // forever processes are created. This is the approach taken by esbuild,
    // https://github.com/evanw/esbuild/commit/77194c8.
    if (process.stdin.isTTY) {
      await new Promise((resolve) => process.stdin.once('close', resolve));
    }
  }

  #onWatch = async (result: BundlerResult, subreddit: string): Promise<void> => {
    /* We have to do this here because none of the rxjs functions fit this use case perfectly. What
     * we need is something that serializes this whole pipeline, but also discards all but the most
     * recent value once we resume processing. We would love to use one of these, but...
     * - concatMap(): Serializes the pipeline correctly but doesn't discard intermediate values. We
     *    only care about the latest bundle, not a queue of bundles.
     * - exhaustMap(): Serializes the pipeline correctly but won't enqueue the latest value.
     * - switchMap(): Takes the latest value correctly but doesn't serialize the pipeline, and we
     *    don't support cancel.
     * There is probably a way to do this using pure RxJS, but it seems substantially more difficult
     * than just doing it ourselves here.
     */
    if (this.#isOnWatchExecuting) {
      // if we're already executing, queue this watch to be executed after we're done
      this.#lastQueuedBundles = result.bundles;
      return;
    }

    if (!result.bundles) {
      return;
    }

    this.#lastBundles = result.bundles;

    if (!this.#lastBundles) {
      return;
    }

    if (!this.#appInfo?.app) {
      this.error(`Something went wrong: App is not found`);
    }

    if (!this.#version) {
      this.error('Something went wrong: no version of this app exists.');
    }

    this.#isOnWatchExecuting = true;

    // 1. bump playtest version:
    this.#version.bumpVersion(VersionBumpType.Prerelease);

    // 2. update devvit yaml:
    await updateDevvitConfig(this.projectRoot, this.configFile, {
      version: this.#version.toString(),
    });

    // 3. update bundle version:
    modifyBundleVersions(this.#lastBundles, this.#version.toString());

    // 4. create new playtest version:
    let appVersionInfo: AppVersionInfo;
    try {
      appVersionInfo = await this.createVersion(
        this.#appInfo!.app,
        this.#version,
        this.#lastBundles,
        VersionVisibility.PRIVATE
      );
    } catch (err) {
      ux.action.stop(chalk.red('Error'));
      if (err instanceof Error) {
        this.log(chalk.red(`\n${StringUtil.caughtToString(err, 'message')}\n`)); // Don't log as error so we don't exit the process.
      } else {
        this.error(
          `An unknown error occurred when creating the app version.\n${StringUtil.caughtToString(err, 'message')}`
        );
      }
      this.#isOnWatchExecuting = false;
      return;
    }

    // 5. confirm new version has finished building:
    if (!(await this.#checkVersionBuildStatus(appVersionInfo))) {
      this.error('App version did not build successfully.');
    }

    // 6. install playtest version to specified subreddit:
    const appWithVersion = `${this.#appInfo!.app!.slug}@${this.#version}`;
    const appVersionId = await slugVersionStringToUUID(appWithVersion, this.appClient);
    const playtestUrl = chalk.bold.green(
      `${REDDIT_DESKTOP}/r/${subreddit}${
        this.#flags?.connect ? `?playtest=${this.#appInfo!.app!.slug}` : ''
      }`
    );

    ux.action.start(`Installing playtest version ${this.#version}`);
    await this.#installationsClient.Upgrade({
      id: this.#installationInfo!.installation!.id,
      appVersionId,
    });

    if (!this.#flags?.['no-live-reload']) {
      this.#server?.send({ appInstalled: {} });
    }

    ux.action.stop(
      `Success! Please visit your test subreddit and refresh to see your latest changes:\n✨ ${playtestUrl}\n`
    );

    this.#isOnWatchExecuting = false;
    // If there's a queued watch, execute it now.
    if (this.#lastQueuedBundles) {
      const newerBundles = this.#lastQueuedBundles;
      this.#lastQueuedBundles = undefined;
      await this.#onWatch({ bundles: newerBundles }, subreddit); // subreddit won't change between calls!
    }
  };

  #onWatchError = (err: unknown): void => {
    this.error(`watch error: ${StringUtil.caughtToString(err, 'message')}`);
  };

  async #onExit(): Promise<void> {
    ux.action.stop('Stopped');

    this.#appLogSub?.unsubscribe();
    await this.#bundler.dispose();
    this.#server?.close();
    await this.#watchAssets?.close();
    await playLockRemove();

    this.log('Playtest session has ended.');

    // If this.#installationInfo exists that means a playtest version has already been installed
    if (this.#installationInfo) {
      const revertCommand = chalk.green(
        `devvit install ${this.#subreddit} ${this.#appName}@latest`
      );

      this.log(
        `To revert back to the latest non-playtest version of the app, run: \n${revertCommand}`
      );
    }

    process.exit(0);
  }
}

export function modifyBundleVersions(bundles: Bundle[], version: string): void {
  for (const bundle of bundles) {
    bundle.dependencies ??= { hostname: '', provides: [], uses: [] };
    bundle.dependencies.actor ??= { name: '', owner: '', version: '' };
    bundle.dependencies.actor.version = version.toString();
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
