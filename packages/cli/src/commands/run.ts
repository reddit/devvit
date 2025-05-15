import { DevvitCommand } from '../util/commands/DevvitCommand.js';

export default class Run extends DevvitCommand {
  static override hidden = true;
  static deprecated = true;
  static override description =
    'DEPRECATED. To test your app, please use `devvit playtest` instead';

  async run(): Promise<void> {
    this.log('`devvit run` has been deprecated. Please use `devvit playtest` instead.');
  }
}
