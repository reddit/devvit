import { Args } from '@oclif/core';

import { HEADER_DEVVIT_CLI, HEADER_USER_AGENT } from '../constants/Headers.js';
import { DEVVIT_DEBUG } from '../lib/config.js';
import { authHeaders, getAccessToken } from '../util/auth.js';
import { DevvitCommand } from '../util/commands/DevvitCommand.js';
import type { BuildMode } from '../util/project.js';

export default class Curl extends DevvitCommand {
  static override description = 'Sends a request to a specified URL using our auth';
  static override hidden = true;

  static override args = {
    url: Args.string({
      description: 'The URL to send the request to.',
      required: true,
    }),
  };

  override init(_mode?: BuildMode | 'None'): Promise<void> {
    // We don't need to initialize the project for the whoami command.
    return super.init('None');
  }

  async run(): Promise<void> {
    const { args } = await this.parse(Curl);

    const token = await getAccessToken();
    if (!token) {
      this.error('Not currently logged in. Try `devvit login` first');
    }

    const headers = {
      ...authHeaders(token),
      [HEADER_USER_AGENT()[0]]: HEADER_USER_AGENT()[1],
      [HEADER_DEVVIT_CLI()[0]]: HEADER_DEVVIT_CLI()[1],
    };

    const response = await fetch(args.url, {
      headers,
      redirect: 'follow',
    });

    if (DEVVIT_DEBUG) {
      this.log(JSON.stringify(Object.fromEntries([...response.headers.entries()]), null, 2));
    }
    if (!response.ok) {
      let textIfAvailable = '';
      try {
        textIfAvailable = `\n\n${await response.text()}`;
      } catch {
        // noop
      }
      this.error(`Failed to fetch: ${response.status} ${response.statusText}${textIfAvailable}`);
    }
    const responseText = await response.text();
    this.log(responseText);
  }
}
