import { existsSync } from 'node:fs';
import path from 'node:path';

import { updateBundleServer, updateBundleVersion } from '@devvit/build-pack/esbuild/ESBuildPack.js';
import type { AppVersionInfo, FullInstallationInfo } from '@devvit/protos/community.js';
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
import { execaCommand } from 'execa';
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
import { killProcessTree, killProcessTreeSync } from '../util/kill-process-tree.js';
import { isWebContainer } from '../util/platform-util.js';
import { devvitClassicConfigFilename, devvitV1ConfigFilename } from '../util/project.js';
import { logInBox } from '../util/ui.js';
import Logs from './logs.js';

const CONFIG_RELOAD_STORM_WINDOW_MILLIS = 3_000;
const MAX_CONFIG_RELOADS_PER_WINDOW = 2;

/**
 * How long the `scripts.dev` output directories must stay quiet (no file
 * additions/changes observed by chokidar) before we treat the first build
 * as complete. Picked to absorb back-to-back writes across vite's
 * client/server environments without adding noticeable startup latency.
 */
const DEV_SCRIPT_BUILD_STABLE_MILLIS = 300;
/** Hard ceiling so a misconfigured `scripts.dev` cannot hang playtest forever. */
const DEV_SCRIPT_BUILD_TIMEOUT_MILLIS = 60_000;
/**
 * Grace period between SIGTERM and SIGKILL to the `scripts.dev` process group.
 * Long enough for vite/esbuild to flush, short enough that Ctrl+C feels snappy.
 */
const DEV_SCRIPT_KILL_GRACE_MILLIS = 2_000;

type RunningDevScript = {
  subprocess: ReturnType<typeof execaCommand>;
  /**
   * Synchronous cleanup registered on `process.on('exit', ...)` to kill the
   * subprocess tree when the parent exits via paths that bypass our SIGINT
   * handler (e.g. `this.error()`, uncaught exceptions, oclif's
   * `process.exit(2)` after a thrown `CLIError`). Without this hook the
   * shell and its vite/esbuild children would be reparented to PID 1 (or
   * leak as a Windows job) and keep running.
   */
  killOnExit: () => void;
};

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

  #bundler: Bundler | undefined;

  // Args
  #subreddit?: string; // unprefixed
  #flags?: CommandFlags<typeof Playtest & typeof DevvitCommand>;

  // State
  #appInfo?: FullAppInfo | undefined;
  #version?: DevvitVersion;
  #installationInfo?: FullInstallationInfo | undefined;
  #lastBundles: Bundle[] | undefined;
  #lastQueuedBundles: Bundle[] | undefined;
  #isOnWatchExecuting: boolean = false;

  // Processes
  #appLogSub?: Subscription;
  #watchAssets?: chokidar.FSWatcher;
  #watchConfigFile?: chokidar.FSWatcher;
  #watchSrc?: Subscription;
  #server?: PlaytestServer;
  #devScript?: RunningDevScript | undefined;
  #hasShownPlaytestReadyMessage: boolean = false;
  #configReloadWindowStartMs: number | undefined;
  #configReloadCount: number = 0;

  async #startDevScript(): Promise<void> {
    const devCommand = this.project.appConfig?.scripts?.dev;
    if (!devCommand) return;

    if (this.#flags?.verbose) {
      const truncatedCommand = devCommand.length > 60 ? devCommand.substr(0, 60) + '…' : devCommand;
      ux.action.start(`Starting dev command: "${truncatedCommand}"`);
    }
    try {
      // `shell: true` wraps the user's command in `/bin/sh -c …` (or
      // `cmd.exe`), so a SIGTERM sent to the subprocess only kills the
      // shell - vite/esbuild children would be reparented to PID 1 and keep
      // running. execa cannot abstract this for us:
      // https://github.com/sindresorhus/execa/issues/96. `detached: true`
      // puts the shell in its own POSIX process group so we can signal the
      // whole tree with `process.kill(-pid, ...)`; on Windows we rely on
      // `taskkill /T /F` instead. See `util/kill-process-tree.ts`.
      const subprocess = execaCommand(devCommand, {
        cwd: this.project.root,
        preferLocal: true,
        shell: true,
        stdout: 'inherit',
        stderr: 'inherit',
        detached: process.platform !== 'win32',
      });

      const killOnExit = () => {
        killProcessTreeSync(subprocess);
      };
      process.once('exit', killOnExit);
      this.#devScript = { subprocess, killOnExit };

      await new Promise<void>((resolve, reject) => {
        subprocess.once('spawn', () => resolve());
        subprocess.once('error', (err) => reject(err));
      });

      subprocess.on('exit', (exitCode, signal) => {
        if (exitCode != null && exitCode !== 0) {
          this.warn(
            `scripts.dev exited with ${exitCode ?? 'unknown'}${signal ? ` (${signal})` : ''}`
          );
        }
      });

      // Prevent unhandled promise rejections if `scripts.dev` exits non-zero while playtest continues.
      void subprocess.catch(() => {});
    } catch (err) {
      ux.action.stop('Error');
      this.error(`Failed to start scripts.dev: ${StringUtil.caughtToString(err, 'message')}`);
    }
    ux.action.stop('OK');
  }

  async #stopDevScript(): Promise<void> {
    if (!this.#devScript) return;
    const running = this.#devScript;
    this.#devScript = undefined;
    process.removeListener('exit', running.killOnExit);

    await killProcessTree(running.subprocess, {
      gracePeriodMillis: DEV_SCRIPT_KILL_GRACE_MILLIS,
    });
  }

  /**
   * Block until `scripts.dev` produces a complete first build.
   *
   * `#startDevScript` only awaits the subprocess `spawn` event, so without
   * this gate we'd race vite/esbuild's first write of `dist/server` and
   * `dist/client` and bundle/install whatever happens to be on disk -
   * typically empty or partially written on a fresh checkout, or stale
   * artifacts from a previous run.
   *
   * We watch the configured output directories with chokidar. Every
   * add/change resets a `DEV_SCRIPT_BUILD_STABLE_MILLIS` debounce; the
   * build is "done" when no events fire for that long. `ignoreInitial:
   * true` ensures we don't accept a leftover `dist/` as proof of a
   * successful first build - we always require at least one post-start
   * write event. Watching whole output dirs (rather than the configured
   * entrypoints) means partial builds where the entrypoint is flushed
   * before chunks/sourcemaps don't trip us up.
   *
   * Returns early if `scripts.dev` exits, and times out after
   * `DEV_SCRIPT_BUILD_TIMEOUT_MILLIS` so a misconfigured script can't
   * hang playtest indefinitely.
   */
  async #waitForFirstBuild(): Promise<void> {
    if (!this.project.appConfig?.scripts?.dev) return;

    const watchPaths = this.#devScriptOutputDirs();
    if (watchPaths.length === 0) return;

    // No spinner: the dev script's stdout (vite/esbuild startup logs) would
    // interrupt cli-ux's in-place rendering and produce duplicated lines.
    this.log('Starting the build...');
    const watcher = chokidar.watch(watchPaths, {
      ignoreInitial: true,
      // Don't fire `add`/`change` until each file has finished being
      // written, to avoid resolving on a half-flushed bundle.
      awaitWriteFinish: { stabilityThreshold: 100, pollInterval: 50 },
    });
    const subprocess = this.#devScript?.subprocess;

    type Outcome = 'ok' | 'timeout' | 'devScriptExited' | { error: Error };
    try {
      const outcome = await new Promise<Outcome>((resolve) => {
        let stableTimer: ReturnType<typeof setTimeout> | undefined;
        let settled = false;
        const settle = (value: Outcome): void => {
          if (settled) return;
          settled = true;
          if (stableTimer) clearTimeout(stableTimer);
          clearTimeout(timeoutTimer);
          resolve(value);
        };
        const onActivity = (): void => {
          if (stableTimer) clearTimeout(stableTimer);
          stableTimer = setTimeout(() => settle('ok'), DEV_SCRIPT_BUILD_STABLE_MILLIS);
        };

        const timeoutTimer = setTimeout(() => settle('timeout'), DEV_SCRIPT_BUILD_TIMEOUT_MILLIS);

        watcher.on('add', onActivity);
        watcher.on('change', onActivity);
        watcher.on('error', (err) =>
          settle({ error: err instanceof Error ? err : new Error(String(err)) })
        );

        // Race against the subprocess promise (rather than .once('exit')) so
        // we still catch the case where it has already exited by the time
        // we attach.
        const onDevScriptExited = (): void => settle('devScriptExited');
        subprocess?.then(onDevScriptExited, onDevScriptExited);
      });

      if (outcome === 'devScriptExited') {
        this.warn('scripts.dev exited before producing a first build.');
      } else if (outcome === 'timeout') {
        this.warn(
          `scripts.dev did not produce expected build outputs within ${
            DEV_SCRIPT_BUILD_TIMEOUT_MILLIS / 1_000
          }s; continuing with whatever is on disk.`
        );
      } else if (outcome !== 'ok') {
        this.warn(
          `Failed to watch for first build: ${StringUtil.caughtToString(outcome.error, 'message')}; continuing.`
        );
      }
    } finally {
      await watcher.close();
    }
  }

  /** Output directories `scripts.dev` is expected to populate. */
  #devScriptOutputDirs(): string[] {
    const dirs = new Set<string>();
    if (this.project.server) {
      dirs.add(path.resolve(this.project.root, this.project.server.dir));
    }
    if (this.project.post) {
      dirs.add(path.resolve(this.project.root, this.project.post.dir));
    }
    return [...dirs];
  }

  /**
   * Build a bundle from the developer's local source and create a new private
   * app version on the server. Always waits for `scripts.dev`'s first build
   * (`firstBuild`) before bundling so we never upload a stale or partial
   * `dist/`.
   */
  async #createPlaytestVersion(args: {
    version: DevvitVersion;
    username: string;
    firstBuild: Promise<void>;
    preventSubredditCreation: boolean;
  }): Promise<AppVersionInfo> {
    if (!this.#bundler) throw Error('no bundler');
    if (!this.#appInfo?.app) throw Error('no app info');

    await args.firstBuild;

    const bundles = await this.#bundler.bundle(this.project, {
      name: ACTOR_SRC_PRIMARY_NAME,
      owner: args.username,
      version: args.version.toString(),
    });

    return await new AppVersionUploader(this, {
      verbose: Boolean(this.#flags?.verbose),
    }).createVersion(
      {
        appId: this.#appInfo.app.id,
        appSlug: this.#appInfo.app.slug,
        appSemver: args.version,
        visibility: VersionVisibility.PRIVATE,
      },
      bundles,
      args.preventSubredditCreation
    );
  }

  async #getExistingInstallInfo(
    appName: string,
    subreddit: string
  ): Promise<FullInstallationInfo | undefined> {
    if (this.#flags?.verbose) {
      ux.action.start(`Checking for existing installation`);
    }
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
    process.on('SIGINT', this.#onExit);

    const { args, flags } = await this.parse(Playtest);
    this.#flags = flags;

    this.#bundler = new Bundler();
    this.project.flag.watchDebounceMillis = this.#flags?.['debounce'] as number | undefined;
    this.project.flag.subreddit = args.subreddit;

    await this.#startDevScript();
    // Block until the dev script has produced a complete first build, so we
    // never bundle/install a stale or partial dist/. Done in parallel with
    // auth so we don't add latency for users without a `scripts.dev`.
    const firstBuild = this.#waitForFirstBuild();

    const token = await getAccessTokenAndLoginIfNeeded(
      isWebContainer() ? 'CopyPaste' : 'LocalSocket'
    );
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
        "Your app doesn't exist yet - you'll need to run 'npx devvit init' before you can playtest your app."
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

    const hasDevScript = !!this.project.appConfig?.scripts?.dev;
    let latestVersion: AppVersionInfo | undefined =
      this.#appInfo.versions.length > 0 ? this.#appInfo.versions[0] : undefined;
    // Tracks whether `latestVersion` was just built from the developer's
    // current source. When true, we skip the redundant upload below.
    let uploadedFromLocalSource = false;

    if (!latestVersion) {
      this.log(chalk.green(`We'll create a default playtest subreddit for your app!`));
      latestVersion = await this.#createPlaytestVersion({
        version: new DevvitVersion(0, 0, 1),
        username,
        firstBuild,
        preventSubredditCreation: false,
      });
      uploadedFromLocalSource = true;
      await this.#refreshAppInfoAndSetSubreddit();
      // Delay writing to the config so we can write the subreddit name from the installation instead of the ID
    }

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
    }

    // Build & upload a fresh playtest version from the developer's local source
    // unless we just created v0.0.1 above. Without this, a fresh subreddit (or
    // a re-install after `devvit uninstall`) would install whatever was last
    // published, firing that version's `onAppInstall` and other triggers
    // instead of the developer's current code. Skipped when there is no
    // `scripts.dev` and the playtest subreddit already exists - then there's
    // nothing local to upload yet, so we install the published version as
    // before. The no-subreddit case always uploads to trigger playtest
    // subreddit creation server-side.
    const shouldCreatePlaytestSubreddit = !this.#subreddit;
    const shouldUploadFreshVersion =
      !uploadedFromLocalSource && (shouldCreatePlaytestSubreddit || hasDevScript);
    if (shouldUploadFreshVersion) {
      if (shouldCreatePlaytestSubreddit) {
        this.log(chalk.green(`We'll create a default playtest subreddit for your app!`));
      }
      this.#version.bumpVersion(VersionBumpType.Prerelease);
      latestVersion = await this.#createPlaytestVersion({
        version: this.#version,
        username,
        firstBuild,
        preventSubredditCreation: !shouldCreatePlaytestSubreddit,
      });
      if (shouldCreatePlaytestSubreddit) {
        await this.#refreshAppInfoAndSetSubreddit();
        // Delay writing to the config so we can write the subreddit name from the installation instead of the ID
      }
    }

    if (!this.#subreddit) {
      this.error(
        'Automatic subreddit creation failed. Please create a subreddit, and either set DEVVIT_SUBREDDIT in your .env file, or set "dev.subreddit" in devvit.json. Then run this command again.'
      );
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
          this.#subreddit,
          Boolean(this.#flags?.verbose)
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
    if (!this.#bundler) throw Error('no bundler');
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
    if (this.project.server)
      // Watch the server directory to allow the watched file to be renamed or deleted.
      assetPaths.push(path.join(this.project.root, this.project.server.dir, '..'));
    if (this.project.appConfig?.marketingAssets?.icon) {
      assetPaths.push(path.join(this.project.root, this.project.appConfig.marketingAssets.icon));
    }
    this.#watchAssets = chokidar.watch(assetPaths, { ignoreInitial: true });

    this.#watchAssets.on('all', () => {
      // asset changes don't result in a code change, so just re-send the last bundles
      this.#onWatch({ bundles: this.#lastBundles });
    });
  }

  #startWatchingConfigFile(): void {
    // Watch the owning directory to support deletes and renames.
    const files = this.#flags?.config
      ? [path.dirname(path.resolve(this.project.root, this.project.filename))]
      : [path.resolve(this.project.root)];

    if (this.project.appConfig?.payments?.productsFile) {
      // Also watch the products file if one is configured
      files.push(path.resolve(this.project.root, this.project.appConfig.payments.productsFile));
    }

    this.#watchConfigFile = chokidar.watch(files, {
      ignoreInitial: true,
      depth: 0,
    });
    this.#watchConfigFile.on('all', this.#onConfigFileModified);
  }

  #onConfigFileModified = async (
    ev: 'add' | 'addDir' | 'change' | 'unlink' | 'unlinkDir',
    file: string
  ): Promise<void> => {
    // Does the file exist?
    if (ev !== 'add' && ev !== 'change') return;

    // Is the file the config?
    const baseFile = path.basename(file);
    const resolvedFile = path.resolve(file);

    const isFlaggedConfigFile =
      this.#flags?.config &&
      path.resolve(this.project.root, this.#flags.config as string) === resolvedFile;
    const isDefaultConfigFile =
      !this.#flags?.config &&
      (baseFile === devvitV1ConfigFilename || baseFile === devvitClassicConfigFilename);
    const isProductsFile =
      this.project.appConfig?.payments?.productsFile &&
      resolvedFile ===
        path.resolve(this.project.root, this.project.appConfig.payments.productsFile);

    if (!isFlaggedConfigFile && !isDefaultConfigFile && !isProductsFile) return;

    if (this.#isConfigReloadStorm()) {
      this.warn(
        `Detected repeated config changes in a short period. ` +
          `Auto-reloading playtest is temporarily disabled to avoid an infinite loop.\n` +
          `If your scripts are rewriting ${devvitV1ConfigFilename}, stop them or restart playtest manually.`
      );
      return;
    }

    ux.action.start(`Reloading config`);
    try {
      await this.init();
    } catch (err) {
      ux.action.stop(`Error: ${StringUtil.caughtToString(err, 'message')}.`);
      return;
    }
    ux.action.stop(`OK`);

    await this.#destroyWatchers();
    await this.run();
  };

  #isConfigReloadStorm(): boolean {
    const now = Date.now();
    const windowStart = this.#configReloadWindowStartMs;
    if (windowStart == null || now - windowStart > CONFIG_RELOAD_STORM_WINDOW_MILLIS) {
      this.#configReloadWindowStartMs = now;
      this.#configReloadCount = 1;
      return false;
    }

    this.#configReloadCount += 1;
    return this.#configReloadCount > MAX_CONFIG_RELOADS_PER_WINDOW;
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

    if (
      this.project.server &&
      !existsSync(
        path.resolve(this.project.root, this.project.server.dir, this.project.server.entry)
      )
    ) {
      // User may be in the process of building a server entry. Wait.
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

    ux.action.start('Updating');

    try {
      // 2. update bundle:
      updateBundleVersion(this.#lastBundles, this.#version.toString());
      try {
        updateBundleServer(this.#lastBundles, this.project.root, this.project.server);
      } catch (err) {
        ux.action.stop('Error');
        this.error(err instanceof Error ? err.message : String(err), {
          exit: false,
        });
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
        ux.action.stop();
        return;
      }

      // 5. confirm new version has finished building
      await waitUntilVersionBuildComplete(
        this,
        this.#appVersionClient,
        appVersionInfo,
        Boolean(this.#flags?.verbose)
      );

      if (this.#lastQueuedBundles) {
        // No need to go further if there's a newer playtest version is waiting
        this.#runQueuedBundlePlaytest(this.#lastQueuedBundles);
        ux.action.stop();
        return;
      }

      // 6. install playtest version to specified subreddit:
      if (this.#flags?.verbose) {
        ux.action.start(`Installing playtest version ${this.#version}`);
      }
      await this.#installationsClient.Upgrade({
        id: this.#installationInfo!.installation!.id,
        appVersionId: appVersionInfo.id,
      });

      this.#server?.send({ appInstalled: {} });

      const playtestUrlRaw = `${REDDIT_DESKTOP}/r/${this.#subreddit}/${
        this.#flags?.connect ? `?playtest=${this.#appInfo!.app!.slug}` : ''
      }`;
      const playtestUrlLabel = chalk.cyan.underline(playtestUrlRaw);
      ux.action.stop(`Success!`);

      const versionText = this.#version.toString();
      const versionLabel = chalk.cyan.bold(`v${versionText}`);

      if (!this.#hasShownPlaytestReadyMessage) {
        this.#hasShownPlaytestReadyMessage = true;
        const message = [
          `${chalk.green('✓')} ${chalk.bold('Playtest ready')}`,
          `${chalk.dim('➜')} ${chalk.bold('URL')}: ${playtestUrlLabel}`,
          `${chalk.dim('➜')} ${chalk.bold('Version')}: ${versionLabel}`,
          `${chalk.dim('➜')} ${chalk.italic(
            'Open the URL above and refresh to see your latest changes.'
          )}`,
        ].join('\n');
        logInBox(message, { style: 'SINGLE' }, (line) => this.log(line));
      } else {
        this.log(`${chalk.green('✓')} ${versionLabel} ${chalk.dim('➜')} ${playtestUrlLabel}`);
      }
    } catch (err) {
      ux.action.stop('Error'); // Stop any spinner if it's running
      this.log(chalk.red(`Something went wrong... ${StringUtil.caughtToString(err, 'message')}`));
    } finally {
      ux.action.stop();
      this.#isOnWatchExecuting = false;
    }

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

  async #destroyWatchers(): Promise<void> {
    process.removeListener('SIGINT', this.#onExit);

    await this.#stopDevScript();
    this.#watchSrc?.unsubscribe();
    this.#appLogSub?.unsubscribe();
    await this.#bundler?.dispose();
    this.#server?.close();
    await this.#watchAssets?.close();
    await this.#watchConfigFile?.close();
    this.#onWatch.clear();
  }

  #onExit = async (): Promise<void> => {
    await this.#destroyWatchers();
    ux.action.stop('Stopped');

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
  };

  async #refreshAppInfoAndSetSubreddit(): Promise<void> {
    this.#appInfo = await getAppBySlug(this.#appClient, {
      slug: this.project.name,
      limit: 1, // fetched version limit; we only need the latest one
    });
    if (!this.#appInfo?.app) {
      this.error('Something went wrong: we could not find your app. Please try again.');
    } else if (!this.#appInfo.app.defaultPlaytestSubredditId && !this.#subreddit) {
      this.error(
        'Something went wrong: we could not find the newly created playtest subreddit. Please try again or playtest on a different subreddit using `devvit playtest <your_subreddit>`.'
      );
    }
    this.#subreddit ??= this.#appInfo.app.defaultPlaytestSubredditId;
  }
}
