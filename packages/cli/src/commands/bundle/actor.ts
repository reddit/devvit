import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { ESBuildPack } from '@devvit/build-pack';
import { formatLogs } from '@devvit/build-pack/lib/BuildPack.js';
import { DefaultBuilder } from '@devvit/builders/Builder.js';
import { ResolverWithPlugins } from '@devvit/linkers/ResolverWithPlugins.js';
import { Bundle } from '@devvit/protos/types/devvit/plugin/buildpack/buildpack_common.js';
import {
  ActorSpec,
  LinkedBundle,
  TargetRuntime,
} from '@devvit/protos/types/devvit/runtime/bundle.js';
import { LOCAL_HOSTNAME } from '@devvit/shared-types/HostnameUtil.js';
import { Args, Flags } from '@oclif/core';

import { getAccessToken } from '../../util/auth.js';
import { Bundler } from '../../util/Bundler.js';
import { toLowerCaseArgParser } from '../../util/commands/DevvitCommand.js';
import { DevvitCommand } from '../../util/commands/DevvitCommand.js';
import { DEVVIT_DISABLE_EXTERN_DEVVIT_PROTOS, distDirFilename } from '../../util/config.js';
import { getPaymentsConfig, readProducts } from '../../util/payments/paymentsConfig.js';

export default class BundleActor extends DevvitCommand {
  static override description = 'Bundle an actor into bundle.json or linked bundle JSON';

  static override examples = [
    '$ devvit bundle actor my-actor',
    '$ devvit bundle actor my-actor --linked',
  ];

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
    linked: Flags.boolean({
      description: 'Build and link locally using DefaultLinker',
      required: false,
      default: false,
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

    if (flags.linked) {
      await this.#makeLinkedBundles(actorSpec);
      this.log(`Successfully bundled and linked actor: ${actorSpec.name}`);
      return;
    }

    await this.#makeBundles(actorSpec, flags.metafile);
    this.log(`Successfully bundled actor: ${actorSpec.name}`);
  }

  async #makeBundles(actorSpec: ActorSpec, includeMetafile: boolean): Promise<void> {
    const actorBundler = new Bundler();

    const bundles = await actorBundler.bundle(this.project, actorSpec, includeMetafile);
    const products = await readProducts(this.project);

    await mkdir(path.join(this.project.root, distDirFilename), { recursive: true });

    await Promise.all(
      bundles.map(async (bundle) => {
        const target = bundle.buildInfo?.targetRuntime ?? TargetRuntime.UNIVERSAL;
        let type = '';
        if (target === TargetRuntime.CLIENT) {
          type = '.client';
        }

        if (products) {
          bundle.paymentsConfig = getPaymentsConfig(this.project.mediaDir, bundle, products, false);
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

  async #makeLinkedBundles(actorSpec: ActorSpec): Promise<void> {
    const buildPack = new ESBuildPack(
      { hostname: LOCAL_HOSTNAME },
      { disableExternDevvitProtos: DEVVIT_DISABLE_EXTERN_DEVVIT_PROTOS }
    );
    const builder = new DefaultBuilder(buildPack, new ResolverWithPlugins());

    const response = await builder.build({
      config: this.project.appConfig,
      minify: 'None',
      info: actorSpec,
      includeMetafile: false,
      root: this.project.root,
    });

    if (response.errors.length > 0) {
      console.error(formatLogs(response.errors));
    }
    if (response.warnings.length > 0) {
      console.warn(formatLogs(response.warnings));
    }

    try {
      const errorCount = response.errors.length;
      if (errorCount > 0) {
        throw Error(
          `Linked build for "${actorSpec.name}" completed with ${errorCount} error${
            errorCount === 1 ? '' : 's'
          }.`
        );
      }

      if (response.bundles.length === 0) {
        throw new Error('Missing linked bundle');
      }

      const outputPath = path.join(this.project.root, distDirFilename);
      await mkdir(outputPath, { recursive: true });

      await Promise.all(
        response.bundles.map(async (bundle) => {
          const target = bundle.buildInfo?.targetRuntime ?? TargetRuntime.UNIVERSAL;
          const type = target === TargetRuntime.CLIENT ? '.client' : '.server';
          const outputFile = path.join(outputPath, `${actorSpec.name}.bundle${type}.linked.json`);

          await writeFile(outputFile, JSON.stringify(LinkedBundle.toJSON(bundle)));
          this.log(`Wrote linked bundle: ${path.relative(this.project.root, outputFile)}`);
        })
      );
    } finally {
      await builder.dispose();
    }
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
