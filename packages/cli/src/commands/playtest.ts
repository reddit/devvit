import { updateBundleServer, updateBundleVersion } from '@devvit/build-pack/esbuild/ESBuildPack.js';
import type { FullInstallationInfo } from '@devvit/protos/community.js';
import { type FullAppInfo, InstallationType, VersionVisibility } from '@devvit/protos/community.js';
import type { Bundle } from '@devvit/protos/types/devvit/plugin/buildpack/buildpack_common.js';
import {
  ACTOR_SRC_DIR,
  ACTOR_SRC_PRIMARY_NAME,
  MAX_ALLOWED_SUBSCRIBER_COUNT,
  PRODUCTS_JSON_FILE,
} from '@devvit/shared-types/constants.js';
import { debounce } from '@devvit/shared-types/debounce.js';
import { StringUtil } from '@devvit/shared-types/StringUtil.js';
import { DevvitVersion, VersionBumpType } from '@devvit/shared-types/Version.js';
import { Args, Flags, ux } from '@oclif/core';
import chalk from 'chalk';
import chokidar from 'chokidar';
import path from 'path';
import type { Subscription } from 'rxjs';
import { map } from 'rxjs';
import { TwirpError, TwirpErrorCode } from 'twirp-ts';

import type { StoredToken } from '../lib/auth/StoredToken.js';
import { REDDIT_DESKTOP } from '../lib/config.js';
import { fetchSubredditSubscriberCount, isCurrentUserEmployee } from '../lib/http/gql.js';
import { PlaytestServer } from '../lib/playtest-server.js';
import type { CommandFlags } from '../lib/types/oclif.js';
import { makeLogSubscription } from '../util/app-logs/make-log-subscription.js';
import { AppVersionUploader } from '../util/AppVersionUploader.js';
import { getAccessTokenAndLoginIfNeeded } from '../util/auth.js';
import { Bundler, type BundlerResult } from '../util/Bundler.js';
import { checkAppNameAvailability } from '../util/checkAppNameAvailability.js';
import {
  createAppClient,
  createAppVersionClient,
  createInstallationsClient,
} from '../util/clientGenerators.js';
import { toLowerCaseArgParser } from '../util/commands/DevvitCommand.js';
import { DevvitCommand } from '../util/commands/DevvitCommand.js';
import { getSubredditNameWithoutPrefix } from '../util/common-actions/getSubredditNameWithoutPrefix.js';
import { installOnSubreddit } from '../util/common-actions/installOnSubreddit.js';
import { waitUntilVersionBuildComplete } from '../util/common-actions/waitUntilVersionBuildComplete.js';
import { getAppBySlug } from '../util/getAppBySlug.js';
import { Project } from '../util/project.js';
import Logs from './logs.js';

export default class Playtest extends DevvitCommand {
  static override description =
    'Installs your app to your test subreddit and starts a playtest session where a new version is installed whenever you save changes to your app code, and logs are continuously streamed';

  static override examples = [
    '$ devvit playtest',
    '$ devvit playtest <subreddit>',
    '$ devvit playtest r/myTestSubreddit',
    '$ devvit playtest myOtherTestSubreddit',
  ];

  static override flags = {
    ...Logs.flags,
    'employee-update': Flags.boolean({
      aliases: ['employeeUpdate'],
      description:
        "I'm an employee and I want to update someone else's app. (This will only work if you're an employee.)",
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
    debounce: Flags.integer({
      description: 'Debounce time in milliseconds for file changes',
      required: false,
    }),
  } as const;

  static override args = {
    subreddit: Args.string({
      description: `Provide the name of a small test subreddit with <${MAX_ALLOWED_SUBSCRIBER_COUNT} members. The "r/" prefix is optional. Leaving this empty will use the subreddit set in the in the "dev.subreddit" field of devvit.json. If neither is set, we will create a "r/[app-name]_dev" subreddit for you.`,
      required: false,
      parse: toLowerCaseArgParser,
    }),
  } as const;

  // API Clients
  readonly #installationsClient = createInstallationsClient();
  readonly #appClient = createAppClient();
  readonly #appVersionClient = createAppVersionClient();

  readonly #bundler: Bundler = new Bundler();

  // Args
  #subreddit?: string; // unprefixed
  #flags?: CommandFlags<typeof Playtest>;

  // State
  #appInfo?: FullAppInfo | undefined;
  #version?: DevvitVersion;
  #installationInfo?: FullInstallationInfo | undefined;
  #lastBundles: Bundle[] | undefined;
  #lastQueuedBundles: Bundle[] | undefined;
  #isOnWatchExecuting: boolean = false;

  // Processes
  #appLogSub?: Subscription;
  #watchSrc?: Subscription;
  #watchAssets?: chokidar.FSWatcher;
  #watchConfigFile?: chokidar.FSWatcher;
  #server?: PlaytestServer;

  async #getExistingInstallInfo(
    appName: string,
    subreddit: string
  ): Promise<FullInstallationInfo | undefined> {
    ux.action.start(`Checking for existing installation`);
    try {
      const result = await this.#installationsClient.GetByAppNameAndInstallLocation({
        location: subreddit,
        type: InstallationType.SUBREDDIT,
        slug: appName,
      });
      ux.action.stop();

      return result;
    } catch (err) {
      if (err instanceof TwirpError && err.code === TwirpErrorCode.NotFound) {
        ux.action.stop(`No existing installation found.`);
        // ignore
        return;
      } else {
        ux.action.stop();

        this.error('Something went wrong when checking for existing installations');
      }
    }
  }

  override async run(): Promise<void> {
    // Despite the name, finally() is only invoked on successful termination.
    process.on('SIGINT', () => {
      void this.#onExit();
    });

    const { args, flags } = await this.parse(Playtest);
    this.#flags = flags;

    this.project.flag.watchDebounceMillis = this.#flags?.['debounce'] as number | undefined;
    this.project.flag.subreddit = args.subreddit;

    const token = await getAccessTokenAndLoginIfNeeded();
    const username = await this.getUserDisplayName(token);
    await this.checkDeveloperAccount();

    if (flags.connect) {
      this.#server = new PlaytestServer(
        {
          dateFormat: undefined,
          runtime: flags['log-runtime'],
          verbose: flags.verbose,
          showTimestamps: flags['show-timestamps'],
        },
        this
      );
      this.#server.open();
    }

    this.#appInfo = await getAppBySlug(this.#appClient, {
      slug: this.project.name,
      limit: 1, // fetched version limit; we only need the latest one
    });

    if (!this.#appInfo?.app) {
      this.error(
        "Your app doesn't exist yet - you'll need to run 'devvit upload' before you can playtest your app."
      );
    }
    this.project.app.defaultPlaytestSubredditId = this.#appInfo.app.defaultPlaytestSubredditId;

    const isOwner = this.#appInfo?.app?.owner?.displayName === username;
    await this.#checkIfUserAllowedToPlaytestThisApp(
      this.project.name,
      isOwner,
      token,
      flags['employee-update']
    );

    // Set the target subreddit to the passed argument, or to the config subreddit, or to the app's default, in this order.
    // If none of these are set, it will be undefined, and we will create a new playtest subreddit.
    const targetSubreddit = this.project.getSubreddit('Dev');
    if (targetSubreddit) {
      this.#subreddit = getSubredditNameWithoutPrefix(targetSubreddit);
    }
    const shouldWriteToConfig = !this.#subreddit;

    let latestVersion = this.#appInfo.versions[0];
    this.#version = new DevvitVersion(
      latestVersion.majorVersion,
      latestVersion.minorVersion,
      latestVersion.patchVersion,
      latestVersion.prereleaseVersion
    );

    if (this.#subreddit) {
      // alert user if they're about to run playtest in a large subreddit
      const subscriberCount = await fetchSubredditSubscriberCount(this.#subreddit, token);

      if (subscriberCount > MAX_ALLOWED_SUBSCRIBER_COUNT) {
        this.error(
          `Playtest can only be used in a small test subreddit. Please try again in a community with less than ${MAX_ALLOWED_SUBSCRIBER_COUNT} members.`
        );
      }
    } else {
      this.log(chalk.green(`We'll create a default playtest subreddit for your app!`));
      // TODO: consider having a dedicated endpoint to create the playtest subreddit so we don't have to upload a new version
      // We need to upload a new version to create a new playtest subreddit
      this.#version.bumpVersion(VersionBumpType.Prerelease);

      const appVersionCreator = new AppVersionUploader(this, {
        verbose: Boolean(this.#flags?.verbose),
      });

      const bundles = await this.#bundler.bundle(this.project, {
        name: ACTOR_SRC_PRIMARY_NAME,
        owner: username,
        version: this.#version.toString(),
      });
      latestVersion = await appVersionCreator.createVersion(
        {
          appId: this.#appInfo.app.id,
          appSlug: this.#appInfo.app.slug,
          appSemver: this.#version,
          visibility: VersionVisibility.PRIVATE,
        },
        bundles,
        false
      );

      // Since we created a subreddit, we reload the app info to get the newly created subreddit ID
      this.#appInfo = await getAppBySlug(this.#appClient, {
        slug: this.project.name,
        limit: 1, // fetched version limit; we only need the latest one
      });
      if (!this.#appInfo?.app) {
        this.error(
          'Something went wrong: we could not find your app after creating a new playtest subreddit. Please try again.'
        );
      } else if (!this.#appInfo.app.defaultPlaytestSubredditId) {
        this.error(
          'Something went wrong: we could not find the newly created playtest subreddit. Please playtest on a different subreddit using `devvit playtest <your_subreddit>` instead.'
        );
      }
      this.#subreddit = this.#appInfo.app.defaultPlaytestSubredditId;
      // Delay writing to the config so we can write the subreddit name from the installation instead of the ID
    }

    // before starting playtest session, make sure app has been installed to the test subreddit:
    this.#installationInfo = await this.#getExistingInstallInfo(this.project.name, this.#subreddit);

    if (!this.#installationInfo) {
      ux.action.start(`Installing`);
      try {
        const userT2Id = await this.getUserT2Id(token);
        this.#installationInfo = await installOnSubreddit(
          this,
          this.#appVersionClient,
          this.#installationsClient,
          userT2Id,
          latestVersion,
          this.#subreddit
        );

        ux.action.stop();
      } catch (err: unknown) {
        ux.action.stop('Error');
        this.error(
          `An error occurred while installing your app: ${StringUtil.caughtToString(err, 'message')}`
        );
      }
    }
    this.#subreddit = this.#installationInfo.installation!.location!.name;
    if (shouldWriteToConfig) {
      this.project.setSubreddit(this.#subreddit, 'Dev'); // Write the new default playtest subreddit to the project config
    }

    this.#appLogSub = makeLogSubscription(
      {
        subreddit: this.#installationInfo.installation!.location!.id,
        appName: this.project.name,
      },
      this,
      flags as CommandFlags<typeof Logs>
    );

    this.#startWatchingSrc(username);
    this.#startWatchingAssets();
    this.#startWatchingConfigFile();

    // We don't know when the user is done. If connected to a terminal, end when
    // stdin is closed. Otherwise, close immediately to avoid the chance that
    // forever processes are created. This is the approach taken by esbuild,
    // https://github.com/evanw/esbuild/commit/77194c8.
    if (process.stdin.isTTY) {
      await new Promise((resolve) => process.stdin.once('close', resolve));
    }
  }

  protected override async init(): Promise<void> {
    await super.init('Dynamic');
  }

  /**
   * Watching source code changes
   */
  #startWatchingSrc(username: string): void {
    const watchSrc = this.#bundler.watch(this.project, this.project.root, {
      name: ACTOR_SRC_PRIMARY_NAME,
      owner: username,
      // Version is always incorrect since it changes on each upload and the
      // watch request isn't reissued.
      version: '0.0.0',
    });

    // Async subscribers are
    // unsupported (https://github.com/ReactiveX/rxjs/issues/2827). Pipe all
    // bundles through an asynchronous observable and only open a subscription
    // for errors. We just dispose the source (bundler) to unsubscribe.
    this.#watchSrc = watchSrc
      .pipe(map((result: BundlerResult) => this.#onWatch(result)))
      .subscribe({ error: this.#onWatchError });
  }

  #startWatchingAssets(): void {
    const productsJSON = path.join(this.project.root, ACTOR_SRC_DIR, PRODUCTS_JSON_FILE);

    const assetPaths = [productsJSON];
    if (this.project.mediaDir) assetPaths.push(path.join(this.project.root, this.project.mediaDir));
    if (this.project.clientDir)
      assetPaths.push(path.join(this.project.root, this.project.clientDir));
    if (this.project.server?.entry)
      assetPaths.push(path.join(this.project.root, this.project.server.entry));
    this.#watchAssets = chokidar.watch(assetPaths, { ignoreInitial: true });

    this.#watchAssets.on('all', () => {
      // asset changes don't result in a code change, so just re-send the last bundles
      this.#onWatch({ bundles: this.#lastBundles });
    });
  }

  #startWatchingConfigFile(): void {
    const configFile = path.join(this.project.root, this.project.filename);
    this.#watchConfigFile = chokidar.watch(configFile, { ignoreInitial: true });

    this.#watchConfigFile.on('all', async (ev) => {
      if (ev === 'change' || ev === 'add')
        try {
          this.project = await Project.new(this.project.root, this.project.filename, 'Dynamic');
        } catch (err) {
          this.error(`Config load failure: ${StringUtil.caughtToString(err, 'message')}.`, {
            exit: false,
          });
        }

      // A lot can change when the config is modified. Eg:
      // - The project name can change.
      // - The watch dir can change. The watch process must be restarted.
      // - A single property can change. Identifying it requires config diff
      //   support and reloading requires examining the state fanout.
      // - The file can be renamed. This would require recomputing the project
      //   root and restarting the watch process.
      // - The config can be invalid or the file deleted.
      this.log(`${this.project.filename} modified; some changes may require a playtest restart.`);
    });
  }

  #onWatch = debounce(
    (result: BundlerResult) => {
      void this.#onWatchActual(result);
    },
    // Use a lambda here, because value won't be set at class construction time.
    () => this.project.watchDebounceMillis
  );

  #onWatchActual = async (result: BundlerResult): Promise<void> => {
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

    // No bundles produced, ignore
    if (!result.bundles?.length) {
      return;
    }

    this.#lastBundles = result.bundles;

    this.#isOnWatchExecuting = true;

    if (!this.#appInfo?.app) {
      this.error(`Something went wrong: App ${this.project.name} is not found`);
    }

    if (!this.#version) {
      this.error('Something went wrong: no version of this app exists.');
    }

    // 1. bump playtest version:
    this.#version.bumpVersion(VersionBumpType.Prerelease);

    try {
      // 2. update bundle:
      updateBundleVersion(this.#lastBundles, this.#version.toString());
      try {
        updateBundleServer(this.#lastBundles, this.project.root, this.project.server);
      } catch (err) {
        this.error(err instanceof Error ? err.message : String(err), { exit: false });
        return;
      }

      // 3. create new playtest version:
      const appVersionCreator = new AppVersionUploader(this, {
        verbose: Boolean(this.#flags?.verbose),
      });

      const appVersionInfo = await appVersionCreator.createVersion(
        {
          appId: this.#appInfo.app.id,
          appSlug: this.#appInfo.app.slug,
          appSemver: this.#version,
          visibility: VersionVisibility.PRIVATE,
        },
        this.#lastBundles,
        true // The playtest subreddit should've already been created so we prevent creating a new one
      );

      if (this.#lastQueuedBundles) {
        // No need to go further if there's a newer playtest version is waiting
        this.#runQueuedBundlePlaytest(this.#lastQueuedBundles);
        return;
      }

      // 5. confirm new version has finished building
      await waitUntilVersionBuildComplete(this, this.#appVersionClient, appVersionInfo);

      if (this.#lastQueuedBundles) {
        // No need to go further if there's a newer playtest version is waiting
        this.#runQueuedBundlePlaytest(this.#lastQueuedBundles);
        return;
      }

      // 6. install playtest version to specified subreddit:
      ux.action.start(`Installing playtest version ${this.#version}`);
      await this.#installationsClient.Upgrade({
        id: this.#installationInfo!.installation!.id,
        appVersionId: appVersionInfo.id,
      });

      this.#server?.send({ appInstalled: {} });

      const playtestUrl = chalk.bold.green(
        `${REDDIT_DESKTOP}/r/${this.#subreddit}${
          this.#flags?.connect ? `?playtest=${this.#appInfo!.app!.slug}` : ''
        }`
      );
      ux.action.stop(
        `Success! Please visit your test subreddit and refresh to see your latest changes:\n✨ ${playtestUrl}\n`
      );
    } catch (err) {
      ux.action.stop('Error'); // Stop any spinner if it's running
      this.log(chalk.red(`Something went wrong... ${StringUtil.caughtToString(err, 'message')}`));
    }

    this.#isOnWatchExecuting = false;
    if (this.#lastQueuedBundles) {
      this.#runQueuedBundlePlaytest(this.#lastQueuedBundles);
    }
  };

  #onWatchError = (err: unknown): void => {
    this.error(`watch error: ${StringUtil.caughtToString(err, 'message')}`);
  };

  /**
   * If there's a queued watch, execute it now.
   */
  #runQueuedBundlePlaytest(newerBundles: Bundle[]): void {
    this.log('Starting a new build...');
    this.#isOnWatchExecuting = false;
    this.#lastQueuedBundles = undefined;
    this.#onWatch({ bundles: newerBundles });
  }

  async #checkIfUserAllowedToPlaytestThisApp(
    appName: string,
    isOwner: boolean,
    token: StoredToken,
    employeeUpdateFlag: boolean
  ): Promise<void> {
    if (isOwner) {
      return;
    }

    if (employeeUpdateFlag) {
      const isEmployee = await isCurrentUserEmployee(token);
      if (!isEmployee) {
        this.error(`You're not an employee, so you can't playtest someone else's app.`);
      }
      // Else, we're an employee, so we can update someone else's app
      this.warn(`Overriding ownership check because you're an employee and told me to!`);
    } else {
      // Check if the app name is available, implying this is a first run
      const appExists = await checkAppNameAvailability(this.#appClient, appName);
      if (appExists.exists) {
        this.error(`That app already exists, and you can't playtest someone else's app!`);
      }

      // App doesn't exist - tell the user to run `devvit upload` first
      this.error(
        "Your app doesn't exist yet - you'll need to run 'devvit upload' once before you can playtest your app."
      );
    }
  }

  async #onExit(): Promise<void> {
    ux.action.stop('Stopped');

    this.#watchSrc?.unsubscribe();
    this.#appLogSub?.unsubscribe();
    await this.#bundler.dispose();
    this.#server?.close();
    await this.#watchAssets?.close();
    await this.#watchConfigFile?.close();
    this.#onWatch.clear();

    this.log('Playtest session has ended.');

    // If this.#installationInfo exists that means a playtest version has already been installed
    if (this.#installationInfo) {
      const revertCommand = chalk.green(
        `devvit install ${this.#subreddit} ${this.project.name}@latest`
      );

      this.log(
        `To revert back to the latest non-playtest version of the app, run: \n${revertCommand}`
      );
    }

    process.exit(0);
  }
}
