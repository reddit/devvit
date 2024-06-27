import type { UIEvent } from '@devvit/protos';
import type { JSONValue } from '@devvit/shared-types/json.js';
import type {
  AsyncUseStateInitializer,
  SetStateAction,
  UseStateInitializer,
  UseStateResult,
} from '../../../../types/hooks.js';
import { registerHook } from './BlocksHandler.js';
import type { RenderContext } from './RenderContext.js';
import type { Hook, HookParams } from './types.js';
import { RenderInterruptError } from './types.js';

class AsyncStateHook<S extends JSONValue> implements Hook {
  state: { value: S | null; loading: boolean } = { value: null, loading: false };
  #changed: () => void;
  #ctx: RenderContext;
  #initializer: AsyncUseStateInitializer<S>;
  #hookId: string;

  constructor(initializer: AsyncUseStateInitializer<S>, params: HookParams) {
    this.#initializer = initializer;
    this.#hookId = params.hookId;
    this.#changed = params.invalidate;
    this.#ctx = params.context;
  }

  async onUIEvent(): Promise<void> {
    if (this.state.value === null) {
      this.state.value = await this.#initializer();
      this.state.loading = false;
      this.#changed();
    }
  }

  setter(action: SetStateAction<S>): void {
    this.state.value = action instanceof Function ? action(this.state.value as S) : action;
    this.#changed();
  }

  onStateLoaded(): void {
    if (this.state.value === null) {
      this.state.loading = true;
      this.#changed();
      const requeueEvent: UIEvent = {
        asyncRequest: { requestId: this.#hookId },
        hook: this.#hookId,
      };
      this.#ctx.addToRequeueEvents(requeueEvent);
      throw new RenderInterruptError();
    }
  }
}

export function useAsyncState<S extends JSONValue>(
  initializer: AsyncUseStateInitializer<S>
): UseStateResult<S> {
  const hook = registerHook({ namespace: 'useAsyncState' }, (params) => {
    return new AsyncStateHook(initializer, params);
  });

  return [hook.state.value as S, hook.setter.bind(hook)];
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
  const hook = registerHook({ namespace: 'useState' }, (params) => {
    const state = initialState instanceof Function ? initialState() : initialState;
    if (state instanceof Promise) {
      return new AsyncStateHook(() => state, params);
    }
    const setter = (action: SetStateAction<S>): void => {
      hook.state.value = action instanceof Function ? action(hook.state.value as S) : action;
      params.invalidate();
    };
    return { state: { value: state }, setter };
  });

  return [hook.state.value as S, hook.setter.bind(hook)];
}
