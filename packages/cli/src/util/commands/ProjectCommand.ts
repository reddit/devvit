import type { DevvitConfig } from '../devvitConfig.js';
import { readDevvitConfig } from '../devvitConfig.js';
import { findProjectRoot } from '../project-util.js';
import { DevvitCommand } from './DevvitCommand.js';

export abstract class ProjectCommand extends DevvitCommand {
  #projectRoot: string | undefined;

  protected override async init(): Promise<void> {
    await this.assertProject();
  }

  public get projectRoot(): string {
    if (!this.#projectRoot) {
      throw new Error(`Did not assert that command is run in project`);
    }
    return this.#projectRoot;
  }

  protected async getProjectConfig(): Promise<DevvitConfig> {
    return readDevvitConfig(this.projectRoot);
  }

  // checks that the command is run in a devvit project
  protected async assertProject(): Promise<string> {
    if (this.#projectRoot) return this.#projectRoot;
    const projectRoot = await findProjectRoot();
    if (!projectRoot) {
      this.error(
        'Not in devvit project. Make sure that there is a valid devvit.yaml in the root of your project'
      );
    }
    this.#projectRoot = projectRoot;

    return this.#projectRoot;
  }
}
