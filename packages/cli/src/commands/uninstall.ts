import { InstallationType } from '@devvit/protos/community.js';
import { StringUtil } from '@devvit/shared-types/StringUtil.js';
import { Args, ux } from '@oclif/core';

import { getAccessTokenAndLoginIfNeeded } from '../util/auth.js';
import { createAppVersionClient, createInstallationsClient } from '../util/clientGenerators.js';
import { DevvitCommand, toLowerCaseArgParser } from '../util/commands/DevvitCommand.js';
import { getSubredditNameWithoutPrefix } from '../util/common-actions/getSubredditNameWithoutPrefix.js';

type UninstallParseResult = {
  args: {
    app?: string | undefined;
    subreddit: string;
  };
};

export default class Uninstall extends DevvitCommand {
  static override description = 'Uninstall an app from the specified subreddit';

  static override examples = [
    '$ devvit uninstall <subreddit> [app]',
    '$ devvit uninstall r/myTestSubreddit',
    '$ devvit uninstall myOtherTestSubreddit my-app',
  ];

  static override args = {
    subreddit: Args.string({
      description:
        'Provide the name of the subreddit to uninstall from. The "r/" prefix is optional',
      required: true,
      parse: toLowerCaseArgParser,
    }),
    app: Args.string({
      description: 'Provide the name of the app to uninstall (defaults to working directory app).',
      required: false,
      parse: toLowerCaseArgParser,
    }),
  };

  readonly #installationsClient = createInstallationsClient();
  readonly #appVersionClient = createAppVersionClient();

  async run(): Promise<void> {
    const { args }: UninstallParseResult = await this.parse(Uninstall);
    const subreddit = getSubredditNameWithoutPrefix(args.subreddit);

    const appName = args.app || (await this.inferAppNameFromProject());

    await getAccessTokenAndLoginIfNeeded();

    ux.action.start(`Finding installation of the app "${appName}" in r/${subreddit}`);
    let id: string;
    try {
      const allInstalledHere = await this.#installationsClient.GetAllWithInstallLocation({
        location: subreddit,
        type: InstallationType.SUBREDDIT,
      });
      // TODO I do not like how I'm doing this. I think we should make a new API call for this, but this _does_ work for now.
      const installationToRemove = (
        await Promise.all(
          allInstalledHere.installations.map(async (installation) => {
            const fullInstallInfo = await this.#installationsClient.GetByUUID({
              id: installation.id,
            });
            const appVersionInfo = await this.#appVersionClient.Get({
              id: fullInstallInfo.appVersion?.id ?? '',
            });
            if (appVersionInfo.app?.slug === appName) {
              // This is the one we want to uninstall
              return installation;
            } else {
              return null;
            }
          })
        )
      ).find((maybeInstall) => !!maybeInstall);
      if (!installationToRemove) {
        this.error(
          `Could not uninstall - no installation of "${appName}" exists in that location!`
        );
      }
      id = installationToRemove.id;
    } catch (err) {
      this.error(
        `Error while trying to find installation to remove: ${StringUtil.caughtToString(err)}`
      );
    }
    ux.action.stop(`✅`);

    ux.action.start(`Uninstalling`);
    try {
      await this.#installationsClient.Remove({ id });
    } catch (err) {
      this.error(`ERROR: Unable to uninstall app: ${StringUtil.caughtToString(err)}`);
    }
    ux.action.stop('✅');
  }
}
