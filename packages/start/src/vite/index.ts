/* eslint-disable implicitDependencies/no-implicit */
import { builtinModules } from 'node:module';
import path from 'node:path';

import chalk from 'chalk';
import type {
  CustomPluginOptions,
  LoggingFunction,
  PluginContext as RollupPluginContext,
  RollupLog,
} from 'rollup';
import {
  type BuildOptions,
  type EnvironmentOptions,
  mergeConfig,
  type Plugin,
  type ViteBuilder,
} from 'vite';

import {
  getClientInputs,
  getServerEntry,
  readDevvitConfig,
  resolveClientRoot,
  resolvePublicDir,
  resolveRepoRoot,
  shouldCheckClientForServerImports,
  shouldSuppressWarning,
} from './utils.js';

/**
 * Options for configuring the Devvit plugin.
 */
export type DevvitPluginOptions = {
  /** Customize the client build. */
  client?: EnvironmentOptions;

  /** Customize the server build. */
  server?: EnvironmentOptions;

  /**
   * Vite log level.
   * @default 'warn'
   */
  logLevel?: 'info' | 'warn' | 'error' | 'silent';

  /**
   * Add verbose debug logging.
   * @default false
   */
  verbose?: boolean;
};

type BuildEnvironment = 'server' | 'client';

type ResolvedRoots = {
  /** The root of the repo, where the devvit.json file is located. */
  repoRoot: string;
  /** The root of the client, where the client code is located. */
  clientRoot: string;
  /** The root of where Vite will build the project from */
  root: string;
};

function resolveBuildRoots(
  configRoot: string | undefined,
  shouldBuildClient: boolean,
  hasExplicitRoot: boolean
): ResolvedRoots {
  const repoRoot = resolveRepoRoot(configRoot);
  const resolvedClientRoot = hasExplicitRoot ? repoRoot : resolveClientRoot(repoRoot);

  return {
    repoRoot,
    clientRoot: shouldBuildClient ? resolvedClientRoot : repoRoot,
    root: shouldBuildClient ? resolvedClientRoot : repoRoot,
  };
}

/**
 * Vite plugin for Devvit apps.
 *
 * Automatically builds your client and server together using the Vite Environment API.
 */
export function devvit(opts: DevvitPluginOptions = {}): Plugin {
  let isWatchMode = false;
  // Default roots keep early hooks safe before config() runs.
  let repoRoot = process.cwd();
  let clientRoot = process.cwd();

  const buildTimes = new Map<BuildEnvironment, number>();
  const logVerbose = (...messages: string[]): void => {
    if (!opts.verbose) return;
    console.log(chalk.dim('[devvit]'), ...messages);
  };

  const checkViolation = (id: string, importer?: string) => {
    const restrictedPaths = ['src/server', 'src/api'].map((restrictedPath) =>
      path.resolve(repoRoot, restrictedPath)
    );
    const normalizedId = path.normalize(id);

    const violation = restrictedPaths.find((restrictedPath) => {
      // Use path.relative to determine if the module is inside a restricted directory.
      // If the relative path doesn't start with '..' and isn't absolute, it's inside.
      // This handles cross-platform path separators and edge cases better than string matching.
      const relative = path.relative(restrictedPath, normalizedId);
      return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
    });

    if (violation) {
      const relativeId = path.relative(repoRoot, id);
      const relativeViolation = path.relative(repoRoot, violation);
      const relativeImporter = importer ? path.relative(repoRoot, importer) : undefined;

      let message =
        `\n${chalk.red.bold('Detected server code in the client!')}\n\n` +
        `You are trying to import server code into the client.\n\n`;

      if (relativeImporter) {
        message += `  ${chalk.bold('Importer:')} ${chalk.cyan(relativeImporter)}\n`;
      }

      message +=
        `  ${chalk.bold('Imported:')} ${chalk.cyan(relativeId)}\n\n` +
        `Server code in "${chalk.cyan(relativeViolation)}" cannot be used in the browser. If you are trying to share code between the client and server, please move the code to a separate file outside of the src/server directory and import it back into the server.`;

      return message;
    }
    return null;
  };

  return {
    name: 'devvit',
    enforce: 'pre',
    perEnvironmentStartEndDuringDev: true,
    config(config, env) {
      // Only support build command for now
      if (env.command !== 'build') {
        throw new Error(
          `${chalk.red('✖')} ${chalk.bold('devvit plugin error')}\n\n` +
            `This plugin only supports ${chalk.cyan('vite build')}.\n` +
            `For development, run: ${chalk.cyan('npm run dev')}\n`
        );
      }

      // Check if watch mode is enabled
      isWatchMode = !!config.build?.watch;
      logVerbose(`watch mode: ${isWatchMode ? 'enabled' : 'disabled'}`);

      // Resolve repo root and config paths early for consistent lookups.
      const hasExplicitRoot = typeof config.root === 'string';
      const initialRepoRoot = resolveRepoRoot(config.root);
      repoRoot = initialRepoRoot;
      const devvitConfig = readDevvitConfig(repoRoot);
      logVerbose(`devvit.json: ${path.resolve(repoRoot, 'devvit.json')}`);

      // Determine which environments should be enabled by config presence.
      // NOTE: As more entrypoints (verticals?) are added, we will need to add
      // them here
      const hasClientEntrypoints = Object.keys(devvitConfig.post?.entrypoints ?? {}).length > 0;
      const shouldBuildClient = hasClientEntrypoints;
      const shouldBuildServer = devvitConfig.server !== undefined;

      // Explain environment decisions to aid debugging.
      logVerbose(`client build: ${shouldBuildClient ? 'enabled' : 'disabled'}`);
      if (!devvitConfig.post) {
        logVerbose('client build reason: devvit.json has no post config');
      } else if (!hasClientEntrypoints) {
        logVerbose('client build reason: devvit.json has no post entrypoints');
      }

      logVerbose(`server build: ${shouldBuildServer ? 'enabled' : 'disabled'}`);
      if (!shouldBuildServer) {
        logVerbose('server build reason: devvit.json has no server config');
      }

      /**
       * This is a kludge to support src/client building outputs to
       * /dist/client/entry.html instead of /dist/client/src/client/entry.html.
       *
       * Vite derives .html entrypoints relative to Vite's project root. Well,
       * that works great in most cases, but in our case we have a TON of apps
       * that rely on dist/client and inside of there entry.html being a direct
       * descendant.
       *
       * Also, we want to keep that pattern for legibility in the templates of
       * src/
       *   client/
       *     entry.html
       *   server/
       *     index.ts
       *
       * And support a devvit.json like this:
       *   "post": {
       *   "dir": "dist/client",
       *   "entrypoints": {
       *     "default": {
       *       "inline": true,
       *       "entry": "splash.html"
       *     },
       *     "game": {
       *       "entry": "game.html"
       *     }
       *   }
       * },
       *
       * So, what we've done to do this while utilizing Vite's environment API is
       * to check if src/client exists and that the user hasn't explicitly set the root.
       * When those are true, we set the client root to src/client which will
       * cause Vite to build to dist/client/entry.html instead of dist/client/src/client/entry.html.
       *
       * The alternative is to run two builds in parallel within the plugin. We've tried it this way don't like it
       * because:
       * - There's more for us to manage
       * - You need to coordinate multiple watchers
       * - You lose shared pipelines, multi-env hooks, and a lot of the benefits of the environment API
       * - If we ever decide to add HMR support, I think it'll be much harder to implement.
       *
       * Sources:
       * - https://github.com/vitejs/vite/issues/15612
       * - https://github.com/vitejs/vite/discussions/16358
       * - https://github.com/vitejs/vite/pull/17394
       *
       *
       * At the same time, our experimental template is flatted like this:
       * src/
       *   entry.html
       *   server/
       *     index.ts
       *
       * And the devvit.json looks like this:
       *
       *   "post": {
       *   "dir": "dist/client",
       *   "entrypoints": {
       *     "default": {
       *       "inline": true,
       *       "entry": "src/splash.html"
       *     },
       *     "game": {
       *       "entry": "src/game.html"
       *     }
       *   }
       * },
       *
       * It doesn't help that we infer the entrypoints based on the expected build output, but that's
       * where a lot of the magic happens!
       */
      // Resolve roots now that client enablement is known.
      const {
        repoRoot: resolvedRepoRoot,
        clientRoot: resolvedClientRoot,
        root: resolvedRoot,
      } = resolveBuildRoots(config.root, shouldBuildClient, hasExplicitRoot);
      repoRoot = resolvedRepoRoot;
      clientRoot = resolvedClientRoot;
      logVerbose(`explicit root: ${hasExplicitRoot ? 'yes' : 'no'}`);
      logVerbose(`repo root: ${repoRoot}`);
      logVerbose(`client root: ${clientRoot}`);
      logVerbose(`root: ${resolvedRoot}`);

      const clientInputs = getClientInputs(devvitConfig, repoRoot, clientRoot);
      if (clientInputs) {
        logVerbose(`client inputs: ${JSON.stringify(clientInputs)}`);
      }

      const baseBuildOptions: Partial<BuildOptions> = {
        emptyOutDir: true,
        sourcemap: true,
        reportCompressedSize: false,
      };

      // Resolve outDirs relative to repo root
      const clientOutDir = path.resolve(repoRoot, 'dist/client');
      const serverOutDir = path.resolve(repoRoot, 'dist/server');
      logVerbose(`config.publicDir: ${String(config.publicDir)}`);
      // Only auto-resolve when unset; `false` explicitly disables publicDir.
      const publicDir =
        config.publicDir === undefined && shouldBuildClient
          ? resolvePublicDir(repoRoot, clientRoot)
          : undefined;
      logVerbose(`client outDir: ${clientOutDir}`);
      logVerbose(`server outDir: ${serverOutDir}`);
      logVerbose(
        `publicDir: ${
          config.publicDir === undefined ? (publicDir ?? 'disabled') : 'using user config'
        }`
      );

      const serverEntry = shouldBuildServer ? getServerEntry(repoRoot) : undefined;
      logVerbose(`server entry: ${serverEntry ?? 'disabled'}`);

      const environments: Record<string, EnvironmentOptions> = {};
      if (shouldBuildClient && clientInputs) {
        environments.client = mergeConfig<EnvironmentOptions, EnvironmentOptions>(
          {
            consumer: 'client',
            build: {
              ...baseBuildOptions,
              outDir: clientOutDir,
              rollupOptions: {
                input: clientInputs,
                onwarn(warning, warn) {
                  if (shouldSuppressWarning(warning)) return;
                  warn(warning);
                },
                output: {
                  entryFileNames: '[name].js',
                  chunkFileNames: '[name].js',
                  assetFileNames: '[name][extname]',
                  sourcemapFileNames: '[name].js.map',
                },
              },
            },
          },
          opts.client ?? {}
        );
      }

      if (shouldBuildServer && serverEntry) {
        environments.server = mergeConfig<EnvironmentOptions, EnvironmentOptions>(
          {
            consumer: 'server',
            resolve: {
              // Bundle all dependencies so the output can run without node_modules.
              noExternal: true,
              // Don't force-externalize any npm deps.
              external: [],
              // But do treat Node built-ins as external.
              builtins: [/^node:/, ...builtinModules],
            },
            build: {
              ...baseBuildOptions,
              ssr: serverEntry,
              target: 'node22',
              outDir: serverOutDir,
              minify: true,
              copyPublicDir: false,
              rollupOptions: {
                onwarn(warning: RollupLog, warn: LoggingFunction) {
                  if (shouldSuppressWarning(warning)) return;
                  warn(warning);
                },
                output: {
                  format: 'cjs',
                  entryFileNames: 'index.cjs',
                  inlineDynamicImports: true,
                },
              },
            },
          },
          opts.server ?? {}
        );
      }

      return {
        appType: 'custom',
        root: resolvedRoot,
        envDir: repoRoot,
        ...(publicDir !== undefined ? { publicDir } : {}),
        logLevel: opts.logLevel ?? 'warn',
        // Enable shared plugins (React, Tailwind, etc.) to run for both environments
        builder: {
          sharedPlugins: true,
          async buildApp(builder: ViteBuilder) {
            const start = Date.now();

            if (opts.verbose) {
              console.log(chalk.dim('Building...'));
            }

            const buildPromises: Promise<unknown>[] = [];

            for (const environmentName of Object.keys(environments)) {
              const environment = builder.environments[environmentName];
              if (!environment) {
                logVerbose(`skipping ${environmentName} build (environment not found)`);
                continue;
              }
              logVerbose(`building ${environmentName} environment`);
              buildPromises.push(builder.build(environment));
            }

            if (buildPromises.length === 0) {
              logVerbose('no environments enabled; skipping build');
              return;
            }

            await Promise.all(buildPromises);

            console.log(
              chalk.green('✔') + ' Build complete ' + chalk.dim(`(${Date.now() - start}ms)`)
            );
          },
        },
        environments: {
          ...environments,
        },
      };
    },
    async resolveId(
      this: RollupPluginContext & { environment?: { name: string } },
      source: string,
      importer: string | undefined,
      options: { isEntry: boolean; custom?: CustomPluginOptions }
    ) {
      const envName = this.environment?.name;
      if (!shouldCheckClientForServerImports(envName)) return null;

      const resolved = await this.resolve(source, importer, { skipSelf: true, ...options });
      const id = resolved?.id ?? source;

      const message = checkViolation(id, importer);
      if (message) {
        const error = new Error(message);
        error.stack = '';
        this.error(error);
      }
      return null;
    },
    load(this: RollupPluginContext & { environment?: { name: string } }, id) {
      const envName = this.environment?.name;
      if (!shouldCheckClientForServerImports(envName)) return null;

      // This is a safety net check.
      // resolveId should catch the import before it reaches load, but this
      // ensures that even if something slips through resolution or is loaded
      // by a different mechanism, we still block server code from the client bundle.
      const message = checkViolation(id);
      if (message) {
        const error = new Error(message);
        error.stack = '';
        this.error(error);
      }
    },
    buildStart(this: RollupPluginContext & { environment: { name: string } }) {
      if (!isWatchMode) return;
      const env = this.environment.name;
      if (env === 'client' || env === 'server') {
        buildTimes.set(env, Date.now());
      }
    },
    buildEnd(this: RollupPluginContext & { environment: { name: string } }) {
      if (!isWatchMode) return;

      const env = this.environment.name;
      if (env === 'client' || env === 'server') {
        const startTime = buildTimes.get(env);
        if (startTime) {
          const duration = Date.now() - startTime;
          const envName = env.charAt(0).toUpperCase() + env.slice(1);
          console.log(
            chalk.green('✔') + ` ${envName} rebuild complete ${chalk.dim(`(${duration}ms)`)}`
          );
          buildTimes.delete(env);
        }
      }
    },
  };
}
