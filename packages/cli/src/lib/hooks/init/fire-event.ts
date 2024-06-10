import type { Hook } from '@oclif/core';
import { Value } from '@devvit/protos';
import { sendEvent } from '../../../util/metrics.js';

const hook: Hook<'init'> = async function (options) {
  // Don't log metrics events - that kinda defeats the point of the opt-out command
  if (options.id === 'metrics') {
    return;
  }

  const isValidCommand = options.id && options.config.commandIDs.includes(options.id);

  const event = {
    source: 'devplatform_cli',
    action: 'ran',
    noun: 'raw_command',
    devplatform: {
      cli_raw_command_line: 'devvit ' + process.argv.slice(2).join(' '),
      cli_is_valid_command: isValidCommand,
      cli_command: isValidCommand ? options.id : undefined,
    },
  };

  await sendEvent(
    Value.fromPartial({
      structValue: event,
    })
  );
};

export default hook;
