/** @jsx Devvit.createElement */
/** @jsxFrag Devvit.Fragment */

import { BlockType, UIEventScope, type UIRequest } from '@devvit/protos';
import { CircuitBreak } from '@devvit/shared-types/CircuitBreaker.js';
import { describe, expect, test, vi } from 'vitest';

import { Devvit } from '../../../Devvit.js';
import { _activeRenderContext, assertValidNamespace, BlocksHandler } from './BlocksHandler.js';
import { captureHookRef } from './refs.js';
import {
  findHookId,
  findHookValue,
  generatePressRequest,
  getEmptyRequest,
  getLatestBlocksState,
  mockMetadata,
} from './test-helpers.js';
import type { HookRef } from './types.js';
import { useAsync } from './useAsync.js';
import { useState } from './useState.js';

const funnyRef: HookRef = {};

const loader = async (): Promise<string> => {
  await new Promise((resolve) => setTimeout(resolve, 10));

  return 'hi world!';
};

const positiveRef: HookRef = {};
const negativeRef: HookRef = {};
const counter1Ref: HookRef = {};
const counter2Ref: HookRef = {};

const InfiniteLoopComponent = (): JSX.Element => {
  _activeRenderContext?.addToRequeueEvents({ asyncResponse: { requestId: '1' } });
  return <hstack />;
};

const SomeAsyncComponent = (): JSX.Element => {
  const { data, error, loading } = captureHookRef(useAsync(loader), funnyRef);
  return (
    <hstack>
      <text>
        {data} - {String(error)} - {loading ? 'loading' : 'done'}
      </text>
    </hstack>
  );
};

const SuccessFail = (): JSX.Element => {
  const [_counter, setCounter] = captureHookRef(useState(0), counter1Ref);
  return (
    <hstack>
      <button onPress={captureHookRef(() => setCounter((c) => c + 1), positiveRef)}>Yay</button>
      <button onPress={captureHookRef(() => Promise.reject(CircuitBreak(undefined)), negativeRef)}>
        {' '}
        Nay
      </button>
    </hstack>
  );
};

const MultiCounter = (): JSX.Element => {
  const [_counter1, setCounter1] = captureHookRef(useState(0), counter1Ref);
  const [_counter2, setCounter2] = captureHookRef(useState(0), counter2Ref);
  return (
    <hstack>
      <button onPress={captureHookRef(() => setCounter1((c) => c + 1), positiveRef)}>One</button>
      <button onPress={captureHookRef(() => setCounter2((c) => c - 1), negativeRef)}>Two</button>
    </hstack>
  );
};

const stateARef: HookRef = {};
const stateBRef: HookRef = {};
const pressARef: HookRef = {};
const pressBRef: HookRef = {};
const toggleRef: HookRef = {};
const ComponentA = (): JSX.Element => {
  const [_count, setCount] = captureHookRef(useState(0), stateARef);
  return <button onPress={captureHookRef(() => setCount((c) => ++c), pressARef)}>A</button>;
};

const ComponentB = (): JSX.Element => {
  const [_count, setCount] = captureHookRef(useState(0), stateBRef);
  return <button onPress={captureHookRef(() => setCount((c) => ++c), pressBRef)}>B</button>;
};

const ConditionalComponent = (): JSX.Element => {
  const [choice, setChoice] = captureHookRef(useState(true), counter1Ref);
  return (
    <hstack>
      <button onPress={captureHookRef(() => setChoice(!choice), toggleRef)}>toggle</button>
      {choice ? <ComponentA /> : <ComponentB />}
    </hstack>
  );
};

const DependentUseAsyncs = (): JSX.Element => {
  const { data: fooData } = useAsync(async () => 'foo');
  const { data: barData } = useAsync(
    async () => {
      if (!fooData) return null;
      return 'bar';
    },
    { depends: fooData }
  );

  return (
    <hstack>
      <text wrap>{JSON.stringify(fooData, null, 2)}</text>
      <text wrap>{JSON.stringify(barData, null, 2)}</text>
    </hstack>
  );
};

const UseAsyncBeforeUseStateComponent = (): JSX.Element => {
  const { data, loading } = useAsync(async () => {
    return 'useAsyncResolved';
  });
  const [useStateValue] = useState(async () => {
    return 'useStateResolved';
  });

  return (
    <vstack height="100%" width="100%" gap="medium" alignment="center middle">
      <text>useAsyncLoading: {loading}</text>
      <text>useAsyncValue: {data}</text>
      <text>useStateValue: {useStateValue}</text>
    </vstack>
  );
};

const UseStateBeforeUseAsyncComponent = (): JSX.Element => {
  const [useStateValue] = useState(async () => {
    return 'useStateResolved';
  });
  const { data, loading } = useAsync(async () => {
    return 'useAsyncResolved';
  });

  return (
    <vstack height="100%" width="100%" gap="medium" alignment="center middle">
      <text>useAsyncLoading: {loading}</text>
      <text>useAsyncValue: {data}</text>
      <text>useStateValue: {useStateValue}</text>
    </vstack>
  );
};

let n = 0;
const AsyncStateComponent = (): JSX.Element => {
  const [_count, setCount] = captureHookRef(
    useState(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      return n++;
    }),
    stateARef
  );
  return <button onPress={captureHookRef(() => setCount((c) => ++c), pressARef)}>A</button>;
};

describe('BlocksHandler', () => {
  describe('regressions', () => {
    test('infinitely looping component should be terminated', async () => {
      const handler = new BlocksHandler(InfiniteLoopComponent);
      try {
        await handler.handle(getEmptyRequest(), mockMetadata);
        expect(false).toBe(true);
      } catch (e) {
        expect(e).toMatchInlineSnapshot(`[Error: Exceeded maximum iterations of 128]`);
      }
    });

    test('async initializer should only fire once, because the state is already there in the second request', async () => {
      console.log();
      expect(!vi.isFakeTimers());
      n = 0;
      const handler = new BlocksHandler(AsyncStateComponent);

      const rsp = await handler.handle(getEmptyRequest(), mockMetadata);
      expect(n).toBe(1);

      const req = { ...getEmptyRequest(), state: rsp.state };
      await handler.handle(req, mockMetadata);
      expect(n).toBe(1);
    });

    test('conditional components should not throw (bonus test)', async () => {
      const handler = new BlocksHandler(ConditionalComponent);
      await handler.handle(getEmptyRequest(), mockMetadata);
    });

    test('remounting should reset', async () => {
      const handler = new BlocksHandler(ConditionalComponent);
      async function press(ref: HookRef): Promise<void> {
        const req = generatePressRequest(ref);
        await handler.handle(req, mockMetadata);
      }
      await handler.handle(getEmptyRequest(), mockMetadata);
      expect(findHookValue(stateARef)).toEqual(0);
      await press(pressARef);
      expect(findHookValue(stateARef)).toEqual(1);
      await press(toggleRef);
      expect(getLatestBlocksState()).toMatchInlineSnapshot(`
        {
          "ConditionalComponent.hstack.ComponentA-1.useState-0": {
            "__deleted": true,
          },
          "ConditionalComponent.hstack.ComponentB-1.useState-0": {
            "error": null,
            "load_state": "loaded",
            "value": 0,
          },
          "ConditionalComponent.useState-0": {
            "error": null,
            "load_state": "loaded",
            "value": false,
          },
          "__cache": {},
        }
      `);
      await press(toggleRef);
      expect(findHookValue(stateARef)).toEqual(0);
    });

    test('All deltas should be returned from handle on a blocking request', async () => {
      const handler = new BlocksHandler(DependentUseAsyncs);
      const data = await handler.handle(
        { events: [{ blocking: {}, scope: UIEventScope.ALL }] },
        mockMetadata
      );

      expect(data.state).toMatchInlineSnapshot(`
        {
          "DependentUseAsyncs.useAsync-0": {
            "data": "foo",
            "depends": null,
            "error": null,
            "load_state": "loaded",
          },
          "DependentUseAsyncs.useAsync-1": {
            "data": "bar",
            "depends": "foo",
            "error": null,
            "load_state": "loaded",
          },
          "__cache": {},
        }
      `);
    });

    test('useState async initializer after useAsync should resolve', async () => {
      const handler = new BlocksHandler(UseAsyncBeforeUseStateComponent);
      const resp = await handler.handle(
        { events: [{ blocking: {}, scope: UIEventScope.ALL }] },
        mockMetadata
      );

      expect(resp.state).toMatchInlineSnapshot(`
        {
          "UseAsyncBeforeUseStateComponent.useAsync-0": {
            "data": "useAsyncResolved",
            "depends": null,
            "error": null,
            "load_state": "loaded",
          },
          "UseAsyncBeforeUseStateComponent.useState-1": {
            "error": null,
            "load_state": "loaded",
            "value": "useStateResolved",
          },
          "__cache": {},
        }
      `);
    });

    test('useState async initializer before useAsync should resolve', async () => {
      const handler = new BlocksHandler(UseStateBeforeUseAsyncComponent);
      const resp = await handler.handle(
        { events: [{ blocking: {}, scope: UIEventScope.ALL }] },
        mockMetadata
      );

      expect(resp.state).toMatchInlineSnapshot(`
        {
          "UseStateBeforeUseAsyncComponent.useAsync-1": {
            "data": "useAsyncResolved",
            "depends": null,
            "error": null,
            "load_state": "loaded",
          },
          "UseStateBeforeUseAsyncComponent.useState-0": {
            "error": null,
            "load_state": "loaded",
            "value": "useStateResolved",
          },
          "__cache": {},
        }
      `);
    });

    test('async child components are forbidden and throw a helpful error', async () => {
      const AsyncChild = async (): Promise<JSX.Element> => {
        return <text>async child</text>;
      };
      const Parent = (): JSX.Element => {
        return (
          <blocks>
            {/* 
            // @ts-expect-error - We're testing that our code guards against this invalid case! */}
            <AsyncChild />
          </blocks>
        );
      };

      const handler = new BlocksHandler(Parent);
      await expect(() =>
        handler.handle(getEmptyRequest(), mockMetadata)
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `[Error: Components (found: AsyncChild) cannot be async. To use data from an async endpoint, please use "const [data] = useState(async () => {/** your async code */})".]`
      );
    });

    test('useState with async initializer in child component renders', async () => {
      const FooComponent = (): JSX.Element => {
        const [state] = useState(async () => 'foo');
        return <text>state: {state}</text>;
      };

      const Root = (): JSX.Element => {
        return (
          <blocks>
            <FooComponent />
          </blocks>
        );
      };

      const handler = new BlocksHandler(Root);
      const resp = await handler.handle(getEmptyRequest(), mockMetadata);

      expect(JSON.stringify(resp.blocks)).toContain('state: foo');
    });

    test('useState with async initializer in child component renders (fragment)', async () => {
      const FooComponent = (): JSX.Element => {
        const [state] = useState(async () => 'foo');
        return <text>state: {state}</text>;
      };

      const Root = (): JSX.Element => {
        return (
          <>
            <FooComponent />
          </>
        );
      };

      const handler = new BlocksHandler(Root);
      const resp = await handler.handle(getEmptyRequest(), mockMetadata);

      expect(JSON.stringify(resp.blocks)).toContain('state: foo');
    });

    test('useState with async initializer in child component renders (deep)', async () => {
      const BazComponent = ({ children }: { children: JSX.Element }): JSX.Element => {
        return <vstack>{children}</vstack>;
      };

      const BarComponent = ({ children }: { children: JSX.Element }): JSX.Element => {
        return <vstack>{children}</vstack>;
      };

      const FooComponent = (): JSX.Element => {
        const [state] = useState(async () => 'foo');
        return <text>state: {state}</text>;
      };

      const Root = (): JSX.Element => {
        return (
          <blocks>
            <BazComponent>
              <BarComponent>
                <FooComponent />
              </BarComponent>
            </BazComponent>
          </blocks>
        );
      };

      const handler = new BlocksHandler(Root);
      const resp = await handler.handle(getEmptyRequest(), mockMetadata);

      expect(JSON.stringify(resp.blocks)).toContain('state: foo');
    });

    test('conditional component that contains useState with async initializer renders', async () => {
      const FooComponent = (): JSX.Element => {
        const [state] = useState(async () => 'foo');
        return <text>state: {state}</text>;
      };

      const showFooRef: HookRef = {};
      const pressRef: HookRef = {};
      const Root = (): JSX.Element => {
        const [showFooComponent, setShowFooComponent] = captureHookRef(useState(false), showFooRef);
        return (
          <blocks>
            <button onPress={captureHookRef(() => setShowFooComponent(true), pressRef)}>
              Show FooComponent
            </button>
            {showFooComponent && <FooComponent />}
          </blocks>
        );
      };

      const handler = new BlocksHandler(Root);
      await handler.handle(getEmptyRequest(), mockMetadata);

      const req = generatePressRequest(pressRef);
      const resp = await handler.handle(req, mockMetadata);

      expect(JSON.stringify(resp.blocks)).toContain('state: foo');
    });
  });

  describe('transformation', () => {
    test('should inject a root element', async () => {
      const callback = vi.fn();
      const component = (): JSX.Element => {
        return <button onPress={callback}>Click me</button>;
      };

      const handler: BlocksHandler = new BlocksHandler(component);
      const response = await handler.handle(getEmptyRequest(), mockMetadata);
      expect(response.blocks?.type).toEqual(BlockType.BLOCK_ROOT);
      expect(response).toMatchSnapshot();
      expect(callback).not.toHaveBeenCalled();
    });
  });
  describe('event shortcuts', () => {
    test('should emit effects in normal operation', async () => {
      const handler = new BlocksHandler(SomeAsyncComponent);
      const response = await handler.handle(getEmptyRequest(), mockMetadata);
      expect(JSON.stringify(response.blocks)).toContain('loading');

      expect(response.events.length).toEqual(1);
      expect(response.events[0].asyncRequest).toBeDefined();
    });

    test('should process all futures in blocking SSR mode', async () => {
      const handler = new BlocksHandler(SomeAsyncComponent);
      const response = await handler.handle(
        { events: [{ blocking: {}, scope: UIEventScope.ALL }] },
        mockMetadata
      );
      expect(JSON.stringify(response.blocks)).toContain('done');
      expect(response.effects.length).toEqual(0);
      expect(response.events.length).toEqual(0);
    });

    test('should be able to batch events and make progress', async () => {
      const handler = new BlocksHandler(SuccessFail);
      await handler.handle(getEmptyRequest(), mockMetadata);
      expect(findHookValue(counter1Ref)).toEqual(0);
      const req = generatePressRequest(positiveRef);
      req.events.push(structuredClone(req.events[0]));
      req.events.push(structuredClone(req.events[0]));
      req.events.push(structuredClone(req.events[0]));
      req.events.push(structuredClone(req.events[0]));
      await handler.handle(req, mockMetadata);
      expect(findHookValue(counter1Ref)).toEqual(5);
    });

    test('should be able to make partial progress', async () => {
      const handler = new BlocksHandler(SuccessFail);
      await handler.handle(getEmptyRequest(), mockMetadata);
      expect(findHookValue(counter1Ref)).toEqual(0);
      let req = generatePressRequest(negativeRef);
      const nay = req.events[0];
      req = generatePressRequest(positiveRef);
      req.events.push(structuredClone(req.events[0]));
      req.events.push(structuredClone(req.events[0]));
      req.events.push(nay);
      req.events.push(structuredClone(req.events[0]));

      // yay, yay, yay, NAY, yay
      // 3 successes, one fail, one deferred success
      const response = await handler.handle(req, mockMetadata);
      expect(findHookValue(counter1Ref)).toEqual(3);
      expect(response.events.length).toEqual(2);
      expect(response.events[0].hook).toEqual(nay.hook);
      expect(response.events[0].retry).toEqual(true);
      expect(response.events[1].hook).toEqual(req.events[0].hook);
      expect(response.events[1].retry).toEqual(true);
    });

    test('should fail if the first event fails', async () => {
      const handler = new BlocksHandler(SuccessFail);
      await handler.handle(getEmptyRequest(), mockMetadata);
      expect(findHookValue(counter1Ref)).toEqual(0);
      let req = generatePressRequest(negativeRef);
      const nay = req.events[0];
      req = generatePressRequest(positiveRef);
      req.events.push(structuredClone(req.events[0]));
      req.events.push(structuredClone(req.events[0]));
      req.events.push(structuredClone(req.events[0]));
      req.events.unshift(nay);

      await expect(handler.handle(req, mockMetadata)).rejects.toThrow('ServerCallRequired');
    });
  });

  describe('keys', () => {
    test('should generate nice hook ids', async () => {
      const Box = ({ children }: Devvit.Blocks.HasElementChildren): JSX.Element => {
        const [_counter, _setCounter] = useState(0);
        return <hstack>{children}</hstack>;
      };
      const boxed = (): JSX.Element => (
        <Box>
          <button onPress={() => {}}>hi world</button>
          <button key="kk" onPress={() => {}}>
            hi world
          </button>
          <button id="something" onPress={() => {}}>
            hi world
          </button>
          <button onPress={() => {}}>hi world</button>
        </Box>
      );

      const handler: BlocksHandler = new BlocksHandler(boxed);
      const request = getEmptyRequest();
      await handler.handle(request, mockMetadata);
      expect(new Set(Object.keys(handler._latestRenderContext?._generated ?? {}))).toEqual(
        new Set([
          'boxed.Box.useState-0',
          'boxed.Box.hstack.button-0.onPress',
          'boxed.Box.hstack.button-3.onPress',
          'boxed.Box.hstack.button-kk.onPress',
          'something.onPress',
        ])
      );
    });
    test('should handle anonymous functions', async () => {
      const handler: BlocksHandler = new BlocksHandler(() => {
        const [_counter, _setCounter] = useState(0);
        return (
          <hstack>
            <button key="kk" onPress={() => {}}>
              hi world
            </button>
          </hstack>
        );
      });
      const request = getEmptyRequest();
      await handler.handle(request, mockMetadata);

      expect(new Set(Object.keys(handler._latestRenderContext?._generated ?? {}))).toEqual(
        new Set(['anonymous.hstack.button-kk.onPress', 'anonymous.useState-0'])
      );
    });

    test('should handle fragments', async () => {
      const handler: BlocksHandler = new BlocksHandler(() => {
        const [_counter, _setCounter] = useState(0);
        return (
          <hstack>
            <>
              <button key="kk" onPress={() => {}}>
                hi world
              </button>
            </>
          </hstack>
        );
      });
      const request = getEmptyRequest();
      await handler.handle(request, mockMetadata);

      expect(new Set(Object.keys(handler._latestRenderContext?._generated ?? {}))).toEqual(
        new Set(['anonymous.hstack.fragment-0.button-kk.onPress', 'anonymous.useState-0'])
      );
    });

    test('should handle mapped fragments', async () => {
      const handler: BlocksHandler = new BlocksHandler(() => {
        const [_counter, _setCounter] = useState(0);
        return (
          <hstack>
            {[1, 2].map((count) => (
              <>
                <button onPress={() => _setCounter((x) => x + count)}>{count}</button>
              </>
            ))}
          </hstack>
        );
      });
      const request = getEmptyRequest();
      await handler.handle(request, mockMetadata);

      expect(new Set(Object.keys(handler._latestRenderContext?._generated ?? {}))).toEqual(
        new Set([
          'anonymous.hstack.fragment-0.button-0.onPress',
          'anonymous.hstack.fragment-1.button-0.onPress',
          'anonymous.useState-0',
        ])
      );
    });
  });

  describe('Context.#state', () => {
    test('responses should only contain state changed', async () => {
      const handler = new BlocksHandler(MultiCounter);

      {
        // initial.
        const rsp = await handler.handle(getEmptyRequest(), mockMetadata);
        expect(rsp.state![findHookId(counter1Ref)]).toEqual({
          value: 0,
          load_state: 'loaded',
          error: null,
        });
        expect(rsp.state![findHookId(counter2Ref)]).toEqual({
          value: 0,
          load_state: 'loaded',
          error: null,
        });
        expect(findHookValue(counter1Ref)).toBe(0);
        expect(findHookValue(counter2Ref)).toBe(0);
      }

      {
        // press button1.
        const req = generatePressRequest(positiveRef);
        const rsp = await handler.handle(req, mockMetadata);
        expect(rsp.state![findHookId(counter1Ref)]).toEqual({
          value: 1,
          load_state: 'loaded',
          error: null,
        });
        expect(rsp.state![findHookId(counter2Ref)]).toBe(undefined);
        expect(findHookValue(counter1Ref)).toBe(1);
        expect(findHookValue(counter2Ref)).toBe(0);
      }

      {
        // press button2.
        const req = generatePressRequest(negativeRef);
        const rsp = await handler.handle(req, mockMetadata);
        expect(rsp.state![findHookId(counter1Ref)]).toBe(undefined);
        expect(rsp.state![findHookId(counter2Ref)]).toEqual({
          value: -1,
          load_state: 'loaded',
          error: null,
        });
        expect(findHookValue(counter1Ref)).toBe(1);
        expect(findHookValue(counter2Ref)).toBe(-1);
      }

      {
        // re-render current state.
        const req = { events: [], state: getLatestBlocksState() };
        const rsp = await handler.handle(req, mockMetadata);
        expect(rsp.state![findHookId(counter1Ref)]).toBe(undefined);
        expect(rsp.state![findHookId(counter2Ref)]).toBe(undefined);
        expect(findHookValue(counter1Ref)).toBe(1);
        expect(findHookValue(counter2Ref)).toBe(-1);
      }
    });

    test('partial progress responses should only contain state changed', async () => {
      const handler = new BlocksHandler(SuccessFail);
      await handler.handle(getEmptyRequest(), mockMetadata);
      expect(findHookValue(counter1Ref)).toEqual(0);
      let req = generatePressRequest(negativeRef);
      const nay = req.events[0];
      req = generatePressRequest(positiveRef);
      req.events.push(structuredClone(req.events[0]));
      req.events.push(structuredClone(req.events[0]));
      req.events.push(nay);
      req.events.push(structuredClone(req.events[0]));

      // yay, yay, NAY, yay
      // 2 successes, one fail, one deferred success
      const rsp = await handler.handle(req, mockMetadata);
      expect(rsp.events.length).toBe(2);
      expect(rsp.events[0].hook).toBe(nay.hook);
      expect(rsp.events[0].retry).toBe(true);
      expect(rsp.events[1].hook).toBe(req.events[0].hook);
      expect(rsp.events[1].retry).toBe(true);

      expect(rsp.state![findHookId(counter1Ref)]).toEqual({
        value: 3,
        load_state: 'loaded',
        error: null,
      });
      expect(findHookValue(counter1Ref)).toBe(3);
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
      const handler: BlocksHandler = new BlocksHandler(boxed);
      const request: UIRequest = {
        events: [],
      };
      const response = await handler.handle(request, mockMetadata);
      expect(response).toMatchSnapshot();

      const alt: BlocksHandler = new BlocksHandler(expectedComponent);
      const altResponse = await alt.handle(request, mockMetadata);
      expect(JSON.stringify(altResponse)).toEqual(JSON.stringify(response));
    });
  });

  describe('keys', () => {
    test('keys should be in-sensitive to DOM re-ordering', async () => {
      let which = 0;

      const component: Devvit.BlockComponent = () => {
        const lol = Math.random() > 0.5;
        return (
          <hstack>
            {lol ? (
              <>
                <button
                  key="one"
                  onPress={captureHookRef(() => {
                    which = 1;
                  }, funnyRef)}
                />
                <button key="two" onPress={() => void (which = 2)} />
              </>
            ) : (
              <>
                <button key="two" onPress={() => void (which = 2)} />
                <button
                  key="one"
                  onPress={captureHookRef(() => {
                    which = 1;
                  }, funnyRef)}
                />
              </>
            )}
          </hstack>
        );
      };

      const handler = new BlocksHandler(component);
      for (let attempts = 0; attempts < 10; attempts++) {
        await handler.handle(getEmptyRequest(), mockMetadata);
        const req = generatePressRequest(funnyRef);
        await handler.handle(req, mockMetadata);
        expect(Object.keys(handler._latestRenderContext?._generated ?? {}).sort()).toEqual(
          [
            'component.hstack.fragment-0.button-one.onPress',
            'component.hstack.fragment-0.button-two.onPress',
          ].sort()
        );
        expect(which).toBe(1);
      }
    });

    test('ids should be insensitive to re-location', async () => {
      let which = 0;

      const component: Devvit.BlockComponent = () => {
        const lol = Math.random() > 0.5;
        return (
          <hstack>
            {lol ? (
              <hstack>
                <button
                  id="one"
                  onPress={captureHookRef(() => {
                    which = 1;
                  }, funnyRef)}
                />
                <button id="two" onPress={() => void (which = 2)} />
              </hstack>
            ) : (
              <>
                <button id="two" onPress={() => void (which = 2)} />
                <button
                  id="one"
                  onPress={captureHookRef(() => {
                    which = 1;
                  }, funnyRef)}
                />
              </>
            )}
          </hstack>
        );
      };
      const handler = new BlocksHandler(component);

      for (let attempts = 0; attempts < 10; attempts++) {
        await handler.handle(getEmptyRequest(), mockMetadata);
        const req = generatePressRequest(funnyRef);
        expect(req.events[0].hook).toEqual('one.onPress');
        await handler.handle(req, mockMetadata);
        expect(which).toBe(1);
      }
    });
  });

  describe('actions handler', () => {
    test('should not call the action handler on initial render', async () => {
      const callback = vi.fn();
      const component = (): JSX.Element => {
        return <button onPress={callback}>Click me</button>;
      };

      const handler: BlocksHandler = new BlocksHandler(component);
      const request: UIRequest = {
        events: [],
      };
      const response = await handler.handle(request, mockMetadata);
      expect(response).toMatchSnapshot();
      expect(callback).not.toHaveBeenCalled();
    });

    test('should call the action handler', async () => {
      const callback = vi.fn();
      const component = (): JSX.Element => {
        return <button onPress={callback}>Click me</button>;
      };

      const handler: BlocksHandler = new BlocksHandler(component);
      const request: UIRequest = {
        events: [],
      };
      await handler.handle(request, mockMetadata);
      const hooks = Object.keys(handler._latestRenderContext?._hooks ?? {});
      expect(hooks.length).toBe(1);

      const action = hooks[0];
      expect(callback).not.toHaveBeenCalled();
      expect(action).toMatchSnapshot();

      const actionRequest: UIRequest = {
        events: [
          {
            scope: UIEventScope.ALL,
            userAction: {
              actionId: action,
            },
            hook: action,
          },
        ],
      };

      await handler.handle(actionRequest, mockMetadata);
      expect(callback).toHaveBeenCalled();
    });

    test('should not throw when children are or become undefined', async () => {
      const component = (): JSX.Element => {
        return <vstack>{undefined}</vstack>;
      };

      const action = 'non-existent-action';
      const request: UIRequest = {
        events: [
          {
            scope: UIEventScope.ALL,
            userAction: {
              actionId: action,
            },
            hook: action,
          },
        ],
      };

      const handler: BlocksHandler = new BlocksHandler(component);
      await handler.handle(request, mockMetadata);
    });
  });

  describe('assertValidNamespace', () => {
    it.each([['useState', 'use', 'use_state']])('%s should pass', (test) => {
      expect(assertValidNamespace(test)).toBeUndefined();
    });

    it.each([['', 'use-state', 'use.state']])('%s should throw', (test) => {
      expect(() => assertValidNamespace(test)).toThrowError();
    });
  });
});
