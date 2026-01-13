#!/usr/bin/env -S node --no-warnings=ExperimentalWarning
// JSON imports are experimental, so we need to disable the warning

import { StringUtil } from '@devvit/shared-types/StringUtil.js';
import { Errors, flush, run } from '@oclif/core';
import { config as dotenvConfig } from 'dotenv';

import { getCurrentCommandEventData } from '../dist/lib/hooks/init/fire-event.js';
import { sendEvent } from '../dist/util/metrics.js';
import { shouldRedact } from '../dist/util/redaction.js';

dotenvConfig();

run(undefined, import.meta.url)
  .then(() => flush())
  .catch(async (err) => {
    const argv = process.argv.slice(2);
    const shouldRedactRawCommandLine = shouldRedact(argv);
    const rawCommand = shouldRedactRawCommandLine ? '<redacted>' : `devvit ${argv.join(' ')}`;

    const event = {
      source: 'devplatform_cli',
      action: 'failed',
      noun: 'command',
      devplatform: {
        ...(getCurrentCommandEventData() ?? {
          cli_raw_command_line: rawCommand,
        }),
        cli_error_message: shouldRedactRawCommandLine
          ? '<redacted>'
          : StringUtil.caughtToString(err, 'message'),
        cli_error_stack: shouldRedactRawCommandLine
          ? '<redacted>'
          : StringUtil.caughtToString(err, 'stack'),
      },
    };
    await sendEvent(event);
    Errors.handle(err);
  });
