import {
  GetByAppNameAndInstallLocationRequest,
  InstallationType,
  RemoteLogQuery,
  RemoteLogSubredditAppNameFilter,
  RemoteLogType,
  Severity,
} from '@devvit/protos';
import { Args, Flags } from '@oclif/core';
import { sub } from 'date-fns';
import type { Subscription } from 'rxjs';
import { filter, merge, retry } from 'rxjs';
import { PlaytestServer } from '../lib/playtest-server.js';
import type { CommandFlags } from '../lib/types/oclif.js';
import { AppLogObserver } from '../util/app-logs/app-log-observer.js';
import {
  defaultAppLogDateFormat,
  formatAppLogDivider,
  parseAppLogDuration,
  supportedDurationFormats,
} from '../util/app-logs/app-log-util.js';
import { createInstallationsClient, createRemoteLoggerClient } from '../util/clientGenerators.js';
import { DevvitCommand, toLowerCaseArgParser } from '../util/commands/DevvitCommand.js';

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
  };

  static override flags = {
    connect: Flags.boolean({
      // to-do: DX-4706 enable.
      default: false,
      description: 'Connect to local runtime.',
      // to-do: DX-4706 delete.
      hidden: true,
    }),
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
      description:
        'Include executing runtime in logs. Remote logs originate from apps running on Reddit servers, local logs originate from your browser.',
      // to-do: DX-4706 delete.
      hidden: true,
    }),
    showKeepAlive: Flags.boolean({
      default: false,
      hidden: true,
    }),
    since: durationFlag({
      char: 's',
      description: `when to start the logs from. example "15s", "2w1d" "30m"\n${supportedDurationFormats}`,
    }),
    verbose: Flags.boolean({ default: false }),
  };

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
      return RemoteLogSubredditAppNameFilter.fromPartial({
        subreddit,
        appName,
      });
    }
    // Call DevPortal to ensure the installation is valid and to convert
    // the subreddit name to a t5_ id.
    // TODO: move this conversion/check into Gateway
    const installationClient = createInstallationsClient(this);
    const result = await installationClient.GetByAppNameAndInstallLocation(
      GetByAppNameAndInstallLocationRequest.fromPartial({
        slug: appName,
        location: subreddit,
        type: InstallationType.SUBREDDIT,
      })
    );

    return RemoteLogSubredditAppNameFilter.fromPartial({
      subreddit: result.installation?.location?.id ?? '',
      appName,
    });
  }

  async run(): Promise<void> {
    // Despite the name, finally() is only invoked on successful termination.
    process.on('SIGINT', () => void this.#onExit());

    await this.checkIfUserLoggedIn();
    await this.checkDevvitTermsAndConditions();

    const { args, flags } = await this.parse(Logs);

    this.#playtest = new PlaytestServer(
      { dateFormat: flags.dateformat, runtime: flags['log-runtime'], verbose: flags.verbose },
      this
    );
    if (flags.connect) this.#playtest.open();

    const appName = args.app || (await this.inferAppNameFromProject());
    const subredditAppName = await this.#getTailFilter(args.subreddit, appName);

    if (!flags.json) {
      this.log(formatAppLogDivider(`streaming logs for ${appName} on ${args.subreddit}`));
    }

    this.#appLogSub = this.#newAppLogSub(subredditAppName, flags);
  }

  #newAppLogSub(
    subredditAppName: RemoteLogSubredditAppNameFilter,
    flags: CommandFlags<typeof Logs>
  ): Subscription {
    const client = createRemoteLoggerClient(this);

    const logs = client.Tail(
      RemoteLogQuery.fromPartial({
        type: RemoteLogType.LOG,
        since: flags.since,
        subredditAppName,
      })
    );
    const errors = client.Tail(
      RemoteLogQuery.fromPartial({
        type: RemoteLogType.ERROR,
        since: flags.since,
        subredditAppName,
      })
    );

    return merge(logs, errors)
      .pipe(retry({ count: 3, delay: 1000, resetOnSuccess: true }))
      .pipe(filter((log) => flags.verbose || log.log?.severity !== Severity.VERBOSE))
      .subscribe(
        new AppLogObserver(
          {
            dateFormat: flags.dateformat,
            json: flags.json,
            runtime: flags['log-runtime'],
            showKeepAlive: flags.showKeepAlive,
            verbose: flags.verbose,
          },
          this
        )
      );
  }

  #onExit(): void {
    this.#appLogSub?.unsubscribe();
    this.#playtest?.close();
  }
}
