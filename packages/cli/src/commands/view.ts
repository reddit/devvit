import type { FullAppInfo } from '@devvit/protos/community.js';
import { StringUtil } from '@devvit/shared-types/StringUtil.js';
import { DevvitVersion } from '@devvit/shared-types/Version.js';
import { Args, Flags } from '@oclif/core';

import { createAppClient, createAppVersionClient } from '../util/clientGenerators.js';
import { DevvitCommand, toLowerCaseArgParser } from '../util/commands/DevvitCommand.js';
import { getVersionByNumber } from '../util/common-actions/getVersionByNumber.js';
import { getAppBySlug } from '../util/getAppBySlug.js';
import { nutritionCategoriesToString } from './install.js';

export default class View extends DevvitCommand {
  static override description =
    'View details about an app version. Specify the version you want, or default to @latest';

  static override examples = [
    '$ devvit view [app-name][@version]',
    '$ devvit view',
    '$ devvit view my-app',
    '$ devvit view @0.1.2',
    '$ devvit view bot-bouncer@1.13.0',
  ];

  static override args = {
    appWithVersion: Args.string({
      description:
        'Provide the name of the app you want to view (defaults to working directory app) and version (defaults to latest)',
      required: false,
      parse: toLowerCaseArgParser,
    }),
    subcommand: Args.string({
      description: 'For specifying a subcommand',
      options: ['version'],
      required: false,
      parse: toLowerCaseArgParser,
    }),
  } as const;

  static override flags = {
    json: Flags.boolean({
      required: false,
      default: false,
      description:
        'If present, the output will be JSON instead of human readable. Useful for scripting.',
    }),
  };

  readonly #appClient = createAppClient();
  readonly #appVersionClient = createAppVersionClient();

  async run(): Promise<void> {
    const { args, flags } = await this.parse(View);

    const inferredParams = await this.inferAppNameAndVersion(args.appWithVersion);

    let appInfo: FullAppInfo | undefined;
    try {
      appInfo = await getAppBySlug(this.#appClient, {
        slug: inferredParams.appName,
      });
    } catch (err) {
      this.error(
        `App ${inferredParams.appName} is not found.\n${StringUtil.caughtToString(err, 'message')}`
      );
    }

    if (!appInfo?.app) {
      this.error(`App ${inferredParams.appName} is not found.`);
    }

    const appVersion = getVersionByNumber(inferredParams.version, appInfo.versions);

    const name = appInfo.app.slug;
    const version = DevvitVersion.fromProtoAppVersionInfo(appVersion).toString();
    const nutrition = await this.#appVersionClient.GetNutritionByNameVersion({ name, version });

    if (args.subcommand === 'version') {
      if (flags.json) {
        this.log(JSON.stringify(appVersion, null, 2));
      } else {
        this.log(version);
      }
      return;
    }

    // Not a subcommand, so let's show everything
    if (flags.json) {
      this.log(JSON.stringify({ app: appInfo.app, version: appVersion, nutrition }, null, 2));
      return;
    }

    // Human-readable output time!
    this.log(`App name: ${appInfo.app.name}`);
    this.log(`Owner: u/${appInfo.app.owner?.displayName ?? '<unknown>'}`);
    if (appInfo.app.stats) {
      this.log(
        `${appInfo.app.stats.installCount} installs, ${appInfo.app.stats.versionsCount} total versions`
      );
    }
    this.log('');
    this.log(`Version: ${version}`);
    this.log(`Uploaded: ${appVersion.uploadedAt?.toLocaleString() ?? '<unknown>'}`);
    this.log('');
    this.log('Nutritional information:');
    this.log(nutritionCategoriesToString(name, nutrition.categories));
  }
}
