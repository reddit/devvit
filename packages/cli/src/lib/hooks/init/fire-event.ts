import type { Hook } from '@oclif/core';

import { sendEvent } from '../../../util/metrics.js';
import { shouldRedact } from '../../../util/redaction.js';

// Yes, this is a global variable. It's not ideal, but it's the only way to
// preserve the data from the `init` hook into the error handler.
let CURRENT_COMMAND_EVENT_DATA:
  | {
      cli_raw_command_line: string;
      cli_is_valid_command: boolean;
      cli_command: string | undefined;
    }
  | undefined = undefined;

export function getCurrentCommandEventData() {
  return CURRENT_COMMAND_EVENT_DATA;
}

const hook: Hook<'init'> = async function (options) {
  const isValidCommand = options.id && options.config.commandIDs.includes(options.id);

  // Do not capture init's argv. The init "code" can be passed via argv and is a one-time-use token.
  // Also do not capture argv for `settings` commands because users may include secrets and we don't want
  // to accidentally ingest them (especially on failures).
  const argv = process.argv.slice(2);
  const shouldRedactRawCommandLine = shouldRedact(argv);
  const cliRawCommandLine = shouldRedactRawCommandLine ? '<redacted>' : `devvit ${argv.join(' ')}`;

  CURRENT_COMMAND_EVENT_DATA = {
    cli_raw_command_line: cliRawCommandLine,
    cli_is_valid_command: Boolean(isValidCommand),
    cli_command: isValidCommand ? options.id : undefined,
  };

  const event = {
    source: 'devplatform_cli',
    action: 'ran',
    noun: 'raw_command',
    devplatform: CURRENT_COMMAND_EVENT_DATA,
  };

  // metrics are in disabled state when the `metrics on` is executed, but we still want to track it
  const isMetricsEnableCommand = options.id === 'metrics' && options.argv.includes('on');

  await sendEvent(event, isMetricsEnableCommand);
};

export default hook;
