import '../shared/devvit-worker-global.js';

import type { Config } from '../Config.js';
import { Header } from '../Header.js';

export const MOCK_HEADERS = {
  [Header.Subreddit]: 't5_testsub',
  [Header.SubredditName]: 'testsub',
  [Header.User]: 't2_testuser',
  [Header.AppUser]: 't2_testuser',
  [Header.App]: 'test-app',
  [Header.Version]: '0.0.0-test',
};

export const installGlobalConfig = (config: Config): void => {
  globalThis.devvit ??= {};
  globalThis.devvit.config = config;
  globalThis.devvit.compute ??= { platform: 'node' };
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
