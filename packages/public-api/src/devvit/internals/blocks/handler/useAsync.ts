import { type AsyncResponse, type UIEvent, UIEventScope } from '@devvit/protos';
import { CIRCUIT_BREAKER_MSG } from '@devvit/shared-types/CircuitBreaker.js';
import type { JSONValue } from '@devvit/shared-types/json.js';
import { StringUtil } from '@devvit/shared-types/StringUtil.js';
import isEqual from 'lodash.isequal';

import type { AsyncUseStateInitializer, UseAsyncResult } from '../../../../types/hooks.js';
import { registerHook } from './BlocksHandler.js';
import type { RenderContext } from './RenderContext.js';
import type { Hook, HookParams } from './types.js';

export type AsyncOptions<S extends JSONValue> = {
  /**
   * The data loader will re-run if the value of `depends` changes.
   */
  depends?: JSONValue;

  /**
   * A callback that will be called after the data is loaded, regardless of whether it succeeds or fails.
   * This is a good place to run setStates or other side effects, because calling a setState in the main
   * body is not allowed.
   *
   *    useAsync(async () => {
   *        const response = await fetch(`https://date.api/today?timezone=${timezone}`);
   *        return response.json();
   *    }, {
   *        depends: [timezone],
   *        finally: (data, error) => {
   *            if (error) {
   *                console.error("Failed to load date data:", error);
   *            } else {
   *                setTodayDate(data['currentDate']);
   *            }
   *        },
   *    });
   *
   */
  finally?: (data: S | null, error: Error | null) => void;
};

export type LoadState = 'initial' | 'loading' | 'loaded' | 'error' | 'disabled';

/**
 * This tries to save an error into the state.  If the error is a circuit breaker, it will throw the error instead,
 * as those errors are not meant to be saved in state.
 *
 * @param e  -- an original error type
 * @returns A JSONValue that can be saved in states
 */
export function toSerializableErrorOrCircuitBreak(e: unknown): {
  message: string;
  details: string;
} {
  // This is a little side-effecty, so open to suggestions on how to improve.
  if (e instanceof Error) {
    if (e.message === CIRCUIT_BREAKER_MSG) {
      throw e;
    }
    console.error(e);
    return { message: e.message, details: e.stack ?? '' };
  } else {
    console.error(e);
    return { message: 'Unknown error', details: StringUtil.caughtToString(e) };
  }
}

type AsyncState<S extends JSONValue> = {
  depends: JSONValue;
  load_state: LoadState;
  data: S | null;
  error: { message: string; details: string } | null;
};

class AsyncHook<S extends JSONValue> implements Hook {
  state: AsyncState<S>;
  readonly #debug: boolean;
  #hookId: string;
  initializer: AsyncUseStateInitializer<S>;
  #invalidate: () => void;
  #ctx: RenderContext;
  localDepends: JSONValue;
  #options: AsyncOptions<S>;

  constructor(
    initializer: AsyncUseStateInitializer<S>,
    options: AsyncOptions<S>,
    params: HookParams
  ) {
    this.#debug = !!params.context.devvitContext.debug.useAsync;
    if (this.#debug) console.debug('[useAsync] v1', options);
    this.state = { data: null, load_state: 'initial', error: null, depends: null };
    this.#hookId = params.hookId;
    this.initializer = initializer;
    this.#invalidate = params.invalidate;
    this.#ctx = params.context;
    this.localDepends = options.depends ?? null;
    this.#options = options;
  }

  /**
   * After we look at our state, we need to decide if we need to dispatch a request to load the data.
   */
  onStateLoaded(): void {
    if (this.state.load_state === 'disabled') {
      return;
    }
    if (this.#debug) console.debug('[useAsync] async onLoad ', this.#hookId, this.state);
    if (this.#debug)
      console.debug('[useAsync] async onLoad have ', this.localDepends, 'and', this.state.depends);
    if (!isEqual(this.localDepends, this.state.depends) || this.state.load_state === 'initial') {
      if (this.#debug) console.debug(`[useAsync] attempting to resolve for hookId`, this.#hookId);
      this.state.load_state = 'loading';
      this.state.depends = this.localDepends;
      this.#invalidate();

      const requeueEvent: UIEvent = {
        scope: UIEventScope.ALL,
        hook: this.#hookId,
        async: true,
        asyncRequest: {
          requestId: this.#hookId + '-' + JSON.stringify(this.state.depends),
        },
      };
      if (this.#debug) console.debug('[useAsync] onLoad requeue');
      this.#ctx.addToRequeueEvents(requeueEvent);
    }
  }

  async onUIEvent(event: UIEvent, context: RenderContext): Promise<void> {
    /**
     * Requests and responses are both handled here. If we have a request, we need to load the data
     * and then send a response.  If we have a response, we need to update our state and re-render.
     *
     * This is a very event-driven way to handle state, but it's the only way to handle async state.
     */
    if (event.asyncRequest) {
      const asyncResponse: AsyncResponse = { requestId: event.asyncRequest.requestId };
      try {
        asyncResponse.data = {
          value: await this.initializer(),
        };
      } catch (e) {
        asyncResponse.error = toSerializableErrorOrCircuitBreak(e);
      }

      const requeueEvent: UIEvent = {
        scope: UIEventScope.ALL,
        asyncResponse: asyncResponse,
        hook: this.#hookId,
      };
      if (this.#debug) console.debug('[useAsync] onReq requeue');
      context.addToRequeueEvents(requeueEvent);
    } else if (event.asyncResponse) {
      const anticipatedRequestId = this.#hookId + '-' + JSON.stringify(this.state.depends);
      if (event.asyncResponse.requestId === anticipatedRequestId) {
        this.state = {
          ...this.state,
          data: (event.asyncResponse.data?.value as S | undefined) ?? null,
          error: event.asyncResponse.error ?? null,
          load_state: event.asyncResponse.error ? 'error' : 'loaded',
        };
        if (this.#options.finally) {
          await this.#options.finally(
            this.state.data,
            this.state.error ? new Error(this.state.error?.message ?? 'Unknown error') : null
          );
        }
        this.#invalidate();
      } else {
        if (this.#debug)
          console.debug(
            '[useAsync] onResp skip, stale event',
            event.asyncResponse.requestId,
            ' !== ',
            anticipatedRequestId
          );
      }
    } else {
      throw new Error('Unknown event type');
    }
  }
}

/**
 * This is the preferred way to handle async state in Devvit.
 *
 * @param initializer -- any async function that returns a JSONValue
 * @returns UseAsyncResult<S>
 */
export function useAsync<S extends JSONValue>(
  initializer: AsyncUseStateInitializer<S>,
  options: AsyncOptions<S> = {}
): UseAsyncResult<S> {
  const hook = registerHook({
    namespace: 'useAsync',
    initializer: (params) => {
      return new AsyncHook(initializer, options, params);
    },
  });

  return {
    data: hook.state.data,
    error: hook.state.error,
    loading: hook.state.load_state === 'loading',
  };
}
