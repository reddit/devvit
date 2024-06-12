import type { IntervalDetails, UIEvent } from '@devvit/protos';
import { EffectType } from '@devvit/protos';
import type { UseIntervalResult } from '../../../../types/hooks.js';
import { registerHook } from './BlocksHandler.js';
import { RenderContext } from './RenderContext.js';
import type { Hook, HookParams } from './types.js';

/**
 * Keeps track of all the intervals that are currently running in a convenient global.
 */
const intervals: { [hookId: string]: IntervalDetails } = {};

RenderContext.addGlobalUndeliveredEventHandler('intervals', async (event, context) => {
  if (event.timer && event.hook) {
    delete intervals[event.hook];
    context.emitEffect('timers', {
      type: EffectType.EFFECT_SET_INTERVALS,
      interval: { intervals },
    });
  }
});

class IntervalHook implements UseIntervalResult, Hook {
  #hookId: string;
  #invalidate: () => void;
  #callback: () => void | Promise<void>;
  #context: RenderContext;
  state = { duration: { seconds: 0, nanos: 0 }, running: false };
  constructor(callback: () => void | Promise<void>, requestedDelayMs: number, params: HookParams) {
    this.#invalidate = params.invalidate;
    this.#hookId = params.hookId;
    this.#callback = callback;
    this.#context = params.context;
    const seconds = Math.floor(requestedDelayMs / 1000);
    const nanos = (requestedDelayMs % 1000) * 1_000_000;
    this.state.duration = { seconds, nanos };
  }

  onStateLoaded(): void {
    if (this.state.running) {
      intervals[this.#hookId] = { duration: this.state.duration };
    } else {
      delete intervals[this.#hookId];
    }
  }

  async onUIEvent(_event: UIEvent): Promise<void> {
    await this.#callback();
  }

  start(): void {
    intervals[this.#hookId] = { duration: this.state.duration };
    this.state.running = true;
    this.#invalidate();
    this.#context.emitEffect('timers', {
      type: EffectType.EFFECT_SET_INTERVALS,
      interval: { intervals },
    });
  }

  stop(): void {
    delete intervals[this.#hookId];
    this.state.running = false;
    this.#invalidate();
    this.#context.emitEffect('timers', {
      type: EffectType.EFFECT_SET_INTERVALS,
      interval: { intervals },
    });
  }
}

export function useInterval(
  callback: () => void | Promise<void>,
  requestedDelayMs: number
): UseIntervalResult {
  return registerHook({ namespace: 'useInterval' }, (params) => {
    return new IntervalHook(callback, requestedDelayMs, params);
  });
}
