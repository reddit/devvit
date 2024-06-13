import { EffectType, RealtimeSubscriptionStatus, type UIEvent } from '@devvit/protos';
import { Header } from '@devvit/shared-types/Header.js';
import type { Data } from '../../../../types/data.js';
import type { UseChannelResult } from '../../../../types/hooks.js';
import type { ChannelOptions } from '../../../../types/realtime.js';
import { ChannelStatus } from '../../../../types/realtime.js';
import { registerHook } from './BlocksHandler.js';
import { RenderContext } from './RenderContext.js';
import type { Hook, HookParams } from './types.js';

const useChannelList: { [hookId: string]: ChannelHook } = {};

/** Unsubscribe and delete hooks with no active event handlers **/
RenderContext.addGlobalUndeliveredEventHandler('useChannel', async (event) => {
  if (event.realtimeEvent && event.hook) {
    useChannelList[event.hook].unsubscribe();
    delete useChannelList[event.hook];
  }
});

type ChannelHookState = {
  /** `<app ID>:<install ID>:<channel name>`. */
  channel: string;
  connected: boolean;
  /** Hook subscribe state, not RPC connection state. */
  subscribed: boolean;
} & Hook['state'];

class ChannelHook implements UseChannelResult, Hook {
  state: ChannelHookState;

  readonly #context: RenderContext;
  readonly #debug: boolean;
  /** Record state in BlocksHandler. */
  readonly #invalidate: () => void;
  readonly #opts: Readonly<ChannelOptions>;

  constructor(opts: Readonly<ChannelOptions>, params: Readonly<HookParams>) {
    this.#context = params.context;
    this.#debug = !!params.context._devvitContext?.debug.realtime;
    this.#opts = opts;
    this.#invalidate = params.invalidate;

    const appID = params.context.meta[Header.App]?.values[0];
    if (!appID) throw Error('useChannel error: missing app ID metadata');

    const installID = params.context.meta[Header.Installation]?.values[0];
    if (!installID) throw Error('useChannel error: missing install ID from metadata');

    const channel = `${appID}:${installID}:${opts.name}`;
    const duplicate = Object.values(this.#context.hooks)
      .filter((hook) => hook instanceof ChannelHook)
      .some((hook) => (hook as ChannelHook).state.channel === channel);
    if (duplicate) throw Error('useChannel error: channel names must be unique');

    this.state = {
      channel,
      connected: false,
      subscribed: false,
    };
    useChannelList[this.state.channel] = this;
  }

  async onUIEvent(ev: UIEvent): Promise<void> {
    const realtime = ev.realtimeEvent;
    if (!realtime || !this.state.subscribed) return;
    switch (realtime.status) {
      case RealtimeSubscriptionStatus.REALTIME_SUBSCRIBED:
        if (this.#debug) console.debug('[realtime] connected');
        this.state.connected = true;
        this.#invalidate();
        await this.#opts.onSubscribed?.();
        break;
      case RealtimeSubscriptionStatus.REALTIME_UNSUBSCRIBED:
        if (this.#debug) console.debug('[realtime] disconnected');
        this.state.connected = false;
        this.#invalidate();
        await this.#opts.onUnsubscribed?.();
        break;
      default:
        if (this.#debug)
          console.debug(`[realtime] received message: ${JSON.stringify(ev, undefined, 2)}`);
        // to-do: define a RealtimeSubscriptionStatus.MESSAGE. this could have
        //        been a oneOf but the current approach allows for status + data
        //        and this default case will break if another new type is added.
        this.#opts.onMessage(realtime.event?.data ?? {});
        break;
    }
  }

  async send(data: Data): Promise<void> {
    if (this.#debug)
      console.debug(`[realtime] send message: ${JSON.stringify(data, undefined, 2)}`);
    if (!this.state.subscribed || !this.state.connected) {
      console.debug(`send failed; ${this.state.channel} channel not connected`);
      throw Error(`useChannel error: send failed; ${this.state.channel} channel not connected`);
    }
    await this.#context.devvitContext.realtime.send(this.state.channel, data);
  }

  get status(): ChannelStatus {
    if (this.state.subscribed && this.state.connected) return ChannelStatus.Connected;
    else if (this.state.subscribed && !this.state.connected) return ChannelStatus.Connecting;
    else if (!this.state.subscribed && this.state.connected) return ChannelStatus.Disconnecting;
    return ChannelStatus.Disconnected;
  }

  subscribe(): void {
    if (this.state.subscribed) return;
    if (this.#debug) console.debug(`[realtime] subscribed`);
    this.state.subscribed = true;
    this.#invalidate();
    this.#emitSubscribed();
  }

  unsubscribe(): void {
    if (!this.state.subscribed) return;
    if (this.#debug) console.debug(`[realtime] unsubscribed`);
    this.state.subscribed = false;
    this.#invalidate();
    this.#emitSubscribed();
  }

  #emitSubscribed(): void {
    const channels = Object.values(this.#context.hooks)
      .filter((hook) => hook instanceof ChannelHook && hook.state.subscribed)
      .map((hook) => (hook as ChannelHook).state.channel);
    this.#context.emitEffect(`useChannel`, {
      type: EffectType.EFFECT_REALTIME_SUB,
      realtimeSubscriptions: { subscriptionIds: channels },
    });
  }
}

export function useChannel(opts: Readonly<ChannelOptions>): UseChannelResult {
  // encode channel name in the hook ID. this would enable sharing channels
  // across useChannel() calls and across components more easily but is
  // currently unused.
  if (!opts.name || /[^a-zA-Z0-9]/.test(opts.name))
    throw Error('useChannel error: channel names must be nonempty and alphanumeric');
  const namespace = `useChannel:${opts.name}`;
  return registerHook({ namespace }, (params) => {
    return new ChannelHook(opts, params);
  });
}
