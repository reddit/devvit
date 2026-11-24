// eslint-disable-next-line no-restricted-imports
import {
  type Experiments,
  ExperimentsDefinition,
} from '@devvit/protos/types/devvit/plugin/experiments/v1alpha/experiments.js';
import { getDevvitConfig } from '@devvit/shared-types/server/get-devvit-config.js';

import { context } from './context.js';

/**
 * Looks up experiment variants and requests exposure for the current user in a server request.
 * Available to first-party apps for experiments declared in `devvit.json` under
 * `featureConfig.experiments`.
 */
class ExperimentsClient {
  /**
   * Looks up the current user's variant for an experiment.
   * @param experimentName The experiment name declared in `devvit.json`.
   * @param expose Whether to request exposure as part of the lookup. Defaults to `false`.
   * @returns The assigned variant, or `undefined` if the lookup yields no variant.
   */
  async experimentVariant(
    experimentName: string,
    expose: boolean = false
  ): Promise<string | undefined> {
    const { variant } = await this.#plugin.GetVariant(
      { name: experimentName, expose },
      context.metadata
    );
    return variant;
  }

  /**
   * Requests exposure for the current user's assignment. Call this when the app
   * uses the variant, including control variants. Exposure recording is best effort.
   * @param experimentName The experiment name declared in `devvit.json`.
   */
  async exposeExperiment(experimentName: string): Promise<void> {
    await this.#plugin.ExposeExperiment({ name: experimentName }, context.metadata);
  }

  get #plugin(): Experiments {
    return getDevvitConfig().use(ExperimentsDefinition);
  }
}

export const experiments = new ExperimentsClient();
