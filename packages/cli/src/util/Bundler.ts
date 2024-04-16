import { ESBuildPack } from '@devvit/build-pack/esbuild/ESBuildPack.js';
import { TscTypeChecker } from '@devvit/build-pack/index.js';
import { formatLogs } from '@devvit/build-pack/lib/BuildPack.js';
import type { ActorSpec, Bundle } from '@devvit/protos';
import { CompileParams } from '@devvit/protos';
import { newBuildInfoDependencies } from '@devvit/runtimes/lib/BuildInfoUtil.js';
import { LOCAL_HOSTNAME } from '@devvit/runtimes/lib/HostnameUtil.js';
import path from 'node:path';
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

  /** @arg {actorDir} Main source directory relative present working directory. */
  async bundle(actorDir: string, actorSpec: ActorSpec): Promise<Bundle> {
    const compiledRes = await this.#buildPack.Compile(
      CompileParams.fromPartial({ filename: actorDir, info: actorSpec, includeAssets: true }),
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

    return newBundle(actorDir, compiledRes.bundle);
  }

  async dispose(): Promise<void> {
    await this.#buildPack.dispose();
  }

  watch(actorDir: string, actorSpec: ActorSpec): Observable<Bundle | undefined> {
    return this.#buildPack
      .Watch(CompileParams.fromPartial({ filename: actorDir, info: actorSpec }), undefined)
      .pipe(
        map((rsp) => {
          if (rsp.warnings.length > 0) console.warn(formatLogs(rsp.warnings));
          if (rsp.errors.length > 0) console.error(formatLogs(rsp.errors));
          return rsp.bundle ? newBundle(actorDir, rsp.bundle) : undefined;
        })
      );
  }
}

function newBundle(actorDir: string, bundle: Bundle): Bundle {
  // to-do: use Builder and pass buildInfo through.
  const dependencies = newBuildInfoDependencies(path.join(process.cwd(), actorDir));
  return {
    ...bundle,
    buildInfo: { created: new Date(), dependencies },
  };
}
