import type { Metadata } from '@devvit/protos';

import { Devvit } from '../../devvit/Devvit.js';
import type { JSONValue } from '../../types/json.js';
import type { KVStore } from '../../types/kvStore.js';

export class KeyValueStorage implements KVStore {
  readonly #metadata: Metadata;

  constructor(metadata: Metadata) {
    this.#metadata = metadata;
  }

  async get<T extends JSONValue = JSONValue>(key: string): Promise<T | undefined> {
    const { messages } = await Devvit.kvStorePlugin.Get({ keys: [key] }, this.#metadata);
    try {
      if (messages[key]) {
        return JSON.parse(messages[key]);
      }
    } catch {
      return undefined;
    }

    return undefined;
  }

  async put(key: string, value: JSONValue): Promise<void> {
    const messages: { [key: string]: string } = {};
    messages[key] = JSON.stringify(value);
    await Devvit.kvStorePlugin.Put({ messages }, this.#metadata);
  }

  async delete(key: string): Promise<void> {
    await Devvit.kvStorePlugin.Del({ keys: [key] }, this.#metadata);
  }

  async list(): Promise<string[]> {
    const { keys } = await Devvit.kvStorePlugin.List({ filter: '*' }, this.#metadata);
    return keys;
  }
}
