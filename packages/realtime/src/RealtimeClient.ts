import { type Realtime, RealtimeDefinition } from '@devvit/protos';
import { context } from '@devvit/server';
import { getDevvitConfig } from '@devvit/server/get-devvit-config.js';
import type { JSONValue } from '@devvit/shared';

export class RealtimeClient {
  readonly #realtimePlugin: Realtime;

  constructor() {
    this.#realtimePlugin = getDevvitConfig().use<Realtime>(RealtimeDefinition);
  }

  async send(channel: string, msg: JSONValue): Promise<void> {
    // guarantee an object by wrapping msg. the key must align to useChannel().
    await this.#realtimePlugin.Send({ channel, data: { msg } }, context.debug.metadata);
  }
}

export const realtime = new RealtimeClient();
