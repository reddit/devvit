import type { UIEvent } from '@devvit/protos';
import type { JSONValue } from '@devvit/shared-types/json.js';
import type {
  SetStateAction,
  UseStateInitializer,
  UseStateResult,
} from '../../../../types/hooks.js';
import { registerHook } from './BlocksHandler.js';
import type { RenderContext } from './RenderContext.js';
import type { Hook, HookParams } from './types.js';
import { RenderInterruptError } from './types.js';
import type { LoadState } from './useAsync.js';

/**
 * Implementation of the useState hook.
 */
class UseStateHook<S extends JSONValue> implements Hook {
  state: { value: S | null; load_state: LoadState } = { value: null, load_state: 'initial' };
  #changed: () => void;
  #ctx: RenderContext;
  #initializer: UseStateInitializer<S>;
  #hookId: string;
  #promise: Promise<S> | undefined;

  constructor(initializer: UseStateInitializer<S>, params: HookParams) {
    this.#initializer = initializer;
    this.#hookId = params.hookId;
    this.#changed = params.invalidate;
    this.#ctx = params.context;
  }

  /**
   * For state initialized with a promise, this function is called when the promise resolves.  This should
   * happen inside the same event loop as the original call to useState, assuming circuit-breaking didn't happen.
   *
   * If circuit-breaking did happen, this function will be called on the server and the state will propagate to
   * the client.
   *
   * This is intended to be synchronous in the event loop, so will block and waterfall.  useAsync is the non-waterfalling
   * version, but this version is provided for backwards compatibility.
   */
  async onUIEvent(): Promise<void> {
    if (this.state.load_state === 'loading' && this.#promise) {
      try {
        this.state.value = await this.#promise;
        this.state.load_state = 'loaded';
      } catch (e) {
        this.state.load_state = 'error';
        console.error('Error loading async state: ', e);
      }
      this.#changed();
    } else {
      /**
       * This would probably be some sort of concurrent access bug.  It's not clear what would put us
       * in this state, but it's worth logging so we can investigate.
       */
      console.warn('Invalid state: ', this.state.load_state, this.#promise);
    }
  }

  setter(action: SetStateAction<S>): void {
    this.state.value = action instanceof Function ? action(this.state.value as S) : action;
    this.state.load_state = 'loaded';
    this.#changed();
  }

  /**
   * After the existing state is loaded, we need to run the initializer if there was no state found.
   */
  onStateLoaded(): void {
    /**
     * If the state is still loading, we need to throw an error to prevent using the null state.
     */
    if (this.state.load_state === 'loading') {
      throw new RenderInterruptError();
    }
    if (this.state.load_state === 'initial') {
      let initialValue: S | Promise<S>;
      try {
        initialValue =
          this.#initializer instanceof Function ? this.#initializer() : this.#initializer;
      } catch (e) {
        console.log('error in loading async', e);
        this.state.load_state = 'error';
        this.#changed();
        return;
      }
      if (initialValue instanceof Promise) {
        this.#promise = initialValue;
        this.state.load_state = 'loading';
        const requeueEvent: UIEvent = {
          asyncRequest: { requestId: this.#hookId },
          hook: this.#hookId,
        };
        this.#ctx.addToRequeueEvents(requeueEvent);
        this.#changed();
        throw new RenderInterruptError();
      } else {
        this.state.value = initialValue;
        this.state.load_state = 'loaded';
      }
      this.#changed();
    }
  }
}

export function useState(initialState: UseStateInitializer<boolean>): UseStateResult<boolean>;
export function useState(initialState: UseStateInitializer<number>): UseStateResult<number>;
export function useState(initialState: UseStateInitializer<string>): UseStateResult<string>;
export function useState<S extends JSONValue>(
  initialState: UseStateInitializer<S>
): UseStateResult<S>;
export function useState<S extends JSONValue>(
  initialState: UseStateInitializer<S>
): UseStateResult<S> {
  const hook = registerHook(
    { namespace: 'useState' },
    (params) => new UseStateHook(initialState, params)
  );

  return [hook.state.value as S, hook.setter.bind(hook)];
}
