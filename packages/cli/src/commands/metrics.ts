import { DevvitCommand } from '../util/commands/DevvitCommand.js';
import { Args } from '@oclif/core';
import { optInMetrics, optOutMetrics } from '../util/metrics.js';

export default class Metrics extends DevvitCommand {
  static override description = 'Display the currently logged in reddit.com user';

  static override args = {
    appName: Args.string({
      description: 'Do you want to turn on or off metrics collection?',
      required: true,
      options: ['on', 'off'],
    }),
  };

  async run(): Promise<void> {
    const { args } = await this.parse(Metrics);

    if (args.appName === 'on') {
      await optInMetrics();
      this.log('Metrics are now enabled');
    } else {
      await optOutMetrics();
      this.log('Metrics are now disabled');
    }
  }
}
