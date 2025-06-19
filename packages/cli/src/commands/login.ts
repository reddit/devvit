import { Flags } from '@oclif/core';

import { getAccessTokenAndLoginIfNeeded, getOAuthSvc } from '../util/auth.js';
import { DevvitCommand } from '../util/commands/DevvitCommand.js';
import { sendEvent } from '../util/metrics.js';

export default class Login extends DevvitCommand {
  static override description = 'Log in to Devvit via reddit.com';

  static override flags = {
    'copy-paste': Flags.boolean({
      aliases: ['copyPaste'],
      required: false,
      default: false,
      description:
        'If present, the user will copy-paste their code from the browser, rather than use localhost.',
    }),
  } as const;

  #event = {
    source: 'devplatform_cli',
    action: 'ran',
    noun: 'login',
    devplatform: {
      cli_raw_command_line: 'devvit ' + process.argv.slice(2).join(' '),
      cli_is_valid_command: true,
      cli_command: 'login',
    } as Record<string, string | boolean | undefined>,
  };

  async run(): Promise<void> {
    const {
      flags: { 'copy-paste': copyPaste },
    } = await this.parse(Login);

    // Clearing a local token before attempting to login (in case the token has expired, for example)
    await getOAuthSvc().Logout({});

    const token = await getAccessTokenAndLoginIfNeeded(copyPaste);
    const username = await this.getUserDisplayName(token);

    await sendEvent(this.#event);
    this.log(
      `Logged in as ${username}\n\n\`devvit new\` to create a new project\n\`devvit --help\` for more commands\n`
    );
  }
}
