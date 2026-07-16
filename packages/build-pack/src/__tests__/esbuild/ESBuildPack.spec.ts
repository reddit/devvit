import path from 'node:path';

import { TargetRuntime } from '@devvit/protos/json/devvit/runtime/bundle.js';
// eslint-disable-next-line no-restricted-imports
import { Bundle } from '@devvit/protos/types/devvit/plugin/buildpack/buildpack_common.js';
import type { BuildResult, OutputFile, PluginBuild } from 'esbuild';
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
              externalEndpoints: false,
              http: { enable: false, domains: [] },
              blob: false,
              chromeless: false,
              journeys: false,
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
              externalEndpoints: false,
              http: { enable: false, domains: [] },
              blob: false,
              chromeless: false,
              journeys: false,
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
              externalEndpoints: false,
              http: { enable: false, domains: [] },
              blob: false,
              chromeless: false,
              journeys: false,
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

  test('non-universal bundles are unmodified', () => {
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
