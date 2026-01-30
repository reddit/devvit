// @vitest-environment jsdom

import { EffectType } from '@devvit/protos/json/devvit/ui/effects/v1alpha/effect.js';
import { RealtimeSubscriptionStatus } from '@devvit/protos/json/devvit/ui/effects/v1alpha/realtime_subscriptions.js';
import type { WebViewMessageEvent_MessageData } from '@devvit/protos/json/devvit/ui/events/v1alpha/web_view.js';
import { type Effect, emitEffect } from '@devvit/shared-types/client/emit-effect.js';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  __clearConnections,
  connectRealtime,
  disconnectRealtime,
  isRealtimeConnected,
} from './realtime.js';

vi.mock('@devvit/shared-types/client/emit-effect.js', () => ({
  emitEffect: vi.fn(),
}));

describe('realtime', () => {
  afterEach(() => {
    vi.resetAllMocks();
    __clearConnections();
  });

  describe('connectRealtime()', () => {
    it('should connect to a channel successfully', async () => {
      const mockOnConnect = vi.fn();
      const mockOnMessage = vi.fn();

      const connection = await connectRealtime({
        channel: 'test_channel',
        onConnect: mockOnConnect,
        onMessage: mockOnMessage,
      });
      const connect = new MessageEvent<WebViewMessageEvent_MessageData>('message', {
        data: {
          type: 'devvit-message',
          data: {
            id: 'id',
            realtimeEvent: {
              event: { channel: 'useChannel:test_channel' },
              status: RealtimeSubscriptionStatus.REALTIME_SUBSCRIBED,
            },
          },
        },
      });
      dispatchEvent(connect);

      expect(emitEffect).toHaveBeenCalledWith<[Effect]>({
        realtime: { subscriptionIds: ['test_channel'] },
        type: EffectType.EFFECT_REALTIME_SUB,
      });
      expect(connection).toBeDefined();
      expect(isRealtimeConnected('test_channel')).toBe(true);
    });

    it('should return existing connection if channel is already connected', async () => {
      const mockOnMessage = vi.fn();
      const mockOnConnect = vi.fn();

      // First connection should succeed
      const connection1 = await connectRealtime({
        channel: 'test_channel',
        onMessage: mockOnMessage,
        onConnect: mockOnConnect,
      });

      // emitEffect should have been called once
      expect(emitEffect).toHaveBeenCalledTimes(1);

      // Second connection should return the same connection object
      const connection2 = await connectRealtime({
        channel: 'test_channel',
        onMessage: mockOnMessage,
      });

      // emitEffect should still have only been called once
      expect(emitEffect).toHaveBeenCalledTimes(1);
      expect(connection1).toBe(connection2);
    });

    it('should call onMessage when receiving a message', async () => {
      const mockOnMessage = vi.fn();

      await connectRealtime({
        channel: 'test_channel',
        onMessage: mockOnMessage,
      });

      // Simulate a message event
      const testMessage = {
        counter: 10,
      };
      const messageEvent = new MessageEvent<WebViewMessageEvent_MessageData>('message', {
        data: {
          type: 'devvit-message',
          data: {
            id: 'id',
            realtimeEvent: {
              event: {
                channel: 'useChannel:test_channel',
                data: { msg: testMessage },
              },
            },
          },
        },
      });
      dispatchEvent(messageEvent);

      expect(mockOnMessage).toHaveBeenCalledWith(testMessage);
    });

    test('throws an error for an invalid channel', () => {
      const mockOnMessage = vi.fn();

      expect(() =>
        connectRealtime({ channel: 'test-channel', onMessage: mockOnMessage })
      ).toThrowErrorMatchingInlineSnapshot(
        `[Error: invalid channel name "test-channel"; channels may only contain letters, numbers, and underscores]`
      );
    });

    test('throws an error for an empty channel', () => {
      const mockOnMessage = vi.fn();

      expect(() =>
        connectRealtime({ channel: '', onMessage: mockOnMessage })
      ).toThrowErrorMatchingInlineSnapshot(
        `[Error: invalid channel name ""; channels may only contain letters, numbers, and underscores]`
      );
    });
  });

  describe('disconnectRealtime()', () => {
    it('should disconnect from a channel', async () => {
      const mockOnMessage = vi.fn();

      await connectRealtime({ channel: 'test_channel', onMessage: mockOnMessage });
      const connect = new MessageEvent<WebViewMessageEvent_MessageData>('message', {
        data: {
          type: 'devvit-message',
          data: {
            id: 'id',
            realtimeEvent: {
              event: { channel: 'useChannel:test_channel' },
              status: RealtimeSubscriptionStatus.REALTIME_SUBSCRIBED,
            },
          },
        },
      });
      dispatchEvent(connect);
      expect(isRealtimeConnected('test_channel')).toBe(true);

      const disconnect = new MessageEvent<WebViewMessageEvent_MessageData>('message', {
        data: {
          type: 'devvit-message',
          data: {
            id: 'id',
            realtimeEvent: {
              event: { channel: 'useChannel:test_channel' },
              status: RealtimeSubscriptionStatus.REALTIME_UNSUBSCRIBED,
            },
          },
        },
      });
      dispatchEvent(disconnect);
      await disconnectRealtime('test_channel');

      expect(emitEffect).toHaveBeenCalledWith<[Effect]>({
        realtime: { subscriptionIds: [] },
        type: EffectType.EFFECT_REALTIME_SUB,
      });
      expect(isRealtimeConnected('test_channel')).toBe(false);
    });
  });
});
