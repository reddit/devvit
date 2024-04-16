import type { Command } from '@oclif/core';
import { Help } from '@oclif/core';

export default class NoTopicsHelp extends Help {
  /**
   * @override
   * @description override default implementation to disable logging of "topics" in help
   * @see https://github.com/oclif/core/blob/00c6118052c4bbc3046e0315ab949ba88b6b19bd/src/help/index.ts#L175 for original impl
   */
  override async showRootHelp(): Promise<void> {
    const state = this.config.pjson?.oclif?.state;
    if (state) {
      this.log(
        state === 'deprecated'
          ? `${this.config.bin} is deprecated`
          : `${this.config.bin} is in ${state}.\n`
      );
    }

    this.log(this.formatRoot());
    this.log('');

    let commands = this.sortedCommands;

    if (commands.length > 0) {
      commands = commands.filter((c) => c.id);
      this.log(this.formatCommands(commands));
      this.log('');
    }
  }
  /**
   * @override
   * @description overriding to make sure descriptions are capitililzed uniformly for all commands
   * @see https://github.com/oclif/core/blob/00c6118052c4bbc3046e0315ab949ba88b6b19bd/src/help/index.ts#L268 for original impl
   */
  override summary(c: Command.Cached): string | undefined {
    if (c.summary) return this.render(c.summary.split('\n')[0]);
    if (c.description == null) return;

    const descriptionFormatted = this.render(c.description).split('\n')[0];
    return descriptionFormatted[0].toUpperCase() + descriptionFormatted.slice(1);
  }
}
