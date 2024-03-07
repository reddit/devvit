import type { SettingsClient } from '@devvit/public-api';
import { AllowedUsersSettingName } from '../constants.js';
import type { DevToolbarAction } from '../types.js';

/**
 * Fetches the allowlist from app settings
 */
export const getAllowedUsers = async (settingsClient: SettingsClient): Promise<string> => {
  const settingsValue = await settingsClient.get(AllowedUsersSettingName);
  if (typeof settingsValue !== 'string') {
    return '';
  }
  return settingsValue;
};

/**
 * Creates the DevToolbarAction object
 */
export function devAction(label: string, runFn: () => void): DevToolbarAction;
export function devAction(runFn: () => void): DevToolbarAction;
export function devAction(...args: unknown[]): DevToolbarAction {
  // single argument - function expected
  if (args.length === 1) {
    const runFn = args[0];
    if (typeof runFn !== 'function') {
      throw new Error('Incorrect argument 1. Expected function');
    }
    return { run: runFn as () => void };
  }
  const label = args[0];
  const runFn = args[1];
  if (typeof label !== 'string') {
    throw new Error('Incorrect argument 1. Expected string');
  }
  if (typeof runFn !== 'function') {
    throw new Error('Incorrect argument 2. Expected function');
  }
  return { label, run: runFn as () => void };
}
