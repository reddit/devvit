import '../shared/devvit-worker-global.js';

import type { Config } from '../Config.js';
import { Header } from '../Header.js';
import type { AppConfig } from '../schemas/config-file.v1.js';

export type PluginMock<T> = {
  plugin: T;
};

export const MOCK_HEADERS = {
  [Header.Subreddit]: 't5_testsub',
  [Header.SubredditName]: 'testsub',
  [Header.User]: 't2_testuser',
  [Header.AppUser]: 't2_testuser',
  [Header.App]: 'test-app',
  [Header.Version]: '0.0.0-test',
  [Header.AppViewerAuthToken]: 'test-token',
};

export const installGlobalConfig = (config: Config, appConfig?: AppConfig): void => {
  globalThis.devvit ??= {};
  globalThis.devvit.config = config;
  globalThis.devvit.compute ??= { platform: 'node' };
  globalThis.devvit.appConfig = appConfig ?? getDefaultAppConfig();
};

export const getDefaultAppConfig = (): AppConfig => {
  return {
    schema: 'v1',
    name: 'test-app',
    permissions: {
      http: { enable: true, domains: [] },
      media: true,
      menu: true,
      payments: true,
      realtime: true,
      redis: true,
      reddit: { enable: true, scope: 'user', asUser: [] },
      settings: true,
      triggers: true,
    },
    post: {
      dir: 'webroot',
      entrypoints: {
        default: {
          inline: true,
          entry: 'splash.html',
          height: 'tall',
          name: 'default',
        },
        game: {
          entry: 'game.html',
          height: 'regular',
          name: 'game',
        },
      },
    },
    json: {
      name: 'test-app',
      permissions: { reddit: true },
    },
  };
};

export const makeConfig = ({
  plugins = {},
}: {
  plugins?: Record<string, unknown>;
} = {}): Config => {
  return {
    assets: {},
    providedDefinitions: [],
    webviewAssets: {},
    getPermissions: () => [],
    export: () => ({
      hostname: '',
      provides: [],
      uses: [],
      permissions: [],
    }),
    provides: () => {},
    addPermissions: () => {},

    use<T>(definition: { fullName: string }): T {
      if (definition.fullName in plugins) {
        return plugins[definition.fullName] as T;
      }
      throw new Error(`Plugin not mocked: ${definition.fullName}`);
    },

    uses(definition: { fullName: string }): boolean {
      return definition.fullName in plugins;
    },
  };
};
