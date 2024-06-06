import type { Hook } from '@oclif/core';
import { createEventsClient } from '../../../util/clientGenerators.js';
import { Value } from '@devvit/protos';

const hook: Hook<'init'> = async function (options) {
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

  await createEventsClient().SendEvent(
    Value.fromPartial({
      structValue: event,
    })
  );
};

export default hook;
