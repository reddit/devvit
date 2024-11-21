/** @jsx Devvit.createElement */
/** @jsxFrag Devvit.Fragment */

import type { IntervalDetails, UIResponse } from '@devvit/protos';
import { EffectType } from '@devvit/protos';
import { Header } from '@devvit/shared-types/Header.js';
import { describe, expect, test } from 'vitest';

import { Devvit } from '../../../Devvit.js';
import { BlocksHandler } from './BlocksHandler.js';
import { captureHookRef } from './refs.js';
import { generatePressRequest, generateTimerRequest, getEmptyRequest } from './test-helpers.js';
import type { HookRef } from './types.js';
import { useInterval } from './useInterval.js';
import { useState } from './useState.js';

const counterRef: HookRef = {};
const intervalRef: HookRef = {};
const intervalAgainRef: HookRef = {};
const stateRef: HookRef = {};
const startRef: HookRef = {};
const stopRef: HookRef = {};

const oneSecond: IntervalDetails = { duration: { seconds: 1, nanos: 0 } };
const mostSecond: IntervalDetails = { duration: { seconds: 0, nanos: 700_000_000 } };

const SillyInterval: Devvit.BlockComponent = () => {
  const interval = captureHookRef(
    useInterval(() => console.log('hi'), 1000),
    intervalRef
  );
  interval.start();

  return <vstack />;
};

const MountUnmount: Devvit.BlockComponent = () => {
  const [child, setChild] = useState(true);
  return (
    <vstack>
      {child && <SillyInterval />}
      <button
        onPress={captureHookRef(() => {
          setChild(true);
        }, startRef)}
      >
        Start
      </button>
      <button onPress={captureHookRef(() => setChild(false), stopRef)}>Stop</button>
    </vstack>
  );
};

const component: Devvit.BlockComponent = () => {
  const [state] = captureHookRef(useState({ foo: 'bar' }), stateRef);
  const [count, setCount] = captureHookRef(useState(0), counterRef);
  const interval = captureHookRef(
    useInterval(() => setCount((count) => count + 1), 1000),
    intervalRef
  );

  const intervalAgain = captureHookRef(
    useInterval(() => setCount((count) => count + 1), 700),
    intervalAgainRef
  );

  return (
    <vstack>
      <text>
        {state.foo} {count}
      </text>
      <button
        onPress={captureHookRef(() => {
          interval.start();
          intervalAgain.start();
        }, startRef)}
      >
        Start
      </button>
      <button onPress={captureHookRef(() => interval.stop(), stopRef)}>Stop</button>
    </vstack>
  );
};

const startInRender: Devvit.BlockComponent = () => {
  const interval = captureHookRef(
    useInterval(() => console.log('hi!'), 1000),
    intervalRef
  );
  interval.start();

  return <vstack />;
};

function timerEffectsIn(response: UIResponse, ref: HookRef): (IntervalDetails | null)[] {
  const effects = response.effects.filter((e) => e.type === EffectType.EFFECT_SET_INTERVALS);

  return effects.flatMap((effect) => {
    const delay = effect.interval?.intervals[ref.id!];
    if (!delay) {
      return [null];
    }
    return [delay];
  });
}

describe('useInterval', () => {
  test('initial state is stopped', async () => {
    const handler = new BlocksHandler(component);
    const response = await handler.handle(getEmptyRequest(), mockMetadata);

    expect(response.state).toMatchSnapshot();
    console.log(response.effects);
    expect(response.effects.length).toBe(0);
  });

  test('you can start inside the render', async () => {
    const handler = new BlocksHandler(startInRender);
    const response = await handler.handle(getEmptyRequest(), mockMetadata);

    expect(response.state).toMatchSnapshot();
    expect(response.effects.length).toBe(1);
    const effect = response.effects[0];
    expect(effect.type).toBe(EffectType.EFFECT_SET_INTERVALS);
    expect(Object.keys(effect.interval!.intervals).length).toEqual(1);
    expect(effect.interval).toMatchSnapshot();
  });

  test('you can start from an event', async () => {
    const handler = new BlocksHandler(component);
    let response = await handler.handle(getEmptyRequest(), mockMetadata);
    expect(response.effects.length).toBe(0);

    const req = generatePressRequest(startRef);
    response = await handler.handle(req, mockMetadata);
    expect(timerEffectsIn(response, intervalRef)).toEqual([oneSecond]);
  });

  test('you can start and stop from an event', async () => {
    const handler = new BlocksHandler(component);
    let response = await handler.handle(getEmptyRequest(), mockMetadata);
    expect(response.effects.length).toBe(0);

    const req = generatePressRequest(startRef);
    const tmp = generatePressRequest(stopRef);
    req.events.push(tmp.events[0]);
    response = await handler.handle(req, mockMetadata);
    expect(timerEffectsIn(response, intervalRef)).toEqual([null]);
  });

  test('you can start and stop from an event', async () => {
    const handler = new BlocksHandler(component);
    let response = await handler.handle(getEmptyRequest(), mockMetadata);
    expect(response.effects.length).toBe(0);

    const req = generatePressRequest(stopRef);
    const tmp = generatePressRequest(startRef);
    req.events.push(tmp.events[0]);
    response = await handler.handle(req, mockMetadata);
    expect(timerEffectsIn(response, intervalRef)).toEqual([oneSecond]);
  });

  test('multiple timers', async () => {
    const handler = new BlocksHandler(component);
    let response = await handler.handle(getEmptyRequest(), mockMetadata);
    expect(response.effects.length).toBe(0);
    const req = generatePressRequest(startRef);
    response = await handler.handle(req, mockMetadata);
    expect(timerEffectsIn(response, intervalRef)).toEqual([oneSecond]);
    expect(timerEffectsIn(response, intervalAgainRef)).toEqual([mostSecond]);
  });

  test('stops timer if unmounted', async () => {
    const handler = new BlocksHandler(MountUnmount);
    let response = await handler.handle(getEmptyRequest(), mockMetadata);
    expect(response.effects.length).toBe(1);
    expect(timerEffectsIn(response, intervalRef)).toEqual([oneSecond]);
    let req = generatePressRequest(stopRef);
    response = await handler.handle(req, mockMetadata);
    req = generateTimerRequest(intervalRef);
    response = await handler.handle(req, mockMetadata);
    expect(timerEffectsIn(response, intervalRef)).toEqual([null]);
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
