import { type AppVersionClient, AppVersionInfo, BuildStatus } from '@devvit/protos/community.js';
import { ux } from '@oclif/core';

import { DevvitCommand } from '../commands/DevvitCommand.js';
import { sleep } from '../sleep.js';

export async function waitUntilVersionBuildComplete(
  command: DevvitCommand,
  appVersionClient: AppVersionClient,
  appVersionInfo: AppVersionInfo
): Promise<void> {
  ux.action.start('App is building remotely');
  for (let i = 0; i < 10 && appVersionInfo.buildStatus === BuildStatus.BUILDING; i++) {
    // version is still building: wait and try again
    await sleep(3000);
    const info = await appVersionClient.Get({ id: appVersionInfo.id });

    if (!info.appVersion) {
      throw new Error('Something went wrong, no app version available.');
    }

    appVersionInfo = info.appVersion;

    if (i === 5) {
      command.log(`Your app's taking a while to build - sorry for the delay!`);
    }
  }
  ux.action.stop();

  if (appVersionInfo.buildStatus !== BuildStatus.READY) {
    throw new Error('Something went wrong: the previous version did not build successfully.');
  }
}
