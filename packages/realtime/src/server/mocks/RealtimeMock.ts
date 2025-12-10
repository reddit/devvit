import { type Metadata, type Realtime } from '@devvit/protos';
import {
  type RealtimeEvent,
  type RealtimeRequest,
} from '@devvit/protos/types/devvit/events/v1alpha/realtime.js';
import { Empty } from '@devvit/protos/types/google/protobuf/empty.js';
import type { PluginMock } from '@devvit/shared-types/test/index.js';
import { Observable, Subject } from 'rxjs';

type Channel = string;

/** A mock the Realtime plugin. */
export class RealtimePluginMock implements Realtime {
  private readonly _sentMessages: Map<Channel, RealtimeEvent[]>;
  private readonly _receivedMessages: Map<Channel, RealtimeEvent[]>;
  private readonly _subjects = new Map<Channel, Subject<RealtimeEvent>>();

  constructor(
    sentMessages: Map<Channel, RealtimeEvent[]>,
    receivedMessages: Map<Channel, RealtimeEvent[]>
  ) {
    this._sentMessages = sentMessages;
    this._receivedMessages = receivedMessages;
  }

  async Send(request: RealtimeEvent, _metadata?: Metadata): Promise<Empty> {
    // Track sent message
    const sentChannelMessages = this._sentMessages.get(request.channel) ?? [];
    sentChannelMessages.push(request);
    this._sentMessages.set(request.channel, sentChannelMessages);

    // Deliver to subscribers (simulating pub/sub behavior)
    const subject = this._subjects.get(request.channel);
    if (subject) {
      subject.next(request);
    }

    return {};
  }

  /**
   * The RXJS Observable pattern is deprecated and the return type is subject to change. Maintaining
   * this contract for now to satisfy the underlying plugin contract.
   *
   * @deprecated
   */
  Subscribe(request: RealtimeRequest, _metadata?: Metadata): Observable<RealtimeEvent> {
    // Create or get existing subject for the channel(s)
    const primaryChannel = request.channels[0];

    let subject = this._subjects.get(primaryChannel);
    if (!subject) {
      subject = new Subject<RealtimeEvent>();
      this._subjects.set(primaryChannel, subject);
    }

    // Track messages that flow through the subscription
    subject.subscribe((event) => {
      const receivedChannelMessages = this._receivedMessages.get(event.channel) ?? [];
      receivedChannelMessages.push(event);
      this._receivedMessages.set(event.channel, receivedChannelMessages);
    });

    return subject;
  }
}

/** A mock that provides helpful methods and an in-memory store on top of the `RealtimePluginMock`. */
export class RealtimeMock implements PluginMock<Realtime> {
  readonly plugin: RealtimePluginMock;

  private readonly _sentMessages = new Map<Channel, RealtimeEvent[]>();
  private readonly _receivedMessages = new Map<Channel, RealtimeEvent[]>();

  constructor() {
    this.plugin = new RealtimePluginMock(this._sentMessages, this._receivedMessages);
  }

  /**
   * Returns all messages that were sent via `Send()` across all channels.
   *
   * @returns An array of `RealtimeEvent` objects that were sent.
   */
  getSentMessages(): RealtimeEvent[] {
    return Array.from(this._sentMessages.values()).flat();
  }

  /**
   * Returns all messages that were sent via `Send()` for the specified channel.
   *
   * @param channel - The channel name to query.
   * @returns An array of `RealtimeEvent` objects that were sent to the channel.
   */
  getSentMessagesForChannel(channel: string): RealtimeEvent[] {
    return this._sentMessages.get(channel) ?? [];
  }

  /**
   * Returns all messages that were received through `Subscribe()` Observables across all channels.
   *
   * @returns An array of `RealtimeEvent` objects that were received.
   */
  getReceivedMessages(): RealtimeEvent[] {
    return Array.from(this._receivedMessages.values()).flat();
  }

  /**
   * Returns all messages that were received through `Subscribe()` Observables for the specified channel.
   *
   * @param channel - The channel name to query.
   * @returns An array of `RealtimeEvent` objects that were received on the channel.
   */
  getReceivedMessagesForChannel(channel: string): RealtimeEvent[] {
    return this._receivedMessages.get(channel) ?? [];
  }

  /**
   * Clears all sent messages across all channels.
   */
  clearSentMessages(): void {
    this._sentMessages.clear();
  }

  /**
   * Clears all sent messages for the specified channel.
   *
   * @param channel - The channel name to clear.
   */
  clearSentMessagesForChannel(channel: string): void {
    this._sentMessages.set(channel, []);
  }

  /**
   * Clears all received messages across all channels.
   */
  clearReceivedMessages(): void {
    this._receivedMessages.clear();
  }

  /**
   * Clears all received messages for the specified channel.
   *
   * @param channel - The channel name to clear.
   */
  clearReceivedMessagesForChannel(channel: string): void {
    this._receivedMessages.set(channel, []);
  }

  /**
   * Clears all tracked messages (both sent and received) across all channels.
   */
  reset(): void {
    this._sentMessages.clear();
    this._receivedMessages.clear();
  }
}
