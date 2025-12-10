import '@devvit/shared-types/polyfill/fetch.polyfill.js';

import { MediaMock } from '@devvit/media/test';
import { RealtimeDefinition } from '@devvit/protos/types/devvit/events/v1alpha/realtime.js';
import { HTTPDefinition } from '@devvit/protos/types/devvit/plugin/http/http.js';
import { MediaServiceDefinition } from '@devvit/protos/types/devvit/plugin/media/media.js';
import { RedisAPIDefinition } from '@devvit/protos/types/devvit/plugin/redis/redisapi.js';
import { SettingsDefinition } from '@devvit/protos/types/devvit/plugin/settings/v1alpha/settings.js';
import { RealtimeMock } from '@devvit/realtime/server/test';
import { RedditPluginMock } from '@devvit/reddit/test';
import { RedisMock } from '@devvit/redis/test';
import { Context, runWithContext } from '@devvit/server';
import { SettingsMock } from '@devvit/settings/test';
import type { Config } from '@devvit/shared-types/Config.js';
import { Header } from '@devvit/shared-types/Header.js';
import type { AppConfig } from '@devvit/shared-types/schemas/config-file.v1.js';
import {
  getDefaultAppConfig,
  makeConfig,
  MOCK_HEADERS as headersMock,
} from '@devvit/shared-types/test/index.js';
import type { T2, T5 } from '@devvit/shared-types/tid.js';
import type { TestAPI, TestFunction } from 'vitest';
import { test as baseTest, vi } from 'vitest';

import { HTTPMock } from '../mocks/http/httpMock.js';
import { installDevvitInterceptors, runWithTestContext, type TestContext } from './context.js';

installDevvitInterceptors();

export type DevvitFixtures = {
  /**
   * The Devvit configuration object for the current test context.
   */
  config: Config;

  /**
   * Request headers simulating a real Devvit execution environment.
   */
  headers: { [key in Header]?: string };

  /**
   * App settings configured for this test instance.
   * Can be customized via `createDevvitTest({ settings: ... })`.
   */
  settings: { [key: string]: string | number | boolean | string[] | undefined };

  /**
   * The username of the simulated user executing the app.
   * @default 'testuser'
   */
  username: string;

  /**
   * The user ID (t2_*) of the simulated user.
   * @default 't2_testuser'
   */
  userId: T2;

  /**
   * The name of the subreddit where the app is running.
   * @default 'testsub'
   */
  subredditName: string;

  /**
   * The subreddit ID (t5_*) where the app is running.
   * @default 't5_testsub'
   */
  subredditId: T5;

  /**
   * Direct access to mock implementations of Devvit capabilities.
   * Use these to inspect state or configure specific mock behaviors.
   */
  mocks: {
    media: MediaMock;
    redis: RedisMock;
    http: HTTPMock;
    reddit: RedditPluginMock;
    realtime: RealtimeMock;
    settings: SettingsMock;
  };
};

export type DevvitTestConfig = {
  /**
   * The username of the simulated user.
   * @default 'testuser'
   */
  username?: string;

  /**
   * The user ID (t2_*) of the simulated user.
   * @default 't2_testuser'
   */
  userId?: T2;

  /**
   * The name of the subreddit where the app is running.
   * @default 'testsub'
   */
  subredditName?: string;

  /**
   * The subreddit ID (t5_*) where the app is running.
   * @default 't5_testsub'
   */
  subredditId?: T5;

  /**
   * Pre-configured app settings to be available via `context.settings`. Use to set
   * settings for use with the `@devvit/settings` capability to make it easier to test.
   */
  settings?: { [key: string]: string | number | boolean | string[] | undefined };

  /**
   * Custom AppConfig to use for the test environment. For internal use.
   */
  appConfig?: AppConfig;
};

function createWrappedTestApi(
  target: TestAPI | TestAPI<DevvitFixtures>['each'],
  setup: () => { reqCtx: Context; fixtures: DevvitFixtures; testContext: TestContext }
): unknown {
  return new Proxy(target, {
    // Handles: test(...), test.only(...), test.skip(...),
    // test.each(table)(...), test.concurrent(...), etc.
    apply(fn, thisArg, argArray: unknown[]) {
      const args = [...argArray];

      // Find the last function argument (the test body / hook body)
      let lastFnIndex = -1;
      for (let i = args.length - 1; i >= 0; i--) {
        if (typeof args[i] === 'function') {
          lastFnIndex = i;
          break;
        }
      }

      if (lastFnIndex !== -1) {
        const userFn = args[lastFnIndex] as TestFunction<DevvitFixtures>;

        // Wrap the user's test function
        args[lastFnIndex] = async (...fnArgs: any[]) => {
          const { reqCtx, fixtures, testContext } = setup();

          try {
            // Heuristic to detect Vitest TestContext
            // Standard test() calls receive a single TestContext object.
            // test.each() calls receive the parameters as arguments.
            const isTestContext =
              fnArgs.length === 1 &&
              fnArgs[0] &&
              (typeof fnArgs[0] === 'object' || typeof fnArgs[0] === 'function') &&
              'task' in fnArgs[0] &&
              // Vitest context usually has these lifecycle methods
              'onTestFailed' in fnArgs[0];

            if (isTestContext) {
              const mergedCtx = { ...fixtures, ...fnArgs[0] };
              return await runWithContext(reqCtx, () =>
                runWithTestContext(testContext, () => userFn(mergedCtx))
              );
            }

            return await runWithContext(reqCtx, () =>
              runWithTestContext(testContext, () =>
                (userFn as (...args: any[]) => Promise<unknown>)(...fnArgs)
              )
            );
          } finally {
            vi.restoreAllMocks();
            await fixtures.mocks.redis.clear();
          }
        };
      }

      const result = Reflect.apply(fn, thisArg, args);

      // IMPORTANT for `.each` (and any curried API):
      // if the result is a function, wrap it too so subsequent call(s)
      // also get fixtures + ALS.
      if (typeof result === 'function') {
        return createWrappedTestApi(result, setup);
      }

      return result;
    },

    // Handles property access: test.only, test.skip, test.each, test.concurrent, ...
    get(fn, prop, receiver) {
      const value = Reflect.get(fn, prop, receiver);
      if (typeof value === 'function') {
        return createWrappedTestApi(value, setup);
      }
      return value;
    },
  });
}

const setup = (
  config: DevvitTestConfig
): {
  reqCtx: Context;
  fixtures: DevvitFixtures;
  testContext: TestContext;
} => {
  const username = config.username ?? 'testuser';
  const userId = config.userId ?? 't2_testuser';
  const subredditName = config.subredditName ?? 'testsub';
  const subredditId = config.subredditId ?? 't5_testsub';
  const settings = config.settings ?? {};
  const appConfig = config.appConfig;

  const headers = {
    ...headersMock,
    [Header.User]: userId,
    [Header.Username]: username,
    [Header.AppUser]: userId,
    [Header.Subreddit]: subredditId,
    [Header.SubredditName]: subredditName,
  };
  const mediaMock = new MediaMock();
  const redisMock = new RedisMock();
  const httpMock = new HTTPMock();
  const redditMock = new RedditPluginMock();
  const realtimeMock = new RealtimeMock();
  const settingsMock = new SettingsMock(settings);

  // Seed default context data so helpers like getCurrentUser/subreddit work.
  redditMock.addUser({ id: userId, name: username });
  redditMock.addSubreddit({ id: subredditId, displayName: subredditName, title: subredditName });

  const cfg = makeConfig({
    plugins: {
      [MediaServiceDefinition.fullName]: mediaMock,
      [RedisAPIDefinition.fullName]: redisMock,
      [HTTPDefinition.fullName]: httpMock,
      [RealtimeDefinition.fullName]: realtimeMock.plugin,
      [SettingsDefinition.fullName]: settingsMock.plugin,
      ...redditMock.getPluginRegistrations(),
    },
  });

  const contextAppConfig = appConfig ?? getDefaultAppConfig();

  const reqCtx = Context(headers);

  const fixtures: DevvitFixtures = {
    config: cfg,
    headers,
    settings,
    username,
    userId,
    subredditName,
    subredditId,
    mocks: {
      media: mediaMock,
      redis: redisMock,
      http: httpMock,
      reddit: redditMock,
      realtime: realtimeMock,
      settings: settingsMock,
    },
  };

  return { reqCtx, fixtures, testContext: { config: cfg, appConfig: contextAppConfig } };
};

/**
 * Creates a test runner with customized Devvit environment.
 *
 * @example
 * const test = createDevvitTest({
 *   username: 'moderator_bob',
 *   settings: { enable_ban_hammer: true }
 * });
 *
 * test('mod action works', async ({ config, headers }) => {
 *   // ...
 * });
 *
 * @experimental
 */
export const createDevvitTest = (config: DevvitTestConfig = {}): TestAPI<DevvitFixtures> => {
  return createWrappedTestApi(baseTest, () => setup(config)) as TestAPI<DevvitFixtures>;
};
