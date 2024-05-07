/** @jsx Devvit.createElement */
/** @jsxFrag Devvit.Fragment */

import type { UIRequest } from '@devvit/protos';
import { describe, expect, test } from 'vitest';
import type { UseStateResult } from '../../../../index.js';
import { Devvit } from '../../../Devvit.js';
import { BlocksHandler } from './BlocksHandler.js';
import { captureHookRef } from './refs.js';
import { EmptyRequest, findHookState, generatePressRequest, mockMetadata } from './test-helpers.js';
import type { HookRef } from './types.js';
import { useAsyncState, useState } from './useState.js';

const syncLegacyComponent: Devvit.BlockComponent = (
  _props: JSX.Props,
  { useState }: Devvit.Context
) => {
  const [state] = useState({ foo: 'bar' });
  return <text>{state.foo}</text>;
};

const deprecatedComponent: Devvit.BlockComponent = (
  _props: JSX.Props,
  { useState }: Devvit.Context
) => {
  const [state] = useState(async () => ({ foo: 'bar' }));
  return <text>{state.foo}</text>;
};

const conditionalComponent: Devvit.BlockComponent = () => {
  const [counter, setCounter] = captureHookRef(useState(0), counterRef);

  let fooValue = '';

  if (counter === 0) {
    const [foo] = useState('bar');
    fooValue = foo;
  }

  return (
    <vstack>
      <text>{counter}</text>
      <text>{fooValue}</text>
      <button
        onPress={() => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setCounter((counter) => (counter > 10 ? (undefined as any) : counter + 1));
        }}
      >
        Increment
      </button>
    </vstack>
  );
};

const multiComponent: Devvit.BlockComponent = () => {
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
};

const asyncComponent: Devvit.BlockComponent = () => {
  const [state] = useAsyncState(async () => {
    return 'hello world';
  });
  return <text>{state}!!</text>;
};

const syncImportComponent: Devvit.BlockComponent = () => {
  const [state] = useState({ foo: 'bar' });
  return <text>{state.foo}</text>;
};

const counterRef: HookRef = {};
const counterButtonRef: HookRef = {};

const counterComponent: Devvit.BlockComponent = () => {
  const [counter, setCounter] = captureHookRef(useState(0), counterRef);
  return (
    <vstack>
      <text>{counter}</text>
      <button
        onPress={captureHookRef(() => setCounter((counter) => counter + 1), counterButtonRef)}
      >
        Increment
      </button>
    </vstack>
  );
};

describe('useState', () => {
  describe('initial state', () => {
    test.each([syncImportComponent, syncLegacyComponent])(
      'uses the given initial state',
      async (c) => {
        const handler = new BlocksHandler(c);
        const response = await handler.handle(EmptyRequest, mockMetadata);

        expect(response.state).toMatchSnapshot();
        expect(JSON.stringify(response.state)).toContain('foo');
        expect(JSON.stringify(response.state)).toContain('bar');
      }
    );

    test('async deprecation displays message', async () => {
      const handler = new BlocksHandler(deprecatedComponent);
      let yay = false;
      try {
        await handler.handle(EmptyRequest, mockMetadata);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        expect(e.message).toContain('useAsyncState instead');
        yay = true;
      }
      expect(yay).toBeTruthy();
    });

    test('async initializer resolves', async () => {
      const handler = new BlocksHandler(asyncComponent);
      const response = await handler.handle(EmptyRequest, mockMetadata);

      expect(response.state).toMatchSnapshot();
      expect(response.events.length).toEqual(1);
      expect(response.blocks).toBeUndefined();

      const event = response.events[0];
      expect(event?.async).toBeFalsy();
      const next: UIRequest = {
        events: [event],
        state: response.state,
      };
      const nextResponse = await handler.handle(next, mockMetadata);
      expect(nextResponse.events.length).toEqual(0);
      expect(JSON.stringify(nextResponse.blocks ?? '')).toContain('hello world');
    });
  });
});

describe('state setter', () => {
  test('updates the value given a new value', async () => {
    const handler = new BlocksHandler(counterComponent);
    await handler.handle(EmptyRequest, mockMetadata);
    expect(findHookState(counterRef)).toEqual(0);
    let req = generatePressRequest(counterButtonRef);
    await handler.handle(req, mockMetadata);
    expect(findHookState(counterRef)).toEqual(1);
    req = generatePressRequest(counterButtonRef);
    await handler.handle(req, mockMetadata);
    expect(findHookState(counterRef)).toEqual(2);
    req = generatePressRequest(counterButtonRef);
    await handler.handle(req, mockMetadata);
    expect(findHookState(counterRef)).toEqual(3);
  });

  test('can be used multiple times in a component', async () => {
    const handler = new BlocksHandler(multiComponent);
    const response = await handler.handle(EmptyRequest, mockMetadata);
    expect(response.state).toMatchSnapshot();
    expect(JSON.stringify(response.state)).toContain('0');
    expect(JSON.stringify(response.state)).toContain('bar');
    expect(JSON.stringify(response.state)).toContain('world');
  });

  test('must not be used outside of a component', async () => {
    expect(() => useState(0)).toThrowError();
  });

  test('must not be used conditionally', async () => {
    // No longer enforced in code.
  });
  test('handles void or undefined values properly', async () => {
    const handler = new BlocksHandler(conditionalComponent);
    await handler.handle(EmptyRequest, mockMetadata);
    expect(findHookState(counterRef)).toEqual(0);
    for (let i = 0; i < 15; i++) {
      const req = generatePressRequest(counterButtonRef);
      await handler.handle(req, mockMetadata);
    }
    expect(findHookState(counterRef)).toEqual(0);
  });

  test('typing is intuitive', () => {
    const _foo: Devvit.BlockComponent = (_props: JSX.Props) => {
      type Foo = {
        bar: string;
      };
      const foo: Foo = { bar: 'abc' };

      useState([1]) satisfies UseStateResult<number[]>;

      // @ts-expect-error
      useState(undefined);
      useState('abc');
      useState(1);
      useState(false);
      useState(null);
      useState([]);
      useState({});
      useState({ a: 123 }) satisfies UseStateResult<{ a: number }>;
      useState([{ a: 123 }, 1, null]);
      useState(foo);
      // @ts-expect-error
      useState(() => undefined);
      useState(() => 'abc');
      useState(() => 1);
      useState(() => false);
      useState(() => null);
      useState(() => []);
      useState(() => ({}));
      useState(() => foo);
      // @ts-expect-error
      useState(Promise.resolve(null));
      // @ts-expect-error
      useState(() => Promise.resolve(undefined));
      // @ts-expect-error
      useState(() => Promise.resolve('abc'));
      // @ts-expect-error
      useState(() => Promise.resolve(1));
      // @ts-expect-error
      useState(() => Promise.resolve(false));
      // @ts-expect-error
      useState(() => Promise.resolve(null));
      // @ts-expect-error
      useState(() => Promise.resolve([]));
      // @ts-expect-error
      useState(() => Promise.resolve({}));
      // @ts-expect-error
      useState(() => Promise.resolve(foo));
      // @ts-expect-error
      useState(new (class {})());
      // @ts-expect-error
      useState(new Map());
      // @ts-expect-error
      useState(new Set());
      // @ts-expect-error
      useState(new Date());
      // @ts-expect-error
      useState(() => Promise.resolve(new (class {})()));
      // @ts-expect-error
      useState(() => Promise.resolve(new Map()));
      // @ts-expect-error
      useState(() => Promise.resolve(new Set()));
      // @ts-expect-error
      useState(() => Promise.resolve(new Date()));
      return <text />;
    };
  });
});
