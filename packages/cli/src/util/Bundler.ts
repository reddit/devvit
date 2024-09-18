import { ESBuildPack } from '@devvit/build-pack/esbuild/ESBuildPack.js';
import { TscTypeChecker } from '@devvit/build-pack/index.js';
import type { ProjectRootDir } from '@devvit/build-pack/lib/BuildPack.js';
import { formatLogs } from '@devvit/build-pack/lib/BuildPack.js';
import type { ActorSpec, Bundle } from '@devvit/protos';
import { CompileParams } from '@devvit/protos';
import { LOCAL_HOSTNAME } from '@devvit/shared-types/HostnameUtil.js';
import type { Observable } from 'rxjs';
import { map } from 'rxjs';
import { DEVVIT_DISABLE_EXTERN_DEVVIT_PROTOS } from './config.js';

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

  async bundle(root: ProjectRootDir, actorSpec: ActorSpec): Promise<Bundle> {
    const compiledRes = await this.#buildPack.Compile(
      CompileParams.fromPartial({ filename: root, info: actorSpec, includeAssets: true }),
      undefined
    );

    if (compiledRes.warnings.length > 0) {
      console.warn(formatLogs(compiledRes.warnings));
    }

    if (compiledRes.errors.length > 0) {
      throw new Error(formatLogs(compiledRes.errors));
    }

    if (compiledRes.bundle == null) {
      throw new Error('Missing bundle');
    }

    return compiledRes.bundle;
  }

  async dispose(): Promise<void> {
    await this.#buildPack.dispose();
  }

  watch(root: ProjectRootDir, actorSpec: ActorSpec): Observable<Bundle | undefined> {
    return this.#buildPack
      .Watch(CompileParams.fromPartial({ filename: root, info: actorSpec }), undefined)
      .pipe(
        map((rsp) => {
          if (rsp.warnings.length > 0) console.warn(formatLogs(rsp.warnings));
          if (rsp.errors.length > 0) console.error(formatLogs(rsp.errors));
          return rsp.bundle;
        })
      );
  }
}
