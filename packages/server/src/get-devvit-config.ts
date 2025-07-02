import type { Config } from '@devvit/shared-types/Config.js';

/**
 * Gets the Config object that the runtime drops on globalThis. For internal use only.
 * @internal
 */
export function getDevvitConfig(): Config {
  const config = (globalThis as { devvit?: { config?: Config } })?.devvit?.config;
  if (!config) {
    throw new Error(
      'Devvit config is not available. Make sure to call getDevvitConfig() after the Devvit runtime has been initialized.'
    );
  }
  return config;
}
