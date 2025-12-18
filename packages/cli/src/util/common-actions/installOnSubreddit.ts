import {
  type AppVersionClient,
  AppVersionInfo,
  FullInstallationInfo,
  type InstallationsClient,
  InstallationType,
} from '@devvit/protos/community.js';

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
