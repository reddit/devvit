import type { Metadata } from '@devvit/protos';

import { Devvit } from '../../devvit/Devvit.js';
import type { JSONValue } from '../../types/json.js';

export class RealtimeClient {
  readonly #metadata: Metadata;

  constructor(metadata: Metadata) {
    this.#metadata = metadata;
  }

  async send(channel: string, msg: JSONValue): Promise<void> {
    // guarantee an object by wrapping msg. the key must align to useChannel().
    await Devvit.realtimePlugin.Send({ channel, data: { msg } }, this.#metadata);
  }
}
