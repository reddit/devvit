import { StringUtil } from '@devvit/shared-types/StringUtil.js';
import { Args, Flags } from '@oclif/core';

import { MY_PORTAL_ENABLED } from '../../lib/config.js';
import { getCaptcha } from '../../util/captcha.js';
import { createAppClient } from '../../util/clientGenerators.js';
import { DevvitCommand, toLowerCaseArgParser } from '../../util/commands/DevvitCommand.js';

export default class CreateApp extends DevvitCommand {
  static override hidden = true;

  static override description = 'Create a new app account for an existing app without one';

  static override flags = {
    'copy-paste': Flags.boolean({
      aliases: ['copyPaste'],
      description: 'Copy-paste the auth code instead of opening a browser',
      default: false,
    }),
  } as const;

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
  } as const;

  readonly #appClient = createAppClient();

  override async run(): Promise<void> {
    const { args, flags } = await this.parse(CreateApp);
    try {
      const response = await this.#appClient.CreateAppAccount({
        slug: args.appName,
        accountName: args.appAccountName,
        // Only prompt for captcha if we're talking to prod
        captcha: MY_PORTAL_ENABLED ? '' : await getCaptcha({ copyPaste: flags['copy-paste'] }),
      });
      if (!response.created) {
        this.error(response.errors ?? 'For some reason, the account was not created.');
      }
      this.log('Your account was created successfully!');
      if (response.errors) {
        this.warn(response.errors);
      }
    } catch (err) {
      this.error(`Something went wrong: ${StringUtil.caughtToString(err, 'message')}`);
    }
  }
}
