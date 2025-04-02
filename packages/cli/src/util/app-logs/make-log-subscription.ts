import { Severity } from '@devvit/protos';
import {
  type RemoteLogQuery,
  type RemoteLogSubredditAppNameFilter,
  RemoteLogType,
} from '@devvit/protos/community.js';
import { defer, filter, map, merge, onErrorResumeNextWith, retry, Subscription } from 'rxjs';

import type Logs from '../../commands/logs.js';
import type { CommandFlags } from '../../lib/types/oclif.js';
import { createRemoteLoggerClient } from '../clientGenerators.js';
import { AppLogObserver } from './app-log-observer.js';
import { lruDistinct } from './lru-distinct.js';

type Console = { error(...args: unknown[]): void; log(...args: unknown[]): void };

/**
 * When retrying logs, how many millis in the past to look (i.e. helps with clock skew)
 */
const RETRY_EPSILON = 10_000;

export function makeLogSubscription(
  subredditAppName: RemoteLogSubredditAppNameFilter,
  console: Console,
  flags: CommandFlags<typeof Logs>
): Subscription {
  const client = createRemoteLoggerClient();

  let resumeAt = new Date(0);

  const createResumableStream = (query: RemoteLogQuery) => {
    return client.Tail(query).pipe(
      onErrorResumeNextWith(
        /**
         * deferring to pick up the latest resumeAt value
         */
        defer(() =>
          client.Tail({
            ...query,
            since: resumeAt,
          })
        ).pipe(
          retry({
            count: 3,
            delay: 1000,
            resetOnSuccess: true,
          })
        )
      ),
      map((response) => {
        const candidateResumeAt =
          response.log?.timestamp ||
          response.event?.timestamp ||
          response.error?.timestamp ||
          response.keepalive?.timestamp ||
          new Date(Date.now() - RETRY_EPSILON);
        if (candidateResumeAt > resumeAt) {
          resumeAt = candidateResumeAt;
        }
        return response;
      }),
      lruDistinct((msg) => JSON.stringify(msg), 10_000)
    );
  };

  const logsQuery = {
    since: flags.since,
    subredditAppName,
    type: RemoteLogType.LOG,
  };
  const logs = createResumableStream(logsQuery);
  const errorsQuery = {
    since: flags.since,
    subredditAppName,
    type: RemoteLogType.ERROR,
  };
  const errors = createResumableStream(errorsQuery);

  return merge(logs, errors)
    .pipe(filter((log) => flags.verbose || log.log?.severity !== Severity.VERBOSE))
    .subscribe(
      new AppLogObserver(
        {
          dateFormat: flags.dateformat,
          json: flags.json,
          runtime: flags['log-runtime'],
          showKeepAlive: flags['show-keep-alive'],
          verbose: flags.verbose,
        },
        console
      )
    );
}
