import { Command } from '@oclif/core';

const DEVVIT_DOCS_URL = `https://developers.reddit.com/docs`;

export default class Docs extends Command {
  static deprecated = true;
  static override description = `DEPRECATED. To access the docs please visit ${DEVVIT_DOCS_URL}\n`;

  async run(): Promise<void> {
    this.log(
      `\`devvit docs\` has been deprecated. Please visit the docs website at ${DEVVIT_DOCS_URL}\nYou can also find this link in the \`devvit help\` menu.`
    );
  }
}
