import type { UIEvent } from '@devvit/protos';
import type { JSONValue } from '@devvit/shared-types/json.js';
import type { RenderContext } from './RenderContext.js';

export type BlocksState = { [key: string]: JSONValue };

export type Props = { [key: string]: unknown };

export type HookSegment = {
  /**
   * This is usually the name of the hook: useState, useAsyncState, etc.
   */
  namespace?: string;

  /**
   * If the ordering is known, you can provide it here.  Else, the key will be a
   * generated auto-incrementing number.
   *
   * The exception is that if key === false, then no key will be added to the hook.
   */

  key?: string | false;

  /**
   * If you want to use a specific id, you can provide it here.  Else, the id will be
   * generated based on the namespace and key.
   */

  id?: string;

  /**
   * If the hook id & hook state is shared across multiple components, you can set this to true.  The only
   * example of this that I can think of is something like createContext and useContext.
   */
  shared?: boolean;
};

export type EventHandler = (event: UIEvent, context: RenderContext) => Promise<void>;

export interface Hook {
  state: JSONValue;

  /**
   * What event callbacks want to hit.
   */
  onUIEvent?: EventHandler;

  /**
   * Lifecycle-wise,
   *
   * 1. constructor
   * 2. state gets copied into the hook
   * 3. onLoad
   * 4. possible changes to the state
   * 5. state gets serialized.
   *
   * @returns
   */
  onLoad?: (ctx: RenderContext) => void;
}

export type HookRef = { id?: string };

export type HookParams = { hookId: string; changed: () => void; context: RenderContext };

export class RenderInterruptError extends Error {}
