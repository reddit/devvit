/** @jsx Devvit.createElement */
/** @jsxFrag Devvit.Fragment */

import { BlockType, type UIRequest } from '@devvit/protos';
import { describe, expect, test, vi } from 'vitest';
import { Devvit } from '../../../Devvit.js';
import { BlocksHandler, assertValidNamespace } from './BlocksHandler.js';
import { captureHookRef } from './refs.js';
import {
  EmptyRequest,
  findHookId,
  findHookValue,
  generatePressRequest,
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
      <button onPress={captureHookRef(() => Promise.reject('error'), negativeRef)}> Nay</button>
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

describe('BlocksHandler', () => {
  describe('regressions', () => {
    test('conditional components should not throw (bonus test)', async () => {
      const handler = new BlocksHandler(ConditionalComponent);
      await handler.handle(EmptyRequest, mockMetadata);
    });

    test('remounting should reset', async () => {
      const handler = new BlocksHandler(ConditionalComponent);
      async function press(ref: HookRef): Promise<void> {
        const req = generatePressRequest(ref);
        await handler.handle(req, mockMetadata);
      }
      await handler.handle(EmptyRequest, mockMetadata);
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
            "value": 0,
          },
          "ConditionalComponent.useState-0": {
            "value": false,
          },
          "__cache": {},
        }
      `);
      await press(toggleRef);
      expect(findHookValue(stateARef)).toEqual(0);
    });
  });

  describe('transformation', () => {
    test('should inject a root element', async () => {
      const callback = vi.fn();
      const component = (): JSX.Element => {
        return <button onPress={callback}>Click me</button>;
      };

      const handler: BlocksHandler = new BlocksHandler(component);
      const response = await handler.handle(EmptyRequest, mockMetadata);
      expect(response.blocks?.type).toEqual(BlockType.BLOCK_ROOT);
      expect(response).toMatchSnapshot();
      expect(callback).not.toHaveBeenCalled();
    });
  });
  describe('event shortcuts', () => {
    test('should emit effects in normal operation', async () => {
      const handler = new BlocksHandler(SomeAsyncComponent);
      const response = await handler.handle(EmptyRequest, mockMetadata);
      expect(JSON.stringify(response.blocks)).toContain('loading');

      expect(response.events.length).toEqual(1);
      expect(response.events[0].asyncRequest).toBeDefined();
    });

    test('should process all futures in blocking SSR mode', async () => {
      const handler = new BlocksHandler(SomeAsyncComponent);
      const response = await handler.handle({ events: [{ blocking: {} }] }, mockMetadata);
      expect(JSON.stringify(response.blocks)).toContain('done');
      expect(response.effects.length).toEqual(0);
      expect(response.events.length).toEqual(0);
    });

    test('should be able to batch events and make progress', async () => {
      const handler = new BlocksHandler(SuccessFail);
      await handler.handle(EmptyRequest, mockMetadata);
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
      await handler.handle(EmptyRequest, mockMetadata);
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
      await handler.handle(EmptyRequest, mockMetadata);
      expect(findHookValue(counter1Ref)).toEqual(0);
      let req = generatePressRequest(negativeRef);
      const nay = req.events[0];
      req = generatePressRequest(positiveRef);
      req.events.push(structuredClone(req.events[0]));
      req.events.push(structuredClone(req.events[0]));
      req.events.push(structuredClone(req.events[0]));
      req.events.unshift(nay);

      await expect(handler.handle(req, mockMetadata)).rejects.toThrow('error');
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
      const request = EmptyRequest;
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
      const request = EmptyRequest;
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
      const request = EmptyRequest;
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
      const request = EmptyRequest;
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
        const rsp = await handler.handle(EmptyRequest, mockMetadata);
        expect(rsp.state![findHookId(counter1Ref)]).toEqual({ value: 0 });
        expect(rsp.state![findHookId(counter2Ref)]).toEqual({ value: 0 });
        expect(findHookValue(counter1Ref)).toBe(0);
        expect(findHookValue(counter2Ref)).toBe(0);
      }

      {
        // press button1.
        const req = generatePressRequest(positiveRef);
        const rsp = await handler.handle(req, mockMetadata);
        expect(rsp.state![findHookId(counter1Ref)]).toEqual({ value: 1 });
        expect(rsp.state![findHookId(counter2Ref)]).toBe(undefined);
        expect(findHookValue(counter1Ref)).toBe(1);
        expect(findHookValue(counter2Ref)).toBe(0);
      }

      {
        // press button2.
        const req = generatePressRequest(negativeRef);
        const rsp = await handler.handle(req, mockMetadata);
        expect(rsp.state![findHookId(counter1Ref)]).toBe(undefined);
        expect(rsp.state![findHookId(counter2Ref)]).toEqual({ value: -1 });
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
      await handler.handle(EmptyRequest, mockMetadata);
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

      expect(rsp.state![findHookId(counter1Ref)]).toEqual({ value: 3 });
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
      0;
      const handler = new BlocksHandler(component);
      for (let attempts = 0; attempts < 10; attempts++) {
        await handler.handle(EmptyRequest, mockMetadata);
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
        await handler.handle(EmptyRequest, mockMetadata);
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
