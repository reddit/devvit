import { LogEventMessage } from '@devvit/protos/types/devvit/plugin/logger/logger.js';
import {
  type RemoteLogMessage,
  RemoteLogType,
} from '@devvit/protos/types/devvit/remote_logger/remote_logger.js';
import { StringUtil } from '@devvit/shared-types/StringUtil.js';
import { Args, Flags } from '@oclif/core';
import chalk from 'chalk';
import type { Duration } from 'date-fns';
import { sub } from 'date-fns';

import { formatAppLogDivider, supportedDurationFormats } from '../util/app-logs/app-log-util.js';
import { createRemoteLoggerClient } from '../util/clientGenerators.js';
import { DevvitCommand, toLowerCaseArgParser } from '../util/commands/DevvitCommand.js';

const durations: Record<string, keyof Duration> = {
  w: 'weeks',
  d: 'days',
  h: 'hours',
  m: 'minutes',
  s: 'seconds',
};

const durationFlag = Flags.custom<Date>({
  default: async () => new Date(),
  defaultHelp: async () => '0m',
  parse: async (str) => {
    // eslint-disable-next-line security/detect-non-literal-regexp
    const pattern = new RegExp(
      `(?<quantity>\\d+)(?<unit>[${Object.values(durations).join('')}])`,
      'g'
    );

    const matches = str.matchAll(pattern);

    const duration: Duration = {};
    for (const match of matches) {
      if (match.groups) {
        const { quantity, unit } = match.groups;
        const key = durations[unit];
        duration[key] = parseInt(quantity);
        str = str.replace(match[0], '');
      }
    }

    if (str.length > 0) {
      throw new Error(`Unable to parse duration: ${str}. ${supportedDurationFormats}`);
    }

    return sub(new Date(), duration);
  },
});

export default class Events extends DevvitCommand {
  static override description: string = 'Streams event logs for an installation';
  static override hidden: boolean = true;
  static override args = {
    app: Args.string({
      description: 'app name',
      required: false,
      parse: toLowerCaseArgParser,
    }),
  };
  static override flags = {
    since: durationFlag({
      char: 's',
      description: `when to start the logs from. example "15s", "2w1d" "30m"\n${supportedDurationFormats}`,
    }),
  };

  async run(): Promise<void> {
    await this.checkIfUserLoggedIn();

    const { args, flags } = await this.parse(Events);
    const loggerClient = createRemoteLoggerClient();

    const appName = args.app || (await this.inferAppNameFromProject());

    this.log(formatAppLogDivider(`streaming event logs for ${appName}`));

    loggerClient
      .Tail({
        since: flags.since,
        subredditAppName: { appName, subreddit: '' },
        type: RemoteLogType.EVENT,
      })
      .subscribe({
        complete: () => {},
        error: (err) => this.#onStreamError(err),
        next: (msg) => this.#onStreamNext(msg),
      });
  }

  #onStreamNext(msg: RemoteLogMessage): void {
    if (msg.keepalive != null) return;
    if (msg.event != null) {
      this.log(JSON.stringify(LogEventMessage.toJSON(msg.event)));
    } else {
      this.warn(chalk.yellow(`unknown message: ${JSON.stringify(msg)}`));
    }
  }

  #onStreamError(err: unknown): void {
    this.error(chalk.red(`error while fetching logs: ${StringUtil.caughtToString(err)}`));
  }
}
