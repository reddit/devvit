import fs, { readFileSync } from 'node:fs';
import path from 'node:path';

import {
  type ActorSpec,
  type DependencySpec,
  type ServerBundle,
  TargetRuntime,
} from '@devvit/protos/json/devvit/runtime/bundle.js';
// eslint-disable-next-line no-restricted-imports
import { Bundle } from '@devvit/protos/types/devvit/plugin/buildpack/buildpack_common.js';
import type { Namespace } from '@devvit/shared-types/Namespace.js';
import type { AppConfig, AppServerConfig } from '@devvit/shared-types/schemas/config-file.v1.js';
import { StringUtil } from '@devvit/shared-types/StringUtil.js';
import type { BuildContext, Plugin, PluginBuild } from 'esbuild';
import esbuild, { type BuildResult } from 'esbuild';
import { BehaviorSubject, Observable } from 'rxjs';
import { of } from 'rxjs';

import type { ProjectRootDir } from '../lib/BuildPack.js';
import { getModuleEntrypoint } from '../lib/BuildPack.js';
import { newBuildInfoDependencies } from './BuildInfoUtil.js';
import { createDependencySpec } from './dependency-spec-util.js';
import { templatize } from './templatizer/templatizer.js';

/** Compiles an app config or an explicit actor entry with supplied dependencies. */
export type CompileParams = {
  minify: 'None' | 'All';
  info: ActorSpec;
  root: ProjectRootDir;
} & (
  | { config: Readonly<AppConfig>; entry?: never; dependencies?: never }
  /** Internal actors only. */
  | { entry: string; dependencies: Readonly<DependencySpec>; config?: never }
);

export type CompileResponse = {
  bundles: Bundle[];
  errors: CompileLog[];
  warnings: CompileLog[];
};

export type CompileLog = {
  detail?: CompileLogLineDetail;
  text: string;
};

export type CompileLogLineDetail = {
  /** 0-based.*/
  column: number;
  filename: string;
  /** 1-based. */
  line: number;
  suggestion: string;
  text: string;
};

const SERVER_ENTRY_WAIT_TIMEOUT_MS = 10_000;
const SERVER_ENTRY_INITIAL_DELAY_MS = 100;
const SERVER_ENTRY_MAX_DELAY_MS = 2_000;
const SERVER_ENTRY_WARN_THRESHOLD_MS = 5_000;

export class Watcher {
  readonly #config: Readonly<AppConfig>;
  readonly #root: ProjectRootDir;
  readonly #observable = new BehaviorSubject<CompileResponse>({
    bundles: [],
    errors: [],
    warnings: [],
  });
  #context?: BuildContext;
  readonly #namespace: Readonly<Namespace>;
  readonly #ready: Promise<void>;

  constructor(
    config: Readonly<AppConfig>,
    namespace: Readonly<Namespace>,
    root: ProjectRootDir,
    actorSpec: ActorSpec
  ) {
    this.#config = config;
    this.#namespace = namespace;
    this.#root = root;
    this.#ready = this.#init(actorSpec);
  }

  getObservable(): Observable<CompileResponse> {
    return this.#observable;
  }

  async dispose(): Promise<void> {
    await this.#context?.dispose();
    this.#observable.complete();
  }

  async #init(actorSpec: ActorSpec): Promise<void> {
    const entry = this.#makeEntry();
    this.#context = await this.#makeEsbuildContext(actorSpec, entry);

    if (this.#observable.isStopped) {
      // Disposal can happen while esbuild is creating the context.
      await this.#context.dispose();
      return;
    }

    await this.#context.watch();
  }

  #makeEntry(): string {
    // The watched file doesn't change but its dependencies do.
    const entry = getModuleEntrypoint();
    const template = templatize(this.#root, this.#config.blocks?.entry);
    fs.writeFileSync(entry, template);
    return entry;
  }

  async #makeEsbuildContext(actorSpec: ActorSpec, entry: string): Promise<BuildContext> {
    const cfg = appEsbuildConfig(this.#config, this.#root);
    return await esbuild.context({
      ...cfg,
      entryPoints: [entry],
      minify: false,
      sourcemap: 'external',
      outfile: 'main.js',
      // esbuild now supports hooks through the onEnd callback in the build API.
      plugins: [
        {
          name: 'publish-compile-result',
          setup: (build: PluginBuild) => {
            build.onEnd(async (result) => {
              await this.#onBuildEnd(actorSpec, result);
            });
          },
        },
        excludeNodeModulesFromSourceMapsPlugin(),
        ...(cfg.plugins || []),
      ],
    });
  }

  /**
   * @description The callback function for esbuild's onEnd hook. This is called after esbuild has finished building.
   */
  async #onBuildEnd(actorSpec: ActorSpec, esbuildResult: BuildResult): Promise<void> {
    await this.#ready;

    const esbuildCompileRes = await newCompileResponse(
      { config: this.#config, info: actorSpec, root: this.#root, minify: 'None' },
      this.#namespace,
      esbuildResult
    );

    this.#observable.next(esbuildCompileRes);
  }
}

export class ESBuildPack {
  /**
   * @property {Map} bundleUpdateEmitters [note] A BehaviorSubject implements the Observable interface. Any observer who subscribes to a behavior subject will receive the last emitted value
   * @see https://rxjs.dev/guide/subject
   */
  readonly #bundleWatchers: Map<string, Watcher> = new Map();
  readonly #namespace: Readonly<Namespace>;

  constructor(namespace: Readonly<Namespace>) {
    this.#namespace = namespace;
  }

  async compile(params: Readonly<CompileParams>): Promise<CompileResponse> {
    const { config, minify, root } = params;
    const entry = config ? getModuleEntrypoint() : path.resolve(root, params.entry);

    if (config) {
      const template = templatize(root, config.blocks?.entry);
      try {
        fs.writeFileSync(entry, template);
      } catch (err) {
        return unknownToErrorCompileResponse('Compilation', err);
      }
    }

    const cfg = config ? appEsbuildConfig(config, root) : esbuildConfig();
    let buildResult;
    try {
      buildResult = await esbuild.build({
        ...cfg,
        entryPoints: [entry],
        sourcemap: 'external',
        plugins: [excludeNodeModulesFromSourceMapsPlugin(), ...(cfg.plugins || [])],
        sourcesContent: false,
        minify: minify === 'All',
        outfile: 'main.js',
        treeShaking: true,
      });
    } catch (err) {
      return isEsbuildResult(err)
        ? await newCompileResponse(params, this.#namespace, err)
        : unknownToErrorCompileResponse('Compilation', err);
    }

    const esbuildCompileResult = await newCompileResponse(params, this.#namespace, buildResult);

    if (esbuildCompileResult.bundles.length === 0) {
      throw new Error(esbuildCompileResult.errors?.[0]?.text ?? 'Missing bundle');
    }

    return esbuildCompileResult;
  }

  async dispose(): Promise<void> {
    await Promise.all(
      Array.from(this.#bundleWatchers.values()).map((watcher) => watcher.dispose())
    );
  }

  watch({
    config,
    root,
    info,
  }: CompileParams & { config: Readonly<AppConfig> }): Observable<CompileResponse> {
    const projectRoot = path.resolve(root);
    let watcher = this.#bundleWatchers.get(projectRoot);
    if (!watcher) {
      try {
        watcher = new Watcher(config, this.#namespace, root, info);
      } catch (err) {
        return of(unknownToErrorCompileResponse('Compilation', err));
      }
      this.#bundleWatchers.set(projectRoot, watcher);
    }

    return watcher.getObservable();
  }
}

async function waitForServerEntry(
  root: ProjectRootDir,
  server: Readonly<AppServerConfig> | undefined
): Promise<boolean> {
  if (!server) return true;

  const entryPath = path.resolve(root, path.join(server.dir, server.entry));
  if (fs.existsSync(entryPath)) return true;

  const start = Date.now();
  const deadline = start + SERVER_ENTRY_WAIT_TIMEOUT_MS;
  const warnAt = start + SERVER_ENTRY_WARN_THRESHOLD_MS;
  let warned = false;

  let delay = SERVER_ENTRY_INITIAL_DELAY_MS;
  while (Date.now() < deadline) {
    const remaining = deadline - Date.now();
    if (remaining <= 0) break;

    const waitMs = Math.min(delay, remaining);
    await new Promise((resolve) => setTimeout(resolve, waitMs));

    if (fs.existsSync(entryPath)) return true;

    if (!warned && Date.now() >= warnAt) {
      warned = true;
      console.warn(
        `Waiting for \`config.server.entry\` file (${path.relative(root, entryPath)}) to be generated...`
      );
    }
    delay = Math.min(delay * 2, SERVER_ENTRY_MAX_DELAY_MS);
  }

  return fs.existsSync(entryPath);
}

async function newCompileResponse(
  params: CompileParams,
  namespace: Readonly<Namespace>,
  buildResult: BuildResult
): Promise<CompileResponse> {
  const { info, root } = params;
  const server = params.config?.server;
  const errors = buildResult.errors.map(esbuildMessageToBuildLog);
  const warnings = buildResult.warnings.map(esbuildMessageToBuildLog);

  let code = '';
  let sourceMap = '';
  for (const outputFile of buildResult.outputFiles || []) {
    if (outputFile.path?.endsWith('.js')) {
      if (code) throw new Error('There should only be one bundle after build');
      code = outputFile.text;
    } else if (outputFile.path?.endsWith('.js.map')) {
      sourceMap = outputFile.text;
    } else {
      throw new Error('Unexpected output file: ' + outputFile.path);
    }
  }

  if (!code) return { bundles: [], errors, warnings };

  let dependencies;
  try {
    dependencies = params.config
      ? createDependencySpec(info, params.config, namespace)
      : structuredClone(params.dependencies);
  } catch (err) {
    return unknownToErrorCompileResponse('Configuration', err);
  }

  const bundles: Bundle[] = [
    {
      assetIds: {},
      code,
      sourceMap,
      dependencies,
      buildInfo: {
        created: new Date(),
        dependencies: newBuildInfoDependencies(root),
        targetRuntime: TargetRuntime.UNIVERSAL,
      },
      webviewAssetIds: {},
    },
  ];

  const serverEntry = server ? path.join(server.dir, server.entry) : undefined;

  if (!(await waitForServerEntry(root, server))) {
    return unknownToErrorCompileResponse(
      'Configuration',
      `Cannot read \`config.server.entry\` file (${serverEntry}). Make sure the \`server.entry\` value is correct and that your project is built.`
    );
  }

  try {
    updateBundleServer(bundles, root, server);
  } catch {
    return unknownToErrorCompileResponse(
      'Configuration',
      `Cannot read \`config.server.entry\` file (${serverEntry}). Make sure the \`server.entry\` value is correct and that your project is built.`
    );
  }

  return { bundles, errors, warnings };
}

/** Stringifies val as a BuildLog error in a CompileResponse. */
function unknownToErrorCompileResponse(
  phase: 'Compilation' | 'Configuration',
  val: unknown
): CompileResponse {
  return {
    bundles: [],
    errors: [{ text: `${phase} failure: ${StringUtil.caughtToString(val)}` }],
    warnings: [],
  };
}

function esbuildMessageToBuildLog(msg: Readonly<esbuild.Message>): CompileLog {
  return {
    text: `[esbuild] ${msg.text}`,
    ...(msg.location != null && {
      detail: {
        column: msg.location.column,
        filename: msg.location.file,
        line: msg.location.line,
        suggestion: msg.location.suggestion,
        text: msg.location.lineText,
      },
    }),
  };
}

function isEsbuildResult(err: unknown): err is esbuild.BuildResult {
  return err instanceof Object && 'errors' in err && 'warnings' in err;
}

/** Config for `devvit.json`. */
function appEsbuildConfig(config: Readonly<AppConfig>, root: ProjectRootDir): esbuild.BuildOptions {
  return {
    ...esbuildConfig(),
    absWorkingDir: path.resolve(root),
    // When Blocks migration is used, the Devvit singleton used in the template
    // must be the same instance as that used elsewhere. Aliases are resolved
    // from the app's working directory, not the compiled file's directory, so
    // this effectively maps the template's @devvit/public-api to the app's
    // version. The same could be done for @devvit/server but apps don't
    // necessarily have a copy.
    alias: config.blocks ? { '@devvit/public-api': '@devvit/public-api' } : {},
    // Tightly coupled to blocks.template.ts.
    define: {
      'globalThis.__devvit__': JSON.stringify({ config }, undefined, 2),
    },
  };
}

/** Config for `devvit.json` or internal example actors. */
function esbuildConfig(): esbuild.BuildOptions {
  return {
    // Recursively inline any imported dependencies.
    bundle: true,
    define: { 'globalThis.__devvit__': 'undefined' },
    external: [
      'node:*',
      // All .js files from https://github.com/nodejs/node/tree/b2405e9/lib that
      // don't start with _. Another option is to mark everything external for
      // server builds but then the user can't bundle _anything_.
      'assert',
      'async_hooks',
      'buffer',
      'child_process',
      'cluster',
      'console',
      'constants',
      'crypto',
      'dgram',
      'diagnostics_channel',
      'dns',
      'domain',
      'events',
      'fs',
      'http',
      'http2',
      'https',
      'inspector',
      'module',
      'net',
      'os',
      'path',
      'perf_hooks',
      'process',
      'punycode',
      'querystring',
      'quic',
      'readline',
      'repl',
      'sea',
      'sqlite',
      'stream',
      'string_decoder',
      'sys',
      'test',
      'timers',
      'tls',
      'trace_events',
      'tty',
      'url',
      'util',
      'v8',
      'vm',
      'wasi',
      'worker_threads',
      'zlib',
    ],
    // Both format and target are intended to align to
    // @devvit/boot's build scripts for bootstrap compatibility.
    format: 'cjs',
    // Use our own built-in `Blocks.createElement` for JSX calls instead
    // of defaulting to `React.createElement`.
    // This should be automatic since its configured in TSConfig, so this
    // is to keep things explicit.
    // See https://esbuild.github.io/api/#jsx-fragment
    jsxFactory: 'Devvit.createElement',
    jsxFragment: 'Devvit.Fragment',
    // Do not show any console output. Warnings and errors are reported in the
    // response.
    logLevel: 'silent',
    platform: 'node',
    target: 'es2020',
    // Write to in-memory buffers.
    write: false,
  };
}

/**
 * Plugin for excluding code from inclusion in the source map by filename. This helps keep bundle size manageable.
 */
function excludeNodeModulesFromSourceMapsPlugin(): Plugin {
  return {
    name: 'excludeNodeModulesFromSourceMaps',
    setup(build: PluginBuild) {
      build.onLoad({ filter: /@devvit\/protos/ }, (args) => {
        if (args.path.endsWith('.js')) {
          return {
            contents:
              fs.readFileSync(args.path, 'utf8') +
              // Replaces the file as it's read in by esbuild with a stubbed-out, inline sourcemap
              // {"version":3,"sources":[""],"mappings":"A"}
              // See: https://github.com/evanw/esbuild/issues/1685
              '\n//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIiJdLCJtYXBwaW5ncyI6IkEifQ==',
            loader: 'default',
          };
        }
      });
    },
  };
}

/** Throws when unable to read config.server.entry. */
function newServerBundle(root: ProjectRootDir, server: Readonly<AppServerConfig>): ServerBundle {
  const serverEntry = path.join(server.dir, server.entry);

  let code;
  try {
    code = readFileSync(path.resolve(root, serverEntry), 'utf8');
  } catch (err) {
    throw Error(`Cannot read \`config.server.entry\` file (${serverEntry}).`, {
      cause: err,
    });
  }

  const sourceMapFilename = findSourceMapURL(code) ?? `${serverEntry}.map`;
  let sourceMap = '';
  try {
    sourceMap = readFileSync(path.resolve(root, sourceMapFilename), 'utf8');
  } catch {
    // source map files aren't required, safe to swallow this error
  }

  return { code, sourceMap };
}

/** @internal */
export function findSourceMapURL(src: string): string | undefined {
  return /[@#]\s*sourceMappingURL=([^\s*]+)(?![\s\S]*sourceMappingURL)/.exec(src)?.[1];
}

/** Throws when unable to read config.server.entry. */
export function updateBundleServer(
  bundles: readonly Bundle[],
  root: ProjectRootDir,
  server: Readonly<AppServerConfig> | undefined
): void {
  if (!server) return;
  for (const bundle of bundles)
    if (bundle.buildInfo?.targetRuntime === TargetRuntime.UNIVERSAL)
      bundle.server = newServerBundle(root, server);
}

export function updateBundleVersion(bundles: readonly Bundle[], version: string): void {
  for (const bundle of bundles) {
    bundle.dependencies ??= { hostname: '', provides: [], uses: [], permissions: [] };
    bundle.dependencies.actor ??= { name: '', owner: '', version: '' };
    bundle.dependencies.actor.version = version.toString();
  }
}
