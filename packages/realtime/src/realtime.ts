import type { WebViewMessageEvent_MessageData } from '@devvit/protos/json/devvit/ui/events/v1alpha/web_view.js';
import type { EffectType } from '@devvit/protos/types/devvit/ui/effects/v1alpha/effect.js';
import type { RealtimeSubscriptionStatus } from '@devvit/protos/types/devvit/ui/effects/v1alpha/realtime_subscriptions.js';
import type { JsonValue } from '@devvit/shared';
import { emitEffect } from '@devvit/shared-types/client/emit-effect.js';

export type ConnectRealtimeOptions<Msg extends JsonValue> = {
  channel: string;
  onConnect?: (channel: string) => void;
  onDisconnect?: (channel: string) => void;
  onMessage: (data: Msg) => void;
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
 *
 * @example
 *
 * ```ts
 * import {connectRealtime, context} from '@devvit/web/client'
 * import type {T2} from '@devvit/web/shared'
 *
 * type RealtimeMessage = {x: number, y: number, t2: T2}
 *
 * connectRealtime<RealtimeMessage>({
 *   channel: context.postId,
 *   onConnect() {
 *     console.log(`${context.userId} connected`)
 *   },
 *   onDisconnect() {
 *     console.log(`${context.userId} disconnected`)
 *   },
 *   onMessage(msg) {
 *     // Filter out current user across all sessions.
 *     if (msg.t2 === context.userId) return
 *
 *     console.log(`user ${msg.t2} at (${msg.x}, ${msg.y})`)
 *   }
 * })
 * ```
 */
export const connectRealtime = async <Msg extends JsonValue>(
  opts: Readonly<ConnectRealtimeOptions<Msg>>
): Promise<Connection> => {
  if (connectionsByChannel.has(opts.channel)) {
    return connectionsByChannel.get(opts.channel)!;
  }

  const connection = new Connection(opts as Readonly<ConnectRealtimeOptions<JsonValue>>);
  connectionsByChannel.set(opts.channel, connection);
  addEventListener('message', connection.onMessage);

  await emitConnectionsEffect();

  return connection;
};

export async function disconnectRealtime(channel: string): Promise<void> {
  const connection = connectionsByChannel.get(channel);
  if (!connection) return;

  connectionsByChannel.delete(channel);
  removeEventListener('message', connection.onMessage);

  await emitConnectionsEffect();
}

/**
 * Clears all connections. Used for testing purposes.
 * @internal
 */
export const __clearConnections = (): void => {
  connectionsByChannel.clear();
};

/** Emits open connections which may cause subscribe / unsubscribe. */
async function emitConnectionsEffect(): Promise<void> {
  await emitEffect({
    realtimeSubscriptions: { subscriptionIds: [...connectionsByChannel.keys()] },
    type: 0 satisfies EffectType.EFFECT_REALTIME_SUB,
  });
}

export class Connection {
  readonly #opts: Readonly<ConnectRealtimeOptions<JsonValue>>;

  constructor(opts: Readonly<ConnectRealtimeOptions<JsonValue>>) {
    this.#opts = opts;
  }

  /**
   * Disconnects from the realtime channel.
   *
   * @deprecated Use `disconnectRealtime()`.
   */
  async disconnect(): Promise<void> {
    await disconnectRealtime(this.#opts.channel);
  }

  onMessage = (ev: MessageEvent<WebViewMessageEvent_MessageData>): void => {
    const { type, data } = ev.data;

    if (type !== 'devvit-message') {
      return;
    }

    if (!data?.realtimeEvent) {
      return;
    }

    const { status, event } = data.realtimeEvent;

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
