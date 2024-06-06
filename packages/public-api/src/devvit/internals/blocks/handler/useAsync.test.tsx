/** @jsx Devvit.createElement */
/** @jsxFrag Devvit.Fragment */

import type { UIEvent, UIRequest } from '@devvit/protos';
import { Devvit, useState } from '../../../../index.js';
import type { JSONValue } from '@devvit/shared-types/json.js';
import { useAsync } from './useAsync.js';
import type { HookRef } from './types.js';
import { captureHookRef } from './refs.js';
import { BlocksHandler } from './BlocksHandler.js';
import { EmptyRequest, findHookState, mockMetadata } from './test-helpers.js';
import { CircuitBreak } from '@devvit/shared-types/CircuitBreaker.js';
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
  const [enabled, _] = useState(true);
  const { data, error, loading } = captureHookRef(useAsync(loader, { depends, enabled }), asyncRef);
  return (
    <hstack>
      <text>{loading ? 'loading' : data || (error ?? 'none').toString()}</text>
      <button onPress={captureHookRef(() => setDepends((d) => d + 1), buttonRef)} />
    </hstack>
  );
};

const asyncRequestEvent = (ref: HookRef, depends: JSONValue = 1): UIEvent => {
  return {
    asyncRequest: { requestId: (ref.id ?? '') + '-' + JSON.stringify(depends) },
    hook: ref.id,
    async: true,
  };
};

const asyncResponseEvent = (ref: HookRef, depends: JSONValue = 1): UIEvent => {
  return {
    asyncResponse: {
      requestId: (ref.id ?? '') + '-' + JSON.stringify(depends),
      data: { value: 'hi world!' },
      error: undefined,
    },
    hook: ref.id,
  };
};
describe('regressions', () => {
  test('enabled doesnt do anything', async () => {
    const handler = new BlocksHandler(App);
    const request: UIRequest = structuredClone(EmptyRequest);
    request.state = { 'App.useState-1': false };
    const response = await handler.handle(request, mockMetadata);
    expect(response.events).toEqual([]);
  });

  test('event-driven state changes are reflected', async () => {
    const handler = new BlocksHandler(App);
    let request: UIRequest = EmptyRequest;
    let response = await handler.handle(request, mockMetadata);

    request = {
      events: [
        {
          userAction: { actionId: buttonRef.id ?? 'wtf' },
          hook: buttonRef.id ?? 'wtf',
        },
      ],
      state: response.state,
    };
    response = await handler.handle(request, mockMetadata);
    expect(response.state!['App.useState-0']).toEqual(2);
    expect(response.events).toEqual([asyncRequestEvent(asyncRef, 2)]);
  });

  test("error response doesn't requeue", async () => {
    const handler = new BlocksHandler(App);
    let request: UIRequest = EmptyRequest;
    let response = await handler.handle(request, mockMetadata);

    const rspEvent = asyncResponseEvent(asyncRef);
    rspEvent.asyncResponse!.error = { message: 'some other error', details: 'some details' };
    rspEvent.asyncResponse!.data = undefined;

    request = { events: [rspEvent], state: response.state };

    response = await handler.handle(request, mockMetadata);
    expect(response.state).toMatchInlineSnapshot(`
      {
        "App.useAsync-2": {
          "data": undefined,
          "depends": 1,
          "error": {
            "details": "some details",
            "message": "some other error",
          },
          "loading": false,
        },
      }
    `);
    expect(response.events.length).toEqual(0);
  });
});

describe('circuit breaking', () => {
  test('circuit breaking doesnt return the error, it breaks', async () => {
    shouldThrow = true;
    const handler = new BlocksHandler(App);
    let request: UIRequest = EmptyRequest;
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
    let request: UIRequest = EmptyRequest;
    let response = await handler.handle(request, mockMetadata);
    expect(response.state).toMatchInlineSnapshot(`
      {
        "App.useAsync-2": {
          "data": null,
          "depends": 1,
          "error": null,
          "loading": true,
        },
        "App.useState-0": 1,
        "App.useState-1": true,
      }
    `);
    const initialState = response.state;

    // ID unchanged, no new events emitted
    request = { events: [], state: initialState };
    response = await handler.handle(request, mockMetadata);
    expect(response.events.length).toEqual(0);

    //ID changed, new event emitted
    const altered = { ...initialState };
    altered['App.useState-0'] = 'other';
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
    let request: UIRequest = EmptyRequest;
    let response = await handler.handle(request, mockMetadata);
    const initialState = response.state;

    request = { events: [asyncResponseEvent(asyncRef, 'unknown')], state: initialState };
    response = await handler.handle(request, mockMetadata);
    expect(response.state).toEqual({}); // nothing changes

    // This one is actually matched up.
    request = { events: [asyncResponseEvent(asyncRef)], state: initialState };
    response = await handler.handle(request, mockMetadata);
    expect(response.state).toMatchInlineSnapshot(`
      {
        "App.useAsync-2": {
          "data": "hi world!",
          "depends": 1,
          "error": null,
          "loading": false,
        },
      }
    `);
  });
});

describe.each([true, false])(`when circuit-breaking: %s`, (circuitBreaking) => {
  test('initial load', async () => {
    shouldThrow = circuitBreaking;
    const handler = new BlocksHandler(App);

    const response = await handler.handle(EmptyRequest, mockMetadata);

    expect(JSON.stringify(response.blocks)).toContain('loading');
    expect(response.events.length).toEqual(1);
    expect(response.events[0]).toEqual(asyncRequestEvent(asyncRef));
  });

  test('receiving request', async () => {
    shouldThrow = false;
    const handler = new BlocksHandler(App);

    let response = await handler.handle(EmptyRequest, mockMetadata);

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

    let response = await handler.handle(EmptyRequest, mockMetadata);
    expect(JSON.stringify(response.blocks)).toContain('loading');

    const request: UIRequest = { events: [asyncResponseEvent(asyncRef)], state: response.state };
    response = await handler.handle(request, mockMetadata);

    expect(findHookState(asyncRef)).toMatchSnapshot();
    expect(JSON.stringify(response.blocks)).toContain('hi world!');
    expect(response.effects.length).toEqual(0);
  });
});
