import type { EffectType } from '@devvit/protos/json/devvit/ui/effects/v1alpha/effect.js';
import { emitEffect } from '@devvit/shared-types/client/emit-effect.js';

/**
 * Explicitly records exposure to an experiment present in `devvit.experiments`.
 * Logs an error and skips exposure if the experiment is absent.
 * @param experimentName The name of the experiment to expose.
 * @internal
 */
export function exposeExperiment(experimentName: string): void {
  if (!Object.hasOwn(devvit.experiments, experimentName)) {
    console.error(
      `exposeExperiment effect ignored because experiment "${experimentName}" is missing from devvit.json`
    );
    return;
  }

  void emitEffect({
    exposeExperiment: {
      name: experimentName,
    },
    type: 17 satisfies EffectType.EFFECT_EXPOSE_EXPERIMENT,
  });
}

/**
 * Returns the variant assigned to the experiment, or undefined if no variant is assigned.
 * @param experimentName
 * @internal
 */
export function experimentVariant(experimentName: string): string | undefined {
  return devvit.experiments[experimentName];
}
