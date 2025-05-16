import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { Bundle } from '@devvit/protos/types/devvit/plugin/buildpack/buildpack_common.js';
import { ActorSpec, TargetRuntime } from '@devvit/protos/types/devvit/runtime/bundle.js';
import { Args, Flags } from '@oclif/core';

import { getAccessToken } from '../../util/auth.js';
import { Bundler } from '../../util/Bundler.js';
import { toLowerCaseArgParser } from '../../util/commands/DevvitCommand.js';
import { DevvitCommand } from '../../util/commands/DevvitCommand.js';
import { distDirFilename } from '../../util/config.js';
import { getPaymentsConfig, readProducts } from '../../util/payments/paymentsConfig.js';

export default class BundleActor extends DevvitCommand {
  static override description = 'Bundle an actor into bundle.json';

  static override examples = ['$ devvit bundle actor my-actor'];

  static override args = {
    name: Args.string({
      description: 'The name of of the actor to bundle',
      required: false,
      parse: toLowerCaseArgParser,
      default: 'main',
    }),
  } as const;

  static override flags = {
    metafile: Flags.boolean({
      description: 'Produce a metafile to analyze the size of the bundle',
      required: false,
    }),
  } as const;

  static override hidden = true;

  async run(): Promise<void> {
    const { args, flags } = await this.parse(BundleActor);

    const username = await this.#getOwnerUsername();

    const actorSpec = {
      name: args.name,
      owner: username,
      version: '0.0.0', // Version is unknown.
    };

    await this.#makeBundles(actorSpec, flags.metafile);

    this.log(`Successfully bundled actor: ${actorSpec.name}`);
  }

  async #makeBundles(actorSpec: ActorSpec, includeMetafile: boolean): Promise<void> {
    const actorBundler = new Bundler();

    const bundles = await actorBundler.bundle(this.project.root, actorSpec, includeMetafile);
    const products = await readProducts(this.project.root);

    await mkdir(path.join(this.project.root, distDirFilename), { recursive: true });

    await Promise.all(
      bundles.map(async (bundle) => {
        const target = bundle.buildInfo?.targetRuntime ?? TargetRuntime.UNIVERSAL;
        let type = '';
        if (target === TargetRuntime.CLIENT) {
          type = '.client';
        }

        if (products) {
          bundle.paymentsConfig = getPaymentsConfig(bundle, products, false);
        }

        await writeFile(
          path.join(this.project.root, distDirFilename, `${actorSpec.name}.bundle${type}.json`),
          JSON.stringify(Bundle.toJSON(bundle))
        );

        if (bundle.metafile) {
          await writeFile(
            path.join(this.project.root, distDirFilename, `${actorSpec.name}.metafile${type}.json`),
            bundle.metafile
          );
        }
      })
    );
  }

  async #getOwnerUsername(): Promise<string> {
    let username = '';

    try {
      const token = await getAccessToken();
      if (token) {
        username = await this.getUserDisplayName(token);
      }
    } catch {
      // Username is unavailable.
    }

    if (!username) {
      this.warn(`You are not logged in: setting "username" as empty`);
    }

    return username;
  }
}
