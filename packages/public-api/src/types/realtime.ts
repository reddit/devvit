import type { JSONValue } from './json.js';

export enum ChannelStatus {
  Unknown,
  Connecting,
  Connected,
  Disconnecting,
  Disconnected,
}

export type ChannelOptions<Message extends JSONValue = JSONValue> = {
  /** Name of the channel */
  name: string;
  /** Called every time a message is received on this channel */
  onMessage(msg: Message): void | undefined;
  /** Optional hook to be informed when the channel has connected */
  onSubscribed?: (() => void | Promise<void>) | undefined;
  /** Optional hook to be informed when the channel has disconnected */
  onUnsubscribed?: (() => void | Promise<void>) | undefined;
};
