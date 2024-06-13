/** @jsx Devvit.createElement */
/** @jsxFrag Devvit.Fragment */

import { BlockRenderEventType, BlockRenderRequest } from '@devvit/protos';
import { Header } from '@devvit/shared-types/Header.js';
import { describe, expect, test, vi } from 'vitest';
import { Devvit } from '../../Devvit.js';
import { BlocksReconciler } from './BlocksReconciler.js';

const Inner: JSX.ComponentFunction = (_props, context) => {
  const [_count, _setCount] = context.useState(1);
  return <text>Inner1</text>;
};

const Outer: JSX.ComponentFunction = (_props, _context) => {
  return (
    <blocks>
      <Inner />
      <Inner />
    </blocks>
  );
};

describe('BlocksReconciler', () => {
  describe('regression', () => {
    test('concurrency bug regression', async () => {
      let reconciler = new BlocksReconciler(
        Outer,
        BlockRenderRequest.fromPartial({
          type: BlockRenderEventType.RENDER_INITIAL,
        }),
        undefined,
        mockMetadata,
        undefined
      );

      await reconciler.render();

      const lastState = reconciler.state;
      reconciler = new BlocksReconciler(
        Outer,
        BlockRenderRequest.fromPartial({
          type: BlockRenderEventType.RENDER_EFFECT_EVENT,
        }),
        lastState,
        mockMetadata,
        undefined
      );

      await reconciler.render();
    });
  });

  describe('function components', () => {
    test('should pass children', async () => {
      const Box = ({ children }: Devvit.Blocks.HasElementChildren): JSX.Element => {
        return <hstack>{children}</hstack>;
      };
      const boxed = (): JSX.Element => (
        <Box>
          <text>hi world</text>
        </Box>
      );
      const expectedComponent = (): JSX.Element => (
        <hstack>
          <text>hi world</text>
        </hstack>
      );
      const reconciler = new BlocksReconciler(
        boxed,
        BlockRenderRequest.fromPartial({
          type: BlockRenderEventType.RENDER_INITIAL,
        }),
        undefined,
        mockMetadata,
        undefined
      );
      const output = await reconciler.render();

      const flatReconciler = new BlocksReconciler(
        expectedComponent,
        BlockRenderRequest.fromPartial({
          type: BlockRenderEventType.RENDER_INITIAL,
        }),
        undefined,
        mockMetadata,
        undefined
      );
      const expected = await flatReconciler.render();
      expect(output).toEqual(expected);
    });
  });

  test('should pass children, double-boxed', async () => {
    const Box = ({ children }: Devvit.Blocks.HasElementChildren): JSX.Element => {
      return <hstack>{children}</hstack>;
    };
    const boxed = (): JSX.Element => (
      <Box>
        <Box>
          <text>hi world</text>
        </Box>
      </Box>
    );
    const expectedComponent = (): JSX.Element => (
      <hstack>
        <hstack>
          <text>hi world</text>
        </hstack>
      </hstack>
    );
    const reconciler = new BlocksReconciler(
      boxed,
      BlockRenderRequest.fromPartial({
        type: BlockRenderEventType.RENDER_INITIAL,
      }),
      undefined,
      mockMetadata,
      undefined
    );
    const output = await reconciler.render();

    const flatReconciler = new BlocksReconciler(
      expectedComponent,
      BlockRenderRequest.fromPartial({
        type: BlockRenderEventType.RENDER_INITIAL,
      }),
      undefined,
      mockMetadata,
      undefined
    );
    const expected = await flatReconciler.render();
    expect(output).toEqual(expected);
  });

  test('should pass children, triple-boxed', async () => {
    const Box = ({ children }: Devvit.Blocks.HasElementChildren): JSX.Element => {
      return <hstack>{children}</hstack>;
    };
    const boxed = (): JSX.Element => (
      <Box>
        <vstack>
          <Box>
            <text>hi world</text>
          </Box>
        </vstack>
      </Box>
    );
    const expectedComponent = (): JSX.Element => (
      <hstack>
        <vstack>
          <hstack>
            <text>hi world</text>
          </hstack>
        </vstack>
      </hstack>
    );
    const reconciler = new BlocksReconciler(
      boxed,
      BlockRenderRequest.fromPartial({
        type: BlockRenderEventType.RENDER_INITIAL,
      }),
      undefined,
      mockMetadata,
      undefined
    );
    const output = await reconciler.render();

    const flatReconciler = new BlocksReconciler(
      expectedComponent,
      BlockRenderRequest.fromPartial({
        type: BlockRenderEventType.RENDER_INITIAL,
      }),
      undefined,
      mockMetadata,
      undefined
    );
    const expected = await flatReconciler.render();
    expect(output).toEqual(expected);
  });

  test('async component can render', async () => {
    const callback = vi.fn();
    const component: JSX.ComponentFunction = async () => {
      return <button onPress={callback}>Click me</button>;
    };

    const reconciler = new BlocksReconciler(
      component,
      BlockRenderRequest.fromPartial({
        type: BlockRenderEventType.RENDER_INITIAL,
      }),
      undefined,
      mockMetadata,
      undefined
    );

    const out = await reconciler.render();
    expect(out).toEqual({
      actions: [],
      config: {
        rootConfig: {
          children: [
            {
              actions: [
                {
                  data: {},
                  id: 'button.spy',
                  type: 0,
                },
              ],
              config: {
                buttonConfig: {
                  buttonAppearance: undefined,
                  buttonSize: undefined,
                  disabled: undefined,
                  icon: undefined,
                  text: 'Click me',
                  textColor: undefined,
                  textColors: undefined,
                },
              },
              size: undefined,
              sizes: undefined,
              type: 3,
            },
          ],
          height: 320,
        },
      },
      size: undefined,
      type: 0,
    });
    expect(callback).not.toHaveBeenCalled();
  });

  describe('actions handler', () => {
    test('should not call the action handler on initial render', async () => {
      const callback = vi.fn();
      const component = (): JSX.Element => {
        return <button onPress={callback}>Click me</button>;
      };

      const reconciler = new BlocksReconciler(
        component,
        BlockRenderRequest.fromPartial({
          type: BlockRenderEventType.RENDER_INITIAL,
        }),
        undefined,
        mockMetadata,
        undefined
      );

      await reconciler.render();
      expect(callback).not.toHaveBeenCalled();
    });

    test('should call the action handler', async () => {
      const callback = vi.fn();
      const component = (): JSX.Element => {
        return <button onPress={callback}>Click me</button>;
      };

      const reconciler = new BlocksReconciler(
        component,
        BlockRenderRequest.fromPartial({
          type: BlockRenderEventType.RENDER_USER_ACTION,
          id: `button.${callback.name}`,
        }),
        {},
        mockMetadata,
        undefined
      );

      await reconciler.render();
      expect(callback).toHaveBeenCalled();
    });

    test('should not throw when children is undefined', async () => {
      const component = (): JSX.Element => {
        return <vstack>{undefined}</vstack>;
      };

      const reconciler = new BlocksReconciler(
        component,
        BlockRenderRequest.fromPartial({
          type: BlockRenderEventType.RENDER_INITIAL,
        }),
        {},
        mockMetadata,
        undefined
      );

      expect(() => reconciler.render()).not.toThrow();
    });
  });

  describe('state', () => {
    test('defaults with __renderState', () => {
      const reconciler = new BlocksReconciler(
        () => null,
        BlockRenderRequest.fromPartial({
          type: BlockRenderEventType.RENDER_INITIAL,
        }),
        undefined,
        mockMetadata,
        undefined
      );

      expect(reconciler.state).toEqual({
        __renderState: {},
      });
    });

    test('updates state with the current renderState', async () => {
      const cmp: JSX.ComponentFunction = (_props, { useState }: Devvit.Context) => {
        const [state, setState] = useState(0);

        return <button onPress={() => setState((count) => count + 1)}> {state}</button>;
      };
      const reconciler = new BlocksReconciler(
        cmp,
        BlockRenderRequest.fromPartial({
          type: BlockRenderEventType.RENDER_INITIAL,
        }),
        undefined,
        mockMetadata,
        undefined
      );

      await reconciler.render();

      expect(reconciler.state).toEqual({
        __renderState: {
          'root.cmp': [0],
        },
      });
    });
  });
});

const mockMetadata = {
  [Header.AppUser]: {
    values: ['t2_appuser'],
  },
  [Header.Subreddit]: {
    values: ['t5_devvit'],
  },
  [Header.User]: {
    values: ['t2_user'],
  },
};
