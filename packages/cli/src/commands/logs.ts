import { InstallationType } from '@devvit/protos/community.js';
import { RemoteLogSubredditAppNameFilter } from '@devvit/protos/types/devvit/remote_logger/remote_logger.js';
import { Args, Flags } from '@oclif/core';
import { sub } from 'date-fns';
import { Subscription } from 'rxjs';

import { PlaytestServer } from '../lib/playtest-server.js';
import {
  defaultAppLogDateFormat,
  formatAppLogDivider,
  parseAppLogDuration,
  supportedDurationFormats,
} from '../util/app-logs/app-log-util.js';
import { makeLogSubscription } from '../util/app-logs/make-log-subscription.js';
import { createInstallationsClient } from '../util/clientGenerators.js';
import { DevvitCommand, toLowerCaseArgParser } from '../util/commands/DevvitCommand.js';
import { getSubredditNameWithoutPrefix } from '../util/common-actions/getSubredditNameWithoutPrefix.js';

const durationFlag = Flags.custom<Date>({
  default: async () => new Date(),
  defaultHelp: async () => '0m',
  parse: async (str) => sub(new Date(), parseAppLogDuration(str)),
});

export default class Logs extends DevvitCommand {
  static override description = 'Streams logs for an installation within a specified subreddit';

  static override examples = [
    '$ devvit logs <subreddit> [app]',
    '$ devvit logs r/myTestSubreddit',
    '$ devvit logs myOtherTestSubreddit my-app',
  ];

  static override args = {
    subreddit: Args.string({
      description: 'Provide the subreddit name. The "r/" prefix is optional',
      required: true,
      parse: toLowerCaseArgParser,
    }),
    app: Args.string({
      description: 'Provide the app name (defaults to working directory app)',
      required: false,
      parse: toLowerCaseArgParser,
    }),
  } as const;
  static override flags = {
    connect: Flags.boolean({ default: true, description: 'Connect to local runtime.' }),
    dateformat: Flags.string({
      char: 'd',
      description:
        'Format for rendering dates. See https://date-fns.org/v2.29.3/docs/format for format options',
      default: defaultAppLogDateFormat,
    }),
    json: Flags.boolean({
      char: 'j',
      description: 'output JSON for each log line',
      default: false,
    }),
    'log-runtime': Flags.boolean({
      aliases: ['logRuntime'],
      description:
        'Include executing runtime in logs. Remote logs originate from apps running on Reddit servers, local logs originate from your browser.',
    }),
    'show-keep-alive': Flags.boolean({
      aliases: ['showKeepAlive'],
      default: false,
      hidden: true,
    }),
    'show-timestamps': Flags.boolean({
      default: false,
      description: 'Show log message timestamps',
      aliases: ['showTimestamps'],
    }),
    since: durationFlag({
      char: 's',
      description: `when to start the logs from. example "15s", "2w1d" "30m"\n${supportedDurationFormats}`,
    }),
    verbose: Flags.boolean({
      char: 'v',
      description: 'Enable verbose logging',
      default: false,
    }),
  } as const;

  #appLogSub?: Subscription;
  #playtest?: PlaytestServer;

  async #getTailFilter(
    subreddit: string,
    appName: string
  ): Promise<RemoteLogSubredditAppNameFilter> {
    // if the dummy-logger is asked for don't worry about doing any lookup, the dummy logger works
    // for every subreddit regardless of user. It's designed to test that logs are flowing through
    // the system. Long term, this will likely be removed as we build confidence in our logger.
    if (appName === 'dummy-logger') {
      return { appName, subreddit };
    }
    // Call DevPortal to ensure the installation is valid and to convert
    // the subreddit name to a t5_ id.
    // TODO: move this conversion/check into Gateway
    const installationClient = createInstallationsClient();
    const result = await installationClient.GetByAppNameAndInstallLocation({
      location: subreddit,
      slug: appName,
      type: InstallationType.SUBREDDIT,
    });

    return { appName, subreddit: result.installation?.location?.id ?? '' };
  }

  async run(): Promise<void> {
    // Despite the name, finally() is only invoked on successful termination.
    process.on('SIGINT', () => void this.#onExit());

    await this.checkIfUserLoggedIn();
    await this.checkDeveloperAccount();

    const { args, flags } = await this.parse(Logs);

    this.#playtest = new PlaytestServer(
      {
        dateFormat: flags.dateformat,
        runtime: flags['log-runtime'],
        verbose: flags.verbose,
        showTimestamps: flags['show-timestamps'],
      },
      this
    );
    if (flags.connect) this.#playtest.open();

    const appName = args.app || this.project.name;
    const subreddit = getSubredditNameWithoutPrefix(args.subreddit);
    const subredditAppName = await this.#getTailFilter(subreddit, appName);

    if (!flags.json) {
      this.log(formatAppLogDivider(`streaming logs for ${appName} on r/${subreddit}`));
    }

    this.#appLogSub = makeLogSubscription(subredditAppName, this, flags);
  }

  #onExit(): void {
    this.#appLogSub?.unsubscribe();
    this.#playtest?.close();

    process.exit(0);
  }
}
