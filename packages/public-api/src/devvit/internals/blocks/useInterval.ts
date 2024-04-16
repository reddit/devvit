import type {
  UseIntervalHook,
  UseIntervalHookState,
  UseIntervalResult,
} from '../../../types/hooks.js';
import { Hook } from '../../../types/hooks.js';
import type { BlocksReconciler } from './BlocksReconciler.js';

export function makeUseIntervalHook(reconciler: BlocksReconciler): UseIntervalHook {
  function useInterval(
    callback: () => void | Promise<void>,
    requestedDelayMs: number
  ): UseIntervalResult {
    const hookIndex = reconciler.currentHookIndex;
    const currentState = reconciler.getCurrentComponentState<UseIntervalHookState>();
    const previousState = reconciler.getPreviousComponentState<UseIntervalHookState>();

    // delayMs may only be a minimum of 100ms
    const minDelay = 100;
    const delayMs = Math.max(minDelay, requestedDelayMs);

    let hookState: UseIntervalHookState = {
      lastRun: undefined,
      running: false,
      preventCallback: false,
      type: Hook.INTERVAL,
    };

    if (hookIndex in currentState) {
      hookState = currentState[hookIndex];
    } else if (hookIndex in previousState) {
      hookState = previousState[hookIndex];
    }

    function start(): void {
      if (requestedDelayMs < minDelay) {
        console.error(
          `useInterval delay must be at least ${minDelay}ms. Your interval of ${requestedDelayMs}ms was automatically extended.`
        );
      }

      for (const [i, stateItem] of Object.entries(currentState)) {
        if (i !== hookIndex.toString() && stateItem?.type === Hook.INTERVAL && stateItem?.running) {
          throw new Error('Only one useInterval hook may be running at a time');
        }
      }

      currentState[hookIndex] = {
        running: true,
        lastRun: Date.now(),
        preventCallback: false,
        type: Hook.INTERVAL,
      };

      reconciler.rerenderIn(delayMs);
    }

    function stop(): void {
      currentState[hookIndex].running = false;
      currentState[hookIndex].lastRun = undefined;
      currentState[hookIndex].preventCallback = false;
    }

    if (reconciler.isEffectRender && hookState.running) {
      if (!hookState.preventCallback) {
        if (hookState.lastRun === undefined || hookState.lastRun + delayMs < Date.now()) {
          reconciler.runHook(async () => {
            const response = callback();

            if (response && response instanceof Promise) {
              await response;
            }

            hookState.lastRun = Date.now();
          });
        }
      }

      reconciler.rerenderIn(delayMs);
    }

    hookState.preventCallback = false;
    currentState[hookIndex] = hookState;
    reconciler.currentHookIndex++;

    return {
      start,
      stop,
    };
  }

  return useInterval;
}
