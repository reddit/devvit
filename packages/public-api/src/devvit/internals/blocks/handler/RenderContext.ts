import type { Effect, UIRequest, UIEvent } from '@devvit/protos';
import type { Devvit } from '../../../Devvit.js';
import type { BlocksState, HookSegment, Hook, EventHandler, HookRef } from './types.js';
import type { EffectEmitter } from '../EffectEmitter.js';

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
  _state: BlocksState;
  _segments: (HookSegment & { next: number })[] = [];
  _hooks: { [key: string]: Hook } = {};
  _prevHookId: string = '';
  _effects: { [key: string]: Effect } = {};
  _changed: { [key: string]: boolean } = {};
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

  constructor(public request: UIRequest) {
    this._state = request.state ?? {};
    this._rootProps = request.props ?? {};
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
