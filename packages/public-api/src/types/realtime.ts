import type { Data } from './data.js';

export enum ChannelStatus {
  Unknown,
  Connecting,
  Connected,
  Disconnecting,
  Disconnected,
}

export type ChannelOptions = {
  /** Name of the channel */
  name: string;
  /** Called every time a message is received on this channel */
  onMessage: (data: Data) => void;
  /** Optional hook to be informed when the channel has connected */
  onSubscribed?: (() => void | Promise<void>) | undefined;
  /** Optional hook to be informed when the channel has disconnected */
  onUnsubscribed?: (() => void | Promise<void>) | undefined;
};
