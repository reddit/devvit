import { Command } from '@oclif/core';

export default class Version extends Command {
  static override description =
    'Display version information about the locally installed devvit CLI';
  async run(): Promise<void> {
    this.log(this.config.version);
  }
}
