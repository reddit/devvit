import type { Metadata } from '@devvit/protos';
import type { JSONValue } from '@devvit/shared-types/json.js';
import { Devvit } from '../../devvit/Devvit.js';

export class RealtimeClient {
  readonly #metadata: Metadata;

  constructor(metadata: Metadata) {
    this.#metadata = metadata;
  }

  async send(channel: string, msg: JSONValue): Promise<void> {
    await Devvit.realtimePlugin.Send({ channel, data: msg }, this.#metadata);
  }
}
