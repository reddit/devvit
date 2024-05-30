import type { UIEvent } from '@devvit/protos';
import type { JSONValue } from '@devvit/shared-types/json.js';
import type { RenderContext } from './RenderContext.js';

export type BlocksState = { [hookID: string]: JSONValue };

export type Props = { [key: string]: unknown };

export type HookSegment = {
  /**
   * This is usually the name of the hook: useAsync, useAsyncState, useChannel,
   * useForm, useInterval, useState, etc, the block element, or the component
   * name (eg, AppToolbar or FooBar).
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

/**
 * Syncs state between client and server, responds to events, provides user
 * API, and transitions state across renders.
 */
export interface Hook {
  /**
   * State to carry across renders. Hook constructor arguments are recreated on
   * render but state may be passed in the render request and used to prime that
   * render's hook before onLoad().
   */
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
   */
  onLoad?(ctx: RenderContext): void; // to-do: why pass context here and in HookParams?
}

export type HookRef = { id?: string };

export type HookParams = {
  hookId: string;
  /**
   * Record state mutation in BlocksHandler. Caller is responsible for filtering
   * out a nop transition where previous state is equivalent to next as wanted.
   */
  changed(): void;
  context: RenderContext;
};

/**
 * Circuit-breaking triggers a {remoteOnly=true, async=false, retry=true} event.
 * This triggers a {remoteOnly=false, async=true, retry=false} event. In
 * practice, that has some slight implications for how it flows through the
 * event loop. If we wanted to, we could change this out, if we fully understand
 * the semantics. This aligns more with useAsync than circuit-breaking today,
 * though either is likely just fine.
 */
export class RenderInterruptError extends Error {}
