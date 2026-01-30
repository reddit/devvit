import { EffectType } from '@devvit/protos/json/devvit/ui/effects/v1alpha/effect.js';
import { RealtimeSubscriptionStatus } from '@devvit/protos/json/devvit/ui/effects/v1alpha/realtime_subscriptions.js';
import type { WebViewMessageEvent_MessageData } from '@devvit/protos/json/devvit/ui/events/v1alpha/web_view.js';
import type { JsonValue } from '@devvit/shared';
import { emitEffect } from '@devvit/shared-types/client/emit-effect.js';

export type ConnectRealtimeOptions<Msg extends JsonValue> = {
  channel: string;
  onConnect?: (channel: string) => void;
  onDisconnect?: (channel: string) => void;
  onMessage: (data: Msg) => void;
};

const connectionsByChannel = new Map<string, Connection>();

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
export const connectRealtime = <Msg extends JsonValue>(
  opts: Readonly<ConnectRealtimeOptions<Msg>>
): Connection => {
  if (!opts.channel || /[^a-zA-Z0-9_]/.test(opts.channel))
    throw Error(
      `invalid channel name "${opts.channel}"; channels may only contain letters, numbers, and underscores`
    );

  if (connectionsByChannel.has(opts.channel)) {
    return connectionsByChannel.get(opts.channel)!;
  }

  const connection = new Connection(opts as Readonly<ConnectRealtimeOptions<JsonValue>>);
  connectionsByChannel.set(opts.channel, connection);
  addEventListener('message', connection.onMessage);

  emitConnectionsEffect();

  return connection;
};

export function disconnectRealtime(channel: string): void {
  const connection = connectionsByChannel.get(channel);
  if (!connection) return;

  connectionsByChannel.delete(channel);
  removeEventListener('message', connection.onMessage);
  if (connection.connected) connection.opts.onDisconnect?.(channel);
  connection.connected = false;

  emitConnectionsEffect();
}

/** True if the channel socket is connected. */
export function isRealtimeConnected(channel: string): boolean {
  return !!connectionsByChannel.get(channel)?.connected;
}

/**
 * Clears all connections. Used for testing purposes.
 * @internal
 */
export const __clearConnections = (): void => {
  connectionsByChannel.clear();
};

/** Emits open connections which may cause subscribe / unsubscribe. */
function emitConnectionsEffect(): void {
  emitEffect({
    realtime: { subscriptionIds: [...connectionsByChannel.keys()] },
    type: EffectType.EFFECT_REALTIME_SUB,
  });
}

export class Connection {
  /** @internal */
  connected: boolean = false;

  /** @internal */
  readonly opts: Readonly<ConnectRealtimeOptions<JsonValue>>;

  constructor(opts: Readonly<ConnectRealtimeOptions<JsonValue>>) {
    this.opts = opts;
  }

  /**
   * Disconnects from the realtime channel.
   *
   * @deprecated Use `disconnectRealtime()`.
   */
  async disconnect(): Promise<void> {
    await disconnectRealtime(this.opts.channel);
  }

  /** @internal */
  onMessage = (ev: MessageEvent<WebViewMessageEvent_MessageData>): void => {
    const { type, data } = ev.data;

    if (type !== 'devvit-message') {
      return;
    }

    if (!data?.realtimeEvent) {
      return;
    }

    const { status, event } = data.realtimeEvent;

    if (!event?.channel.endsWith(this.opts.channel)) {
      return;
    }

    // Normalize the channel name (remove namespacing)
    event.channel = this.opts.channel;

    if (status === RealtimeSubscriptionStatus.REALTIME_SUBSCRIBED) {
      this.connected = true;
      this.opts.onConnect?.(this.opts.channel);
    } else if (status === RealtimeSubscriptionStatus.REALTIME_UNSUBSCRIBED) {
      this.connected = false;
      this.opts.onDisconnect?.(this.opts.channel);
    } else if (event.data) {
      this.opts.onMessage(event.data.msg);
    } else {
      console.error('[realtime] Received event without data:', {
        channel: this.opts.channel,
        event,
      });
    }
  };
}
