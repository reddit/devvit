import { RealtimeSubscriptionStatus } from '@devvit/protos';
import { Header } from '@devvit/shared-types/Header.js';
import { expect, test } from 'vitest';
import { Devvit } from '../../../Devvit.js';
import { BlocksHandler } from './BlocksHandler.js';
import { captureHookRef } from './refs.js';
import { generatePressRequest, getLatestBlocksState } from './test-helpers.js';
import type { HookRef } from './types.js';
import { useChannel } from './useChannel.js';

const meta = {
  [Header.AppUser]: {
    values: ['t2_appuser'],
  },
  [Header.Subreddit]: {
    values: ['t5_devvit'],
  },
  [Header.App]: {
    values: ['app'],
  },
  [Header.Installation]: {
    values: ['install'],
  },
};

for (const channel of ['', 'Channel.', 'Channel-']) {
  test(`channels must have valid names: "${channel}"`, async () => {
    const Component = (): JSX.Element => {
      useChannel({ name: channel, onMessage() {} });
      return <vstack />;
    };

    const handler = new BlocksHandler(Component);
    await expect(handler.handle({ events: [] }, meta)).rejects.toThrow(
      'useChannel error: channel names must be nonempty and alphanumeric'
    );
  });
}

test('channels must be unique', async () => {
  const Component = (): JSX.Element => {
    useChannel({ name: 'Channel', onMessage() {} });
    useChannel({ name: 'Channel', onMessage() {} });
    return <vstack />;
  };

  const handler = new BlocksHandler(Component);
  await expect(handler.handle({ events: [] }, meta)).rejects.toThrow(
    'useChannel error: channel names must be unique'
  );
});

test('initial state is unsubscribed', async () => {
  const Component = (): JSX.Element => {
    useChannel({ name: 'Channel', onMessage() {} });
    return <vstack />;
  };

  const handler = new BlocksHandler(Component);
  const rsp = await handler.handle({ events: [] }, meta);

  expect(rsp.effects).toMatchInlineSnapshot(`[]`);
  expect(rsp.state).toMatchInlineSnapshot(`
    {
      "Component.useChannel:Channel-0": {
        "channel": "app:install:Channel",
        "connected": false,
        "subscribed": false,
      },
    }
  `);
});

test('subscribe sets channel to subscribed', async () => {
  const Component = (): JSX.Element => {
    const channel = useChannel({ name: 'Channel', onMessage() {} });
    channel.subscribe();
    return <vstack />;
  };

  const handler = new BlocksHandler(Component);

  const rsp = await handler.handle({ events: [] }, meta);
  expect(rsp.effects).toMatchInlineSnapshot(`
    [
      {
        "realtimeSubscriptions": {
          "subscriptionIds": [
            "app:install:Channel",
          ],
        },
        "type": 0,
      },
    ]
  `);
  expect(rsp.state).toMatchInlineSnapshot(`
    {
      "Component.useChannel:Channel-0": {
        "channel": "app:install:Channel",
        "connected": false,
        "subscribed": true,
      },
    }
  `);
});

// the subscribe() method is an unwanted pattern because render is more like a
// render loop where all the code is reexcuted. just documenting the
// shortcoming.
test('unsubscribe in an event does nothing if subscribing in render loop', async () => {
  const buttonRef = {};
  const Component = (): JSX.Element => {
    const channel = useChannel({ name: 'Channel', onMessage() {} });
    channel.subscribe();

    return (
      <button
        onPress={captureHookRef(() => {
          channel.unsubscribe();
        }, buttonRef)}
      />
    );
  };

  const handler = new BlocksHandler(Component);

  {
    const rsp = await handler.handle({ events: [] }, meta);
    expect(rsp.effects).toMatchInlineSnapshot(`
      [
        {
          "realtimeSubscriptions": {
            "subscriptionIds": [
              "app:install:Channel",
            ],
          },
          "type": 0,
        },
      ]
    `);
    expect(rsp.state).toMatchInlineSnapshot(`
      {
        "Component.useChannel:Channel-0": {
          "channel": "app:install:Channel",
          "connected": false,
          "subscribed": true,
        },
      }
    `);
  }

  {
    const rsp = await handler.handle(generatePressRequest(buttonRef), meta);
    expect(rsp.effects).toMatchInlineSnapshot(`
      [
        {
          "realtimeSubscriptions": {
            "subscriptionIds": [
              "app:install:Channel",
            ],
          },
          "type": 0,
        },
      ]
    `);
    expect(rsp.state).toMatchInlineSnapshot(`
      {
        "Component.useChannel:Channel-0": {
          "channel": "app:install:Channel",
          "connected": false,
          "subscribed": true,
        },
      }
    `);
  }
});

test('resubscribe is ignored', async () => {
  // eslint-disable-next-line sonarjs/no-identical-functions
  const Component = (): JSX.Element => {
    const channel = useChannel({ name: 'Channel', onMessage() {} });
    channel.subscribe();
    return <vstack />;
  };

  const handler = new BlocksHandler(Component);

  {
    const rsp = await handler.handle({ events: [] }, meta);
    expect(rsp.effects).toMatchInlineSnapshot(`
      [
        {
          "realtimeSubscriptions": {
            "subscriptionIds": [
              "app:install:Channel",
            ],
          },
          "type": 0,
        },
      ]
    `);
    expect(rsp.state).toMatchInlineSnapshot(`
      {
        "Component.useChannel:Channel-0": {
          "channel": "app:install:Channel",
          "connected": false,
          "subscribed": true,
        },
      }
    `);
  }

  {
    const rsp = await handler.handle({ events: [], state: getLatestBlocksState() }, meta);
    expect(rsp.effects).toMatchInlineSnapshot(`[]`);
    expect(rsp.state).toMatchInlineSnapshot(`{}`);
  }
});

test('un/subscribe from an event sets channel to un/subscribed', async () => {
  const unsubscribeRef = {};
  const subscribeRef = {};
  const Component = (): JSX.Element => {
    const channel = useChannel({ name: 'Channel', onMessage() {} });

    return (
      <vstack>
        <button
          onPress={captureHookRef(() => {
            channel.subscribe();
          }, subscribeRef)}
        />
        <button
          onPress={captureHookRef(() => {
            channel.unsubscribe();
          }, unsubscribeRef)}
        />
      </vstack>
    );
  };

  const handler = new BlocksHandler(Component);

  {
    const rsp = await handler.handle({ events: [], state: getLatestBlocksState() }, meta);
    expect(rsp.effects).toMatchInlineSnapshot(`[]`);
    expect(rsp.state).toMatchInlineSnapshot(`
      {
        "Component.useChannel:Channel-0": {
          "channel": "app:install:Channel",
          "connected": false,
          "subscribed": false,
        },
      }
    `);
  }

  {
    const rsp = await handler.handle(generatePressRequest(subscribeRef), meta);
    expect(rsp.effects).toMatchInlineSnapshot(`
      [
        {
          "realtimeSubscriptions": {
            "subscriptionIds": [
              "app:install:Channel",
            ],
          },
          "type": 0,
        },
      ]
    `);
    expect(rsp.state).toMatchInlineSnapshot(`
      {
        "Component.useChannel:Channel-0": {
          "channel": "app:install:Channel",
          "connected": false,
          "subscribed": true,
        },
      }
    `);
  }

  {
    const rsp = await handler.handle(generatePressRequest(unsubscribeRef), meta);
    expect(rsp.effects).toMatchInlineSnapshot(`
      [
        {
          "realtimeSubscriptions": {
            "subscriptionIds": [],
          },
          "type": 0,
        },
      ]
    `);
    expect(rsp.state).toMatchInlineSnapshot(`
      {
        "Component.useChannel:Channel-0": {
          "channel": "app:install:Channel",
          "connected": false,
          "subscribed": false,
        },
      }
    `);
  }
});

test('un/subscribe event invokes callback', async () => {
  const channelRef: HookRef = {};
  const onSubscribed = vi.fn();
  const onUnsubscribed = vi.fn();
  const Component = (): JSX.Element => {
    const channel = captureHookRef(
      useChannel({ name: 'Channel', onMessage() {}, onSubscribed, onUnsubscribed }),
      channelRef
    );
    channel.subscribe();
    return <vstack />;
  };

  const handler = new BlocksHandler(Component);

  {
    // initial render to prime channelRef.
    const rsp = await handler.handle({ events: [], state: getLatestBlocksState() }, meta);
    expect(rsp.effects).toMatchInlineSnapshot(`
      [
        {
          "realtimeSubscriptions": {
            "subscriptionIds": [
              "app:install:Channel",
            ],
          },
          "type": 0,
        },
      ]
    `);
    expect(rsp.state).toMatchInlineSnapshot(`
      {
        "Component.useChannel:Channel-0": {
          "channel": "app:install:Channel",
          "connected": false,
          "subscribed": true,
        },
      }
    `);
    expect(onSubscribed).toBeCalledTimes(0);
    expect(onUnsubscribed).toBeCalledTimes(0);
  }

  {
    const rsp = await handler.handle(
      {
        events: [
          {
            hook: channelRef.id,
            realtimeEvent: {
              event: { channel: 'app:install:Channel' },
              status: RealtimeSubscriptionStatus.REALTIME_SUBSCRIBED,
            },
          },
        ],
        state: getLatestBlocksState(),
      },
      meta
    );
    expect(rsp.effects).toMatchInlineSnapshot(`[]`);
    expect(rsp.state).toMatchInlineSnapshot(`
      {
        "Component.useChannel:Channel-0": {
          "channel": "app:install:Channel",
          "connected": true,
          "subscribed": true,
        },
      }
    `);
    expect(onSubscribed).toBeCalledTimes(1);
    expect(onUnsubscribed).toBeCalledTimes(0);
  }

  {
    const rsp = await handler.handle(
      {
        events: [
          {
            hook: channelRef.id,
            realtimeEvent: {
              event: { channel: 'app:install:Channel' },
              status: RealtimeSubscriptionStatus.REALTIME_UNSUBSCRIBED,
            },
          },
        ],
        state: getLatestBlocksState(),
      },
      meta
    );
    expect(rsp.effects).toMatchInlineSnapshot(`[]`);
    expect(rsp.state).toMatchInlineSnapshot(`
      {
        "Component.useChannel:Channel-0": {
          "channel": "app:install:Channel",
          "connected": false,
          "subscribed": true,
        },
      }
    `);
    expect(onSubscribed).toBeCalledTimes(1);
    expect(onUnsubscribed).toBeCalledTimes(1);
  }
});

test('message event invokes callback', async () => {
  const channelRef: HookRef = {};
  const onMessage = vi.fn();
  const Component = (): JSX.Element => {
    const channel = captureHookRef(useChannel({ name: 'Channel', onMessage }), channelRef);
    channel.subscribe();
    return <vstack />;
  };

  const handler = new BlocksHandler(Component);

  await handler.handle({ events: [], state: getLatestBlocksState() }, meta);
  await handler.handle(
    {
      events: [
        {
          hook: channelRef.id,
          realtimeEvent: {
            event: { channel: 'app:install:Channel' },
            status: RealtimeSubscriptionStatus.REALTIME_SUBSCRIBED,
          },
        },
      ],
      state: getLatestBlocksState(),
    },
    meta
  );

  const rsp = await handler.handle(
    {
      events: [
        {
          hook: channelRef.id,
          realtimeEvent: {
            event: { channel: 'app:install:Channel', data: 'data' },
          },
        },
      ],
      state: getLatestBlocksState(),
    },
    meta
  );
  expect(rsp.effects).toMatchInlineSnapshot(`[]`);
  expect(rsp.state).toMatchInlineSnapshot(`{}`);
  expect(onMessage).toBeCalledTimes(1);
  expect(onMessage).toBeCalledWith('data');
});

test('two channels', async () => {
  const channelARef: HookRef = {};
  const channelBRef: HookRef = {};
  const onMessageA = vi.fn();
  const onSubscribedA = vi.fn();
  const onUnsubscribedA = vi.fn();
  const onMessageB = vi.fn();
  const onSubscribedB = vi.fn();
  const onUnsubscribedB = vi.fn();

  const Component = (): JSX.Element => {
    const channelA = captureHookRef(
      useChannel({
        name: 'ChannelA',
        onMessage: onMessageA,
        onSubscribed: onSubscribedA,
        onUnsubscribed: onUnsubscribedA,
      }),
      channelARef
    );
    const channelB = captureHookRef(
      useChannel({
        name: 'ChannelB',
        onMessage: onMessageB,
        onSubscribed: onSubscribedB,
        onUnsubscribed: onUnsubscribedB,
      }),
      channelBRef
    );
    channelA.subscribe();
    channelB.subscribe();
    return <vstack />;
  };

  const handler = new BlocksHandler(Component);

  await handler.handle({ events: [], state: getLatestBlocksState() }, meta);

  {
    const rsp = await handler.handle(
      {
        events: [
          {
            hook: channelARef.id,
            realtimeEvent: {
              event: { channel: 'app:install:ChannelA' },
              status: RealtimeSubscriptionStatus.REALTIME_SUBSCRIBED,
            },
          },
        ],
        state: getLatestBlocksState(),
      },
      meta
    );
    expect(rsp.effects).toMatchInlineSnapshot(`[]`);
    expect(rsp.state).toMatchInlineSnapshot(`
      {
        "Component.useChannel:ChannelA-0": {
          "channel": "app:install:ChannelA",
          "connected": true,
          "subscribed": true,
        },
      }
    `);
    expect(onMessageA).toBeCalledTimes(0);
    expect(onSubscribedA).toBeCalledTimes(1);
    expect(onUnsubscribedA).toBeCalledTimes(0);
    expect(onMessageB).toBeCalledTimes(0);
    expect(onSubscribedB).toBeCalledTimes(0);
    expect(onUnsubscribedB).toBeCalledTimes(0);
  }

  {
    const rsp = await handler.handle(
      {
        events: [
          {
            hook: channelBRef.id,
            realtimeEvent: {
              event: { channel: 'app:install:ChannelB' },
              status: RealtimeSubscriptionStatus.REALTIME_SUBSCRIBED,
            },
          },
        ],
        state: getLatestBlocksState(),
      },
      meta
    );
    expect(rsp.effects).toMatchInlineSnapshot(`[]`);
    expect(rsp.state).toMatchInlineSnapshot(`
      {
        "Component.useChannel:ChannelB-1": {
          "channel": "app:install:ChannelB",
          "connected": true,
          "subscribed": true,
        },
      }
    `);
    expect(onMessageA).toBeCalledTimes(0);
    expect(onSubscribedA).toBeCalledTimes(1);
    expect(onUnsubscribedA).toBeCalledTimes(0);
    expect(onMessageB).toBeCalledTimes(0);
    expect(onSubscribedB).toBeCalledTimes(1);
    expect(onUnsubscribedB).toBeCalledTimes(0);
  }

  {
    const rsp = await handler.handle(
      {
        events: [
          {
            hook: channelARef.id,
            realtimeEvent: {
              event: { channel: 'app:install:ChannelA', data: 'a' },
            },
          },
        ],
        state: getLatestBlocksState(),
      },
      meta
    );
    expect(rsp.effects).toMatchInlineSnapshot(`[]`);
    expect(rsp.state).toMatchInlineSnapshot('{}');
    expect(onMessageA).toBeCalledTimes(1);
    expect(onMessageA).toBeCalledWith('a');
    expect(onSubscribedA).toBeCalledTimes(1);
    expect(onUnsubscribedA).toBeCalledTimes(0);
    expect(onMessageB).toBeCalledTimes(0);
    expect(onSubscribedB).toBeCalledTimes(1);
    expect(onUnsubscribedB).toBeCalledTimes(0);
  }

  {
    const rsp = await handler.handle(
      {
        events: [
          {
            hook: channelBRef.id,
            realtimeEvent: {
              event: { channel: 'app:install:ChannelB', data: 'b' },
            },
          },
        ],
        state: getLatestBlocksState(),
      },
      meta
    );
    expect(rsp.effects).toMatchInlineSnapshot(`[]`);
    expect(rsp.state).toMatchInlineSnapshot('{}');
    expect(onMessageA).toBeCalledTimes(1);
    expect(onSubscribedA).toBeCalledTimes(1);
    expect(onUnsubscribedA).toBeCalledTimes(0);
    expect(onMessageB).toBeCalledTimes(1);
    expect(onMessageB).toBeCalledWith('b');
    expect(onSubscribedB).toBeCalledTimes(1);
    expect(onUnsubscribedB).toBeCalledTimes(0);
  }

  {
    const rsp = await handler.handle(
      {
        events: [
          {
            hook: channelARef.id,
            realtimeEvent: {
              event: { channel: 'app:install:ChannelA' },
              status: RealtimeSubscriptionStatus.REALTIME_UNSUBSCRIBED,
            },
          },
        ],
        state: getLatestBlocksState(),
      },
      meta
    );
    expect(rsp.effects).toMatchInlineSnapshot(`[]`);
    expect(rsp.state).toMatchInlineSnapshot(`
      {
        "Component.useChannel:ChannelA-0": {
          "channel": "app:install:ChannelA",
          "connected": false,
          "subscribed": true,
        },
      }
    `);
    expect(onMessageA).toBeCalledTimes(1);
    expect(onSubscribedA).toBeCalledTimes(1);
    expect(onUnsubscribedA).toBeCalledTimes(1);
    expect(onMessageB).toBeCalledTimes(1);
    expect(onSubscribedB).toBeCalledTimes(1);
    expect(onUnsubscribedB).toBeCalledTimes(0);
  }

  {
    const rsp = await handler.handle(
      {
        events: [
          {
            hook: channelBRef.id,
            realtimeEvent: {
              event: { channel: 'app:install:ChannelB' },
              status: RealtimeSubscriptionStatus.REALTIME_UNSUBSCRIBED,
            },
          },
        ],
        state: getLatestBlocksState(),
      },
      meta
    );
    expect(rsp.effects).toMatchInlineSnapshot(`[]`);
    expect(rsp.state).toMatchInlineSnapshot(`
      {
        "Component.useChannel:ChannelB-1": {
          "channel": "app:install:ChannelB",
          "connected": false,
          "subscribed": true,
        },
      }
    `);
    expect(onMessageA).toBeCalledTimes(1);
    expect(onSubscribedA).toBeCalledTimes(1);
    expect(onUnsubscribedA).toBeCalledTimes(1);
    expect(onMessageB).toBeCalledTimes(1);
    expect(onSubscribedB).toBeCalledTimes(1);
    expect(onUnsubscribedB).toBeCalledTimes(1);
  }
});
