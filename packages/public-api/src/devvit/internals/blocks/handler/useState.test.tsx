/** @jsx Devvit.createElement */
/** @jsxFrag Devvit.Fragment */
import { describe, expect, test } from 'vitest';

import type { UseStateResult } from '../../../../index.js';
import { Devvit } from '../../../Devvit.js';
import { BlocksHandler } from './BlocksHandler.js';
import { captureHookRef } from './refs.js';
import {
  findHookState,
  generatePressRequest,
  getEmptyRequest,
  mockMetadata,
} from './test-helpers.js';
import type { HookRef } from './types.js';
import { useState } from './useState.js';

const syncLegacyComponent: Devvit.BlockComponent = (
  _props: JSX.Props,
  { useState }: Devvit.Context
) => {
  const [state] = useState({ foo: 'bar' });
  return <text>{state.foo}</text>;
};

const objectComponent: Devvit.BlockComponent = (
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
  const [state] = useState(async () => {
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
        const response = await handler.handle(getEmptyRequest(), mockMetadata);

        expect(response.state).toMatchSnapshot();
        expect(JSON.stringify(response.state)).toContain('foo');
        expect(JSON.stringify(response.state)).toContain('bar');
      }
    );

    test('state isnt null while async request in flight ', async () => {
      const handler = new BlocksHandler(objectComponent);
      await handler.handle(getEmptyRequest(), mockMetadata);
    });

    test('async initializer resolves', async () => {
      const handler = new BlocksHandler(asyncComponent);
      const response = await handler.handle(getEmptyRequest(), mockMetadata);

      expect(JSON.stringify(response.blocks ?? '')).toContain('hello world');
    });

    test('sync initializer that throws fails', async () => {
      const component: Devvit.BlockComponent = (_: JSX.Props, { useState }: Devvit.Context) => {
        const [state] = useState<string>(() => {
          throw Error('message');
        });
        return <text>{state}</text>;
      };

      const handler = new BlocksHandler(component);
      await expect(handler.handle(getEmptyRequest(), mockMetadata)).rejects.toThrow(
        'Unknown error'
      ); // to-do: toThrow('message').
    });

    test('async initializer that throws fails', async () => {
      const component: Devvit.BlockComponent = (_: JSX.Props, { useState }: Devvit.Context) => {
        const [state] = useState<string>(async () => {
          throw Error('message');
        });
        return <text>{state}</text>;
      };

      const handler = new BlocksHandler(component);
      await expect(handler.handle(getEmptyRequest(), mockMetadata)).rejects.toThrow('message');
    });
  });
});

describe('state setter', () => {
  test('updates the value given a new value', async () => {
    const handler = new BlocksHandler(counterComponent);
    await handler.handle(getEmptyRequest(), mockMetadata);
    expect(findHookState(counterRef)).toEqual({ value: 0, load_state: 'loaded', error: null });
    let req = generatePressRequest(counterButtonRef);
    await handler.handle(req, mockMetadata);
    expect(findHookState(counterRef)).toEqual({ value: 1, load_state: 'loaded', error: null });
    req = generatePressRequest(counterButtonRef);
    await handler.handle(req, mockMetadata);
    expect(findHookState(counterRef)).toEqual({ value: 2, load_state: 'loaded', error: null });
    req = generatePressRequest(counterButtonRef);
    await handler.handle(req, mockMetadata);
    expect(findHookState(counterRef)).toEqual({ value: 3, load_state: 'loaded', error: null });
  });

  test('can be used multiple times in a component', async () => {
    const handler = new BlocksHandler(multiComponent);
    const response = await handler.handle(getEmptyRequest(), mockMetadata);
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
    await handler.handle(getEmptyRequest(), mockMetadata);
    expect(findHookState(counterRef)).toEqual({ value: 0, load_state: 'loaded', error: null });
    for (let i = 0; i < 15; i++) {
      const req = generatePressRequest(counterButtonRef);
      await handler.handle(req, mockMetadata);
    }
    expect(findHookState(counterRef)).toEqual({ value: 0, load_state: 'loaded', error: null });
  });

  test('typing is intuitive', () => {
    const _foo: Devvit.BlockComponent = (_props: JSX.Props) => {
      type Foo = {
        bar: string;
      };
      const foo: Foo = { bar: 'abc' };

      useState([1]) satisfies UseStateResult<number[]>;

      // @ts-expect-error test bad type.
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
      // @ts-expect-error test bad type.
      useState(() => undefined);
      useState(() => 'abc');
      useState(() => 1);
      useState(() => false);
      useState(() => null);
      useState(() => []);
      useState(() => ({}));
      useState(() => foo);
      // @ts-expect-error test bad type.
      useState(Promise.resolve(null));
      // @ts-expect-error test bad type.
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
    };
  });
});
