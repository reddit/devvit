import type { JSONValue } from '@devvit/shared-types/json.js';
import type { AsyncUseStateInitializer, UseAsyncResult } from '../../../../types/hooks.js';

import type { AsyncResponse, UIEvent } from '@devvit/protos';
import { CIRCUIT_BREAKER_MSG } from '@devvit/shared-types/CircuitBreaker.js';
import isEqual from 'lodash.isequal';
import { registerHook } from './BlocksHandler.js';
import type { RenderContext } from './RenderContext.js';
import type { Hook, HookParams } from './types.js';
export type AsyncOptions = {
  /**
   * The data loader will re-run if the value of `depends` changes.
   */
  depends?: JSONValue;

  /**
   * If `enabled` is false, the data loader will not run.
   */
  enabled?: boolean;
};

class AsyncHook<S extends JSONValue> implements Hook {
  state: UseAsyncResult<S> & { depends: JSONValue };
  readonly #debug: boolean;
  #hookId: string;
  #initializer: AsyncUseStateInitializer<S>;
  #invalidate: () => void;
  #ctx: RenderContext;
  #localDepends: JSONValue;
  #enabled: boolean;

  constructor(initializer: AsyncUseStateInitializer<S>, options: AsyncOptions, params: HookParams) {
    this.#debug = !!params.context.devvitContext.debug.useAsync;
    if (this.#debug) console.debug('[useAsync] v1', options);
    this.state = { data: null, loading: false, error: null, depends: null };
    this.#hookId = params.hookId;
    this.#initializer = initializer;
    this.#invalidate = params.invalidate;
    this.#ctx = params.context;
    this.#localDepends = options.depends ?? null;
    this.#enabled = options.enabled ?? true;
  }

  /**
   * After we look at our state, we need to decide if we need to dispatch a request to load the data.
   */
  onStateLoaded(): void {
    if (!this.#enabled) {
      return;
    }
    if (this.#debug) console.debug('[useAsync] async onLoad ', this.#hookId, this.state);
    if (this.#debug)
      console.debug('[useAsync] async onLoad have ', this.#localDepends, 'and', this.state.depends);
    if (
      !isEqual(this.#localDepends, this.state.depends) ||
      (this.state.data === null && this.state.error === null && this.state.loading === false)
    ) {
      this.state.loading = true;
      this.state.depends = this.#localDepends;
      this.#invalidate();

      const requeueEvent: UIEvent = {
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
          value: await this.#initializer(),
        };
      } catch (e) {
        if (e instanceof Error) {
          if (e.message === CIRCUIT_BREAKER_MSG) {
            throw e;
          }
          asyncResponse.error = { message: e.message, details: e.stack ?? '' };
        } else {
          asyncResponse.error = { message: 'Unknown error', details: String(e) };
        }
      }

      const requeueEvent: UIEvent = {
        asyncResponse: asyncResponse,
        hook: this.#hookId,
      };
      if (this.#debug) console.debug('[useAsync] onReq requeue');
      context.addToRequeueEvents(requeueEvent);
    } else if (event.asyncResponse) {
      const anticipatedRequestId = this.#hookId + '-' + JSON.stringify(this.state.depends);
      if (event.asyncResponse.requestId === anticipatedRequestId) {
        const result = {
          data: event.asyncResponse.data?.value as S | null,
          loading: false,
          error: event.asyncResponse.error ?? null,
        };
        this.state = { ...this.state, ...result };
        this.#invalidate();
      } else {
        if (this.#debug) console.debug('[useAsync] onResp skip, stale event');
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
  options: AsyncOptions = {}
): UseAsyncResult<S> {
  const hook = registerHook({ namespace: 'useAsync' }, (params) => {
    return new AsyncHook(initializer, options, params);
  });

  return hook.state;
}
