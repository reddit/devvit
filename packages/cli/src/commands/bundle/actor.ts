import { ActorSpec, Bundle } from '@devvit/protos';
import { ACTOR_SRC_DIR } from '@devvit/shared-types/constants.js';
import { Args } from '@oclif/core';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { Bundler } from '../../util/Bundler.js';
import { toLowerCaseArgParser } from '../../util/commands/DevvitCommand.js';
import { ProjectCommand } from '../../util/commands/ProjectCommand.js';
import { distDirFilename } from '../../util/config.js';
import { readDevvitConfig } from '../../util/devvitConfig.js';

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

    const actorBundler = new Bundler();
    const bundle = await actorBundler.bundle(
      ACTOR_SRC_DIR,
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
}
