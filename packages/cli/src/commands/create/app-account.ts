import { StringUtil } from '@devvit/shared-types/StringUtil.js';
import { Args, Flags } from '@oclif/core';
import type { FlagInput } from '@oclif/core/lib/interfaces/parser.js';
import { MY_PORTAL_ENABLED } from '../../lib/config.js';
import { getCaptcha } from '../../util/captcha.js';
import { createAppClient } from '../../util/clientGenerators.js';
import { DevvitCommand, toLowerCaseArgParser } from '../../util/commands/DevvitCommand.js';

export default class CreateApp extends DevvitCommand {
  static override hidden = true;

  static override description = 'Create a new app account for an existing app without one';

  static override flags: FlagInput = {
    copyPaste: Flags.boolean({
      name: 'copyPaste',
      description: 'Copy-paste the auth code instead of opening a browser',
      default: false,
    }),
  };

  static override args = {
    appName: Args.string({
      description: 'Name of the app',
      required: true,
      parse: toLowerCaseArgParser,
    }),
    appAccountName: Args.string({
      description: 'Name of the app account you want to claim',
      required: true,
      parse: toLowerCaseArgParser,
    }),
  };

  readonly #appClient = createAppClient(this);

  override async run(): Promise<void> {
    const {
      args: { appName, appAccountName },
      flags: { copyPaste },
    } = await this.parse(CreateApp);
    try {
      const response = await this.#appClient.CreateAppAccount({
        slug: appName,
        accountName: appAccountName,
        // Only prompt for captcha if we're talking to prod
        captcha: MY_PORTAL_ENABLED ? '' : await getCaptcha({ copyPaste }),
      });
      if (!response.created) {
        this.error(response.errors ?? 'For some reason, the account was not created.');
      }
      this.log('Your account was created successfully!');
      if (response.errors) {
        this.warn(response.errors);
      }
    } catch (e) {
      this.error(StringUtil.caughtToString(e));
    }
  }
}
