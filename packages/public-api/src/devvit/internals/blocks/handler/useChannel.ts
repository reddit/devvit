import { EffectType, RealtimeSubscriptionStatus, type UIEvent } from '@devvit/protos';
import { Header } from '@devvit/shared-types/Header.js';
import type { JSONValue } from '@devvit/shared-types/json.js';
import type { UseChannelResult } from '../../../../types/hooks.js';
import type { ChannelOptions } from '../../../../types/realtime.js';
import { ChannelStatus } from '../../../../types/realtime.js';
import { registerHook } from './BlocksHandler.js';
import type { RenderContext } from './RenderContext.js';
import type { Hook, HookParams } from './types.js';

type ChannelHookState = {
  /** `<app ID>:<install ID>:<channel name>`. */
  readonly channel: string;
  connected: boolean;
  /** Hook subscribe state, not RPC connection state. */
  subscribed: boolean;
} & Hook['state'];

class ChannelHook<Message extends JSONValue> implements UseChannelResult<Message>, Hook {
  state: ChannelHookState;

  readonly #context: RenderContext;
  readonly #debug: boolean;
  /** Record state in BlocksHandler. */
  readonly #invalidate: () => void;
  readonly #opts: Readonly<ChannelOptions<Message>>;

  constructor(opts: Readonly<ChannelOptions<Message>>, params: Readonly<HookParams>) {
    this.#context = params.context;
    this.#debug = !!params.context._devvitContext?.debug.realtime;
    this.#opts = opts;
    this.#invalidate = params.invalidate;

    const appID = params.context.meta[Header.App]?.values[0];
    if (!appID) throw Error('useChannel missing app ID metadata');

    const installID = params.context.meta[Header.Installation]?.values[0];
    if (!installID) throw Error('useChannel missing install ID from metadata');

    const channel = `${appID}:${installID}:${opts.name}`;
    const duplicate = Object.values(this.#context._hooks)
      .filter((hook) => hook instanceof ChannelHook)
      .some((hook) => (hook as ChannelHook<Message>).state.channel === channel);
    if (duplicate) throw Error(`useChannel channel names must be unique; "${channel}" duplicated`);

    this.state = {
      channel,
      connected: false,
      subscribed: false,
    };
  }

  async onUIEvent(ev: UIEvent): Promise<void> {
    const realtime = ev.realtimeEvent;
    if (!realtime || !this.state.subscribed) return;
    switch (realtime.status) {
      case RealtimeSubscriptionStatus.REALTIME_SUBSCRIBED:
        if (this.#debug) console.debug(`[realtime] "${this.state.channel}" connected`);
        this.state.connected = true;
        this.#invalidate();
        await this.#opts.onSubscribed?.();
        break;
      case RealtimeSubscriptionStatus.REALTIME_UNSUBSCRIBED:
        if (this.#debug) console.debug(`[realtime] "${this.state.channel}" disconnected`);
        this.state.connected = false;
        this.#invalidate();
        await this.#opts.onUnsubscribed?.();
        break;
      default:
        if (this.#debug)
          console.debug(
            `[realtime] "${this.state.channel}" received message: ${JSON.stringify(
              ev,
              undefined,
              2
            )}`
          );
        // to-do: define a RealtimeSubscriptionStatus.MESSAGE. this could have
        //        been a oneOf but the current approach allows for status + data
        //        and this default case will break if another new type is added.
        this.#opts.onMessage(realtime.event?.data ?? {});
        break;
    }
  }

  async send(msg: Message): Promise<void> {
    if (this.#debug)
      console.debug(
        `[realtime] "${this.state.channel}" send message: ${JSON.stringify(msg, undefined, 2)}`
      );
    if (!this.state.subscribed || !this.state.connected) {
      console.debug(`[realtime] "${this.state.channel}" send failed; channel not connected`);
      throw Error(`useChannel send failed; "${this.state.channel}" channel not connected`);
    }
    await this.#context.devvitContext.realtime.send(this.state.channel, msg);
  }

  get status(): ChannelStatus {
    if (this.state.subscribed && this.state.connected) return ChannelStatus.Connected;
    else if (this.state.subscribed && !this.state.connected) return ChannelStatus.Connecting;
    else if (!this.state.subscribed && this.state.connected) return ChannelStatus.Disconnecting;
    return ChannelStatus.Disconnected;
  }

  subscribe(): void {
    if (this.state.subscribed) return;
    if (this.#debug) console.debug(`[realtime] "${this.state.channel}" subscribed`);
    this.state.subscribed = true;
    this.#invalidate();
    this.#emitSubscribed();
  }

  unsubscribe(): void {
    if (!this.state.subscribed) return;
    if (this.#debug) console.debug(`[realtime] "${this.state.channel}" unsubscribed`);
    this.state.subscribed = false;
    this.#invalidate();
    this.#emitSubscribed();
  }

  #emitSubscribed(): void {
    const channels = Object.values(this.#context._hooks)
      .filter((hook) => hook instanceof ChannelHook && hook.state.subscribed)
      .map((hook) => (hook as ChannelHook<Message>).state.channel);
    this.#context.emitEffect(this.state.channel, {
      type: EffectType.EFFECT_REALTIME_SUB,
      realtimeSubscriptions: { subscriptionIds: channels },
    });
  }
}

export function useChannel<Message extends JSONValue>(
  opts: Readonly<ChannelOptions<Message>>
): UseChannelResult<Message> {
  if (!opts.name || /[^a-zA-Z0-9_]/.test(opts.name))
    throw Error(
      `useChannel error: The name "${opts.name}" you provided for the hook is invalid. Valid names can only contain letters, numbers, and underscores (_).`
    );

  // allow RealtimeEffectHandler to compute hook ID. maintain compatibility with
  // realtimeChannelToHookID().
  const id = `useChannel:${opts.name}`;
  return registerHook({
    id,
    namespace: id,
    initializer: (params) => new ChannelHook(opts, params),
  });
}
