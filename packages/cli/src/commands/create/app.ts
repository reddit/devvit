import { DevvitCommand } from '../../util/commands/DevvitCommand.js';

export default class CreateApp extends DevvitCommand {
  static deprecated = true;
  static override description = 'DEPRECATED. To create a new app please use `devvit new`';

  async run(): Promise<void> {
    this.log(
      '`devvit create app` has been deprecated. To create a new app please use `devvit new`.'
    );
  }
}
