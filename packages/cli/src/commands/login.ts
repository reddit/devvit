import { DevvitCommand } from '../util/commands/DevvitCommand.js';
import { Flags } from '@oclif/core';

export default class Login extends DevvitCommand {
  static override description = 'Log in to Devvit via reddit.com';

  static override flags = {
    'copy-paste': Flags.boolean({
      required: false,
      default: false,
      description:
        'If present, the user will copy-paste their code from the browser, rather than use localhost.',
    }),
  };

  async run(): Promise<void> {
    const {
      flags: { 'copy-paste': copyPaste },
    } = await this.parse(Login);

    // Clearing a local token before attempting to login (in case the token has expired, for example)
    await this.oauthSvc.Logout({});

    const token = await this.getAccessTokenAndLoginIfNeeded(copyPaste);
    const username = await this.getUserDisplayName(token);

    this.log(`Logged in as ${username}`);
  }
}
