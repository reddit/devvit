import type { Bundle } from '@devvit/protos';
import { ActorSpec, DependencySpec, RemoteLogType, Severity, UUID } from '@devvit/protos';
import type { AppVersionInfo, FullInstallationInfo } from '@devvit/protos/community.js';
import {
  BuildStatus,
  GetAllWithInstallLocationRequest,
  InstallationCreationRequest,
  InstallationType,
  InstallationUpgradeRequest,
  VersionVisibility,
  type FullAppInfo,
} from '@devvit/protos/community.js';
import { StringUtil } from '@devvit/shared-types/StringUtil.js';
import { DevvitVersion, VersionBumpType } from '@devvit/shared-types/Version.js';
import {
  ACTOR_SRC_DIR,
  ACTOR_SRC_PRIMARY_NAME,
  MAX_ALLOWED_SUBSCRIBER_COUNT,
} from '@devvit/shared-types/constants.js';
import { Args, Flags, ux } from '@oclif/core';
import type { FlagInput } from '@oclif/core/lib/interfaces/parser.js';
import chalk from 'chalk';
import path from 'path';
import type { Subscription } from 'rxjs';
import { filter, map, merge, retry } from 'rxjs';
import Upload from '../commands/upload.js';
import { REDDIT_DESKTOP } from '../lib/config.js';
import { fetchSubredditSubscriberCount } from '../lib/http/gql.js';
import { PlaytestServer } from '../lib/playtest-server.js';
import type { CommandFlags } from '../lib/types/oclif.js';
import { Bundler } from '../util/Bundler.js';
import { AppLogObserver } from '../util/app-logs/app-log-observer.js';
import { createInstallationsClient, createRemoteLoggerClient } from '../util/clientGenerators.js';
import { toLowerCaseArgParser } from '../util/commands/DevvitCommand.js';
import { slugVersionStringToUUID } from '../util/common-actions/slugVersionStringToUUID.js';
import { updateDevvitConfig } from '../util/devvitConfig.js';

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
      connect: Flags.boolean({
        // to-do: DX-4706 enable.
        default: false,
        description: 'Connect to local runtime.',
        // to-do: DX-4706 delete.
        hidden: true,
      }),
      'log-runtime': Flags.boolean({
        description:
          'Include executing runtime in logs. Remote logs originate from apps running on Reddit servers, local logs originate from your browser.',
        // to-do: DX-4706 delete.
        hidden: true,
      }),
      // to-do: delete. This only exists in case users dislike live-reload.
      'no-live-reload': Flags.boolean({
        description: 'Attempt to reload the subreddit being browsed automatically.',
        // to-do: DX-4706 delete.
        hidden: true,
      }),
      verbose: Flags.boolean({ default: false }),
    };
  }

  static override args = {
    subreddit: Args.string({
      description: `Provide the name of a small test subreddit with <${MAX_ALLOWED_SUBSCRIBER_COUNT} members. The "r/" prefix is optional`,
      required: true,
      parse: toLowerCaseArgParser,
    }),
  };

  readonly #installationsClient = createInstallationsClient(this);
  #appLogSub?: Subscription;
  readonly #bundler: Bundler = new Bundler(true);
  #existingInstallInfo?: FullInstallationInfo | undefined;
  #appInfo?: FullAppInfo | undefined;
  #version?: DevvitVersion;
  #lastQueuedBundle: undefined | Readonly<Bundle>;
  #isOnWatchExecuting: boolean = false;
  #server?: PlaytestServer;
  #flags?: CommandFlags<typeof Playtest>;

  async #getExistingInstallInfo(subreddit: string): Promise<FullInstallationInfo | undefined> {
    const existingInstalls = await this.#installationsClient.GetAllWithInstallLocation(
      GetAllWithInstallLocationRequest.fromPartial({
        type: InstallationType.SUBREDDIT,
        location: subreddit,
      })
    );
    const fullInstallInfoList = await Promise.all(
      existingInstalls.installations.map((install) => {
        // TODO I'm not a fan of having to re-fetch these installs to get the app IDs
        // TODO we should update the protobuf to include the app and app version IDs
        return this.#installationsClient.GetByUUID(UUID.fromPartial({ id: install.id }));
      })
    );

    return fullInstallInfoList.find((install) => {
      return install.app?.id === this.#appInfo?.app?.id;
    });
  }

  async checkVersionBuildStatus(appVersionInfo: AppVersionInfo): Promise<boolean> {
    ux.action.start('App is building remotely...');
    for (let i = 0; i < 5 && appVersionInfo.buildStatus === BuildStatus.BUILDING; i++) {
      // version is still building: wait and try again
      await sleep(1000);
      const info = await this.appVersionClient.Get({ id: appVersionInfo.id });

      if (!info.appVersion) {
        this.error('Something went wrong, no app version available.');
      }

      appVersionInfo = info.appVersion;
    }
    if (appVersionInfo.buildStatus === BuildStatus.READY) {
      ux.action.stop(`✅`);
    } else {
      this.warn('Something went wrong: the previous version did not build successfully.');
    }
    return appVersionInfo.buildStatus === BuildStatus.READY;
  }

  override async run(): Promise<void> {
    // Despite the name, finally() is only invoked on successful termination.
    process.on('SIGINT', () => void this.#onExit());

    const { args, flags } = await this.parse(Playtest);
    this.#flags = flags;

    if (flags.connect) {
      this.#server = new PlaytestServer(
        { dateFormat: undefined, runtime: flags['log-runtime'], verbose: flags.verbose },
        this
      );
      this.#server.open();
    }

    const token = await this.getAccessTokenAndLoginIfNeeded();
    const username = await this.getUserDisplayName(token);
    await this.checkDevvitTermsAndConditions();

    const projectConfig = await this.getProjectConfig();
    const appName = projectConfig.slug ?? projectConfig.name;

    const subreddit = args.subreddit.startsWith('r/')
      ? args.subreddit.substring(2)
      : args.subreddit;

    this.#appInfo = await this.getAppBySlug(appName);

    if (!this.#appInfo) {
      this.error(
        `Your app doesn't exist yet - you'll need to run 'devvit upload' before you can playtest your app.`
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

    const srcDir = path.join(this.projectRoot, ACTOR_SRC_DIR);
    const watch = this.#bundler.watch(srcDir, {
      name: ACTOR_SRC_PRIMARY_NAME,
      owner: username,
      version: projectConfig.version,
    });

    // before starting playtest session, make sure app has been installed to the test subreddit:
    const appWithVersion = `${appName}@${this.#version}`;
    const appVersionId = await slugVersionStringToUUID(appWithVersion, this.appClient);

    ux.action.start(`Checking for existing installation...`);
    this.#existingInstallInfo = await this.#getExistingInstallInfo(subreddit);

    if (!this.#existingInstallInfo) {
      const userT2Id = await this.getUserT2Id(token);

      ux.action.start(`Installing...`);
      try {
        this.#existingInstallInfo = await this.#installationsClient.Create(
          InstallationCreationRequest.fromPartial({
            appVersionId,
            runAs: userT2Id,
            type: InstallationType.SUBREDDIT,
            location: subreddit,
          })
        );
      } catch {
        this.error('There was an error installing your app. Please try again later.');
      }
    }

    this.#appLogSub = this.#newAppLogSub(
      appName,
      flags['log-runtime'],
      this.#existingInstallInfo.installation!.location!.id,
      flags.verbose
    );

    // Async subscribers are
    // unsupported (https://github.com/ReactiveX/rxjs/issues/2827). Pipe all
    // bundles through an asynchronous observable and only open a subscription
    // for errors. We just dispose the source (bundler) to unsubscribe.
    watch
      .pipe(map((bundle: Bundle | undefined) => this.#onWatch(bundle, subreddit)))
      .subscribe({ error: this.#onWatchError });

    // We don't know when the user is done. If connected to a terminal, end when
    // stdin is closed. Otherwise, close immediately to avoid the chance that
    // forever processes are created. This is the approach taken by esbuild,
    // https://github.com/evanw/esbuild/commit/77194c8.
    if (process.stdin.isTTY) {
      await new Promise((resolve) => process.stdin.once('close', resolve));
    }
  }

  #newAppLogSub(
    appName: string,
    logRuntime: boolean,
    subreddit: string,
    verbose: boolean
  ): Subscription {
    const client = createRemoteLoggerClient(this);
    const subredditAppName = { appName, subreddit };
    const now = new Date();

    const logs = client.Tail({
      type: RemoteLogType.LOG,
      subredditAppName,
      since: now,
    });
    const errors = client.Tail({
      type: RemoteLogType.ERROR,
      subredditAppName,
      since: now,
    });

    return merge(logs, errors)
      .pipe(retry({ count: 5, delay: 1_000, resetOnSuccess: true }))
      .pipe(filter((log) => verbose || log.log?.severity !== Severity.VERBOSE))
      .subscribe(
        new AppLogObserver(
          {
            dateFormat: undefined,
            json: false,
            runtime: logRuntime,
            showKeepAlive: false,
            verbose,
          },
          this
        )
      );
  }

  #onWatch = async (bundle: Readonly<Bundle> | undefined, subreddit: string): Promise<void> => {
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
      this.#lastQueuedBundle = bundle;
      return;
    }

    if (!bundle) {
      return;
    }

    if (!this.#version) {
      this.error('Something went wrong: no version of this app exists.');
    }

    this.#isOnWatchExecuting = true;

    // 1. bump playtest version:
    this.#version.bumpVersion(VersionBumpType.Prerelease);

    // 2. update devvit yaml:
    await updateDevvitConfig(this.projectRoot, {
      version: this.#version.toString(),
    });

    // 3. update bundle version:
    modifyBundleVersion(bundle, this.#version.toString());

    // 4. create new playtest version:
    const appVersionInfo = await this.createVersion(
      this.#appInfo!,
      this.#version,
      [bundle],
      VersionVisibility.PRIVATE
    );

    // 5. confirm new version has finished building:
    if (!(await this.checkVersionBuildStatus(appVersionInfo))) {
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

    ux.action.start(`Installing playtest version ${this.#version}...`);
    await this.#installationsClient.Upgrade(
      InstallationUpgradeRequest.fromPartial({
        id: this.#existingInstallInfo!.installation!.id,
        appVersionId,
      })
    );
    if (!this.#flags?.['no-live-reload']) this.#server?.send({ appInstalled: {} });
    ux.action.stop(
      `✅\nSuccess! Please visit your test subreddit and refresh to see your latest changes:\n✨ ${playtestUrl}\n`
    );

    this.#isOnWatchExecuting = false;
    // If there's a queued watch, execute it now.
    if (this.#lastQueuedBundle) {
      const newerBundle = this.#lastQueuedBundle;
      this.#lastQueuedBundle = undefined;
      await this.#onWatch(newerBundle, subreddit); // subreddit won't change between calls!
    }
  };

  #onWatchError = (err: unknown): void => {
    this.error(`watch error: ${StringUtil.caughtToString(err)}`);
  };

  async #onExit(): Promise<void> {
    const revertCommand = chalk.blue(
      `devvit install ${this.#existingInstallInfo!.installation!.location!.name} ${
        this.#appInfo!.app!.slug
      }@latest`
    );

    this.#appLogSub?.unsubscribe();
    await this.#bundler.dispose();
    this.#server?.close();
    this.log(
      `\nYour playtest session has ended, but your playtest version is still installed. To revert back to the latest non-playtest version of the app, run: \n${revertCommand}`
    );
  }
}

export function modifyBundleVersion(bundle: Bundle, version: string): void {
  bundle.dependencies ??= DependencySpec.fromPartial({});
  bundle.dependencies.actor ??= ActorSpec.fromPartial({});

  bundle.dependencies.actor.version = version.toString();
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
