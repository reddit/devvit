import type { JSONValue } from '@devvit/shared-types/json.js';

export type KVStore = {
  /**
   * Retrieves a value from the store at the given key
   */
  get<T extends JSONValue = JSONValue>(key: string): Promise<T | undefined>;
  /**
   * Assigns a value to a key in the store
   */
  put(key: string, value: JSONValue): Promise<void>;
  /**
   * Deletes a key from the store if present
   */
  delete(key: string): Promise<void>;
  /**
   * Returns a list of keys in the store
   */
  list(): Promise<string[]>;
};
