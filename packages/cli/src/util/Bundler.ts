import { ESBuildPack } from '@devvit/build-pack/esbuild/ESBuildPack.js';
import { TscTypeChecker } from '@devvit/build-pack/index.js';
import type { ProjectRootDir } from '@devvit/build-pack/lib/BuildPack.js';
import { formatLogs } from '@devvit/build-pack/lib/BuildPack.js';
import { type Bundle } from '@devvit/protos/types/devvit/plugin/buildpack/buildpack_common.js';
import type { ActorSpec } from '@devvit/protos/types/devvit/runtime/bundle.js';
import { LOCAL_HOSTNAME } from '@devvit/shared-types/HostnameUtil.js';
import type { Observable } from 'rxjs';
import { map } from 'rxjs';

import { DEVVIT_DISABLE_EXTERN_DEVVIT_PROTOS } from './config.js';

export type BundlerResult = {
  bundles: Bundle[] | undefined;
};

export class Bundler {
  #buildPack: ESBuildPack;

  constructor(typecheckEnabled: boolean = true) {
    this.#buildPack = new ESBuildPack(
      { hostname: LOCAL_HOSTNAME },
      {
        disableExternDevvitProtos: DEVVIT_DISABLE_EXTERN_DEVVIT_PROTOS,
        typeChecker: typecheckEnabled ? new TscTypeChecker() : undefined,
      }
    );
  }

  async bundle(root: ProjectRootDir, actorSpec: ActorSpec): Promise<Bundle[]> {
    const compiledRes = await this.#buildPack.Compile(
      { filename: root, info: actorSpec, includeAssets: true, minify: 0 },
      undefined
    );

    if (compiledRes.warnings.length > 0) {
      console.warn(formatLogs(compiledRes.warnings));
    }

    if (compiledRes.errors.length > 0) {
      throw new Error(formatLogs(compiledRes.errors));
    }

    if (compiledRes.bundles.length === 0) {
      throw new Error('Missing bundle');
    }

    return compiledRes.bundles;
  }

  async dispose(): Promise<void> {
    await this.#buildPack.dispose();
  }

  watch(root: ProjectRootDir, actorSpec: ActorSpec): Observable<BundlerResult> {
    return this.#buildPack
      .Watch({ filename: root, info: actorSpec, includeAssets: false, minify: 0 }, undefined)
      .pipe(
        map((rsp) => {
          if (rsp.warnings.length > 0) console.warn(formatLogs(rsp.warnings));
          if (rsp.errors.length > 0) console.error(formatLogs(rsp.errors));
          return { bundles: rsp.bundles };
        })
      );
  }
}
