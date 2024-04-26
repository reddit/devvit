import type { PluginSettings } from '../../types/index.js';

export function pluginIsEnabled(settings: PluginSettings | boolean | undefined): boolean {
  if (!settings) {
    return false;
  }

  if (settings === true) {
    return true;
  }

  return settings.enabled;
}
