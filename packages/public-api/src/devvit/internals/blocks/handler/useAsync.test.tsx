/** @jsx Devvit.createElement */
/** @jsxFrag Devvit.Fragment */

import type { UIEvent, UIRequest } from '@devvit/protos';
import { Devvit } from '../../../../index.js';
import { useAsync } from './useAsync.js';
import type { HookRef } from './types.js';
import { captureHookRef } from './refs.js';
import { BlocksHandler } from './BlocksHandler.js';
import { EmptyRequest, findHookState, mockMetadata } from './test-helpers.js';

let shouldThrow = false;

const loader = async (): Promise<string> => {
  if (shouldThrow) {
    throw new Error('error');
  }
  await setTimeout(() => {}, 10);
  return 'hi world!';
};

const asyncRef: HookRef = {};

const App: Devvit.BlockComponent = () => {
  const { data, error, loading } = captureHookRef(useAsync(loader), asyncRef);
  return (
    <hstack>
      <text>{loading ? 'loading' : data || (error ?? 'none').toString()}</text>
    </hstack>
  );
};

const asyncRequestEvent = (ref: HookRef): UIEvent => {
  return {
    asyncRequest: { requestId: ref.id ?? '' },
    hook: ref.id,
    async: true,
  };
};

const asyncResponseEvent = (ref: HookRef): UIEvent => {
  return {
    asyncResponse: {
      requestId: ref.id ?? '',
      data: { value: 'hi world!' },
      error: undefined,
    },
    hook: ref.id,
  };
};

describe.each([true, false])(`when circuit-breaking: %s`, (circuitBreaking) => {
  test('initial load', async () => {
    shouldThrow = circuitBreaking;
    const handler = new BlocksHandler(App);

    const response = await handler.handle(EmptyRequest, mockMetadata);
    expect(JSON.stringify(response.blocks)).toContain('loading');

    expect(response.effects.length).toEqual(1);
    expect(response.effects[0].sendEvent?.event).toEqual(asyncRequestEvent(asyncRef));
  });

  test('receiving request', async () => {
    shouldThrow = false;
    const handler = new BlocksHandler(App);

    let response = await handler.handle(EmptyRequest, mockMetadata);

    const request: UIRequest = { events: [asyncRequestEvent(asyncRef)], state: response.state };
    expect(response.state).toMatchSnapshot();
    response = await handler.handle(request, mockMetadata);

    expect(response.blocks).toBeFalsy();
    expect(response.effects.length).toEqual(1);
    expect(response.effects[0].sendEvent?.event).toEqual(asyncResponseEvent(asyncRef));
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
