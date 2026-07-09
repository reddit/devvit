// eslint-disable-next-line no-restricted-imports
import type { FullAppInfo } from '@devvit/protos/types/devvit/dev_portal/app/app.js';

export type AppAuthorizationRole = 'owner' | 'maintainer' | 'unauthorized';
export type AppWriteAction = 'upload' | 'publish';

type DeveloperDisplayName = {
  displayName?: string;
};

type AppWithMaintainers = NonNullable<FullAppInfo['app']> & {
  maintainers?: readonly DeveloperDisplayName[];
};

function normalizeDisplayName(displayName: string | undefined): string | undefined {
  return displayName?.trim().toLowerCase();
}

export function getAppAuthorizationRole(
  appInfo: FullAppInfo | undefined,
  username: string
): AppAuthorizationRole {
  const app = appInfo?.app as AppWithMaintainers | undefined;
  const normalizedUsername = normalizeDisplayName(username);

  if (!app || !normalizedUsername) {
    return 'unauthorized';
  }

  if (normalizeDisplayName(app.owner?.displayName) === normalizedUsername) {
    return 'owner';
  }

  if (
    app.maintainers?.some(
      (maintainer) => normalizeDisplayName(maintainer.displayName) === normalizedUsername
    )
  ) {
    return 'maintainer';
  }

  return 'unauthorized';
}

export function canWriteAppVersion(role: AppAuthorizationRole): boolean {
  return role === 'owner' || role === 'maintainer';
}

export function getAppAuthorizationErrorMessage(
  appInfo: FullAppInfo,
  appName: string,
  action: AppWriteAction
): string {
  return `You are not authorized to ${action} the app "${appName}". Please check that you are logged in as the owner (${appInfo.app?.owner?.displayName ?? '<unknown>'}) or as a designated maintainer.`;
}
