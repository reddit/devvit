import type { LogMessage } from '@devvit/protos';
import { Severity } from '@devvit/protos';
import chalk from 'chalk';
import { format as formatDate } from 'date-fns';

export type AppLogConfig = {
  dateFormat: string | undefined;
  /** When true, print if log originates from local or remote runtime. */
  runtime: boolean;
  /** When true, print log level and timestamp with each message. */
  verbose: boolean;
};

export type SeverityConfig = { label: string; color: (text: string) => string };
export const severities: Record<Severity, SeverityConfig> = {
  [Severity.DEBUG]: { label: 'DEBUG', color: chalk.green },
  [Severity.INFO]: { label: 'INFO', color: (s: string) => s },
  [Severity.WARN]: { label: 'WARN', color: chalk.yellow },
  [Severity.ERROR]: { label: 'ERROR', color: chalk.red },
  [Severity.UNRECOGNIZED]: { label: 'UNKNOWN', color: chalk.gray },
  [Severity.VERBOSE]: { label: 'VERBOSE', color: chalk.gray },
};
export const defaultAppLogDateFormat: string = 'MMM d HH:mm:ss';

const durations: Record<string, keyof Duration> = {
  s: 'seconds',
  m: 'minutes',
  h: 'hours',
  d: 'days',
  w: 'weeks',
};

export function formatAppLogDate(date: Date | number, dateFormat: string | undefined): string {
  return formatDate(date, dateFormat ?? defaultAppLogDateFormat);
}

/**
 * Formats msg as a terminal-wide header / footer. Eg, the msg "abc" becomes
 * "────────────────────── abc ───────────────────────" on a 50-wide character
 * terminal.
 */
export function formatAppLogDivider(msg: string, trunc?: 'TruncStart'): string {
  const w = process.stdout.columns; // width
  // If truncating, start from the front but leave space for the ellipsis and
  // two `─ ` (5 characters).
  if (trunc === 'TruncStart' && msg.length + 4 > w) msg = `…${msg.slice(msg.length + 5 - w)}`;
  msg = `─ ${msg} ─`;
  return msg.padStart(msg.length + Math.floor((w - msg.length) / 2), '─').padEnd(w, '─');
}

export function formatAppLogMessage(
  log: Readonly<LogMessage>,
  config: Readonly<AppLogConfig>,
  localRuntime?: boolean
): string {
  const severity = severities[log.severity];
  const level = config.verbose ? severity.color(`[${severity.label}]`) : '';
  const runtime = config.runtime ? `[${localRuntime ? 'local' : 'remote'}]` : '';
  const timestamp =
    config.verbose && log.timestamp
      ? chalk.dim(formatAppLogDate(log.timestamp, config.dateFormat))
      : '';
  return [level, runtime, timestamp, log.message].filter(Boolean).join(' ');
}

export const supportedDurationFormats = `Supported format:\n${Object.entries(durations)
  .map(([k, v]) => `\t${k}: ${v}`)
  .join('\n')}`;

export function parseAppLogDuration(str: string): Duration {
  // eslint-disable-next-line security/detect-non-literal-regexp
  const pattern = new RegExp(
    `(?<quantity>\\d+)(?<unit>[${Object.values(durations).join('')}])`,
    'g'
  );

  const errMsg = `Unable to parse duration: ${str}. ${supportedDurationFormats}`;

  const duration: Duration = {};
  for (const match of str.matchAll(pattern)) {
    if (match.groups) {
      const { quantity, unit } = match.groups;
      const key = durations[unit];
      duration[key] = parseInt(quantity, 10);
      if (!Number.isInteger(duration[key])) throw Error(errMsg);
    }
  }

  if (!Object.keys(duration).length) throw Error(errMsg);

  return duration;
}
