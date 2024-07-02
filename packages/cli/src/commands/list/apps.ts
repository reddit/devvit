import type { AppInfo } from '@devvit/protos/community.js';
import { GetAllWithOwnerRequest } from '@devvit/protos/community.js';
import { ux } from '@oclif/core';
import { createAppClient } from '../../util/clientGenerators.js';
import { DevvitCommand } from '../../util/commands/DevvitCommand.js';
import { getAccessTokenAndLoginIfNeeded } from '../../util/auth.js';

export default class ListApps extends DevvitCommand {
  static override description = 'List all apps that you have published';

  readonly #appService = createAppClient();

  async run(): Promise<void> {
    const token = await getAccessTokenAndLoginIfNeeded();
    const t2_id = await this.getUserT2Id(token);

    ux.action.start('Fetching');
    const res = await this.#appService.GetAllWithOwner(
      GetAllWithOwnerRequest.fromPartial({ owner: t2_id })
    );
    ux.action.stop();

    this.#logApps(res.apps);
  }

  #logApps(apps: AppInfo[]): void {
    type DataRow = { name: string; installCount: number };
    const tableData: DataRow[] = apps.map((app: AppInfo) => ({
      name: app.name,
      installCount: app.stats!.installCount,
    }));

    const appNameColumn = {
      header: 'App name',
      get: (entry: DataRow) => entry.name,
    };
    const latestVersionColumn = {
      header: 'Number of installs',
      get: (entry: DataRow) => entry.installCount,
    };

    ux.table(tableData, { appNameColumn, latestVersionColumn });
  }
}
