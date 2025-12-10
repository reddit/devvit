import { type Realtime, RealtimeDefinition } from '@devvit/protos';
import { context } from '@devvit/server';
import type { JsonValue } from '@devvit/shared';
import { getDevvitConfig } from '@devvit/shared-types/server/get-devvit-config.js';

export class RealtimeClient {
  /**
   * @example
   *
   * ```ts
   * import {context, realtime} from '@devvit/web/server';
   * import type {T2} from '@devvit/web/shared'
   *
   * type RealtimeMessage = {x: number, y: number, t2: T2}
   *
   * await realtime.send<RealtimeMessage>({x: 1, y: 2, t2: context.userId})
   * ```
   */
  async send<Msg extends JsonValue>(channel: string, msg: Msg): Promise<void> {
    // guarantee an object by wrapping msg. the key must align to useChannel().
    await this.#plugin.Send({ channel, data: { msg } }, context.metadata);
  }

  get #plugin(): Realtime {
    return getDevvitConfig().use(RealtimeDefinition);
  }
}
