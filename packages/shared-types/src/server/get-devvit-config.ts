import type { Config } from '../Config.js';
import type {} from '../shared/devvit-worker-global.js';

/**
 * Gets the Config object that the runtime drops on globalThis. For internal use
 * only.
 */
export function getDevvitConfig(): Config {
  if (!globalThis.devvit?.config) {
    throw new Error(
      'Devvit config is not available. Make sure to call getDevvitConfig() after the Devvit runtime has been initialized.'
    );
  }
  return globalThis.devvit.config;
}
