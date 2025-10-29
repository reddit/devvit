import fs, { readFileSync } from 'node:fs';
import path from 'node:path';

import { Bundle } from '@devvit/protos/types/devvit/plugin/buildpack/buildpack_common.js';
import {
  type ActorSpec,
  type DependencySpec,
  type ServerBundle,
  TargetRuntime,
} from '@devvit/protos/types/devvit/runtime/bundle.js';
import type { ClientFactory } from '@devvit/shared-types/ConfigImpl.js';
import { ConfigImpl as Config } from '@devvit/shared-types/ConfigImpl.js';
import type { Namespace } from '@devvit/shared-types/Namespace.js';
import { NonNull } from '@devvit/shared-types/NonNull.js';
import type { AppConfig, AppServerConfig } from '@devvit/shared-types/schemas/config-file.v1.js';
import { StringUtil } from '@devvit/shared-types/StringUtil.js';
import type { BuildContext, Plugin, PluginBuild } from 'esbuild';
import esbuild, { type BuildResult } from 'esbuild';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { of } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import type { ProjectRootDir } from '../lib/BuildPack.js';
import { getClassicModuleEntrypoint, getModuleEntrypoint } from '../lib/BuildPack.js';
import { newBuildInfoDependencies } from './BuildInfoUtil.js';
import type { ConcreteActorType } from './BundleModule.js';
import { dangerouslyGetBundleActor } from './BundleModule.js';
import { createDependencySpec } from './dependency-spec-util.js';
import { externalizeDevvitProtos } from './plugins/externalizeDevvitProtos.js';
import {
  postProcessServerStubCode,
  serverClientCodeSplit,
} from './plugins/serverClientCodeSplit.js';
import { templatize } from './templatizer/templatizer.js';
import { prefixBuildResultLogs } from './utils.js';

export type CompileParams = {
  config: AppConfig | undefined;
  minify: 'None' | 'All';
  info: ActorSpec;
  includeMetafile: boolean;
  root: ProjectRootDir;
};

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

const FAKE_FACTORY: ClientFactory = {
  // TODO: remove use of any below
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Build(): any {},
};

const BUILD_TARGETS = [TargetRuntime.UNIVERSAL, TargetRuntime.CLIENT];

type BuildTarget = {
  ctx: BuildContext;
  result?: BuildResult | undefined;
};

export class Watcher {
  readonly #disableExternDevvitProtos: boolean;

  readonly #config: Readonly<AppConfig> | undefined;
  readonly #root: ProjectRootDir;
  /**
   * the actual emitter of updates
   */
  readonly #observable: BehaviorSubject<CompileResponse>;

  /**
   * subscribers to this.observable will continue subscribing until this notifier emits a values
   */
  readonly #disposedNotifier: Subject<void> = new Subject();

  /**
   * will be asynchronously set as buildResult.stop after calling esbuild.build
   */
  #disposeWatcher?: () => Promise<void>;
  readonly #namespace: Readonly<Namespace>;

  readonly #buildTargets: Map<TargetRuntime, BuildTarget> = new Map();

  readonly #ready: Promise<void>;

  /**
   * The default behavior is to externalize @devvit/protos. Set
   * disableExternDevvitProtos to bundle this large dependency.
   */
  constructor(
    config: Readonly<AppConfig> | undefined,
    namespace: Readonly<Namespace>,
    root: ProjectRootDir,
    actorSpec: ActorSpec,
    options?: Readonly<ESBuildPackOptions>
  ) {
    this.#config = config;
    this.#namespace = namespace;
    this.#root = root;

    this.#disableExternDevvitProtos = options?.disableExternDevvitProtos ?? false;

    //  observers of this will be subscribed until this.disposedNotifier emits a value
    const sourceObservable = new Observable<CompileResponse>().pipe(
      takeUntil(this.#disposedNotifier)
    );

    // our observable is a BehaviorSubject used to multicast the source observer
    this.#observable = new BehaviorSubject<CompileResponse>({
      bundles: [],
      errors: [],
      warnings: [],
    });

    // multi-casts (shares) here
    sourceObservable.subscribe(this.#observable);

    // #init handles errors.
    this.#ready = this.#init(actorSpec);
  }

  getObservable(): Observable<CompileResponse> {
    return this.#observable;
  }

  async dispose(): Promise<void> {
    await this.#disposeWatcher?.();

    // cancels all subscriptions after emitting value due to "takeUntil"
    this.#disposedNotifier.next();
    // clean up self
    this.#disposedNotifier.complete();
  }

  async #init(actorSpec: ActorSpec): Promise<void> {
    const entry = this.#makeEntry();
    // Building for Universal and Client targets. May include Server in the future.
    for (const target of BUILD_TARGETS) {
      this.#buildTargets.set(target, {
        ctx: await this.#makeEsbuildContext(actorSpec, target, entry),
      });
    }

    this.#disposeWatcher = async () => {
      for (const [_, target] of this.#buildTargets) {
        await target.ctx.dispose();
      }
    };

    if (this.#observable.isStopped) {
      // Disposed while await-ing and prior to setting disposeWatcher.
      await this.#disposeWatcher();
      return;
    }

    const watchers = [];
    for (const [_, target] of this.#buildTargets) {
      watchers.push(target.ctx.watch());
    }

    await Promise.all(watchers);
  }

  #makeEntry(): string {
    // The watched file doesn't change but its dependencies do.
    const entry = getModuleEntrypoint(this.#config, this.#root);

    if (this.#config) {
      const template = templatize(this.#root, this.#config.blocks?.entry);
      fs.writeFileSync(entry, template);
    }
    return entry;
  }

  async #makeEsbuildContext(
    actorSpec: ActorSpec,
    targetRuntime: TargetRuntime,
    entry: string
  ): Promise<BuildContext> {
    const cfg = esbuildConfig(this.#config, this.#disableExternDevvitProtos, targetRuntime, true);
    return await esbuild.context({
      ...cfg,
      entryPoints: [entry],
      minify: false,
      sourcemap: 'external',
      outfile: 'main.js',
      // esbuild now supports hooks through the onEnd callback in the build API.
      plugins: [
        {
          name: 'optionally-type-check-and-publish-compile-result-on-build-end',
          setup: (build: PluginBuild) => {
            build.onEnd(async (result) => {
              await this.#onBuildEnd(actorSpec, result, targetRuntime);
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
  async #onBuildEnd(
    actorSpec: ActorSpec,
    esbuildResult: BuildResult,
    targetRuntime: TargetRuntime
  ): Promise<void> {
    await this.#ready;

    this.#buildTargets.get(targetRuntime)!.result = esbuildResult;

    const results: Map<TargetRuntime, BuildResult> = new Map();

    // bail early if any builds are incomplete
    for (const [targetRuntime, target] of this.#buildTargets) {
      if (!target.result) return;
      results.set(targetRuntime, target.result);
    }

    const esbuildCompileRes = await newCompileResponse(
      this.#config,
      this.#namespace,
      actorSpec,
      results,
      this.#root
    );

    // clear saved values so we don't double-fire the next time we get results
    for (const [_, target] of this.#buildTargets) {
      target.result = undefined;
    }

    this.#observable.next(esbuildCompileRes);
  }
}

type ESBuildPackOptions = {
  readonly disableExternDevvitProtos?: boolean | undefined;
};

export class ESBuildPack {
  /**
   * @property {Map} bundleUpdateEmitters [note] A BehaviorSubject implements the Observable interface. Any observer who subscribes to a behavior subject will receive the last emitted value
   * @see https://rxjs.dev/guide/subject
   */
  readonly #bundleWatchers: Map<string, Watcher> = new Map();
  readonly #namespace: Readonly<Namespace>;

  // EsbuildPack options
  readonly #disableExternDevvitProtos: boolean;

  /**
   * The default behavior is to externalize @devvit/protos. Set
   * disableExternDevvitProtos to bundle this large dependency.
   */
  constructor(namespace: Readonly<Namespace>, options?: Readonly<ESBuildPackOptions>) {
    this.#namespace = namespace;
    this.#disableExternDevvitProtos = options?.disableExternDevvitProtos ?? false;
  }

  async compile({
    config,
    minify,
    info,
    includeMetafile,
    root,
  }: CompileParams): Promise<CompileResponse> {
    const entry = getModuleEntrypoint(config, root);

    if (config) {
      const template = templatize(root, config.blocks?.entry);
      try {
        fs.writeFileSync(entry, template);
      } catch (err) {
        return unknownToErrorCompileResponse('Compilation', err);
      }
    }

    const buildResults: Map<TargetRuntime, BuildResult> = new Map();

    for (const targetRuntime of BUILD_TARGETS) {
      const cfg = esbuildConfig(config, this.#disableExternDevvitProtos, targetRuntime);
      try {
        const buildResult = await esbuild.build({
          ...cfg,
          entryPoints: [entry],
          metafile: true,
          sourcemap: 'external',
          plugins: [excludeNodeModulesFromSourceMapsPlugin(), ...(cfg.plugins || [])],
          sourcesContent: false,
          minify: minify === 'All',
          outfile: 'main.js',
          treeShaking: true,
        });
        buildResults.set(targetRuntime, buildResult);
      } catch (err) {
        return isEsbuildResult(err)
          ? await newCompileResponse(
              config,
              this.#namespace,
              info,
              new Map([[targetRuntime, err]]),
              root,
              includeMetafile
            )
          : unknownToErrorCompileResponse('Compilation', err);
      }
    }

    const esbuildCompileResult = await newCompileResponse(
      config,
      this.#namespace,
      info,
      buildResults,
      root,
      includeMetafile
    );

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

  watch({ config, root, info }: CompileParams): Observable<CompileResponse> {
    // Use a stable entrypoint, not a template.
    const blocksEntry = config?.blocks?.entry ?? getClassicModuleEntrypoint(root);
    if (!this.#bundleWatchers.has(blocksEntry)) {
      let watcher;
      try {
        watcher = new Watcher(config, this.#namespace, root, info, {
          disableExternDevvitProtos: this.#disableExternDevvitProtos,
        });
      } catch (err) {
        return of(unknownToErrorCompileResponse('Compilation', err));
      }
      this.#bundleWatchers.set(root, watcher);
      return watcher.getObservable();
    }

    return NonNull(this.#bundleWatchers.get(blocksEntry)).getObservable();
  }
}

async function newCompileResponse(
  config: Readonly<AppConfig> | undefined,
  namespace: Readonly<Namespace>,
  actorSpec: ActorSpec,
  buildResults: Map<TargetRuntime, BuildResult>,
  root: ProjectRootDir,
  includeMetafile: boolean = false
): Promise<CompileResponse> {
  const errors: CompileLog[] = [];
  const warnings: CompileLog[] = [];
  const bundles: Bundle[] = [];

  for (const [targetRuntime, buildResult] of buildResults) {
    if (!buildResult) continue;

    prefixBuildResultLogs(buildResult, 'esbuild');

    errors.push(...buildResult.errors.map(esbuildMessageToBuildLog));
    warnings.push(...buildResult.warnings.map(esbuildMessageToBuildLog));

    let code: string = '';
    let sourceMap: string = '';
    for (const outputFile of buildResult.outputFiles || []) {
      if (outputFile.path?.endsWith('.js')) {
        if (code) {
          throw new Error('There should only be one bundle after build');
        }
        // ESBuild is wrapping our Proxy stub in this which binds the proxy to the `default` export of the module.
        // We want our proxy to be the mapper when importing from the stubbed file so we need to unwrap this so
        // the import statement doesn't become the object: { default: <proxy> } but just <proxy>.
        code = postProcessServerStubCode(outputFile.text);
      } else if (outputFile.path?.endsWith('.js.map')) {
        sourceMap = outputFile.text;
      } else {
        throw new Error('Unexpected output file: ' + outputFile.path);
      }
    }

    if (!code) {
      const errors = buildResult.errors.map(esbuildMessageToBuildLog);
      const warnings = buildResult.warnings.map(esbuildMessageToBuildLog);
      return { bundles: [], errors, warnings };
    }

    let dependencies;
    try {
      dependencies = await getDependencySpec(actorSpec, code, config, namespace);
    } catch (err) {
      return unknownToErrorCompileResponse('Evaluation', err);
    }

    let metafile: string | undefined;
    if (includeMetafile && buildResult.metafile) {
      metafile = JSON.stringify(buildResult.metafile);
    }

    bundles.push({
      assetIds: {},
      code,
      sourceMap,
      dependencies,
      buildInfo: {
        created: new Date(),
        dependencies: newBuildInfoDependencies(root),
        targetRuntime,
      },
      webviewAssetIds: {},
      metafile,
    });
  }

  try {
    updateBundleServer(bundles, root, config?.server);
  } catch {
    const serverEntry = config?.server
      ? path.join(config.server.dir, config.server.entry)
      : undefined;
    return unknownToErrorCompileResponse(
      'Evaluation',
      `Cannot read \`config.server.entry\` file (${serverEntry}).`
    );
  }

  return { bundles, errors, warnings };
}

async function dangerouslyMakeDependencySpec(
  namespace: Readonly<Namespace>,
  actorSpec: ActorSpec,
  ActorClass: ConcreteActorType
): Promise<DependencySpec> {
  const config = new Config(FAKE_FACTORY, actorSpec, {}, {});
  new ActorClass(config);
  const spec = config.export(namespace);
  for (const provide of spec.provides) {
    for (const method of provide.definition?.methods ?? []) {
      if (!(method.name in ActorClass.prototype)) {
        throw new Error(`App class ${ActorClass.name} does not implement ${method.fullName}`);
      }
    }
  }
  return spec;
}

/** Stringifies val as a BuildLog error in a CompileResponse. */
function unknownToErrorCompileResponse(
  phase: 'Compilation' | 'Evaluation',
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
    text: msg.text,
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

/** Call with defined config for v1 behavior. */
function esbuildConfig(
  config: Readonly<AppConfig> | undefined,
  disableExternDevvitProtos: boolean,
  targetRuntime: TargetRuntime,
  watchMode: boolean = false
): esbuild.BuildOptions {
  return {
    // When Blocks migration is used, the Devvit singleton used in the template
    // must be the same instance as that used elsewhere. Aliases are resolved
    // from the current working directory, not the compiled file's directory, so
    // this effectively maps the template's @devvit/public-api to the app's
    // version. The same could be done for @devvit/server but apps don't
    // necessarily have a copy.
    alias: config?.blocks ? { '@devvit/public-api': '@devvit/public-api' } : {},
    // Recursively inline any imported dependencies.
    bundle: true,
    // Tightly coupled to blocks.template.tsx.
    define: {
      'globalThis.__devvit__': config ? JSON.stringify({ config }, undefined, 2) : 'undefined',
    },
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
    // Split the @devvit/protos from the LinkedBundle. This means apps assume
    // @devvit/protos is available for import at execution time.
    plugins: [
      externalizeDevvitProtos(disableExternDevvitProtos),
      ...(targetRuntime === TargetRuntime.CLIENT ? [serverClientCodeSplit(watchMode)] : []),
    ],
    // to-do: uncomment once runtime is split aware and deployed everywhere.
    // external: ['@devvit/protos'],
    // Both format and target are intended to align to
    // @devvit/runtimes/package.json's build scripts for bootstrap compatibility.
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
    platform: targetRuntime === TargetRuntime.UNIVERSAL ? 'node' : 'browser',
    target: 'es2020',
    // Write to in-memory buffers.
    write: false,
  };
}

/**
 * Plugin for excluding code from inclusion in the source map by filename. This helps keep bundle size manageable.
 * @arg {RegExp} config.filter - A filter for what paths to exclude, if they match.
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

async function getDependencySpec(
  actorSpec: Readonly<ActorSpec>,
  code: string,
  config: Readonly<AppConfig> | undefined,
  namespace: Readonly<Namespace>
): Promise<DependencySpec> {
  if (config) return createDependencySpec(actorSpec, config, namespace);
  const ActorClass = await dangerouslyGetBundleActor(code);
  return await dangerouslyMakeDependencySpec(namespace, actorSpec, ActorClass);
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
