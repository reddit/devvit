import { ActorSpec, Bundle } from '@devvit/protos';
import {
  ACTORS_DIR_LEGACY,
  ACTOR_SRC_DIR,
  ACTOR_SRC_PRIMARY_NAME,
} from '@devvit/shared-types/constants.js';
import { Args } from '@oclif/core';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { Bundler } from '../../util/Bundler.js';
import { toLowerCaseArgParser } from '../../util/commands/DevvitCommand.js';
import { ProjectCommand } from '../../util/commands/ProjectCommand.js';
import { distDirFilename } from '../../util/config.js';
import { readDevvitConfig } from '../../util/devvitConfig.js';
import { dirExists } from '../../util/files.js';

export default class BundleActor extends ProjectCommand {
  static override description = 'Bundle an actor into bundle.json';

  static override examples = ['$ devvit bundle actor my-actor'];

  static override args = {
    name: Args.string({
      description: 'The name of of the actor to bundle',
      required: false,
      parse: toLowerCaseArgParser,
      default: 'main',
    }),
  };

  static override hidden = true;

  async run(): Promise<void> {
    const { args } = await this.parse(BundleActor);

    const username = await this.#getOwnerUsername();
    const config = await readDevvitConfig(this.projectRoot);

    const actorName = args.name;
    const actorPath = await this.#getActorRelativePath(actorName);

    const actorBundler = new Bundler();
    const bundle = await actorBundler.bundle(
      actorPath,
      ActorSpec.fromPartial({
        name: actorName,
        owner: username,
        version: config.version,
      })
    );

    await mkdir(path.join(this.projectRoot, distDirFilename), { recursive: true });
    await writeFile(
      path.join(this.projectRoot, distDirFilename, `${actorName}.bundle.json`),
      JSON.stringify(Bundle.toJSON(bundle))
    );
    this.log(`Successfully bundled actor: ${actorName}`);
  }

  async #getOwnerUsername(): Promise<string> {
    let username = '';

    try {
      const token = await this.getAccessToken();
      if (token) {
        username = await this.getUserDisplayName(token);
      }
    } catch (e) {
      // Username is unavailable.
    }

    if (!username) {
      this.warn(`You are not logged in: setting "username" as empty`);
    }

    return username;
  }

  /**
   * @description checks that the specified actor name exists as a folder in project
   */
  async #getActorRelativePath(actorName: string): Promise<string> {
    const actorRelativePath =
      actorName === ACTOR_SRC_PRIMARY_NAME
        ? ACTOR_SRC_DIR
        : path.join(ACTORS_DIR_LEGACY, actorName);

    const fullPath = path.join(this.projectRoot, actorRelativePath);
    const actorFolderExists = await dirExists(fullPath);

    if (!actorFolderExists) {
      this.error(
        `Actor: ${actorName} does not exist in your project. Please make sure that the correct folder exists under /actors`
      );
    }
    return actorRelativePath;
  }
}
