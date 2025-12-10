import { realtime } from '@devvit/realtime/server';
import { expect } from 'vitest';

import { createDevvitTest } from './devvitTest.js';

const test = createDevvitTest();

test('can send realtime messages', async ({ mocks }) => {
  await realtime.send('my-channel', { foo: 'bar' });

  const messages = mocks.realtime.getSentMessagesForChannel('my-channel');
  expect(messages.length).toBe(1);
  expect(messages[0].channel).toBe('my-channel');
  expect(messages[0].data?.msg).toEqual({ foo: 'bar' });
});

test('can subscribe to realtime messages', async ({ mocks }) => {
  const observable = mocks.realtime.plugin.Subscribe({ channels: ['subscribe-channel'] });
  const subscription = observable.subscribe(() => {});

  await realtime.send('subscribe-channel', { test: 'data' });

  // Give the async operation time to complete
  await new Promise((resolve) => setTimeout(resolve, 0));

  const receivedMessages = mocks.realtime.getReceivedMessagesForChannel('subscribe-channel');
  expect(receivedMessages.length).toBe(1);
  expect(receivedMessages[0].channel).toBe('subscribe-channel');
  expect(receivedMessages[0].data?.msg).toEqual({ test: 'data' });

  subscription.unsubscribe();
});
