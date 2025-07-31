import { type Realtime, RealtimeDefinition } from '@devvit/protos';
import { context } from '@devvit/server';
import type { JsonValue } from '@devvit/shared';
import { getDevvitConfig } from '@devvit/shared-types/server/get-devvit-config.js';

export class RealtimeClient {
  #pluginCache?: Realtime;

  async send(channel: string, msg: JsonValue): Promise<void> {
    // guarantee an object by wrapping msg. the key must align to useChannel().
    await this.#plugin.Send({ channel, data: { msg } }, context.metadata);
  }

  get #plugin(): Realtime {
    return (this.#pluginCache ??= getDevvitConfig().use(RealtimeDefinition));
  }
}

export const realtime = new RealtimeClient();
