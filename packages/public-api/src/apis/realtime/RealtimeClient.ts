import type { Metadata } from '@devvit/protos';
import type { Data } from '../../types/index.js';
import { Devvit } from '../../devvit/Devvit.js';

export class RealtimeClient {
  readonly #metadata: Metadata;

  constructor(metadata: Metadata) {
    this.#metadata = metadata;
  }

  async send(channel: string, data: Data): Promise<void> {
    await Devvit.realtimePlugin.Send({ channel, data }, this.#metadata);
  }
}
