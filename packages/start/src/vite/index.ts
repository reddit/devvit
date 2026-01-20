/* eslint-disable implicitDependencies/no-implicit */
import fs from 'node:fs';
import { builtinModules } from 'node:module';
import path from 'node:path';

import type { AppConfig } from '@devvit/shared-types/schemas/config-file.v1.js';
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

const shouldSuppressWarning = (warning: RollupLog): boolean => {
  return warning.code === 'EVAL' && (warning.id ?? '').includes('node_modules/@protobufjs/inquire');
};

const shouldCheckClientForServerImports = (environmentName: string | undefined): boolean => {
  // When Vite's Environment API is unavailable (or the hook is invoked without environment context),
  // treat the build as "client" for safety. This prevents accidental bundling of server code into
  // the browser output.
  return environmentName === undefined || environmentName === 'client';
};

/**
 * Reads and parses the devvit.json configuration file.
 */
function readDevvitConfig(projectRoot: string): AppConfig | null {
  const configPath = path.resolve(projectRoot, 'devvit.json');
  try {
    const content = fs.readFileSync(configPath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

/**
 * Extracts client entry points from devvit.json config.
 */
function getClientInputsFromConfig(config: AppConfig): Record<string, string> | undefined {
  if (!config?.post?.entrypoints) {
    return undefined;
  }

  const inputs: Record<string, string> = {};

  for (const [key, value] of Object.entries(config.post.entrypoints)) {
    inputs[key] = value.entry;
  }

  return Object.keys(inputs).length > 0 ? inputs : undefined;
}

/**
 * Resolves the server entry point.
 *
 * Checks for src/api/index.ts first, then falls back to src/server/index.ts
 * for backwards compatibility.
 */
function getServerEntry(projectRoot: string): string {
  const apiEntry = path.resolve(projectRoot, 'src/api/index.ts');
  if (fs.existsSync(apiEntry)) {
    return apiEntry;
  }

  const serverEntry = path.resolve(projectRoot, 'src/server/index.ts');
  if (fs.existsSync(serverEntry)) {
    return serverEntry;
  }

  throw new Error(
    `${chalk.red('✖')} ${chalk.bold('devvit plugin error')}\n\n` +
      `Could not find server entry point.\n` +
      `Expected ${chalk.cyan('src/api/index.ts')} or ${chalk.cyan('src/server/index.ts')}.\n`
  );
}

/**
 * Vite plugin for Devvit apps.
 *
 * Automatically builds your client and server together using the Vite Environment API.
 *
 * @experimental
 */
export function devvit(opts: DevvitPluginOptions = {}): Plugin {
  let isWatchMode = false;
  let projectRoot = process.cwd();

  const buildTimes = new Map<BuildEnvironment, number>();

  const checkViolation = (id: string, importer?: string) => {
    const restrictedPaths = ['src/server', 'src/api'].map((p) => path.resolve(projectRoot, p));
    const normalizedId = path.normalize(id);

    const violation = restrictedPaths.find((restrictedPath) => {
      // Use path.relative to determine if the module is inside a restricted directory.
      // If the relative path doesn't start with '..' and isn't absolute, it's inside.
      // This handles cross-platform path separators and edge cases better than string matching.
      const relative = path.relative(restrictedPath, normalizedId);
      return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
    });

    if (violation) {
      const relativeId = path.relative(projectRoot, id);
      const relativeViolation = path.relative(projectRoot, violation);
      const relativeImporter = importer ? path.relative(projectRoot, importer) : undefined;

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

      projectRoot = config.root ?? process.cwd();
      const devvitConfig = readDevvitConfig(projectRoot);

      if (!devvitConfig) {
        throw new Error(
          `${chalk.red('✖')} ${chalk.bold('devvit plugin error')}\n\n` +
            `Could not find ${chalk.cyan('devvit.json')}. It must be present in the root of your project.\n`
        );
      }

      const clientInputs = getClientInputsFromConfig(devvitConfig);

      if (!clientInputs) {
        throw new Error(
          `${chalk.red('✖')} ${chalk.bold('devvit plugin error')}\n\n` +
            `Could not find entry points in ${chalk.cyan('devvit.json')}.\n`
        );
      }

      const baseBuildOptions: Partial<BuildOptions> = {
        emptyOutDir: true,
        sourcemap: true,
        reportCompressedSize: false,
      };

      // Resolve outDirs relative to project root
      const clientOutDir = path.resolve(projectRoot, 'dist/client');
      const serverOutDir = path.resolve(projectRoot, 'dist/server');

      return {
        appType: 'custom',
        root: projectRoot,
        logLevel: opts.logLevel ?? 'warn',
        // Enable shared plugins (React, Tailwind, etc.) to run for both environments
        builder: {
          sharedPlugins: true,
          async buildApp(builder: ViteBuilder) {
            const client = builder.environments.client;
            const server = builder.environments.server;
            const start = Date.now();

            if (opts.verbose) {
              console.log(chalk.dim('Building...'));
            }

            await Promise.all([builder.build(client), builder.build(server)]);

            console.log(
              chalk.green('✔') + ' Build complete ' + chalk.dim(`(${Date.now() - start}ms)`)
            );
          },
        },
        environments: {
          client: mergeConfig<EnvironmentOptions, EnvironmentOptions>(
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
          ),
          server: mergeConfig<EnvironmentOptions, EnvironmentOptions>(
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
                ssr: getServerEntry(projectRoot),
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
          ),
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
