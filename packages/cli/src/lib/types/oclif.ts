import type { Command } from '@oclif/core';
import type { BooleanFlag, OptionFlag } from '@oclif/core/lib/interfaces/parser.js';

/**
 * Given an oclif command like `typeof Playtest`, return the typing of the flags
 * property.
 *
 * to-do: this type is likely incomplete or incorrect. If something appears to
 *        be wrong, change it!
 */
export type CommandFlags<Cmd extends typeof Command> = {
  [Flag in keyof Cmd['flags']]: Cmd['flags'][Flag] extends BooleanFlag<boolean>
    ? boolean
    : Cmd['flags'][Flag] extends OptionFlag<infer T>
      ? T
      : unknown;
};
