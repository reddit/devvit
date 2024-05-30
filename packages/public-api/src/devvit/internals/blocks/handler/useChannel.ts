import { RealtimeSubscriptionStatus, type UIEvent } from '@devvit/protos';
import { Header } from '@devvit/shared-types/Header.js';
import type { Data } from '../../../../types/data.js';
import type { UseChannelResult } from '../../../../types/hooks.js';
import type { ChannelOptions } from '../../../../types/realtime.js';
import { ChannelStatus } from '../../../../types/realtime.js';
import { registerHook } from './BlocksHandler.js';
import type { RenderContext } from './RenderContext.js';
import type { Hook, HookParams } from './types.js';

type ChannelHookState = {
  /** `<app ID>:<install ID>:<channel name>`. */
  channel: string;
  connected: boolean;
  /** Hook subscribe state, not RPC connection state. */
  subscribed: boolean;
} & Hook['state'];

class ChannelHook implements UseChannelResult, Hook {
  state: ChannelHookState;

  #context: RenderContext;
  /** Record state in BlocksHandler. */
  #save: () => void;
  #opts: Readonly<ChannelOptions>;

  constructor(opts: Readonly<ChannelOptions>, params: Readonly<HookParams>) {
    this.#context = params.context;
    this.#opts = opts;
    this.#save = params.changed;

    const appID = params.context.meta[Header.App]?.values[0];
    if (!appID) throw Error('useChannel() missing app ID metadata');

    const installID = params.context.meta[Header.Installation]?.values[0];
    if (!installID) throw Error('useChannel() missing install ID from metadata');

    this.state = {
      channel: `${appID}:${installID}:${opts.name}`,
      connected: false,
      subscribed: false,
    };
  }

  async onUIEvent(ev: UIEvent): Promise<void> {
    const realtime = ev.realtimeEvent;
    if (!realtime || !this.state.subscribed) return;
    switch (realtime.status) {
      case RealtimeSubscriptionStatus.REALTIME_SUBSCRIBED:
        this.state.connected = true;
        this.#save();
        await this.#opts.onSubscribed?.();
        break;
      case RealtimeSubscriptionStatus.REALTIME_UNSUBSCRIBED:
        this.state.connected = false;
        this.#save();
        await this.#opts.onUnsubscribed?.();
        break;
      default:
        // to-do: define a RealtimeSubscriptionStatus.MESSAGE. this could have
        //        been a oneOf but the current approach allows for status + data
        //        and this default case will break if another new type is added.
        this.#opts.onMessage(realtime.event?.data ?? {});
        break;
    }
  }

  async send(data: Data): Promise<void> {
    if (!this.state.subscribed || !this.state.connected)
      throw Error(`send failed; ${this.state.channel} channel not connected`);
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
    this.state.subscribed = true;
    this.#save();
  }

  unsubscribe(): void {
    if (!this.state.subscribed) return;
    this.state.subscribed = false;
    this.#save();
  }
}

export function useChannel(opts: Readonly<ChannelOptions>): UseChannelResult {
  return registerHook({ namespace: 'useChannel' }, (params) => {
    return new ChannelHook(opts, params);
  });
}
