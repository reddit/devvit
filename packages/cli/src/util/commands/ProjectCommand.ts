import type { DevvitConfig } from '../devvit-config.js';
import { readDevvitConfig } from '../devvit-config.js';
import { type PackageJSON, readPackageJSON } from '../package-managers/package-util.js';
import { findProjectRoot } from '../project-util.js';
import { DevvitCommand } from './DevvitCommand.js';

export abstract class ProjectCommand extends DevvitCommand {
  #projectRoot: string | undefined;

  protected override async init(): Promise<void> {
    await super.init();
    await this.assertProject();
  }

  public get projectRoot(): string {
    if (!this.#projectRoot) {
      throw new Error(`Did not assert that command is run in project`);
    }
    return this.#projectRoot;
  }

  public async getProjectConfig(): Promise<DevvitConfig> {
    return readDevvitConfig(this.projectRoot, this.configFileName);
  }

  protected async getRootPackageJson(): Promise<PackageJSON> {
    return await readPackageJSON(this.projectRoot);
  }

  // checks that the command is run in a devvit project
  protected async assertProject(): Promise<string> {
    if (this.#projectRoot) return this.#projectRoot;
    const projectRoot = await findProjectRoot(this.configFileName);
    if (!projectRoot) {
      this.error(
        'Not in devvit project. Make sure that there is a valid devvit.yaml in the root of your project'
      );
    }
    this.#projectRoot = projectRoot;

    return this.#projectRoot;
  }
}
