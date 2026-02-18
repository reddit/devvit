import path from 'node:path';

import { Bundle } from '@devvit/protos/types/devvit/plugin/buildpack/buildpack_common.js';
import { TargetRuntime } from '@devvit/protos/types/devvit/runtime/bundle.js';
import { build, type BuildResult, type OutputFile, type PluginBuild } from 'esbuild';
import type { Observable } from 'rxjs';
import { vi } from 'vitest';

import {
  type CompileParams,
  type CompileResponse,
  ESBuildPack,
  findSourceMapURL,
  updateBundleServer,
  updateBundleVersion,
  Watcher,
} from '../../esbuild/ESBuildPack.js';
import {
  postProcessServerStubCode,
  serverClientCodeSplit,
} from '../../esbuild/plugins/serverClientCodeSplit.js';

const OUTPUT_FILES = [{ path: 'code.js', text: '' } as OutputFile];

let onEndList: ((result: Partial<BuildResult>) => Promise<void>)[] = [];
// Mock imports are hoisted: https://vitest.dev/api/vi.html#vi-mock.
// @ts-expect-error allow top-level await for unit test.
const esbuild: { default: typeof import('esbuild') } = await vi.hoisted(async () => {
  const esbuild = await vi.importActual<typeof import('esbuild')>('esbuild');
  return {
    default: {
      ...esbuild,
      async context(opts) {
        await opts.plugins![0]!.setup({
          onEnd(fn) {
            onEndList.push(fn as (result: Partial<BuildResult>) => Promise<void>);
          },
          onResolve(_, __) {
            // we don't really care about having to await this callback since it's guaranteed to have run before onEnd.
          },
        } as PluginBuild);
        return { async dispose() {}, async watch() {} };
      },
    },
    build: esbuild.build,
  };
});
async function onEnd(arg: Partial<BuildResult>): Promise<void> {
  await Promise.all(onEndList.map((fn) => fn(arg)));
}

const namespace = { hostname: 'local' };

const TEST_TIMEOUT = 50_000; // tsc is slow

let esBuildPack: ESBuildPack;

beforeEach(async () => {
  esBuildPack = new ESBuildPack(namespace);
  vi.setSystemTime(0);
});

afterEach(async () => {
  await esBuildPack.dispose();
  onEndList = [];
});
afterAll(() => {
  vi.unmock('esbuild');
});

describe('Watcher', () => {
  it(
    'Emits updates even when initial build failed',
    async () => {
      vi.mock('esbuild', () => esbuild); // Hoisted.

      const badActorPath = path.join(__dirname, '../test-actors/multi-file-hello-world-class');

      const watcher = new Watcher(undefined, namespace, badActorPath, {
        name: badActorPath.split(path.sep).at(-1)!,
        owner: 'snoo',
        version: '0.0.0',
      }); // this should not throw an error

      let val: CompileResponse;
      watcher.getObservable().subscribe((v) => {
        val = v;
      });

      // first bundle.
      await onEnd({
        errors: [
          {
            id: 'id',
            pluginName: 'pluginName',
            text: 'text',
            location: null,
            notes: [],
            detail: undefined,
          },
        ],
        warnings: [],
      });
      // second bundle.
      await onEnd({
        errors: [
          {
            id: 'id',
            pluginName: 'pluginName',
            text: 'text',
            location: null,
            notes: [],
            detail: undefined,
          },
        ],
        warnings: [],
      });
      expect(val!.errors.length).toBe(1); // initial build failed

      await onEnd({ errors: [], outputFiles: OUTPUT_FILES, warnings: [] });
      expect(val!.errors.length).toBe(0); // should have successful build after fix
    },
    TEST_TIMEOUT
  );
});

describe('ES Build Pack', () => {
  describe('v1', () => {
    test(
      'blocks',
      async () => {
        const req: CompileParams = {
          config: {
            name: 'name',
            schema: 'v1',
            permissions: {
              http: { enable: false, domains: [] },
              blob: false,
              media: false,
              menu: true,
              payments: false,
              realtime: false,
              redis: false,
              reddit: { enable: false, scope: 'user', asUser: [] },
              settings: false,
              triggers: false,
            },
            blocks: { entry: 'migrate.tsx' },
            menu: { items: [] },
            post: {
              dir: 'dir',
              entrypoints: {
                default: {
                  name: 'default',
                  entry: 'entry',
                  height: 'regular',
                },
              },
            },
            json: { name: 'name' },
          },
          root: path.resolve(__dirname, '..', 'test-actors', 'v1-blocks'),
          info: { name: 'name', owner: 'owner', version: '0.0.0' },
          minify: 'None',
          includeMetafile: false,
        };
        const rsp = await esBuildPack.compile(req);

        // User code has precedence.
        expect(rsp.bundles[0].code.indexOf('unique string b')).toBeGreaterThan(
          rsp.bundles[0].code.indexOf('unique string a')
        );

        processCompileResultForSnapshot(rsp);

        expect(rsp).toMatchSnapshot();
      },
      TEST_TIMEOUT
    );

    test(
      'no blocks',
      async () => {
        const req: CompileParams = {
          config: {
            name: 'name',
            schema: 'v1',
            permissions: {
              http: { enable: false, domains: [] },
              blob: false,
              media: false,
              menu: true,
              payments: false,
              realtime: false,
              redis: false,
              reddit: { enable: false, scope: 'user', asUser: [] },
              settings: false,
              triggers: false,
            },
            menu: { items: [] },
            post: {
              dir: 'dir',
              entrypoints: {
                default: {
                  name: 'default',
                  entry: 'entry',
                  height: 'regular',
                },
              },
            },
            json: { name: 'name' },
          },
          // Arbitrary directory just to ensure that no Blocks code is used.
          root: path.resolve(__dirname, '..', 'test-actors', 'bad-syntax'),
          info: { name: 'name', owner: 'owner', version: '0.0.0' },
          minify: 'None',
          includeMetafile: false,
        };
        const rsp = await esBuildPack.compile(req);

        processCompileResultForSnapshot(rsp);

        expect(rsp).toMatchSnapshot();
      },
      TEST_TIMEOUT
    );

    test(
      'server only',
      async () => {
        const req: CompileParams = {
          config: {
            name: 'name',
            schema: 'v1',
            permissions: {
              http: { enable: false, domains: [] },
              blob: false,
              media: false,
              menu: false,
              payments: false,
              realtime: false,
              redis: false,
              reddit: { enable: false, scope: 'user', asUser: [] },
              settings: false,
              triggers: false,
            },
            server: { dir: '.', entry: 'server.js' },
            json: { name: 'name' },
          },
          root: path.resolve(__dirname, '..', 'test-actors', 'server'),
          info: { name: 'name', owner: 'owner', version: '0.0.0' },
          minify: 'None',
          includeMetafile: false,
        };
        const rsp = await esBuildPack.compile(req);

        processCompileResultForSnapshot(rsp);

        expect(rsp).toMatchSnapshot();
      },
      TEST_TIMEOUT
    );
  });

  describe('Bundle', () => {
    it(
      'correctly returns CompileResponse',
      async () => {
        const req: CompileParams = {
          config: undefined,
          root: 'filename', // doesn't exist.
          info: {
            name: 'main',
            owner: 'snoo',
            version: '0.0.0',
          },
          minify: 'None',
          includeMetafile: false,
        };
        const rsp = await esBuildPack.compile(req);

        processCompileResultForSnapshot(rsp);
        expect(rsp).toMatchSnapshot();
      },
      TEST_TIMEOUT
    );

    for (const [index, [name, dir]] of [
      ['a simple program (API)', 'hello-world-api'],
      ['a simple program (subclass)', 'hello-world-class'],
      ['an invalid program', 'bad-syntax'],
      ['CommonJS module (API)', 'cjs-module-api'],
      ['CommonJS module (API) require', 'cjs-module-api-require'],
      ['CommonJS module (subclass)', 'cjs-module-class'],
      ['ECMAScript module (API)', 'es-module-api'],
      ['ECMAScript module (subclass)', 'es-module-class'],
    ].entries()) {
      test(`Case ${index}: "${name}"`, async () => {
        const req: CompileParams = {
          config: undefined,
          root: dir == null ? dir : path.resolve(__dirname, '..', 'test-actors', dir),
          info: {
            name: dir,
            owner: 'snoo',
            version: '0.0.0',
          },
          minify: 'None',
          includeMetafile: false,
        };
        const rsp = await esBuildPack.compile(req);

        processCompileResultForSnapshot(rsp);

        expect(rsp).toMatchSnapshot();
      });
    }

    describe('Code split', () => {
      test('multiple distinct bundles are created', async () => {
        const req: CompileParams = {
          config: undefined,
          root: path.resolve(__dirname, '..', 'test-actors', 'code-split'),
          info: {
            name: 'code-split',
            owner: 'snoo',
            version: '0.0.0',
          },
          minify: 'None',
          includeMetafile: false,
        };

        const rsp = await esBuildPack.compile(req);

        expect(rsp.bundles.length).toBeGreaterThan(1);

        const code: Map<TargetRuntime, string> = new Map();

        rsp.bundles.forEach((bundle) => {
          expect(bundle.code).toBeDefined();
          code.set(bundle.buildInfo!.targetRuntime, bundle.code);
        });

        const strings = ['Life, the Universe, and Everything', 'alfredo'];

        for (const string of strings) {
          expect(code.get(TargetRuntime.CLIENT)).not.toContain(string);
          expect(code.get(TargetRuntime.UNIVERSAL)).toContain(string);
        }
      });
    });

    describe('Metafile', () => {
      it('produces a metafile when requested', async () => {
        const req: CompileParams = {
          config: undefined,
          root: path.resolve(__dirname, '..', 'test-actors', 'hello-devvit'),
          info: {
            name: 'hello-devvit',
            owner: 'snoo',
            version: '0.0.0',
          },
          minify: 'None',
          includeMetafile: true,
        };
        const bundleResponse = await esBuildPack.compile(req);
        expect(bundleResponse.bundles.some((bundle) => bundle.metafile !== undefined)).toBeTruthy();
      });

      it('does not produce a metafile when disabled', async () => {
        const req: CompileParams = {
          config: undefined,
          root: path.resolve(__dirname, '..', 'test-actors', 'hello-devvit'),
          info: {
            name: 'hello-devvit',
            owner: 'snoo',
            version: '0.0.0',
          },
          minify: 'None',
          includeMetafile: false,
        };
        const bundleResponse = await esBuildPack.compile(req);
        expect(bundleResponse.bundles.some((bundle) => bundle.metafile !== undefined)).toBeFalsy();
      });
    });

    describe('WatchBundleUpdate', () => {
      let observable: Observable<CompileResponse>;

      beforeEach(async () => {
        vi.mock('esbuild', () => esbuild); // Hoisted.

        observable = esBuildPack.watch({
          config: undefined,
          root: 'filename',
          info: {
            name: 'main',
            owner: 'snoo',
            version: '0.0.0',
          },
          minify: 'None',
          includeMetafile: false,
        });

        await onEnd({
          errors: [],
          outputFiles: OUTPUT_FILES,
          warnings: [],
        });
      }, TEST_TIMEOUT * 5);

      it(
        'will emit updates when module files are modified',
        async () => {
          const subscriber = vi.fn();
          // gets most recently emitted value, 1st call
          observable.subscribe(subscriber);

          await onEnd({
            errors: [],
            outputFiles: OUTPUT_FILES,
            warnings: [],
          });
          expect(subscriber).toBeCalledTimes(2);
        },
        TEST_TIMEOUT
      );

      it(
        'will emit updates when module files are modified multiple times',
        async () => {
          const subscriber = vi.fn();
          // gets most recently emitted value, 1st call
          observable.subscribe(subscriber);

          await onEnd({
            errors: [],
            outputFiles: OUTPUT_FILES,
            warnings: [],
          });
          expect(subscriber).toBeCalledTimes(2);
          await onEnd({
            errors: [],
            outputFiles: OUTPUT_FILES,
            warnings: [],
          });
          expect(subscriber).toBeCalledTimes(3);
        },
        TEST_TIMEOUT * 5 // tsc is slow
      );

      it(
        'will unsubscribe all subscribers upon disposal',
        async () => {
          // subscribe to updates
          const subscriber = vi.fn();
          const subscription = observable.subscribe(subscriber);

          // dispose build pack
          await esBuildPack.dispose();
          expect(subscription.closed).toBe(true);

          // modify file, should not receive any updates from this modification since already unsubscribed
          await onEnd({
            errors: [],
            outputFiles: OUTPUT_FILES,
            warnings: [],
          });
        },
        TEST_TIMEOUT
      );
    });
  });
  describe('ESBuild output', () => {
    it('wraps CJS code in __toESM() calls', async () => {
      const result = await build({
        bundle: true,
        entryPoints: [path.resolve(__dirname, '..', 'test-actors', 'code-split', 'main.tsx')],
        minify: false,
        outfile: 'main.js',
        plugins: [serverClientCodeSplit()],
        format: 'cjs',
        jsxFactory: 'Devvit.createFragment',
        jsxFragment: 'Devvit.Fragment',
        target: 'es2020',
        write: false,
      });

      // Validate that ESBuild is wrapping CJS code to act like ESM code in the
      // way `postProcessServerStubCode()` assumes itd  in order to clean it up
      expect(
        result.outputFiles.some((bundle) =>
          bundle.text.includes('__toESM(require_server_stub(), 1)')
        )
      ).toBeTruthy();
      const stubbedRedis = result.outputFiles?.[0]?.text.match(
        /var import_RedisClient[0-9]* = __toESM\(require_server_stub\(\), 1\)/gm
      );
      expect(stubbedRedis).toBeFalsy();
    });

    it('has __toESM() calls stripped from stubbed server code', async () => {
      const result = await build({
        bundle: true,
        entryPoints: [path.resolve(__dirname, '..', 'test-actors', 'code-split', 'main.tsx')],
        minify: false,
        outfile: 'main.js',
        plugins: [serverClientCodeSplit(true)],
        format: 'cjs',
        jsxFactory: 'Devvit.createFragment',
        jsxFragment: 'Devvit.Fragment',
        target: 'es2020',
        write: false,
      });

      const clientBundle = result.outputFiles.find((bundle) =>
        bundle.text.includes('"server-only:')
      );
      expect(clientBundle?.text).not.toBeUndefined();
      const cleanedUpCode = postProcessServerStubCode(clientBundle!.text);
      const stubs = Array.from(
        cleanedUpCode.matchAll(/var require_([a-zA-Z_-]+) = __commonJS\(\{\n[^\n]*"server-only:/gm)
      );
      stubs.forEach(([_, stub]) =>
        expect(cleanedUpCode).not.toContain(`__toESM(require_${stub}(), 1)`)
      );
    });

    it('removes plugin code when DEVVIT_BUNDLE_STRIP_PLUGINS is set', async () => {
      process.env.DEVVIT_BUNDLE_STRIP_PLUGINS = '1';
      const result = await build({
        bundle: true,
        entryPoints: [path.resolve(__dirname, '..', 'test-actors', 'code-split', 'main.tsx')],
        minify: false,
        outfile: 'main.js',
        plugins: [serverClientCodeSplit(true)],
        format: 'cjs',
        jsxFactory: 'Devvit.createFragment',
        jsxFragment: 'Devvit.Fragment',
        target: 'es2020',
        write: false,
      });
      const clientBundle = result.outputFiles.find((bundle) =>
        bundle.text.includes('"server-only:')
      );
      expect(clientBundle?.text).not.toBeUndefined();
      const stubbedRedis = result.outputFiles?.[0]?.text.match(
        /var import_RedisClient[0-9]* = __toESM\(require_server_stub\(\), 1\)/gm
      );
      expect(stubbedRedis).toBeTruthy();
    });
  });
});

describe('findSourceMapURL()', () => {
  test('empty', () => {
    expect(findSourceMapURL('')).toBe(undefined);
  });

  test('exact', () => {
    expect(findSourceMapURL('//@ sourceMappingURL=foo.js')).toBe('foo.js');
  });

  test('multiple', () => {
    expect(findSourceMapURL('//# sourceMappingURL=foo.js\n//# sourceMappingURL=bar.js')).toBe(
      'bar.js'
    );
  });

  test('trailing whitespace', () => {
    expect(findSourceMapURL('//# sourceMappingURL=foo.js \n')).toBe('foo.js');
  });

  test('polyfill.iife.js', () => {
    expect(
      findSourceMapURL(
        `
    *)
 */
 //# sourceMappingURL=polyfill.iife.js.map
`
      )
    ).toBe('polyfill.iife.js.map');
  });

  test('preact.min.js', () => {
    expect(
      findSourceMapURL(
        `
typeof module<"u"?module.exports=c:self.preact=c}();
//# sourceMappingURL=preact.min.js.map
`
      )
    ).toBe('preact.min.js.map');
  });
});

describe('updateBundleServer()', () => {
  test('universal bundles are modified', () => {
    const bundle: Bundle = {
      assetIds: {},
      buildInfo: {
        targetRuntime: TargetRuntime.UNIVERSAL,
        dependencies: {},
      },
      code: '',
      webviewAssetIds: {},
    };
    updateBundleServer([bundle], path.join(__dirname, '../test-actors/server'), {
      dir: '.',
      entry: 'server.js',
    });

    expect(bundle?.server?.code).toMatchInlineSnapshot(`
      "console.log('hello server');
      "
    `);
  });

  test('client bundles are unmodified', () => {
    const bundle: Bundle = {
      assetIds: {},
      buildInfo: {
        targetRuntime: TargetRuntime.CLIENT,
        dependencies: {},
      },
      code: '',
      webviewAssetIds: {},
    };
    updateBundleServer([bundle], path.join(__dirname, '../test-actors/server'), {
      dir: '.',
      entry: 'server.js',
    });

    expect(bundle?.server).toBe(undefined);
  });

  test('server bundles with no config are unmodified', () => {
    const bundle: Bundle = {
      assetIds: {},
      buildInfo: {
        targetRuntime: TargetRuntime.UNIVERSAL,
        dependencies: {},
      },
      code: '',
      webviewAssetIds: {},
    };
    updateBundleServer([bundle], path.join(__dirname, '../test-actors/server'), undefined);

    expect(bundle?.server).toBe(undefined);
  });
});

describe('updateBundleVersion()', () => {
  test('bundle has a version and is modified', () => {
    const bundle: Bundle = { assetIds: {}, code: '', webviewAssetIds: {} };

    updateBundleVersion([bundle], '1.2.3.4');

    expect(bundle?.dependencies?.actor?.version).toBe('1.2.3.4');
  });
});

function processCompileResultForSnapshot(compileRes: CompileResponse): void {
  compileRes.bundles.forEach((bundle) => {
    bundle.code = bundle.code.length === 0 ? 'empty' : 'nonempty';
    bundle.sourceMap = bundle.sourceMap?.length === 0 ? 'empty' : 'nonempty';
    if (bundle.buildInfo?.dependencies != null) {
      bundle.buildInfo.dependencies = {};
    }
  });

  // Drone runs the tests in a Docker container, so the paths are different
  compileRes.errors.forEach((e) => {
    if (e.detail != null) {
      // replace the string with the last part of the filepath
      e.detail.filename = e.detail?.filename.split(path.sep).at(-1)!;
    }
  });
}
