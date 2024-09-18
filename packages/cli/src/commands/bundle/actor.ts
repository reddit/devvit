import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { Bundle } from '@devvit/protos/types/devvit/plugin/buildpack/buildpack_common.js';
import { ActorSpec } from '@devvit/protos/types/devvit/runtime/bundle.js';
import { Args } from '@oclif/core';

import { getAccessToken } from '../../util/auth.js';
import { Bundler } from '../../util/Bundler.js';
import { toLowerCaseArgParser } from '../../util/commands/DevvitCommand.js';
import { ProjectCommand } from '../../util/commands/ProjectCommand.js';
import { distDirFilename } from '../../util/config.js';
import { readDevvitConfig } from '../../util/devvitConfig.js';
import { readAndInjectBundleProducts } from '../../util/payments/paymentsConfig.js';

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
    const config = await readDevvitConfig(this.projectRoot, this.configFile);

    const actorName = args.name;

    const actorBundler = new Bundler();
    const bundle = await actorBundler.bundle(
      this.projectRoot,
      ActorSpec.fromPartial({
        name: actorName,
        owner: username,
        version: config.version,
      })
    );

    await readAndInjectBundleProducts(this.projectRoot, bundle, false);

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
      const token = await getAccessToken();
      if (token) {
        username = await this.getUserDisplayName(token);
      }
    } catch (err) {
      // Username is unavailable.
    }

    if (!username) {
      this.warn(`You are not logged in: setting "username" as empty`);
    }

    return username;
  }
}
