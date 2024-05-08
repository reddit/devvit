import { UUID } from '@devvit/protos';
import { GetAllWithInstallLocationRequest, InstallationType } from '@devvit/protos/community';
import { StringUtil } from '@devvit/shared-types/StringUtil.js';
import { Args, ux } from '@oclif/core';
import { createAppVersionClient, createInstallationsClient } from '../util/clientGenerators.js';
import { DevvitCommand, toLowerCaseArgParser } from '../util/commands/DevvitCommand.js';

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

  readonly #installationsClient = createInstallationsClient(this);
  readonly #appVersionClient = createAppVersionClient(this);

  async run(): Promise<void> {
    const { args }: UninstallParseResult = await this.parse(Uninstall);

    const appName = args.app || (await this.inferAppNameFromProject());

    await this.getAccessTokenAndLoginIfNeeded();

    ux.action.start(
      `Finding installation of the app "${appName}" in ${
        args.subreddit.startsWith('r/') ? args.subreddit : `r/${args.subreddit}`
      }`
    );
    let id: string;
    try {
      const allInstalledHere = await this.#installationsClient.GetAllWithInstallLocation(
        GetAllWithInstallLocationRequest.fromPartial({
          type: InstallationType.SUBREDDIT,
          location: args.subreddit,
        })
      );
      // TODO I do not like how I'm doing this. I think we should make a new API call for this, but this _does_ work for now.
      const installationToRemove = (
        await Promise.all(
          allInstalledHere.installations.map(async (installation) => {
            const fullInstallInfo = await this.#installationsClient.GetByUUID(
              UUID.fromPartial({ id: installation.id })
            );
            const appVersionInfo = await this.#appVersionClient.Get(
              UUID.fromPartial({ id: fullInstallInfo.appVersion?.id ?? '' })
            );
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
      await this.#installationsClient.Remove(UUID.fromPartial({ id }));
    } catch (err) {
      this.error(`ERROR: Unable to uninstall app: ${StringUtil.caughtToString(err)}`);
    }
    ux.action.stop('✅');
  }
}
