// @vitest-environment jsdom

import { emitEffect } from '@devvit/client';
import { RealtimeEvent } from '@devvit/protos/types/devvit/events/v1alpha/realtime.js';
import type { EffectType } from '@devvit/protos/types/devvit/ui/effects/v1alpha/effect.js';
import type {
  RealtimeSubscriptionEvent,
  RealtimeSubscriptionStatus,
} from '@devvit/protos/types/devvit/ui/effects/v1alpha/realtime_subscriptions.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { __clearConnections, connectRealtime } from './realtime.js';

vi.mock('@devvit/client', () => ({
  emitEffect: vi.fn(),
}));

describe('realtime', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
    // Clean up any remaining connections
    __clearConnections();
  });

  describe('connectRealtime', () => {
    it('should connect to a channel successfully', async () => {
      const mockOnConnect = vi.fn();
      const mockOnMessage = vi.fn();

      (emitEffect as ReturnType<typeof vi.fn>).mockResolvedValue({
        realtimeEvent: {
          status: 0 satisfies RealtimeSubscriptionStatus.REALTIME_SUBSCRIBED,
        } as RealtimeSubscriptionEvent,
      });

      const connection = await connectRealtime({
        channel: 'test-channel',
        onConnect: mockOnConnect,
        onMessage: mockOnMessage,
      });

      expect(emitEffect).toHaveBeenCalledWith({
        realtimeSubscriptions: { subscriptionIds: ['test-channel'] },
        type: 0 satisfies EffectType.EFFECT_REALTIME_SUB,
      });
      expect(connection).toBeDefined();
      expect(typeof connection.disconnect).toBe('function');
    });

    it('should return existing connection if channel is already connected', async () => {
      const mockOnMessage = vi.fn();
      const mockOnConnect = vi.fn();

      (emitEffect as ReturnType<typeof vi.fn>).mockResolvedValue({
        realtimeEvent: {
          status: 0 satisfies RealtimeSubscriptionStatus.REALTIME_SUBSCRIBED,
        } as RealtimeSubscriptionEvent,
      });

      // First connection should succeed
      const connection1 = await connectRealtime({
        channel: 'test-channel',
        onMessage: mockOnMessage,
        onConnect: mockOnConnect,
      });

      // emitEffect should have been called once
      expect(emitEffect).toHaveBeenCalledTimes(1);

      // Second connection should return the same connection object
      const connection2 = await connectRealtime({
        channel: 'test-channel',
        onMessage: mockOnMessage,
      });

      // emitEffect should still have only been called once
      expect(emitEffect).toHaveBeenCalledTimes(1);
      expect(connection1).toBe(connection2);
    });

    it('should call onMessage when receiving a message', async () => {
      const mockOnMessage = vi.fn();

      (emitEffect as ReturnType<typeof vi.fn>).mockResolvedValue({
        realtimeEvent: {
          status: 0 satisfies RealtimeSubscriptionStatus.REALTIME_SUBSCRIBED,
        } as RealtimeSubscriptionEvent,
      });

      await connectRealtime({
        channel: 'test-channel',
        onMessage: mockOnMessage,
      });

      // Simulate a message event
      const testMessage = {
        counter: 10,
      };

      // Create and dispatch a message event
      const messageEvent = new MessageEvent('message', {
        data: {
          type: 'devvit-message',
          data: {
            hook: 'useChannel:test-channel',
            realtimeEvent: {
              event: {
                channel: 'useChannel:test-channel',
                data: {
                  msg: testMessage,
                },
              } satisfies RealtimeEvent,
            },
          },
        },
      });

      window.dispatchEvent(messageEvent);

      expect(mockOnMessage).toHaveBeenCalledWith(testMessage);
    });
  });

  describe('Connection.disconnect', () => {
    it('should disconnect from a channel', async () => {
      const mockOnMessage = vi.fn();

      (emitEffect as ReturnType<typeof vi.fn>).mockResolvedValue({
        realtimeEvent: {
          status: 0 satisfies RealtimeSubscriptionStatus.REALTIME_SUBSCRIBED,
        } as RealtimeSubscriptionEvent,
      });

      const connection = await connectRealtime({
        channel: 'test-channel',
        onMessage: mockOnMessage,
      });

      await connection.disconnect();

      expect(emitEffect).toHaveBeenCalledWith({
        realtimeSubscriptions: { subscriptionIds: [] },
        type: 0 satisfies EffectType.EFFECT_REALTIME_SUB,
      });
    });
  });
});
