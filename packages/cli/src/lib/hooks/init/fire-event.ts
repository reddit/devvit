import type { Hook } from '@oclif/core';
import { sendEvent } from '../../../util/metrics.js';

const hook: Hook<'init'> = async function (options) {
  const isValidCommand = options.id && options.config.commandIDs.includes(options.id);

  // argv[0] is the path to node
  // argv[1] is the path to the JS script that was run
  // we only need indices 2+
  const rawCommand = `devvit ${process.argv.slice(2).join(' ')}`;

  const event = {
    source: 'devplatform_cli',
    action: 'ran',
    noun: 'raw_command',
    devplatform: {
      cli_raw_command_line: rawCommand,
      cli_is_valid_command: isValidCommand,
      cli_command: isValidCommand ? options.id : undefined,
    },
  };

  // metrics are in disabled state when the `metrics on` is executed, but we still want to track it
  const isMetricsEnableCommand = options.id === 'metrics' && options.argv.includes('on');

  await sendEvent(event, isMetricsEnableCommand);
};

export default hook;
