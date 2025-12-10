import { AsyncLocalStorage } from 'node:async_hooks';

import type { Config } from '@devvit/shared-types/Config.js';
import type { AppConfig } from '@devvit/shared-types/schemas/config-file.v1.js';
import { type DevvitWorkerGlobal } from '@devvit/shared-types/shared/devvit-worker-global.js';

export type TestContext = {
  config: Config;
  appConfig?: AppConfig | undefined;
};

const contextStorage = new AsyncLocalStorage<TestContext>();

export function runWithTestContext<T>(context: TestContext, fn: () => T): T {
  return contextStorage.run(context, fn);
}

export function getTestContext(): TestContext | undefined {
  return contextStorage.getStore();
}

class TestDevvitWorkerGlobal implements DevvitWorkerGlobal {
  compute = { platform: 'node' } as const;

  get config(): Config {
    return getTestContext()?.config as Config;
  }

  get appConfig(): AppConfig {
    return getTestContext()?.appConfig as AppConfig;
  }
}

export function installDevvitInterceptors() {
  if (globalThis.devvit instanceof TestDevvitWorkerGlobal) return;

  globalThis.devvit = new TestDevvitWorkerGlobal();
}
