import { DevvitCommand } from '../util/commands/DevvitCommand.js';
import { Flags } from '@oclif/core';
import { getAccessToken } from '../util/auth.js';

export default class Whoami extends DevvitCommand {
  static override description = 'Display the currently logged in reddit.com user';

  static override flags = {
    token: Flags.boolean({
      description: 'Print out your auth token, not your username. Careful with this!',
      required: false,
      hidden: true,
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(Whoami);

    const token = await getAccessToken();
    if (!token) {
      this.error('Not currently logged in. Try `devvit login` first');
    }

    if (flags.token) {
      this.log('Careful with this Icarus - sharing this with others is dangerous!');
      this.log(`Token: ${token.accessToken}`);
      return;
    }

    const userName = await this.getUserDisplayName(token);
    if (userName) {
      this.log(`Logged in as u/${userName}`);
    }
  }
}
