import { EffectType } from '@devvit/protos/json/devvit/ui/effects/v1alpha/effect.js';
import type { DevvitGlobal } from '@devvit/shared-types/client/devvit-global.js';
import { emitEffect } from '@devvit/shared-types/client/emit-effect.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { experimentVariant, exposeExperiment } from './experiments.js';
import { mockDevvit } from './helpers/test-helpers.js';

vi.mock('@devvit/shared-types/client/emit-effect.js', () => ({
  emitEffect: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal('devvit', { ...mockDevvit, experiments: {} } satisfies DevvitGlobal);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('exposeExperiment', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('emits an exposure effect for the requested experiment', () => {
    globalThis.devvit.experiments = { devvit_test_app_exp: 'enabled' };

    exposeExperiment('devvit_test_app_exp');

    expect(emitEffect).toHaveBeenCalledOnce();
    expect(emitEffect).toHaveBeenCalledWith({
      exposeExperiment: { name: 'devvit_test_app_exp' },
      type: EffectType.EFFECT_EXPOSE_EXPERIMENT,
    });
    expect(console.error).not.toHaveBeenCalled();
  });

  it.each<{
    description: string;
    experiments: Record<string, string>;
    experimentName: string;
  }>([
    {
      description: 'the experiment map is empty',
      experiments: {},
      experimentName: 'devvit_test_app_exp',
    },
    {
      description: 'only another experiment has an assignment',
      experiments: { devvit_other_exp: 'enabled' },
      experimentName: 'devvit_test_app_exp',
    },
    {
      description: 'the name matches the inherited toString property',
      experiments: {},
      experimentName: 'toString',
    },
  ])('logs an error and skips exposure when $description', ({ experiments, experimentName }) => {
    globalThis.devvit.experiments = experiments;

    exposeExperiment(experimentName);

    expect(console.error).toHaveBeenCalledOnce();
    expect(console.error).toHaveBeenCalledWith(
      `exposeExperiment effect ignored because experiment "${experimentName}" is missing from devvit.json`
    );
    expect(emitEffect).not.toHaveBeenCalled();
  });
});

describe('experimentVariant', () => {
  it.each(['enabled', 'control_1', 'treatment_2'])(
    'returns the assigned variant "%s" without recording exposure',
    (variant) => {
      globalThis.devvit.experiments = {
        devvit_other_exp: 'other',
        devvit_test_app_exp: variant,
      };

      expect(experimentVariant('devvit_test_app_exp')).toBe(variant);
      expect(emitEffect).not.toHaveBeenCalled();
    }
  );

  it.each<{ description: string; experiments: Record<string, string> }>([
    { description: 'the experiment map is empty', experiments: {} },
    {
      description: 'only another experiment has an assignment',
      experiments: { devvit_other_exp: 'enabled' },
    },
  ])('returns undefined when $description without recording exposure', ({ experiments }) => {
    globalThis.devvit.experiments = experiments;

    expect(experimentVariant('devvit_test_app_exp')).toBeUndefined();
    expect(emitEffect).not.toHaveBeenCalled();
  });
});
