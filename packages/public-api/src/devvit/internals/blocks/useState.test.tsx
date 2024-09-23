/** @jsx Devvit.createElement */
/** @jsxFrag Devvit.Fragment */

import { BlockRenderEventType, BlockRenderRequest } from '@devvit/protos';
import { Header } from '@devvit/shared-types/Header.js';
import { describe, expect, test } from 'vitest';

import { Devvit } from '../../Devvit.js';
import { BlocksReconciler } from './BlocksReconciler.js';
import { makeUseStateHook } from './useState.js';

describe('useState', () => {
  describe('initial state', () => {
    test('uses the given initial state', async () => {
      const reconciler = new BlocksReconciler(
        (_props: JSX.Props, { useState }: Devvit.Context) => {
          const [state] = useState({ foo: 'bar' });
          return <text>{state.foo}</text>;
        },
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
          'root.anonymous': [
            {
              foo: 'bar',
            },
          ],
        },
      });
    });

    test('async initializer resolves', async () => {
      const reconciler = new BlocksReconciler(
        (_props: JSX.Props, { useState }: Devvit.Context) => {
          const [state] = useState(() => {
            return new Promise<string>((resolve) => {
              setTimeout(() => {
                resolve('hello world');
              }, 100);
            });
          });
          return <text>{state}</text>;
        },
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
          'root.anonymous': ['hello world'],
        },
      });
    });
  });

  describe('state setter', () => {
    test('updates the value given a new value', async () => {
      const reconciler = new BlocksReconciler(
        (_props: JSX.Props, { useState }: Devvit.Context) => {
          const [counter, setCounter] = useState(0);
          return (
            <vstack>
              <text>{counter}</text>
              <button onPress={() => setCounter((counter) => counter + 1)}>Increment</button>
            </vstack>
          );
        },
        BlockRenderRequest.fromPartial({
          type: BlockRenderEventType.RENDER_USER_ACTION,
          id: `button.onPress`,
        }),
        {
          __renderState: {
            'root.anonymous': [5],
          },
        },
        mockMetadata,
        undefined
      );

      await reconciler.render();

      expect(reconciler.state).toEqual({
        __renderState: {
          'root.anonymous': [6],
        },
      });
    });

    test('updates the value using a function', async () => {
      const reconciler = new BlocksReconciler(
        (_props: JSX.Props, { useState }: Devvit.Context) => {
          const [counter, setCounter] = useState(1);
          return (
            <vstack>
              <text>{counter}</text>
              <button onPress={() => setCounter((prev) => prev * 2)}>Double it</button>
            </vstack>
          );
        },
        BlockRenderRequest.fromPartial({
          type: BlockRenderEventType.RENDER_USER_ACTION,
          id: `button.onPress`,
        }),
        {
          __renderState: {
            'root.anonymous': [2],
          },
        },
        mockMetadata,
        undefined
      );

      await reconciler.render();

      expect(reconciler.state).toEqual({
        __renderState: {
          'root.anonymous': [4],
        },
      });
    });

    test('cannot be called during the render of the component', async () => {
      const reconciler = new BlocksReconciler(
        (_props: JSX.Props, { useState }: Devvit.Context) => {
          const [counter, setCounter] = useState(0);

          setCounter(1337);

          return (
            <vstack>
              <text>{counter}</text>
            </vstack>
          );
        },
        BlockRenderRequest.fromPartial({
          type: BlockRenderEventType.RENDER_USER_ACTION,
          id: `button.onPress`,
        }),
        undefined,
        mockMetadata,
        undefined
      );

      await expect(reconciler.render()).rejects.toThrowError(
        'Invalid hook call. Hooks can only be called at the top-level of a function component. Make sure that you are not calling hooks inside loops, conditions, or nested functions.'
      );
    });
  });

  test('can be used multiple times in a component', async () => {
    const reconciler = new BlocksReconciler(
      (_props: JSX.Props, { useState }: Devvit.Context) => {
        const [counter] = useState(0);
        const [foo] = useState('bar');
        const [baz] = useState({
          hello: 'world',
        });

        return (
          <vstack>
            <text>{counter}</text>
            <text>{foo}</text>
            <text>{baz.hello}</text>
          </vstack>
        );
      },
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
        'root.anonymous': [
          0,
          'bar',
          {
            hello: 'world',
          },
        ],
      },
    });
  });

  test('must not be used outside of a component', async () => {
    const reconciler = new BlocksReconciler(
      () => null,
      BlockRenderRequest.fromPartial({
        type: BlockRenderEventType.RENDER_INITIAL,
      }),
      undefined,
      mockMetadata,
      undefined
    );

    const useState = makeUseStateHook(reconciler);
    expect(() => useState(0)).toThrowError('Current component key is missing');
  });

  test('must not be used conditionally', async () => {
    const reconciler = new BlocksReconciler(
      (_props: JSX.Props, { useState }: Devvit.Context) => {
        const [counter, setCounter] = useState(0);

        let fooValue = '';

        if (counter === 0) {
          const [foo] = useState('bar');
          fooValue = foo;
        }

        return (
          <vstack>
            <text>{counter}</text>
            <text>{fooValue}</text>
            <button onPress={() => setCounter((counter) => counter + 1)}>Increment</button>
          </vstack>
        );
      },
      BlockRenderRequest.fromPartial({
        type: BlockRenderEventType.RENDER_USER_ACTION,
        id: `button.onPress`,
      }),
      {
        __renderState: {
          'root.anonymous': [0],
        },
      },
      mockMetadata,
      undefined
    );

    await expect(reconciler.render()).rejects.toThrowError(
      'Invalid hook call. Hooks can only be called at the top-level of a function component. Make sure that you are not calling hooks inside loops, conditions, or nested functions.'
    );
  });

  test('handles void or undefined values properly', async () => {
    const reconciler = new BlocksReconciler(
      (_props: JSX.Props, { useState }: Devvit.Context) => {
        const [state] = useState({ foo: 'bar' });
        useState(() => {});
        const [foo] = useState('foo');
        useState(undefined);
        return (
          <vstack>
            <text>{state.foo}</text>
            <text>{foo}</text>
          </vstack>
        );
      },
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
        'root.anonymous': [
          {
            foo: 'bar',
          },
          undefined,
          'foo',
          undefined,
        ],
      },
    });
  });

  test('typing is intuitive', () => {
    new BlocksReconciler(
      (_props: JSX.Props, { useState }: Devvit.Context) => {
        type Foo = {
          bar: string;
        };
        const foo: Foo = { bar: 'abc' };

        useState(undefined);
        useState('abc');
        useState(1);
        useState(false);
        useState(null);
        useState([]);
        useState({});
        useState({ a: 123 });
        useState([{ a: 123 }, 1, null]);
        useState(foo);
        useState(() => undefined);
        useState(() => 'abc');
        useState(() => 1);
        useState(() => false);
        useState(() => null);
        useState(() => []);
        useState(() => ({}));
        useState(() => foo);
        useState(() => Promise.resolve(undefined));
        useState(() => Promise.resolve('abc'));
        useState(() => Promise.resolve(1));
        useState(() => Promise.resolve(false));
        useState(() => Promise.resolve(null));
        useState(() => Promise.resolve([]));
        useState(() => Promise.resolve({}));
        useState(() => Promise.resolve(foo));
        // @ts-expect-error test bad type.
        useState(new (class {})());
        // @ts-expect-error test bad type.
        useState(new Map());
        // @ts-expect-error test bad type.
        useState(new Set());
        // @ts-expect-error test bad type.
        useState(new Date());
        // @ts-expect-error test bad type.
        useState(() => Promise.resolve(new (class {})()));
        // @ts-expect-error test bad type.
        useState(() => Promise.resolve(new Map()));
        // @ts-expect-error test bad type.
        useState(() => Promise.resolve(new Set()));
        // @ts-expect-error test bad type.
        useState(() => Promise.resolve(new Date()));
        return <text />;
      },
      undefined,
      undefined,
      mockMetadata,
      undefined
    );
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
