import type { Context, ModeratorPermission } from '@devvit/public-api';
import { Header } from '@devvit/shared-types/Header.js';

// Internal function for getting the current user's moderator permissions in the current subreddit
async function getPermissions(context: Context): Promise<Set<ModeratorPermission>> {
  const metadataPermissions = context.debug.metadata[Header.ModPermissions]?.values as
    | ModeratorPermission[]
    | undefined;
  if (metadataPermissions) {
    return new Set(metadataPermissions);
  }

  const user = await context.reddit.getCurrentUser();
  return new Set(
    context.subredditName
      ? ((await user?.getModPermissionsForSubreddit(context.subredditName)) ?? [])
      : []
  );
}

/**
 * currentUserHasModPermissions verifies the current user is a mod with all of
 * permissions provided in the `permissions` argument before executing
 * the callback function.
 * @param context Context instance from the request
 * @param permissions List of moderator permissions to check
 * @param callback Function to execute if the user has the required permissions
 * @returns Promise<void>
 * @throws Error if the user does not have all required permissions
 * @example currentUserHasModPermissions(context.reddit, ['all'], () => { ... });
 */
export async function currentUserHasModPermissions(
  context: Context,
  permissions: ModeratorPermission[],
  callback: () => void
): Promise<void> {
  const userPermissionSet = await getPermissions(context);

  if (permissions.every((permission) => userPermissionSet.has(permission))) {
    callback();
    return;
  }

  throw new Error(
    `User[${context.userId}] does not have all required permissions in r/${context.subredditName}: [${permissions.join(', ')}]`
  );
}
