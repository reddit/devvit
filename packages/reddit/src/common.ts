import { Scope } from '@devvit/protos/json/reddit/devvit/app_permission/v1/app_permission.js';
import { getDevvitConfig } from '@devvit/shared-types/server/get-devvit-config.js';

export const RunAs = {
  APP: 0,
  USER: 1,
  UNSPECIFIED: 2,
} as const;

export type UserGeneratedContent = {
  text: string;
  imageUrls?: string[];
};

export function assertUserScope(scope: Scope) {
  const scopeName = Scope[scope];
  if (
    !getDevvitConfig()
      .getPermissions()
      .some((permission) => permission.asUserScopes.includes(scope))
  ) {
    throw Error(
      `To call this API with 'runAs: "USER"', set 'permissions.reddit.asUser: [ "${scopeName}" ]' in your devvit.json file.`
    );
  }
}
