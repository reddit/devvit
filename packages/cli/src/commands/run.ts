import { ProjectCommand } from '../util/commands/ProjectCommand.js';

export default class Run extends ProjectCommand {
  static deprecated = true;
  static override description =
    'DEPRECATED. To test your app, please use `devvit playtest` instead';

  async run(): Promise<void> {
    this.log('`devvit run` has been deprecated. Please use `devvit playtest` instead.');
  }
}
