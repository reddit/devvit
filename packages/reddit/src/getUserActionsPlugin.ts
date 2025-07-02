import { type UserActions, UserActionsDefinition } from '@devvit/protos';
import { getDevvitConfig } from '@devvit/server/get-devvit-config.js';

let userActionsPlugin: UserActions | undefined;

/**
 * @internal
 */
export function getUserActionsPlugin(): UserActions {
  if (!userActionsPlugin) {
    userActionsPlugin = getDevvitConfig().use<UserActions>(UserActionsDefinition);
  }
  return userActionsPlugin;
}
