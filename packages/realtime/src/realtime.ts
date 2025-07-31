import type { EffectType } from '@devvit/protos/types/devvit/ui/effects/v1alpha/effect.js';
import type {
  RealtimeSubscriptionEvent,
  RealtimeSubscriptionStatus,
} from '@devvit/protos/types/devvit/ui/effects/v1alpha/realtime_subscriptions.js';
import type { JsonValue } from '@devvit/shared';
import { emitEffect } from '@devvit/shared-types/client/emit-effect.js';

type ConnectRealtimeOptions = {
  channel: string;
  onConnect?: (channel: string) => void;
  onDisconnect?: (channel: string) => void;
  onMessage: (data: JsonValue) => void;
};

const connectionsByChannel = new Map<string, Connection>();

/* TODO: Clean up this API. Now that realtime has been removed from the
 * EFFECTS_WITH_RESPONSE list, we probably don't need to await emitEffect.
 */

/**
 * Connects to a realtime channel for receiving messages.
 *
 * @param opts - Connection options including channel name and callbacks
 * @returns A Connection object with a disconnect method
 */
export const connectRealtime = async (
  opts: Readonly<ConnectRealtimeOptions>
): Promise<Connection> => {
  if (connectionsByChannel.has(opts.channel)) {
    return connectionsByChannel.get(opts.channel)!;
  }

  const connection = new Connection(opts);
  connectionsByChannel.set(opts.channel, connection);
  addEventListener('message', connection.onMessage);

  await emitEffect({
    realtimeSubscriptions: { subscriptionIds: [...connectionsByChannel.keys()] },
    type: 0 satisfies EffectType.EFFECT_REALTIME_SUB,
  });

  return connection;
};

/**
 * Clears all connections. Used for testing purposes.
 * @internal
 */
export const __clearConnections = (): void => {
  connectionsByChannel.clear();
};

class Connection {
  readonly #opts: Readonly<ConnectRealtimeOptions>;

  constructor(opts: Readonly<ConnectRealtimeOptions>) {
    this.#opts = opts;
  }

  /**
   * Disconnects from the realtime channel.
   *
   * This works by sending a list of all channels we want to remain subscribed to,
   * excluding the channel we want to disconnect from. The effect handler compares this
   * new list with existing subscriptions and triggers disconnect for any channel
   * that's no longer in the list.
   */
  async disconnect(): Promise<void> {
    const connection = connectionsByChannel.get(this.#opts.channel);
    if (!connection) {
      return;
    }

    // Get all current subscriptions except the one we're disconnecting
    const remainingChannels = [...connectionsByChannel.keys()].filter(
      (ch) => ch !== this.#opts.channel
    );
    await emitEffect({
      realtimeSubscriptions: { subscriptionIds: remainingChannels },
      type: 0 satisfies EffectType.EFFECT_REALTIME_SUB,
    });
    connectionsByChannel.delete(this.#opts.channel);
  }

  onMessage = (ev: MessageEvent): void => {
    const { type, data } = ev.data;

    if (type !== 'devvit-message') {
      return;
    }

    if (!data.realtimeEvent) {
      return;
    }

    const { status, event } = data.realtimeEvent as RealtimeSubscriptionEvent;

    if (!event?.channel.endsWith(this.#opts.channel)) {
      return;
    }

    // Normalize the channel name (remove namespacing)
    event.channel = this.#opts.channel;

    if (status === (0 satisfies RealtimeSubscriptionStatus.REALTIME_SUBSCRIBED)) {
      this.#opts.onConnect?.(this.#opts.channel);
    } else if (status === (1 satisfies RealtimeSubscriptionStatus.REALTIME_UNSUBSCRIBED)) {
      this.#opts.onDisconnect?.(this.#opts.channel);
    } else if (event.data) {
      this.#opts.onMessage(event.data.msg);
    } else {
      console.error('[realtime] Received event without data:', {
        channel: this.#opts.channel,
        event,
      });
    }
  };
}
