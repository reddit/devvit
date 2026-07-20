import { ESBuildPack } from '@devvit/build-pack/esbuild/ESBuildPack.js';
import { formatLogs, type ProjectRootDir } from '@devvit/build-pack/lib/BuildPack.js';
import type { ActorSpec } from '@devvit/protos/json/devvit/runtime/bundle.js';
// eslint-disable-next-line no-restricted-imports
import { type Bundle } from '@devvit/protos/types/devvit/plugin/buildpack/buildpack_common.js';
import { LOCAL_HOSTNAME } from '@devvit/shared-types/HostnameUtil.js';
import type { Observable } from 'rxjs';
import { map } from 'rxjs';

import type { Project } from './project.js';

export type BundlerResult = {
  bundles: Bundle[] | undefined;
};

export class Bundler {
  #buildPack: ESBuildPack;

  constructor() {
    this.#buildPack = new ESBuildPack({ hostname: LOCAL_HOSTNAME });
  }

  async bundle(project: Readonly<Project>, actorSpec: ActorSpec): Promise<Bundle[]> {
    const compiledRes = await this.#buildPack.compile(
      // to-do: why no minify?
      {
        config: project.appConfig,
        info: actorSpec,
        minify: 'None',
        root: project.root,
      }
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

  watch(
    project: Readonly<Project> | undefined,
    root: ProjectRootDir,
    actorSpec: ActorSpec
  ): Observable<BundlerResult> {
    return this.#buildPack
      .watch({
        config: project?.appConfig,
        info: actorSpec,
        minify: 'None',
        root,
      })
      .pipe(
        map((rsp) => {
          if (rsp.warnings.length > 0) console.warn(formatLogs(rsp.warnings));
          if (rsp.errors.length > 0) console.error(formatLogs(rsp.errors));
          return { bundles: rsp.bundles };
        })
      );
  }
}
