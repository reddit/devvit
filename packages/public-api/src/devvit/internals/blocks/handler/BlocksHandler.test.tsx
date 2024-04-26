/** @jsx Devvit.createElement */
/** @jsxFrag Devvit.Fragment */

import { BlockType, type UIRequest } from '@devvit/protos';
import { describe, expect, test, vi } from 'vitest';
import { Devvit } from '../../../Devvit.js';
import { BlocksHandler } from './BlocksHandler.js';
import { captureHookRef } from './refs.js';
import type { HookRef } from './types.js';
import { EmptyRequest, findHookState, generatePressRequest, mockMetadata } from './test-helpers.js';
import { useState } from './useState.js';
import { useAsync } from './useAsync.js';

const funnyRef: HookRef = {};

const loader = async (): Promise<string> => {
  await new Promise((resolve) => setTimeout(resolve, 10));

  return 'hi world!';
};

const yayRef: HookRef = {};
const nayRef: HookRef = {};
const counterRef: HookRef = {};

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
  const [_counter, setCounter] = captureHookRef(useState(0), counterRef);
  return (
    <hstack>
      <button onPress={captureHookRef(() => setCounter((c) => c + 1), yayRef)}>Yay</button>
      <button onPress={captureHookRef(() => Promise.reject('error'), nayRef)}> Nay</button>
    </hstack>
  );
};

describe('BlocksHandler', () => {
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

      expect(response.effects.length).toEqual(1);
      expect(response.effects[0].sendEvent?.event?.asyncRequest).toBeDefined();
    });

    test('should process all futures in blocking SSR mode', async () => {
      const handler = new BlocksHandler(SomeAsyncComponent);
      const response = await handler.handle({ events: [{ blocking: {} }] }, mockMetadata);
      expect(JSON.stringify(response.blocks)).toContain('done');
      expect(response.effects.length).toEqual(0);
    });

    test('should be able to batch events and make progress', async () => {
      const handler = new BlocksHandler(SuccessFail);
      await handler.handle(EmptyRequest, mockMetadata);
      expect(findHookState(counterRef)).toEqual(0);
      const req = generatePressRequest(yayRef);
      req.events.push(structuredClone(req.events[0]));
      req.events.push(structuredClone(req.events[0]));
      req.events.push(structuredClone(req.events[0]));
      req.events.push(structuredClone(req.events[0]));
      await handler.handle(req, mockMetadata);
      expect(findHookState(counterRef)).toEqual(5);
    });

    test('should be able to make partial progress', async () => {
      const handler = new BlocksHandler(SuccessFail);
      await handler.handle(EmptyRequest, mockMetadata);
      expect(findHookState(counterRef)).toEqual(0);
      let req = generatePressRequest(nayRef);
      const nay = req.events[0];
      req = generatePressRequest(yayRef);
      req.events.push(structuredClone(req.events[0]));
      req.events.push(structuredClone(req.events[0]));
      req.events.push(nay);
      req.events.push(structuredClone(req.events[0]));

      // yay, yay, yay, NAY, yay
      // 3 successes, one fail, one deferred success
      const response = await handler.handle(req, mockMetadata);
      expect(findHookState(counterRef)).toEqual(3);
      expect(response.effects.length).toEqual(2);
      expect(response.effects[0].sendEvent?.event).toEqual(nay);
      expect(response.effects[1].sendEvent?.event).toEqual(req.events[0]);
      expect(response.effects[1].sendEvent?.jumpsQueue).toEqual(true);
    });

    test('should fail if the first event fails', async () => {
      const handler = new BlocksHandler(SuccessFail);
      await handler.handle(EmptyRequest, mockMetadata);
      expect(findHookState(counterRef)).toEqual(0);
      let req = generatePressRequest(nayRef);
      const nay = req.events[0];
      req = generatePressRequest(yayRef);
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
          ['component.hstack.button-one.onPress', 'component.hstack.button-two.onPress'].sort()
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
});
