import type { Metadata } from '@devvit/protos';

import { Devvit } from '../../devvit/Devvit.js';
import type { ModLog, ModLogAddOptions } from '../../types/modlog.js';

export class ModLogClient implements ModLog {
  readonly #metadata: Metadata;

  constructor(metadata: Metadata) {
    this.#metadata = metadata;
  }

  async add(options: Readonly<ModLogAddOptions>): Promise<void> {
    await Devvit.modLogPlugin.Add(options, this.#metadata);
  }
}
