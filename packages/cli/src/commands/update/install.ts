import { Args } from '@oclif/core';
import { DevvitCommand, toLowerCaseArgParser } from '../../util/commands/DevvitCommand.js';

export default class UpdateInstall extends DevvitCommand {
  static deprecated = true;
  static override aliases = ['update'];

  static override args = {
    appWithVersion: Args.string({
      description:
        'The name of the app you want to install, and what version of that app to install (default @latest)',
      required: false,
      parse: toLowerCaseArgParser,
    }),
    subreddit: Args.string({
      description:
        'The name of the subreddit where you want to install. The "r/" prefix is optional',
      required: false,
      parse: toLowerCaseArgParser,
    }),
  };

  static override description =
    'DEPRECATED. To update an installation of the app, please use `devvit install <subreddit>`';

  async run(): Promise<void> {
    this.log(
      '`devvit update` has been deprecated. To update an installation of the app, please use `devvit install <subreddit>` instead. You can find more information by running `devvit install --help`.'
    );
  }
}
