/** @jsx Devvit.createElement */
/** @jsxFrag Devvit.Fragment */

import { type UIEvent, UIEventScope, type UIRequest, UIResponse } from '@devvit/protos';
import { CircuitBreak } from '@devvit/shared-types/CircuitBreaker.js';

import { Devvit, useState } from '../../../../index.js';
import type { JSONObject, JSONValue } from '../../../../types/json.js';
import { BlocksHandler } from './BlocksHandler.js';
import { captureHookRef } from './refs.js';
import { findHookState, getEmptyRequest, mockMetadata } from './test-helpers.js';
import type { HookRef } from './types.js';
import { useAsync } from './useAsync.js';
let shouldThrow = false;

const loader = async (): Promise<string> => {
  if (shouldThrow) {
    throw CircuitBreak('');
  }
  await setTimeout(() => {}, 10);
  return 'hi world!';
};

const asyncRef: HookRef = {};
const buttonRef: HookRef = {};

const App: Devvit.BlockComponent = () => {
  const [depends, setDepends] = useState(1);
  const { data, error, loading } = captureHookRef(useAsync(loader, { depends }), asyncRef);
  return (
    <hstack>
      <text>{loading ? 'loading' : data || (error ?? 'none').toString()}</text>
      <button onPress={captureHookRef(() => setDepends((d) => d + 1), buttonRef)} />
    </hstack>
  );
};

const NullApp: Devvit.BlockComponent = () => {
  const { data, error, loading } = captureHookRef(
    useAsync(async () => null, { depends: 1 }),
    asyncRef
  );
  return <text>{loading ? 'loading' : data || (error ?? 'none').toString()}</text>;
};

const asyncRequestEvent = (ref: HookRef, depends: JSONValue = 1): UIEvent => {
  return {
    scope: UIEventScope.ALL,
    asyncRequest: { requestId: (ref.id ?? '') + '-' + JSON.stringify(depends) },
    hook: ref.id,
    async: true,
  };
};

const asyncResponseEvent = (ref: HookRef, depends: JSONValue = 1): UIEvent => {
  return {
    scope: UIEventScope.ALL,
    asyncResponse: {
      requestId: (ref.id ?? '') + '-' + JSON.stringify(depends),
      data: { value: 'hi world!' },
      error: undefined,
    },
    hook: ref.id,
  };
};
describe('regressions', () => {
  test('loading null doesnt loop', async () => {
    shouldThrow = true;
    const handler = new BlocksHandler(NullApp);

    let response = await handler.handle(getEmptyRequest(), mockMetadata);
    expect(JSON.stringify(response.blocks)).toContain('loading');
    expect(response.state).toMatchInlineSnapshot(`
      {
        "NullApp.useAsync-0": {
          "data": null,
          "depends": 1,
          "error": null,
          "load_state": "loading",
        },
        "__cache": {},
      }
    `);
    const event = {
      scope: UIEventScope.ALL,
      asyncResponse: {
        requestId: (asyncRef.id ?? '') + '-1',
        data: { value: null },
        error: undefined,
      },
      hook: asyncRef.id,
    };

    const request: UIRequest = { events: [event], state: response.state };
    response = await handler.handle(request, mockMetadata);

    expect(response.state).toMatchInlineSnapshot(`
      {
        "NullApp.useAsync-0": {
          "data": null,
          "depends": 1,
          "error": null,
          "load_state": "loaded",
        },
        "__cache": {},
      }
    `);
    expect(findHookState(asyncRef)).toMatchSnapshot();
    expect(JSON.stringify(response.blocks)).toContain('none');
    expect(response.effects.length).toEqual(0);
    expect(response.events.length).toEqual(0);
  });

  test('getting an undefined data is ok', async () => {
    shouldThrow = true;
    const handler = new BlocksHandler(NullApp);

    let response = await handler.handle(getEmptyRequest(), mockMetadata);
    const event = {
      scope: UIEventScope.ALL,
      asyncResponse: {
        requestId: (asyncRef.id ?? '') + '-1',
        error: { message: 'some error', details: 'some details' },
      },
      hook: asyncRef.id,
    };

    const request: UIRequest = { events: [event], state: response.state };
    response = await handler.handle(request, mockMetadata);

    /**
     * This is a regression test to ensure that the state & data is not set to undefined
     */
    expect(response.state!['NullApp.useAsync-0'].data).toMatchInlineSnapshot(`null`);
  });

  test('event-driven state changes are reflected', async () => {
    const handler = new BlocksHandler(App);
    let request: UIRequest = getEmptyRequest();
    let response = await handler.handle(request, mockMetadata);

    request = {
      events: [
        {
          scope: UIEventScope.ALL,
          userAction: { actionId: buttonRef.id ?? 'wtf' },
          hook: buttonRef.id ?? 'wtf',
        },
      ],
      state: response.state,
    };
    response = await handler.handle(request, mockMetadata);
    expect(response.state!['App.useState-0'].value).toEqual(2);
  });

  test("error response doesn't requeue", async () => {
    const handler = new BlocksHandler(App);
    let request: UIRequest = getEmptyRequest();
    let response = await handler.handle(request, mockMetadata);

    const rspEvent = asyncResponseEvent(asyncRef);
    rspEvent.asyncResponse!.error = { message: 'some other error', details: 'some details' };
    rspEvent.asyncResponse!.data = undefined;

    request = { events: [rspEvent], state: response.state };

    response = await handler.handle(request, mockMetadata);
    expect(response.state).toMatchInlineSnapshot(`
      {
        "App.useAsync-1": {
          "data": null,
          "depends": 1,
          "error": {
            "details": "some details",
            "message": "some other error",
          },
          "load_state": "error",
        },
        "__cache": {},
      }
    `);
    expect(response.events.length).toEqual(0);
  });

  test('multiple useAsyncs can resolve when they are dependent', async () => {
    shouldThrow = true;
    const async1Ref: HookRef = {};
    const async2Ref: HookRef = {};
    const AppUseAsyncs: Devvit.BlockComponent = () => {
      const {
        data: data1,
        error: error1,
        loading: loading1,
      } = captureHookRef(useAsync(loader), async1Ref);
      const {
        data: data2,
        error: error2,
        loading: loading2,
      } = captureHookRef(useAsync(loader, { depends: data1 }), async2Ref);
      return (
        <hstack>
          <text>{loading1 ? 'loading' : data1 || (error1 ?? 'none').toString()}</text>
          <text>{loading2 ? 'loading' : data2 || (error2 ?? 'none').toString()}</text>
        </hstack>
      );
    };

    const handler = new BlocksHandler(AppUseAsyncs);
    const request1: UIRequest = getEmptyRequest();
    const response1 = await handler.handle(request1, mockMetadata);

    expect(response1.state).toMatchInlineSnapshot(`
      {
        "AppUseAsyncs.useAsync-0": {
          "data": null,
          "depends": null,
          "error": null,
          "load_state": "loading",
        },
        "AppUseAsyncs.useAsync-1": {
          "data": null,
          "depends": null,
          "error": null,
          "load_state": "loading",
        },
        "__cache": {},
      }
    `);

    const event = {
      scope: UIEventScope.ALL,
      asyncResponse: {
        requestId: (async1Ref.id ?? '') + '-null',
        data: { value: 'foo' },
        error: undefined,
      },
      hook: async1Ref.id,
    };

    const request2: UIRequest = { events: [event], state: response1.state };
    const response2 = await handler.handle(request2, mockMetadata);

    expect(response2.events).toMatchInlineSnapshot(`
      [
        {
          "async": true,
          "asyncRequest": {
            "requestId": "AppUseAsyncs.useAsync-1-"foo"",
          },
          "hook": "AppUseAsyncs.useAsync-1",
          "scope": 0,
        },
      ]
    `);

    expect(response2.state).toMatchInlineSnapshot(`
      {
        "AppUseAsyncs.useAsync-0": {
          "data": "foo",
          "depends": null,
          "error": null,
          "load_state": "loaded",
        },
        "AppUseAsyncs.useAsync-1": {
          "data": null,
          "depends": "foo",
          "error": null,
          "load_state": "loading",
        },
        "__cache": {},
      }
    `);

    const event3 = {
      scope: UIEventScope.ALL,
      asyncResponse: {
        requestId: (async2Ref.id ?? '') + '-"foo"',
        data: { value: 'bar' },
        error: undefined,
      },
      hook: async2Ref.id,
    };

    const request3: UIRequest = { events: [event3], state: response2.state };
    const response3 = await handler.handle(request3, mockMetadata);

    expect(response3.events).toMatchInlineSnapshot(`[]`);
    expect(response3.state).toMatchInlineSnapshot(`
      {
        "AppUseAsyncs.useAsync-1": {
          "data": "bar",
          "depends": "foo",
          "error": null,
          "load_state": "loaded",
        },
        "__cache": {},
      }
    `);
  });
});

describe('AsyncOptions', () => {
  test('then should execute after async', async () => {
    const AppWithThen: Devvit.BlockComponent = () => {
      const [depends, setDepends] = useState(1);
      const [_count, setCount] = useState(1337);
      const then = (_data: JSONValue | Error) => {
        setCount((c) => c + 1);
      };
      const { data, error, loading } = useAsync(loader, { depends, finally: then });
      return (
        <hstack>
          <text>{loading ? 'loading' : data || (error ?? 'none').toString()}</text>
          <button onPress={captureHookRef(() => setDepends((d) => d + 1), buttonRef)} />
        </hstack>
      );
    };

    shouldThrow = false;
    const handler = new BlocksHandler(AppWithThen);
    let state: JSONObject = {};

    const exhaust = async (request: UIRequest) => {
      let i = 0;
      let response: UIResponse = { events: [], state: {}, effects: [] };
      do {
        if (i++ > 50) {
          throw new Error('infinite loop');
        }
        response = await handler.handle(request, mockMetadata);
        state = { ...state, ...response.state };
        request = { events: response.events, state: structuredClone(state) };
      } while (response.events.length > 0);
      return response;
    };

    await exhaust(getEmptyRequest());

    expect(typeof state['AppWithThen.useState-1']).toBe('object');
    const useState1 = state['AppWithThen.useState-1'] as JSONObject;
    expect(useState1.value).toBe(1338);
  });
});

describe('circuit breaking', () => {
  test('circuit breaking doesnt return the error, it breaks', async () => {
    shouldThrow = true;
    const handler = new BlocksHandler(App);
    let request: UIRequest = getEmptyRequest();
    const response = await handler.handle(request, mockMetadata);

    request = { events: [asyncRequestEvent(asyncRef)], state: response.state };
    await expect(async () => handler.handle(request, mockMetadata)).rejects.toThrowError(
      'ServerCallRequired'
    );
  });
});

describe('invalidation', () => {
  test('changing ids', async () => {
    const handler = new BlocksHandler(App);
    let request: UIRequest = getEmptyRequest();
    let response = await handler.handle(request, mockMetadata);
    expect(response.state).toMatchInlineSnapshot(`
      {
        "App.useAsync-1": {
          "data": null,
          "depends": 1,
          "error": null,
          "load_state": "loading",
        },
        "App.useState-0": {
          "error": null,
          "load_state": "loaded",
          "value": 1,
        },
        "__cache": {},
      }
    `);
    const initialState = response.state;

    // ID unchanged, no new events emitted
    request = { events: [], state: initialState };
    response = await handler.handle(request, mockMetadata);
    expect(response.events.length).toEqual(0);

    //ID changed, new event emitted
    const altered = { ...initialState };
    altered['App.useState-0'] = { value: 'other' };
    request = { events: [], state: altered };
    response = await handler.handle(request, mockMetadata);
    expect(response.events).toEqual([asyncRequestEvent(asyncRef, 'other')]);

    // //ID changed, state also changed, no new event emitted
    // request = { events: [], state: response.state, props: { depends: 1 } };
    // response = await handler.handle(request, mockMetadata);
    // expect(response.events).toEqual([]);
  });

  test('mismatched responses', async () => {
    const handler = new BlocksHandler(App);
    let request: UIRequest = getEmptyRequest();
    let response = await handler.handle(request, mockMetadata);
    const initialState = response.state;

    request = { events: [asyncResponseEvent(asyncRef, 'unknown')], state: initialState };
    response = await handler.handle(request, mockMetadata);
    expect(response.state).toEqual({ __cache: {} }); // nothing changes

    // This one is actually matched up.
    request = { events: [asyncResponseEvent(asyncRef)], state: initialState };
    response = await handler.handle(request, mockMetadata);
    expect(response.state).toMatchInlineSnapshot(`
      {
        "App.useAsync-1": {
          "data": "hi world!",
          "depends": 1,
          "error": null,
          "load_state": "loaded",
        },
        "__cache": {},
      }
    `);
  });
});

describe.each([true, false])(`when circuit-breaking: %s`, (circuitBreaking) => {
  test('initial load', async () => {
    shouldThrow = circuitBreaking;
    const handler = new BlocksHandler(App);

    const response = await handler.handle(getEmptyRequest(), mockMetadata);

    expect(JSON.stringify(response.blocks)).toContain('loading');
    expect(response.events.length).toEqual(1);
    expect(response.events[0]).toEqual(asyncRequestEvent(asyncRef));
  });

  test('receiving request', async () => {
    shouldThrow = false;
    const handler = new BlocksHandler(App);

    let response = await handler.handle(getEmptyRequest(), mockMetadata);

    const request: UIRequest = { events: [asyncRequestEvent(asyncRef)], state: response.state };
    expect(response.state).toMatchSnapshot();
    response = await handler.handle(request, mockMetadata);

    expect(response.blocks).toBeFalsy();
    expect(response.events.length).toEqual(1);
    expect(response.events[0]).toEqual(asyncResponseEvent(asyncRef));
  });

  test('receiving response', async () => {
    shouldThrow = true;
    const handler = new BlocksHandler(App);

    let response = await handler.handle(getEmptyRequest(), mockMetadata);
    expect(JSON.stringify(response.blocks)).toContain('loading');

    const request: UIRequest = { events: [asyncResponseEvent(asyncRef)], state: response.state };
    response = await handler.handle(request, mockMetadata);

    expect(findHookState(asyncRef)).toMatchSnapshot();
    expect(JSON.stringify(response.blocks)).toContain('hi world!');
    expect(response.effects.length).toEqual(0);
  });
});
