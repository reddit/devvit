import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import chalk from 'chalk';
// eslint-disable-next-line implicitDependencies/no-implicit
import type { PluginContext as RollupPluginContext } from 'rollup';
import type { ConfigEnv, ConfigPluginContext, Plugin, UserConfig, ViteBuilder } from 'vite';
import { afterEach, beforeAll, describe, expect, test, vi } from 'vitest';

import { devvit } from './index.js';

beforeAll(() => {
  process.env.FORCE_COLOR = '0';
  chalk.level = 0;
});

afterEach(() => {
  vi.restoreAllMocks();
});

type DevvitResolvedConfig = {
  builder?: { buildApp?: (builder: ViteBuilder) => Promise<void> };
  root?: string;
  envDir?: string;
  publicDir?: string | false;
  environments?: {
    client?: { build?: { rollupOptions?: { input?: Record<string, string> } } };
    server?: { build?: { ssr?: string } };
  };
};

type DevvitResolveIdContext = {
  environment: { name: string };
  error: (e: unknown) => never;
  resolve: (
    source: string,
    importer: string | undefined,
    options: { skipSelf: boolean }
  ) => Promise<{ id: string } | null>;
};

type DevvitLoadContext = {
  environment: { name: string };
  error: (e: unknown) => never;
};

function normalizePathForSnapshot(filePath: string, projectRoot: string): string {
  return filePath.replaceAll(projectRoot, '<root>').replaceAll('\\', '/');
}

function withMockedCwd<T>(projectRoot: string, runner: () => T): T {
  const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(projectRoot);
  try {
    return runner();
  } finally {
    cwdSpy.mockRestore();
  }
}

class PluginHarness {
  constructor(private readonly _plugin: Plugin) {}

  getConfigHook() {
    const hook = this._plugin.config;
    if (typeof hook === 'function') {
      return hook;
    }
    return hook?.handler;
  }

  getResolveIdHook() {
    const hook = this._plugin.resolveId;
    if (typeof hook === 'function') {
      return hook;
    }
    return hook?.handler;
  }

  getLoadHook() {
    const hook = this._plugin.load;
    if (typeof hook === 'function') {
      return hook;
    }
    return hook?.handler;
  }

  runConfig(config: UserConfig, env: ConfigEnv) {
    const hook = this.getConfigHook();
    if (!hook) return undefined;
    return hook.call({} as ConfigPluginContext, config, env);
  }

  async runResolveId(
    context: Partial<DevvitResolveIdContext>,
    source: string,
    importer: string | undefined
  ) {
    const hook = this.getResolveIdHook();
    if (!hook) return undefined;

    const fullContext = {
      environment: { name: 'client' },
      error: (e: unknown) => {
        throw e;
      },
      resolve: async (src: string) => ({ id: path.resolve('/', src) }),
      ...context,
    } as unknown as RollupPluginContext;

    return hook.call(fullContext, source, importer, { isEntry: false, attributes: {} });
  }

  runLoad(context: Partial<DevvitLoadContext>, id: string) {
    const hook = this.getLoadHook();
    if (!hook) return undefined;

    const fullContext = {
      environment: { name: 'client' },
      error: (e: unknown) => {
        throw e;
      },
      ...context,
    } as unknown as RollupPluginContext;

    return hook.call(fullContext, id);
  }

  async expectResolveIdError(
    source: string,
    importer: string | undefined,
    matcher: (message: string) => void
  ) {
    const errorMock = vi.fn();
    await this.runResolveId(
      {
        error: errorMock as unknown as (e: unknown) => never,
      },
      source,
      importer
    );
    expect(errorMock).toHaveBeenCalledTimes(1);
    const errorMessage = errorMock.mock.calls[0][0];
    matcher(typeof errorMessage === 'string' ? errorMessage : errorMessage.message);
  }

  expectLoadError(id: string, matcher: (message: string) => void) {
    const errorMock = vi.fn();
    this.runLoad(
      {
        error: errorMock as unknown as (e: unknown) => never,
      },
      id
    );
    expect(errorMock).toHaveBeenCalledTimes(1);
    const errorMessage = errorMock.mock.calls[0][0];
    matcher(typeof errorMessage === 'string' ? errorMessage : errorMessage.message);
  }
}

class TestProject {
  readonly root: string;

  constructor() {
    this.root = fs.mkdtempSync(path.join(os.tmpdir(), 'devvit-start-test-'));
  }

  writeDevvitJson(contents: unknown): void {
    fs.writeFileSync(path.join(this.root, 'devvit.json'), JSON.stringify(contents, null, 2));
  }

  write(filePath: string, content: string = ''): void {
    const fullPath = path.join(this.root, filePath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, content);
  }

  path(filePath: string): string {
    return path.join(this.root, filePath);
  }

  cleanup(): void {
    fs.rmSync(this.root, { recursive: true, force: true });
  }
}

describe('devvit Vite plugin', () => {
  test('prints a helpful error when used outside vite build', () => {
    const harness = new PluginHarness(devvit());

    const callConfig = (): void => {
      const config: UserConfig = { root: '/' };
      const env: ConfigEnv = { command: 'serve', mode: 'development' };
      harness.runConfig(config, env);
    };

    let err: unknown;
    try {
      callConfig();
    } catch (e) {
      err = e;
    }

    expect((err as Error).message).toMatchInlineSnapshot(`
      "✖ devvit plugin error

      This plugin only supports vite build.
      For development, run: npm run dev
      "
    `);
  });

  test('prints a helpful error when devvit.json entrypoints cannot be inferred', () => {
    const harness = new PluginHarness(devvit());
    const project = new TestProject();

    const callConfig = (): void => {
      const config: UserConfig = {};
      const env: ConfigEnv = { command: 'build', mode: 'production' };
      harness.runConfig(config, env);
    };

    let err: unknown;
    try {
      withMockedCwd(project.root, callConfig);
    } catch (e) {
      err = e;
    }

    expect((err as Error).message).toMatchInlineSnapshot(`
      "✖ devvit plugin error

      Could not read devvit.json. Ensure it exists in the project root and contains valid JSON.
      "
    `);

    project.cleanup();
  });

  test('throws a helpful error when resolveId detects server code import', async () => {
    const harness = new PluginHarness(devvit());
    const project = new TestProject();

    project.writeDevvitJson({
      post: {
        entrypoints: {
          default: { entry: 'index.html' },
        },
      },
    });

    project.write('src/server/index.ts', 'export const handler = async () => {}');

    withMockedCwd(project.root, () => {
      const config: UserConfig = {};
      const env: ConfigEnv = { command: 'build', mode: 'production' };
      harness.runConfig(config, env);
    });

    const importer = project.path('src/client/game.tsx');
    const source = 'src/server/secret.ts';

    // Override the resolver to be aware of our temp project root
    harness.runResolveId = async (context, src, imp) => {
      const hook = harness.getResolveIdHook();
      if (!hook) return undefined;

      const fullContext = {
        environment: { name: 'client' },
        error: (e: unknown) => {
          throw e;
        },
        resolve: async (s: string) => ({ id: path.resolve(project.root, s) }),
        ...context,
      } as unknown as RollupPluginContext;

      return hook.call(fullContext, src, imp, { isEntry: false, attributes: {} });
    };

    await harness.expectResolveIdError(source, importer, (message) => {
      expect(message).toContain('Detected server code in the client!');
      expect(message).toContain('Importer: src/client/game.tsx');
      expect(message).toContain('Imported: src/server/secret.ts');
    });

    project.cleanup();
  });

  test('throws a helpful error when load detects server code (fallback)', () => {
    const harness = new PluginHarness(devvit());
    const project = new TestProject();

    project.writeDevvitJson({
      post: {
        entrypoints: {
          default: { entry: 'index.html' },
        },
      },
    });

    project.write('src/server/index.ts', 'export const handler = async () => {}');

    withMockedCwd(project.root, () => {
      const config: UserConfig = {};
      const env: ConfigEnv = { command: 'build', mode: 'production' };
      harness.runConfig(config, env);
    });

    const id = project.path('src/server/secret.ts');

    harness.expectLoadError(id, (message) => {
      expect(message).toContain('Detected server code in the client!');
      expect(message).not.toContain('Importer:');
      expect(message).toContain('Imported: src/server/secret.ts');
    });

    project.cleanup();
  });

  test('buildApp logs expected client + server build messages and uses entrypoint keys as input names', async () => {
    const harness = new PluginHarness(devvit());
    const project = new TestProject();

    project.writeDevvitJson({
      post: {
        entrypoints: {
          default: { entry: 'index.html' },
          splash: { entry: 'splash.html' },
          legacy: { entry: 'src/client/legacy.html' },
        },
      },
      server: {
        entry: 'src/server/index.ts',
        dir: 'dist/server',
      },
    });

    project.write('src/client/index.html', '<!doctype html>');
    project.write('src/client/splash.html', '<!doctype html>');
    project.write('src/client/legacy.html', '<!doctype html>');
    project.write('src/server/index.ts', 'export const handler = async () => {}');

    const resolved = withMockedCwd(project.root, () => {
      const config: UserConfig = {};
      const env: ConfigEnv = { command: 'build', mode: 'production' };
      return harness.runConfig(config, env) as DevvitResolvedConfig;
    });

    if (!('environments' in resolved) || !('builder' in resolved)) {
      throw new Error('Expected devvit plugin config hook to return a resolved config object.');
    }

    const clientInputs = resolved.environments?.client?.build?.rollupOptions?.input ?? {};
    expect(
      Object.fromEntries(
        Object.entries(clientInputs).map(([key, value]) => [
          key,
          normalizePathForSnapshot(value, project.root),
        ])
      )
    ).toMatchInlineSnapshot(`
      {
        "default": "<root>/src/client/index.html",
        "legacy": "<root>/src/client/legacy.html",
        "splash": "<root>/src/client/splash.html",
      }
    `);

    const consoleLines: string[] = [];
    vi.spyOn(console, 'log').mockImplementation((...args: unknown[]) => {
      consoleLines.push(args.map(String).join(' '));
    });

    // Mock Date.now() to return consistent values for testing
    vi.spyOn(Date, 'now').mockReturnValue(0);

    const builder = {
      environments: { client: { name: 'client' }, server: { name: 'server' } },
      build: vi.fn(async () => {}),
    } as unknown as ViteBuilder;

    await resolved?.builder?.buildApp?.(builder);

    expect(consoleLines).toMatchInlineSnapshot(`
      [
        "✔ Build complete (0ms)",
      ]
    `);

    project.cleanup();
  });

  test('skips client environment when devvit.json has no post config', async () => {
    const harness = new PluginHarness(devvit());
    const project = new TestProject();

    project.writeDevvitJson({
      server: {
        entry: 'src/server/index.ts',
        dir: 'dist/server',
      },
    });

    project.write('src/server/index.ts', 'export const handler = async () => {}');

    const resolved = withMockedCwd(project.root, () => {
      const config: UserConfig = {};
      const env: ConfigEnv = { command: 'build', mode: 'production' };
      return harness.runConfig(config, env) as DevvitResolvedConfig;
    });

    expect(resolved.environments?.client).toBeUndefined();
    expect(resolved.environments?.server).toBeDefined();
    expect(resolved.root).toBe(project.root);
    expect(resolved.envDir).toBe(project.root);

    const buildMock = vi.fn(async () => {});
    const builder = {
      environments: { server: { name: 'server' } },
      build: buildMock,
    } as unknown as ViteBuilder;

    await resolved?.builder?.buildApp?.(builder);

    expect(buildMock).toHaveBeenCalledTimes(1);
    expect(buildMock).toHaveBeenCalledWith(builder.environments.server);

    project.cleanup();
  });

  test('skips client environment when post entrypoints are missing', () => {
    const harness = new PluginHarness(devvit());
    const project = new TestProject();

    project.writeDevvitJson({
      post: {},
      server: {
        entry: 'src/server/index.ts',
        dir: 'dist/server',
      },
    });

    project.write('src/server/index.ts', 'export const handler = async () => {}');

    const resolved = withMockedCwd(project.root, () => {
      const config: UserConfig = {};
      const env: ConfigEnv = { command: 'build', mode: 'production' };
      return harness.runConfig(config, env) as DevvitResolvedConfig;
    });

    expect(resolved.environments?.client).toBeUndefined();
    expect(resolved.environments?.server).toBeDefined();
    expect(resolved.root).toBe(project.root);

    project.cleanup();
  });

  test('skips server environment when devvit.json has no server config', async () => {
    const harness = new PluginHarness(devvit());
    const project = new TestProject();

    project.writeDevvitJson({
      post: {
        entrypoints: {
          default: { entry: 'index.html' },
        },
      },
    });

    project.write('src/client/index.html', '<!doctype html>');

    const resolved = withMockedCwd(project.root, () => {
      const config: UserConfig = {};
      const env: ConfigEnv = { command: 'build', mode: 'production' };
      return harness.runConfig(config, env) as DevvitResolvedConfig;
    });

    expect(resolved.environments?.client).toBeDefined();
    expect(resolved.environments?.server).toBeUndefined();
    expect(resolved.root).toBe(project.path('src/client'));

    const buildMock = vi.fn(async () => {});
    const builder = {
      environments: { client: { name: 'client' } },
      build: buildMock,
    } as unknown as ViteBuilder;

    await resolved?.builder?.buildApp?.(builder);

    expect(buildMock).toHaveBeenCalledTimes(1);
    expect(buildMock).toHaveBeenCalledWith(builder.environments.client);

    project.cleanup();
  });

  test('supports repo-root client entries when src/client is missing', () => {
    const harness = new PluginHarness(devvit());
    const project = new TestProject();

    project.writeDevvitJson({
      post: {
        entrypoints: {
          default: { entry: 'src/splash.html' },
          game: { entry: 'src/game.html' },
        },
      },
    });

    project.write('src/splash.html', '<!doctype html>');
    project.write('src/game.html', '<!doctype html>');
    project.write('src/server/index.ts', 'export const handler = async () => {}');

    const resolved = withMockedCwd(project.root, () => {
      const config: UserConfig = {};
      const env: ConfigEnv = { command: 'build', mode: 'production' };
      return harness.runConfig(config, env) as DevvitResolvedConfig;
    });

    const clientInputs = resolved.environments?.client?.build?.rollupOptions?.input ?? {};
    const normalizedInputs = Object.fromEntries(
      Object.entries(clientInputs).map(([key, value]) => [
        key,
        normalizePathForSnapshot(value, project.root),
      ])
    );

    expect(normalizedInputs).toStrictEqual({
      default: '<root>/src/splash.html',
      game: '<root>/src/game.html',
    });
    expect(resolved.root).toBe(project.root);
    expect(resolved.envDir).toBe(project.root);

    project.cleanup();
  });

  test('respects explicit root without src/client inference', () => {
    const harness = new PluginHarness(devvit());
    const project = new TestProject();

    project.writeDevvitJson({
      post: {
        entrypoints: {
          default: { entry: 'src/client/index.html' },
        },
      },
    });

    project.write('src/client/index.html', '<!doctype html>');
    project.write('src/server/index.ts', 'export const handler = async () => {}');

    const config: UserConfig = { root: project.root };
    const env: ConfigEnv = { command: 'build', mode: 'production' };
    const resolved = harness.runConfig(config, env) as DevvitResolvedConfig;

    const clientInputs = resolved.environments?.client?.build?.rollupOptions?.input ?? {};
    expect(
      Object.fromEntries(
        Object.entries(clientInputs).map(([key, value]) => [
          key,
          normalizePathForSnapshot(value, project.root),
        ])
      )
    ).toStrictEqual({ default: '<root>/src/client/index.html' });
    expect(resolved.root).toBe(project.root);

    project.cleanup();
  });

  test('skips publicDir auto-resolution when user disables it', () => {
    const harness = new PluginHarness(devvit());
    const project = new TestProject();

    project.writeDevvitJson({
      post: {
        entrypoints: {
          default: { entry: 'index.html' },
        },
      },
    });

    project.write('src/client/index.html', '<!doctype html>');
    project.write('src/server/index.ts', 'export const handler = async () => {}');
    project.write('public/snoo.png', 'png');
    project.write('src/client/public/snoo.png', 'png');

    let resolved: DevvitResolvedConfig | undefined;
    expect(() => {
      resolved = withMockedCwd(project.root, () => {
        const config: UserConfig = { publicDir: false };
        const env: ConfigEnv = { command: 'build', mode: 'production' };
        return harness.runConfig(config, env) as DevvitResolvedConfig;
      });
    }).not.toThrow();

    expect(resolved?.publicDir).toBeUndefined();

    project.cleanup();
  });
});
