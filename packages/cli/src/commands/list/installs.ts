import type {
  AppInfo,
  FullInstallationInfo,
  InstallationInfo,
  MultipleInstallationsResponse,
} from '@devvit/protos/community.js';
import {
  GetAllWithInstallerRequest,
  GetAllWithInstallLocationRequest,
  InstallationType,
  UUID,
} from '@devvit/protos/community.js';
import { DevvitVersion } from '@devvit/shared-types/Version.js';
import { Args, ux } from '@oclif/core';

import { getAccessTokenAndLoginIfNeeded } from '../../util/auth.js';
import { createInstallationsClient } from '../../util/clientGenerators.js';
import { DevvitCommand, toLowerCaseArgParser } from '../../util/commands/DevvitCommand.js';

enum SearchType {
  MINE,
  BY_SUB,
}

export default class ListInstalls extends DevvitCommand {
  static override description =
    'List all apps currently installed in the specified subreddit. If no subreddit is given, defaults to listing all apps installed by you';

  static override args = {
    subreddit: Args.string({
      required: false,
      description:
        'Provide the name of the subreddit in which to search for app installs. The "r/" prefix is optional',
      parse: toLowerCaseArgParser,
    }),
  };

  readonly #installationsClient = createInstallationsClient();

  async run(): Promise<void> {
    const { args } = await this.parse(ListInstalls);

    ux.action.start('loading');
    const results = await this.#fetchInstalls(args.subreddit);
    ux.action.stop();
    this.log(); // newline

    let searchType = SearchType.MINE;
    if (args.subreddit) {
      searchType = SearchType.BY_SUB;
    }

    await this.#formatAndLogInstallations(results.installations, searchType);
  }

  async #fetchInstalls(subreddit?: string): Promise<MultipleInstallationsResponse> {
    const token = await getAccessTokenAndLoginIfNeeded();

    if (subreddit != null) {
      // ask about installations in given subreddit
      return await this.#installationsClient.GetAllWithInstallLocation(
        GetAllWithInstallLocationRequest.fromPartial({
          type: InstallationType.SUBREDDIT,
          location: subreddit,
        })
      );
    }

    // Not getting subreddit app installs, get all apps installed by the logged in user
    const myId = await this.getUserT2Id(token);
    return await this.#installationsClient.GetAllWithInstaller(
      GetAllWithInstallerRequest.fromPartial({
        installedBy: myId,
      })
    );
  }

  async #formatAndLogInstallations(
    installations: InstallationInfo[],
    searchType: SearchType
  ): Promise<void> {
    const fullInstallationsInfo = await Promise.all(
      installations.map((i) => this.#installationsClient.GetByUUID(UUID.fromPartial({ id: i.id })))
    );
    if (searchType === SearchType.BY_SUB) {
      this.#formatAndLogInstallationsInSubreddit(fullInstallationsInfo);
      return;
    }
    this.#formatAndLogInstallationsOfMyApps(fullInstallationsInfo);
  }

  #formatAndLogInstallationsOfMyApps(installations: FullInstallationInfo[]): void {
    type AppName = AppInfo['name'];

    const installationsIndexedByAppName = new Map<AppName, FullInstallationInfo[]>();

    // index installations by app name
    installations.forEach((installationInfo) => {
      if (installationInfo.app == null) return;
      const appName = installationInfo.app.name;
      installationsIndexedByAppName.set(appName, installationsIndexedByAppName.get(appName) ?? []);
      installationsIndexedByAppName.get(appName)!.push(installationInfo);
    });

    // normalize into an array to feed to ux.table
    type DataRow = {
      appName: string;
      installations: {
        appVersion: string;
        location: string;
      }[];
    };
    const data: DataRow[] = [];
    installationsIndexedByAppName.forEach((installations, appName) => {
      data.push({
        appName,
        installations: installations.map((i) => ({
          appVersion: DevvitVersion.fromProtoAppVersionInfo(i.appVersion!).toString(),
          location: i.installation!.location!.name,
        })),
      });
    });

    const appNameColumn = {
      header: 'App Name',
      get: (entry: DataRow) => entry.appName,
      minWidth: 18,
    };
    const installedSubredditsColumn = {
      header: 'Installed Subreddits',
      get: (row: DataRow) =>
        row.installations
          .map((installation) => `${installation.location} (v${installation.appVersion})`)
          .join(`\n`) + '\n',
    };

    ux.table(data, {
      appNameColumn,
      installedSubredditsColumn,
    });
  }

  #formatAndLogInstallationsInSubreddit(installationsInSubreddit: FullInstallationInfo[]): void {
    type DataRow = {
      version: string;
      appName: string;
    };

    const data: DataRow[] = installationsInSubreddit.map((installation) => {
      const versionStr = DevvitVersion.fromProtoAppVersionInfo(installation.appVersion!).toString();
      const appName = installation.app!.name;
      return {
        version: versionStr,
        appName,
      };
    });

    // we can assume the list of installations is specific to a subreddit
    const appsColumn = {
      header: 'Apps Installed In Subreddit',
      get: (row: DataRow) => `${row.appName} (v${row.version})`,
      minWidth: 18,
    };
    ux.table(data, { appsColumn });
  }
}
