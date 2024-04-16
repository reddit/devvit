import { Command } from '@oclif/core';
import NoTopicHelpImpl from '../lib/help.js';
import chalk from 'chalk';

export default class Help extends Command {
  static override description = 'Display help for devvit';

  // Define additional content for the general --help menu
  #logAdditionalHelpContent(): void {
    this.log(
      `${chalk.bold('DOCUMENTATION')}\n  https://developers.reddit.com/docs \n\n${chalk.bold(
        'REPORT A BUG'
      )}\n  https://reddit.com/r/devvit`
    );
  }

  async run(): Promise<void> {
    await new NoTopicHelpImpl(this.config).showRootHelp();
    this.#logAdditionalHelpContent();
  }
}
