import { getAccessToken, getOAuthSvc } from '../util/auth.js';
import { DevvitCommand } from '../util/commands/DevvitCommand.js';

export default class Logout extends DevvitCommand {
  static override description = 'Log out of Devvit via reddit.com';

  async run(): Promise<void> {
    const token = await getAccessToken();
    if (!token) {
      this.log('Not currently logged in. Nothing to do here :)');
      return;
    }

    await getOAuthSvc().Logout({});
    this.log('Successfully logged out');
  }
}
