// eslint-disable-next-line no-restricted-imports
import {
  type Experiments,
  ExperimentsDefinition,
} from '@devvit/protos/types/devvit/plugin/experiments/v1alpha/experiments.js';
import { makeConfig, MOCK_HEADERS } from '@devvit/shared-types/test/index.js';

import { Context, experiments, runWithContext } from './index.js';

const experimentName = 'devvit_test_app_exp';
const plugin = {
  GetVariant: vi.fn<Experiments['GetVariant']>(),
  ExposeExperiment: vi.fn<Experiments['ExposeExperiment']>(),
} satisfies Experiments;

beforeEach(() => {
  plugin.GetVariant.mockReset();
  plugin.ExposeExperiment.mockReset();
  vi.stubGlobal('devvit', {
    config: makeConfig({ plugins: { [ExperimentsDefinition.fullName]: plugin } }),
  });
});

afterEach(() => vi.unstubAllGlobals());

describe('experiments', () => {
  test.each([
    {
      description: 'returns the assigned variant with exposure disabled by default',
      expose: undefined,
      expectedExpose: false,
      response: { variant: 'enabled' },
    },
    {
      description: 'requests exposure when enabled and returns the control variant',
      expose: true,
      expectedExpose: true,
      response: { variant: 'control_1' },
    },
    {
      description: 'returns undefined when the plugin returns no variant',
      expose: false,
      expectedExpose: false,
      response: {},
    },
  ])('$description', async ({ expose, expectedExpose, response }) => {
    const request = Context(MOCK_HEADERS);
    plugin.GetVariant.mockResolvedValue(response);

    await expect(
      runWithContext(request, () => experiments.experimentVariant(experimentName, expose))
    ).resolves.toBe(response.variant);

    expect(plugin.GetVariant).toHaveBeenCalledExactlyOnceWith(
      { name: experimentName, expose: expectedExpose },
      request.metadata
    );
    expect(plugin.ExposeExperiment).not.toHaveBeenCalled();
  });

  test('requests exposure with the experiment name and current request metadata', async () => {
    const request = Context(MOCK_HEADERS);
    plugin.ExposeExperiment.mockResolvedValue({});

    await expect(
      runWithContext(request, () => experiments.exposeExperiment(experimentName))
    ).resolves.toBeUndefined();

    expect(plugin.ExposeExperiment).toHaveBeenCalledExactlyOnceWith(
      { name: experimentName },
      request.metadata
    );
    expect(plugin.GetVariant).not.toHaveBeenCalled();
  });

  test.each([
    { method: 'experimentVariant', rpc: plugin.GetVariant },
    { method: 'exposeExperiment', rpc: plugin.ExposeExperiment },
  ] as const)('$method propagates RPC errors', async ({ method, rpc }) => {
    const error = new Error('Experiment is not declared');
    rpc.mockRejectedValue(error);

    await expect(
      runWithContext(Context(MOCK_HEADERS), async () => experiments[method](experimentName))
    ).rejects.toBe(error);
  });
});
