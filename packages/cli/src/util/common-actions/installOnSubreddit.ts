import { InstallationType } from '@devvit/protos/json/devvit/dev_portal/app_version/info/app_version_info.js';
// eslint-disable-next-line no-restricted-imports
import type { AppVersionInfo } from '@devvit/protos/types/devvit/dev_portal/app_version/info/app_version_info.js';
// eslint-disable-next-line no-restricted-imports
import type {
  AppVersionClient,
  InstallationsClient,
} from '@devvit/protos/types/devvit/dev_portal/dev_portal.twirp-client.js';
// eslint-disable-next-line no-restricted-imports
import type { FullInstallationInfo } from '@devvit/protos/types/devvit/dev_portal/installation/installation.js';

import { DevvitCommand } from '../commands/DevvitCommand.js';
import { waitUntilVersionBuildComplete } from '../common-actions/waitUntilVersionBuildComplete.js';

export async function installOnSubreddit(
  command: DevvitCommand,
  appVersionClient: AppVersionClient,
  installationsClient: InstallationsClient,
  userT2Id: `t2_${string}`,
  appVersion: AppVersionInfo,
  subreddit: string,
  verbose: boolean
): Promise<FullInstallationInfo> {
  // Wait for the app version to be built.
  await waitUntilVersionBuildComplete(command, appVersionClient, appVersion, verbose);

  return await installationsClient.Create({
    appVersionId: appVersion.id,
    runAs: userT2Id,
    type: InstallationType.SUBREDDIT,
    location: subreddit,
    upgradeStrategy: 0,
  });
}
