import {
  LogErrorMessage,
  LogEventMessage,
  LogMessage,
  Severity,
} from '@devvit/protos/types/devvit/plugin/logger/logger.js';
import type {
  RemoteLogMessage,
  RemoteLogQuery,
} from '@devvit/protos/types/devvit/remote_logger/remote_logger.js';
import { StringUtil } from '@devvit/shared-types/StringUtil.js';
import chalk from 'chalk';
import type { Observer } from 'rxjs';

import type { AppLogConfig } from './app-log-util.js';
import {
  formatAppLogDate,
  formatAppLogDivider,
  formatAppLogMessage,
  severities,
} from './app-log-util.js';

type Console = { error(...args: unknown[]): void; log(...args: unknown[]): void };
type AppLogObserverConfig = AppLogConfig & {
  json: boolean;
  showKeepAlive: boolean;
};

/**
 * RemoteLogMessage Rxjs Observer that logs messages to stdout / stderr for
 * users.
 */
export class AppLogObserver implements Observer<RemoteLogMessage> {
  /** Often CLI flags. */
  #config: AppLogObserverConfig;
  /** Often a DevvitCommand. */
  #logger: Console;
  /** Query for logs. Observer needs to update its since on messages, in case of later retries. */
  #logsQuery: RemoteLogQuery;
  /** Query for errors. Observer needs to update its since on messages, in case of later retries. */
  #errorsQuery: RemoteLogQuery;

  constructor(
    config: AppLogObserverConfig,
    logger: Console,
    logsQuery: RemoteLogQuery,
    errorsQuery: RemoteLogQuery
  ) {
    this.#config = config;
    this.#logger = logger;
    this.#logsQuery = logsQuery;
    this.#errorsQuery = errorsQuery;
  }

  complete(): void {
    if (!this.#config.json) {
      this.#logger.log(
        formatAppLogDivider(
          `log stream complete (${formatAppLogDate(new Date(), this.#config.dateFormat)})`
        )
      );
    }
  }

  next(msg: RemoteLogMessage): void {
    if (msg.error != null) {
      if (this.#errorsQuery.since != null && msg.error?.timestamp != null) {
        this.#errorsQuery.since = new Date(msg.error.timestamp);
        this.#errorsQuery.since.setMilliseconds(this.#errorsQuery.since.getMilliseconds() + 1);
      }
      if (this.#config.json) this.#logger.log(JSON.stringify(LogErrorMessage.toJSON(msg.error)));
      else this.#logError(msg.error);
    } else if (msg.event != null) {
      if (this.#config.json) this.#logger.log(JSON.stringify(LogEventMessage.toJSON(msg.event)));
      else this.#logEvent(msg.event);
    } else if (msg.log != null) {
      if (this.#logsQuery.since != null && msg.log?.timestamp != null) {
        this.#logsQuery.since = new Date(msg.log.timestamp);
        this.#logsQuery.since.setMilliseconds(this.#logsQuery.since.getMilliseconds() + 1);
      }
      if (this.#config.json) this.#logger.log(JSON.stringify(LogMessage.toJSON(msg.log)));
      else this.#logger.log(formatAppLogMessage(msg.log, this.#config));
    } else if (msg.keepalive && this.#config.showKeepAlive) {
      const ts = msg.keepalive.timestamp;
      if (ts != null) {
        ts.setMilliseconds(ts.getMilliseconds() + 1);
        this.#errorsQuery.since = ts;
        this.#logsQuery.since = ts;
      }
      this.#logger.log(chalk.dim(formatAppLogDivider('keep alive')));
    }
  }

  error(err: unknown): void {
    this.#logger.error(chalk.red(`error while fetching logs: ${StringUtil.caughtToString(err)}`));
  }

  #logError(error: LogErrorMessage): void {
    const severity = severities[Severity.ERROR];
    const level = this.#config.verbose ? severity.color(`[${severity.label}]`) : '';
    const timestamp =
      this.#config.verbose && error.timestamp
        ? chalk.dim(formatAppLogDate(error.timestamp, this.#config.dateFormat))
        : '';

    let lines = [level, timestamp, severity.color(error.message)].filter(Boolean).join(' ');

    // next if we have a stack show it
    if (error.stack) {
      lines += `\n${chalk.dim(error.stack)}`;
    }

    // if we have the file name show that and the line/column number if provided
    if (error.fileName) {
      lines += `\n${error.fileName}`;
      if (error.lineNumber != null) {
        lines += `:${error.lineNumber}`;

        if (error.columnNumber != null) lines += `:${error.columnNumber}`;
      }
    }

    this.#logger.log(lines);
  }

  #logEvent(log: LogEventMessage): void {
    const serverity = severities[Severity.VERBOSE];
    const level = this.#config.verbose ? serverity.color(`[EVENT]`) : '';
    const timestamp =
      this.#config.verbose && log.timestamp
        ? chalk.dim(formatAppLogDate(log.timestamp, this.#config.dateFormat))
        : '';
    const line = [level, timestamp, log.type, `labels=${JSON.stringify(log.labels)}`]
      .filter(Boolean)
      .join(' ');
    this.#logger.log(line);
  }
}
