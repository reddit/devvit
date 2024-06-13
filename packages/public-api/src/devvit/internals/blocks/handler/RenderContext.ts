import type { Effect, Metadata, UIEvent, UIRequest } from '@devvit/protos';
import type { Devvit } from '../../../Devvit.js';
import type { EffectEmitter } from '../EffectEmitter.js';
import type { BlocksState, EventHandler, Hook, HookRef, HookSegment } from './types.js';

/**
 * The RenderContext is a class that holds the state of the rendering process.
 *
 * There are many properties that start with an underscore, which is a convention we use to
 * indicate that they are private and should not be accessed directly.  They are used internally
 * in tests and in the implementation of the BlocksHandler.
 *
 * DO your best to avoid adding new properties to this class to support new features.  It will be tempting
 * to add special cases for new features, but we should strive to work within the existing framework.
 */
export class RenderContext implements EffectEmitter {
  readonly request: Readonly<UIRequest>;
  readonly meta: Readonly<Metadata>;
  #state: BlocksState;
  _segments: (HookSegment & { next: number })[] = [];
  _hooks: { [hookID: string]: Hook } = {};
  _prevHookId: string = '';
  _effects: { [key: string]: Effect } = {};
  _changed: { [hookID: string]: true } = {};
  /** Events that will re-enter the dispatcher queue */
  _requeueEvents: UIEvent[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _rootProps: { [key: string]: any } = {};
  _generated: { [key: string]: boolean } = {};
  static _staticUndeliveredHandlers: { [key: string]: EventHandler } = {};
  _undeliveredHandlers: { [key: string]: EventHandler } = {};
  _devvitContext?: Devvit.Context;

  get devvitContext(): Devvit.Context {
    if (!this._devvitContext) {
      throw new Error('Devvit context not available');
    }
    return this._devvitContext;
  }

  set devvitContext(context: Devvit.Context) {
    this._devvitContext = context;
  }

  constructor(request: UIRequest, meta: Metadata) {
    this.request = request;
    this.meta = meta;
    this.#state = request.state ?? {};
    this._rootProps = request.props ?? {};
  }

  /** The state delta new to this render. */
  get _changedState(): BlocksState {
    const changed: BlocksState = {};
    for (const key in this._changed) changed[key] = this._state[key];
    return changed;
  }

  get hooks(): { readonly [hookID: string]: Hook } {
    return this._hooks;
  }

  /** The complete render state. */
  get _state(): BlocksState {
    return this.#state;
  }

  /** Replacing state resets the delta for the next render. */
  set _state(state: BlocksState) {
    this._changed = {};
    this.#state = state;
  }

  push(options: HookSegment): void {
    this._segments.push({ ...options, next: 0 });
  }

  pop(): void {
    this._segments.pop();
  }

  addUndeliveredEventHandler(id: string, handler: EventHandler): void {
    this._undeliveredHandlers[id] = handler;
  }

  addGlobalUndeliveredEventHandler(id: string, handler: EventHandler): void {
    RenderContext.addGlobalUndeliveredEventHandler(id, handler);
  }

  getHook(ref: HookRef): Hook {
    return this._hooks[ref.id!];
  }
  /** Catches events with no active handler and routes to the corresponding hook to detach/unsubscribe/etc **/
  static addGlobalUndeliveredEventHandler(id: string, handler: EventHandler): void {
    RenderContext._staticUndeliveredHandlers[id] = handler;
  }

  async handleUndeliveredEvent(ev: UIEvent): Promise<Effect[] | void> {
    const allHandlers = {
      ...RenderContext._staticUndeliveredHandlers,
      ...this._undeliveredHandlers,
    };
    for (const [_, handler] of Object.entries(allHandlers)) {
      await handler(ev, this);
    }
  }

  emitEffect(dedupeKey: string, effect: Effect): void {
    this._effects[dedupeKey] = effect;
  }

  /**
   * Adds event that will re-enter the dispatcher queue.
   */
  addToRequeueEvents(...events: UIEvent[]): void {
    if (this._devvitContext?.debug.blocks) console.debug('[blocks] requeueing events', events);

    const grouped = events.reduce(
      (acc, event) => {
        if (event.retry) {
          acc.retry.push(event);
        } else {
          acc.normal.push(event);
        }
        return acc;
      },
      { retry: [], normal: [] } as { retry: UIEvent[]; normal: UIEvent[] }
    );

    // We need to maintain the order of the events, so we need to add the retry events first
    this._requeueEvents = [...grouped.retry, ...this._requeueEvents, ...grouped.normal];
  }

  get effects(): Effect[] {
    return Object.values(this._effects);
  }

  nextHookId(options: HookSegment): string {
    if (options.key === undefined) {
      options.key = this._segments[this._segments.length - 1].next++ + '';
    }
    this.push(options);
    try {
      const builder = [];
      /**
       * We need to build the hook id from the segments in reverse order, because an explicit id
       * overrrides parent path info.
       */
      for (let i = this._segments.length - 1; i >= 0; i--) {
        const segment = this._segments[i];
        if (segment.id) {
          builder.unshift(segment.id);
          break;
        }

        const tag = [];
        if (segment.namespace) {
          tag.push(segment.namespace);
        }

        if (segment.key !== undefined && segment.key !== false) {
          tag.push(segment.key);
        }

        builder.unshift(tag.join('-'));
      }
      const id = builder.join('.');
      if (this._generated[id] && !options.shared) {
        throw new Error(
          `Hook id ${id} already used, cannot register another hook with the same id`
        );
      }
      this._generated[id] = true;
      this._prevHookId = id;
      return id;
    } finally {
      this.pop();
    }
  }
}
