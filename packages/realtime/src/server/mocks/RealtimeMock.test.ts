import { type Realtime, RealtimeDefinition } from '@devvit/protos';
import type { RealtimeEvent } from '@devvit/protos/types/devvit/events/v1alpha/realtime.js';
import { makeConfig } from '@devvit/shared-types/test/index.js';
import { describe, expect, it } from 'vitest';

import { RealtimeMock } from './RealtimeMock.js';

describe('RealtimeMock', () => {
  it('should track sent messages', async () => {
    const mock = new RealtimeMock();
    const event1: RealtimeEvent = { channel: 'test-channel', data: { msg: 'hello' } };
    const event2: RealtimeEvent = { channel: 'test-channel', data: { msg: 'world' } };

    await mock.plugin.Send(event1);
    await mock.plugin.Send(event2);

    const sent = mock.getSentMessagesForChannel('test-channel');
    expect(sent).toHaveLength(2);
    expect(sent[0]).toStrictEqual(event1);
    expect(sent[1]).toStrictEqual(event2);
  });

  it('should deliver sent messages to subscribers', async () => {
    const mock = new RealtimeMock();
    const observable = mock.plugin.Subscribe({ channels: ['test-channel'] });
    const event: RealtimeEvent = { channel: 'test-channel', data: { msg: 'broadcast' } };

    const receivedEvents: RealtimeEvent[] = [];
    const subscription = observable.subscribe((ev) => {
      receivedEvents.push(ev);
    });

    await mock.plugin.Send(event);

    // Give the async operation time to complete
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(receivedEvents).toHaveLength(1);
    expect(receivedEvents[0]).toStrictEqual(event);

    const sent = mock.getSentMessagesForChannel('test-channel');
    const received = mock.getReceivedMessagesForChannel('test-channel');
    expect(sent).toHaveLength(1);
    expect(received).toHaveLength(1);
    expect(sent[0]).toStrictEqual(event);
    expect(received[0]).toStrictEqual(event);

    subscription.unsubscribe();
  });

  it('should track messages per channel', async () => {
    const mock = new RealtimeMock();
    const event1: RealtimeEvent = { channel: 'channel-1', data: { msg: 'one' } };
    const event2: RealtimeEvent = { channel: 'channel-2', data: { msg: 'two' } };

    await mock.plugin.Send(event1);
    await mock.plugin.Send(event2);

    expect(mock.getSentMessagesForChannel('channel-1')).toHaveLength(1);
    expect(mock.getSentMessagesForChannel('channel-2')).toHaveLength(1);
    expect(mock.getSentMessagesForChannel('channel-1')[0]).toStrictEqual(event1);
    expect(mock.getSentMessagesForChannel('channel-2')[0]).toStrictEqual(event2);
  });

  it('should reset all messages across all channels', async () => {
    const mock = new RealtimeMock();
    const event1: RealtimeEvent = { channel: 'channel-1', data: { msg: 'one' } };
    const event2: RealtimeEvent = { channel: 'channel-2', data: { msg: 'two' } };

    await mock.plugin.Send(event1);
    await mock.plugin.Send(event2);

    expect(mock.getSentMessagesForChannel('channel-1')).toHaveLength(1);
    expect(mock.getSentMessagesForChannel('channel-2')).toHaveLength(1);

    mock.reset();

    expect(mock.getSentMessagesForChannel('channel-1')).toHaveLength(0);
    expect(mock.getSentMessagesForChannel('channel-2')).toHaveLength(0);
  });

  it('should isolate messages between instances', async () => {
    const mock1 = new RealtimeMock();
    const mock2 = new RealtimeMock();
    const event1: RealtimeEvent = { channel: 'test-channel', data: { msg: 'instance-1' } };
    const event2: RealtimeEvent = { channel: 'test-channel', data: { msg: 'instance-2' } };

    await mock1.plugin.Send(event1);
    await mock2.plugin.Send(event2);

    expect(mock1.getSentMessagesForChannel('test-channel')).toHaveLength(1);
    expect(mock1.getSentMessagesForChannel('test-channel')[0]).toStrictEqual(event1);
    expect(mock2.getSentMessagesForChannel('test-channel')).toHaveLength(1);
    expect(mock2.getSentMessagesForChannel('test-channel')[0]).toStrictEqual(event2);
  });

  it('should wire through makeConfig', async () => {
    const config = makeConfig({
      plugins: {
        [RealtimeDefinition.fullName]: new RealtimeMock().plugin,
      },
    });
    const realtime = config.use(RealtimeDefinition) as Realtime;

    expect(realtime).toBeDefined();
    expect(typeof realtime.Send).toBe('function');
    expect(typeof realtime.Subscribe).toBe('function');

    const event: RealtimeEvent = { channel: 'test-channel', data: { msg: 'config-test' } };
    await realtime.Send(event);

    // Note: We can't easily verify the message was tracked since we only have the plugin,
    // not the RealtimeMock wrapper. But we can verify the plugin works.
    expect(realtime).toBeDefined();
  });

  it('should handle multiple subscribers on the same channel', async () => {
    const mock = new RealtimeMock();
    const observable1 = mock.plugin.Subscribe({ channels: ['test-channel'] });
    const observable2 = mock.plugin.Subscribe({ channels: ['test-channel'] });
    const event: RealtimeEvent = { channel: 'test-channel', data: { msg: 'broadcast' } };

    const received1: RealtimeEvent[] = [];
    const received2: RealtimeEvent[] = [];
    const sub1 = observable1.subscribe((ev) => received1.push(ev));
    const sub2 = observable2.subscribe((ev) => received2.push(ev));

    await mock.plugin.Send(event);
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Both subscribers should receive the message
    expect(received1).toHaveLength(1);
    expect(received2).toHaveLength(1);
    expect(received1[0]).toStrictEqual(event);
    expect(received2[0]).toStrictEqual(event);

    sub1.unsubscribe();
    sub2.unsubscribe();
  });

  it('should reset both sent and received messages', async () => {
    const mock = new RealtimeMock();
    const observable = mock.plugin.Subscribe({ channels: ['test-channel'] });
    const event: RealtimeEvent = { channel: 'test-channel', data: { msg: 'test' } };

    const subscription = observable.subscribe(() => {});

    await mock.plugin.Send(event);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mock.getSentMessagesForChannel('test-channel')).toHaveLength(1);
    expect(mock.getReceivedMessagesForChannel('test-channel')).toHaveLength(1);

    mock.reset();

    expect(mock.getSentMessagesForChannel('test-channel')).toHaveLength(0);
    expect(mock.getReceivedMessagesForChannel('test-channel')).toHaveLength(0);

    subscription.unsubscribe();
  });

  it('should support getSentMessages for all channels', async () => {
    const mock = new RealtimeMock();
    const event1: RealtimeEvent = { channel: 'channel-1', data: { msg: 'one' } };
    const event2: RealtimeEvent = { channel: 'channel-2', data: { msg: 'two' } };

    await mock.plugin.Send(event1);
    await mock.plugin.Send(event2);

    const allSent = mock.getSentMessages();
    expect(allSent).toHaveLength(2);
    expect(allSent).toContainEqual(event1);
    expect(allSent).toContainEqual(event2);
  });

  it('should clear sent messages for a specific channel', async () => {
    const mock = new RealtimeMock();
    const event1: RealtimeEvent = { channel: 'channel-1', data: { msg: 'one' } };
    const event2: RealtimeEvent = { channel: 'channel-2', data: { msg: 'two' } };

    await mock.plugin.Send(event1);
    await mock.plugin.Send(event2);

    expect(mock.getSentMessagesForChannel('channel-1')).toHaveLength(1);
    expect(mock.getSentMessagesForChannel('channel-2')).toHaveLength(1);

    mock.clearSentMessagesForChannel('channel-1');

    expect(mock.getSentMessagesForChannel('channel-1')).toHaveLength(0);
    expect(mock.getSentMessagesForChannel('channel-2')).toHaveLength(1);
  });

  it('should clear all sent messages', async () => {
    const mock = new RealtimeMock();
    const event1: RealtimeEvent = { channel: 'channel-1', data: { msg: 'one' } };
    const event2: RealtimeEvent = { channel: 'channel-2', data: { msg: 'two' } };

    await mock.plugin.Send(event1);
    await mock.plugin.Send(event2);

    expect(mock.getSentMessagesForChannel('channel-1')).toHaveLength(1);
    expect(mock.getSentMessagesForChannel('channel-2')).toHaveLength(1);

    mock.clearSentMessages();

    expect(mock.getSentMessagesForChannel('channel-1')).toHaveLength(0);
    expect(mock.getSentMessagesForChannel('channel-2')).toHaveLength(0);
  });

  it('should clear received messages for a specific channel', async () => {
    const mock = new RealtimeMock();
    const observable = mock.plugin.Subscribe({ channels: ['channel-1'] });
    const event1: RealtimeEvent = { channel: 'channel-1', data: { msg: 'one' } };
    const event2: RealtimeEvent = { channel: 'channel-2', data: { msg: 'two' } };

    const subscription = observable.subscribe(() => {});

    await mock.plugin.Send(event1);
    await mock.plugin.Send(event2);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mock.getReceivedMessagesForChannel('channel-1')).toHaveLength(1);
    expect(mock.getReceivedMessagesForChannel('channel-2')).toHaveLength(0);

    mock.clearReceivedMessagesForChannel('channel-1');

    expect(mock.getReceivedMessagesForChannel('channel-1')).toHaveLength(0);
    expect(mock.getReceivedMessagesForChannel('channel-2')).toHaveLength(0);

    subscription.unsubscribe();
  });

  it('should clear all received messages', async () => {
    const mock = new RealtimeMock();
    const observable1 = mock.plugin.Subscribe({ channels: ['channel-1'] });
    const observable2 = mock.plugin.Subscribe({ channels: ['channel-2'] });
    const event1: RealtimeEvent = { channel: 'channel-1', data: { msg: 'one' } };
    const event2: RealtimeEvent = { channel: 'channel-2', data: { msg: 'two' } };

    const sub1 = observable1.subscribe(() => {});
    const sub2 = observable2.subscribe(() => {});

    await mock.plugin.Send(event1);
    await mock.plugin.Send(event2);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mock.getReceivedMessagesForChannel('channel-1')).toHaveLength(1);
    expect(mock.getReceivedMessagesForChannel('channel-2')).toHaveLength(1);

    mock.clearReceivedMessages();

    expect(mock.getReceivedMessagesForChannel('channel-1')).toHaveLength(0);
    expect(mock.getReceivedMessagesForChannel('channel-2')).toHaveLength(0);

    sub1.unsubscribe();
    sub2.unsubscribe();
  });

  it('should clear sent and received messages independently', async () => {
    const mock = new RealtimeMock();
    const observable = mock.plugin.Subscribe({ channels: ['test-channel'] });
    const event: RealtimeEvent = { channel: 'test-channel', data: { msg: 'test' } };

    const subscription = observable.subscribe(() => {});

    await mock.plugin.Send(event);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mock.getSentMessagesForChannel('test-channel')).toHaveLength(1);
    expect(mock.getReceivedMessagesForChannel('test-channel')).toHaveLength(1);

    mock.clearSentMessagesForChannel('test-channel');

    expect(mock.getSentMessagesForChannel('test-channel')).toHaveLength(0);
    expect(mock.getReceivedMessagesForChannel('test-channel')).toHaveLength(1);

    mock.clearReceivedMessagesForChannel('test-channel');

    expect(mock.getSentMessagesForChannel('test-channel')).toHaveLength(0);
    expect(mock.getReceivedMessagesForChannel('test-channel')).toHaveLength(0);

    subscription.unsubscribe();
  });
});
