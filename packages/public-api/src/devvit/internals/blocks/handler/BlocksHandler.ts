import {
  type Effect,
  type Metadata,
  type UIEvent,
  UIEventScope,
  type UIRequest,
  type UIResponse,
} from '@devvit/protos';
import { isCircuitBreaker } from '@devvit/shared-types/CircuitBreaker.js';
import type { JSONValue } from '@devvit/shared-types/json.js';

import type { BlockElement } from '../../../Devvit.js';
import type { ReifiedBlockElement, ReifiedBlockElementOrLiteral } from '../BlocksReconciler.js';
import { BlocksTransformer } from '../BlocksTransformer.js';
import type { EffectEmitter } from '../EffectEmitter.js';
import { ContextBuilder } from './ContextBuilder.js';
import { _isTombstone, RenderContext } from './RenderContext.js';
import type { BlocksState, Hook, HookParams, HookSegment, Props } from './types.js';
import { RenderInterruptError } from './types.js';

/**
 * This can be a global/singleton because render is synchronous.
 *
 * If you want to use this from somewhere else, please consider using one of the
 * functions like isRendering or registerHook, and then try to add additional
 * functions here if needed.  Don't use this directly.
 */
export let _activeRenderContext: RenderContext | null = null;

export function useEffectEmitter(): EffectEmitter {
  if (!_activeRenderContext) {
    throw new Error('Hooks can only be declared at the top of a component.');
  }
  return _activeRenderContext;
}

export function isRendering(): boolean {
  return _activeRenderContext !== null;
}

function _structuredClone<T extends JSONValue>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * See [HookSegment](./types.ts) for more information.
 */
export function assertValidNamespace(input: string): void {
  const regex = /[-.]/;
  const valid = input !== '' && !regex.test(input);

  if (!valid) {
    throw new Error(
      `Hook with namespace '${input}' is invalid. Hook namespaces cannot be empty string or contain dashes/dots because they are used as delimiters internally. Please update the hook namespace and try again.`
    );
  }
}

type RegisterHookOptions<H extends Hook> = HookSegment & {
  /**
   * Factory function to build the hook. Only called once for the entire lifecycle of a
   * BlocksHandler.handle() invocation.
   */
  initializer: (p: HookParams) => H;
};

/**
 * This can get called multiple times in a given render. Initialize is only called once!
 *
 * This is the recommended low-level interface for creating hooks like useState or useAsync.
 *
 * Practically, this initializes your hook if it doesn't already exist, and makes sure
 * that its state gets all sync'd up.
 *
 * @param HookSegment -- A name for this hook.  This is used to dedupe hooks.
 * @param initializer
 *    factory for building this hook
 * @returns
 */
export function registerHook<H extends Hook>({
  initializer,
  ...hookSegment
}: RegisterHookOptions<H>): H {
  if (!_activeRenderContext) {
    throw new Error(
      "Hooks can only be declared at the top of a component.  You cannot declare hooks outside of components or inside of event handlers.  It's almost always a mistake to declare hooks inside of loops or conditionals."
    );
  }

  assertValidNamespace(hookSegment.namespace);

  const hookId = _activeRenderContext.nextHookId(hookSegment);
  const context = _activeRenderContext;
  const params: HookParams = {
    hookId,
    invalidate: () => {
      context._changed[hookId] = true;
      context._state[hookId] = context?._hooks[hookId]?.state;
    },
    context: _activeRenderContext,
  };
  const fromNull =
    _activeRenderContext._state[hookId] === undefined ||
    _isTombstone(_activeRenderContext._state[hookId]);
  _activeRenderContext._hooks[hookId] = _activeRenderContext._hooks[hookId] ?? initializer(params);
  const hook: H = _activeRenderContext._hooks[hookId] as H;

  if (!fromNull) {
    hook.state = _activeRenderContext._state[hookId];
  }
  hook.onStateLoaded?.();
  if (fromNull && hook.state !== undefined && hook.state !== null) {
    params.invalidate();
  }
  return hook;
}

export let _latestBlocksHandler: BlocksHandler | null = null;

/**
 * Replacing BlocksReconciler, the model is now less of a "reconciliation", and more
 * of a handling a request/response lifecycle.
 *
 */
export class BlocksHandler {
  #root: JSX.ComponentFunction;
  #contextBuilder: ContextBuilder = new ContextBuilder();
  #blocksTransformer: BlocksTransformer = new BlocksTransformer(
    () => this._latestRenderContext?.devvitContext?.assets
  );
  _latestRenderContext: RenderContext | null = null;

  constructor(root: JSX.ComponentFunction) {
    if (this.#debug) console.debug('[blocks] BlocksHandler v1');
    this.#root = root;
    _latestBlocksHandler = this;
  }

  async handle(request: UIRequest, metadata: Metadata): Promise<UIResponse> {
    const context = new RenderContext(request, metadata);
    const devvitContext = this.#contextBuilder.buildContext(context, request, metadata);
    context.devvitContext = devvitContext;

    let blocks;

    /**
     * Events on the main queue must be handled in order, so that state is updated in the correct order.  Events
     * on other queues can be handled in parallel, because they only emit effects.
     *
     * There is an optimization here to process SendEventEffects locally, instead of letting them bubble up to the
     * platform.  This prevents a round trip to the platform for every event.
     *
     * This also means we need to respect execution queues here, and not just in the platform.
     */
    const eventsToProcess = request.events;
    const noEvents = !request.events?.length;
    const isMainQueue = noEvents || eventsToProcess.some((e) => !e.async);

    const isBlockingSSR = eventsToProcess.some((e) => e.blocking);

    let changed: { [hookID: string]: true };
    let progress:
      | {
          _state: BlocksState;
          _effects: { [key: string]: Effect };
        }
      | undefined;
    let remaining: UIEvent[] = [...eventsToProcess];

    /**
     * When purely rendering, we now add one synthetic event.  This enables us to loop over the events that an initial render may generate
     * in an async world.  This is a bit of a hack, but it's the simplest way to handle this.
     */
    if (eventsToProcess.length === 0) {
      eventsToProcess.push({
        scope: UIEventScope.ALL,
      });
    }

    if (this.#debug) console.debug('[blocks] starting processing events');
    while (eventsToProcess.length > 0) {
      if (this.#debug)
        console.debug('[blocks] processing events loop iteration', eventsToProcess.length);
      /**
       * A concurrently executable batch is a set of events that can be executed in parallel.  This either one main queue event,
       * or any number of other queue events.
       */
      const batch = [];
      if (!eventsToProcess[0].async) {
        batch.push(eventsToProcess.shift()!);
      } else {
        while (eventsToProcess[0]?.async) {
          batch.push(eventsToProcess.shift()!);
        }
      }
      if (!batch.length) throw Error('batch must have at least one event');
      try {
        if (batch[0].async) {
          const stateCopy = _structuredClone(context._state);
          await this.#handleAsyncQueues(context, ...batch);
          // enforce that state updates are only allowed on the main queue.
          context._state = stateCopy;
        } else {
          await this.#handleMainQueue(context, ...batch);
        }
      } catch (e) {
        /**
         * Guard clause, retries are only applicable for circuit breakers.  If we're not a circuit breaker, we need to throw the error.
         */
        if (!isCircuitBreaker(e)) {
          throw e;
        }

        if (this.#debug) console.debug('[blocks] caught in handler', e);
        context._latestRenderContent = undefined;
        /**
         * If we have a progress, we can recover from an error by rolling back to the last progress, and then letting the
         * remaining events be reprocessed.
         */
        if (progress) {
          context._state = progress._state;
          context._changed = changed!;
          context._effects = progress._effects;

          const requeueable = remaining.map((e) => {
            const requeueEvent = { ...e };
            requeueEvent.retry = true;
            return requeueEvent;
          });
          context.addToRequeueEvents(...requeueable);
          break;
        } else {
          console.error('[blocks] unhandled error in handler', e);
          throw e;
        }
      }

      if (this.#debug) console.debug('[blocks] remaining events', context._requeueEvents);
      const remainingRequeueEvents: UIEvent[] = [];
      for (const event of context._requeueEvents) {
        if (!isMainQueue && !event.async) {
          if (this.#debug)
            console.debug(
              '[blocks] NOT reprocessing event in BlocksHandler, sync mismatch A',
              event
            );
          // We're async, this is a main queue event.  We need to send it back to the platform to let
          // the platform synchronize it.
          remainingRequeueEvents.push(event);
          continue;
        }
        if (isMainQueue && event.async && !isBlockingSSR) {
          if (this.#debug)
            console.debug(
              '[blocks] NOT reprocessing event in BlocksHandler, sync mismatch B',
              event
            );
          // We're main queue, and this is an async event.  We're not in SSR mode, so let's prioritize
          // returning control quickly to the platform so we don't block event loops.
          remainingRequeueEvents.push(event);
          continue;
        }
        if (this.#debug) console.debug('[blocks] reprocessing event in BlocksHandler', event);
        eventsToProcess.push(event);
      }
      context._requeueEvents = remainingRequeueEvents; //

      /**
       * If we're going back through this again, we need to capture the progress, and the remaining events.
       */
      if (eventsToProcess.length > 0) {
        changed = { ...context._changed };
        progress = {
          _state: _structuredClone(context._state),
          _effects: { ...context._effects },
        };
        remaining = [...eventsToProcess];
      }
    } // End of while loop

    // Rendering only happens on the main queue.
    if (isMainQueue) {
      if (!context._latestRenderContent) {
        context._latestRenderContent = this.#renderRoot(
          this.#root,
          context.request.props ?? {},
          context
        );
      }
      const tags = context._latestRenderContent;

      if (tags) {
        blocks = this.#blocksTransformer.createBlocksElementOrThrow(tags);
        blocks = this.#blocksTransformer.ensureRootBlock(blocks);
      }
    }

    return {
      state: context._changedState,
      effects: context.effects,
      blocks: blocks,
      events: context._requeueEvents,
    };
  }

  get #debug(): boolean {
    return !!this._latestRenderContext?.devvitContext.debug.blocks;
  }

  #loadHooks(context: RenderContext, ..._events: UIEvent[]): void {
    context._hooks = {};

    this.#renderRoot(this.#root, context.request.props ?? {}, context);
  }

  /**
   * These can all run in parallel, because they only emit effects
   */
  async #handleAsyncQueues(context: RenderContext, ...batch: UIEvent[]): Promise<void> {
    this.#loadHooks(context, ...batch);

    await Promise.all(
      batch.map(async (event) => {
        if (!event.async) {
          throw new Error(
            "You can't mix main and other queues in one batch.  This is likely a platform bug.  Please file an issue in the Discord for someone to help! https://discord.com/channels/1050224141732687912/1115441897079574620"
          );
        }
        await this.#attemptHook(context, event);
      })
    );
  }

  async #attemptHook(context: RenderContext, event: UIEvent): Promise<void> {
    const hook = context._hooks[event.hook!];
    if (hook?.onUIEvent) {
      try {
        await hook.onUIEvent(event, context);
      } catch (e) {
        if (isCircuitBreaker(e)) {
          if (this.#debug) {
            console.error('Server call required', e);
          }
        } else {
          console.error('Error in event handler', e);
        }

        throw e;
      }
    } else {
      await context.handleUndeliveredEvent(event);
    }
  }

  async #handleMainQueue(context: RenderContext, ...batch: UIEvent[]): Promise<void> {
    // We need to handle events in order, so that the state is updated in the correct order.
    for (const event of batch) {
      if (this.#debug) console.log('[blocks] handling main queue event', event);
      if (this.#debug) console.log('[blocks] before', context._state);
      this.#loadHooks(context, event);
      await this.#attemptHook(context, event);
      if (this.#debug) console.log('[blocks] after', context._state);
    }
    // We need this to process possible unmounts given the most recent event
    this.#loadHooks(context);
  }

  #renderRoot(
    component: JSX.ComponentFunction,
    props: Props,
    context: RenderContext
  ): ReifiedBlockElement | undefined {
    if (this.#debug) console.debug('[blocks] renderRoot');
    context._generated = {};
    _activeRenderContext = context;
    this._latestRenderContext = context;
    try {
      const roots = this.#render(component, props, context);

      if (roots.length !== 1) {
        throw new Error(
          `There can only be one root element, received: ${roots.length}. Please wrap these elements in a <vstack></vstack> or <hstack></hstack> to continue. Fragments cannot be used as a root element.`
        );
      }
      const root = roots[0];

      // By the time it gets to this point the promise has been serialized.
      // That's why the check is not root instanceof Promise
      if (root === '[object Promise]') {
        throw new Error(
          `Root elements cannot be async. To use data from an async endpoint, please use "const [data] = useState(async () => {/** your async code */})".`
        );
      }

      if (typeof root === 'string') {
        throw new Error(
          `The root element must return a valid block, not a string. Try wrapping the element in a <text>your content</text> tag to continue.`
        );
      }

      context._latestRenderContent = root;

      return root;
    } catch (e) {
      if (e instanceof RenderInterruptError) {
        return undefined;
      } else {
        throw e;
      }
    } finally {
      _activeRenderContext = null;
    }
  }

  #render(
    component: JSX.ComponentFunction,
    props: Props,
    context: RenderContext
  ): ReifiedBlockElementOrLiteral[] {
    // Anonymous functions don't have a name
    // use || instead of ?? due to empty string
    context.push({ namespace: component.name || 'anonymous', ...props });
    try {
      const element = component(props, context.devvitContext);

      if (element instanceof Promise) {
        throw new Error(
          `Components (found: ${component.name ?? 'unknown component'}) cannot be async. To use data from an async endpoint, please use "const [data] = useState(async () => {/** your async code */})".`
        );
      }

      return this.#renderElement(element, context);
    } finally {
      context.pop();
    }
  }

  #renderList(list: JSX.Element[], context: RenderContext): ReifiedBlockElementOrLiteral[] {
    list = list.flat(Infinity);
    return list.flatMap((e, i) => {
      if (e && typeof e === 'object' && 'props' in e) {
        if (!e.props?.key) {
          e.props = e.props ?? {};
          e.props.key = `${i}`;
        }
      }
      return this.#renderElement(e, context);
    });
  }

  #renderElement(element: JSX.Element, context: RenderContext): ReifiedBlockElementOrLiteral[] {
    if (Array.isArray(element)) {
      return this.#renderList(element, context);
    } else if (isBlockElement(element)) {
      // This means the element is a fragment
      if (element.type === undefined) {
        context.push({ namespace: 'fragment', ...element.props });
        // Since it's a fragment, don't reifyProps because you can't have props on a fragment
        const children = this.#renderList(element.children, context);
        context.pop();
        return children;
      } else if (typeof element.type === 'function') {
        const propsWithChildren = { ...element.props, children: element.children.flat(Infinity) };
        return this.#render(element.type, propsWithChildren, context);
      } else {
        context.push({ namespace: element.type, ...element.props });
        const reifiedChildren = this.#renderList(element.children, context);
        const reifiedProps = this.#reifyProps(element.props ?? {});
        context.pop();
        return [{ type: element.type, children: reifiedChildren, props: reifiedProps }];
      }
    } else {
      return [(element ?? '').toString()];
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  #reifyProps(props: { [key: string]: any }): { [key: string]: JSONValue } {
    const reifiedProps: { [key: string]: JSONValue } = {};
    for (const key in props) {
      if (typeof props[key] === 'undefined') {
        // skip
      } else if (typeof props[key] === 'function') {
        const hook = registerHook({
          namespace: key,
          key: false,
          initializer: ({ hookId }) => ({
            hookId,
            state: null,
            onUIEvent: (event) => props[key](event.userAction?.data),
          }),
        });
        reifiedProps[key] = hook.hookId;
        if ('captureHookRef' in props[key]) {
          props[key].captureHookRef();
        }
      } else {
        // push value through the JSON parser to filter incompatible types
        const value = JSON.parse(JSON.stringify(props[key]));
        if (value !== undefined && value !== null) {
          reifiedProps[key] = value;
        }
      }
    }
    return reifiedProps;
  }
}

function isBlockElement(e: JSX.Element): e is BlockElement {
  return typeof e === 'object' && e != null && 'type' in e;
}
