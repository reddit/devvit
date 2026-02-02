import { type AppVersionClient, AppVersionInfo, BuildStatus } from '@devvit/protos/community.js';
import { ux } from '@oclif/core';

import { DevvitCommand } from '../commands/DevvitCommand.js';
import { sleep } from '../sleep.js';

export async function waitUntilVersionBuildComplete(
  command: DevvitCommand,
  appVersionClient: AppVersionClient,
  appVersionInfo: AppVersionInfo,
  verbose: boolean
): Promise<void> {
  if (verbose) {
    ux.action.start('App is building remotely');
  }
  for (let i = 0; i < 20 && appVersionInfo.buildStatus === BuildStatus.BUILDING; i++) {
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
    if (i === 10) {
      command.log(`Still working on it... thanks for your patience!`);
    }
    if (i === 15) {
      command.log(
        `This is taking a lot longer than usual. If you had a lot of new assets, that might be why. Giving it a little more time...`
      );
    }
  }
  if (verbose) {
    ux.action.stop();
  }

  if (appVersionInfo.buildStatus !== BuildStatus.READY) {
    if (appVersionInfo.buildStatus === BuildStatus.BUILDING) {
      throw new Error(
        `Something went wrong: The previous version did not finish building remotely in a timely manner. If you had a lot of new assets, wait a minute and then try again; if not, or if that doesn't help, please reach out to Devvit support.`
      );
    }
    throw new Error('Something went wrong: the previous version did not build successfully.');
  }
}
