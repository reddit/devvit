import { DevvitCommand } from '../util/commands/DevvitCommand.js';

const R_DEVVIT_URL = 'https://reddit.com/r/devvit';

export default class Feedback extends DevvitCommand {
  static deprecated = true;
  static override description = `DEPRECATED. To give feedback please visit ${R_DEVVIT_URL}\n`;

  async run(): Promise<void> {
    this.log(
      `\`devvit feedback\` has been deprecated. Please share your feedback in ${R_DEVVIT_URL}\nYou can also find this link in the \`devvit help\` menu.`
    );
  }
}
