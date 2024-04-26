import { DevvitCommand } from '../util/commands/DevvitCommand.js';

export default class Logout extends DevvitCommand {
  static override description = 'Log out of Devvit via reddit.com';

  async run(): Promise<void> {
    const token = await this.getAccessToken();
    if (!token) {
      this.log('Not currently logged in. Nothing to do here :)');
      return;
    }

    await this.oauthSvc.Logout({});
    this.log('Successfully logged out');
  }
}
