import type { JSONValue } from '@devvit/shared-types/json.js';
import type { AsyncUseStateInitializer, UseAsyncResult } from '../../../../types/hooks.js';

import type { AsyncResponse, UIEvent } from '@devvit/protos';
import { EffectType } from '@devvit/protos';
import type { Hook, HookParams } from './types.js';
import { registerHook } from './BlocksHandler.js';
import type { RenderContext } from './RenderContext.js';

class AsyncHook<S extends JSONValue> implements Hook {
  state: UseAsyncResult<S>;
  #hookId: string;
  #initializer: AsyncUseStateInitializer<S>;
  #changed: () => void;

  constructor(initializer: AsyncUseStateInitializer<S>, params: HookParams) {
    this.state = { data: null, loading: false, error: null };
    this.#hookId = params.hookId;
    this.#initializer = initializer;
    this.#changed = params.changed;
  }

  /**
   * After we look at our state, we need to decide if we need to dispatch a request to load the data.
   */
  onLoad(context: RenderContext): void {
    if (this.state.data === null && this.state.error === null && this.state.loading === false) {
      this.state.loading = true;
      this.#changed();
      context.emitEffect(this.#hookId, {
        type: EffectType.EFFECT_SEND_EVENT,
        sendEvent: {
          event: {
            asyncRequest: { requestId: this.#hookId },
            async: true,
            hook: this.#hookId,
          },
        },
      });
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
          asyncResponse.error = { message: e.message, details: e.stack ?? '' };
        } else {
          asyncResponse.error = { message: 'Unknown error', details: String(e) };
        }
      }

      context.emitEffect(this.#hookId, {
        type: EffectType.EFFECT_SEND_EVENT,
        sendEvent: {
          event: {
            asyncResponse,
            hook: this.#hookId,
          },
        },
      });
    } else if (event.asyncResponse) {
      const result: UseAsyncResult<S> = {
        data: event.asyncResponse.data?.value as S | null,
        loading: false,
        error: event.asyncResponse.error ?? null,
      };
      this.state = result;
      this.#changed();
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
  initializer: AsyncUseStateInitializer<S>
): UseAsyncResult<S> {
  const hook = registerHook({ namespace: 'useAsync' }, (params) => {
    return new AsyncHook(initializer, params);
  });

  return hook.state;
}
