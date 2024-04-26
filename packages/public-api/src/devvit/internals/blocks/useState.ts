import type { SetStateAction, UseStateHook, UseStateResult } from '../../../types/hooks.js';
import type { BlocksReconciler } from './BlocksReconciler.js';

export function makeUseStateHook(reconciler: BlocksReconciler): UseStateHook {
  function useState<S>(initialState: S): UseStateResult<S> {
    const hookIndex = reconciler.currentHookIndex;
    const currentState = reconciler.getCurrentComponentState<S>();
    const previousState = reconciler.getPreviousComponentState<S>();

    if (hookIndex in currentState) {
      reconciler.currentHookIndex++;
      return [currentState[hookIndex], stateSetter];
    }

    if (reconciler.isInitialRender || !(hookIndex in previousState)) {
      const value = initialState instanceof Function ? initialState() : initialState;

      if (value instanceof Promise) {
        const asyncResolver = async (): Promise<void> => {
          currentState[hookIndex] = await value;
          reconciler.currentHookIndex = 0;
        };
        throw asyncResolver();
      }

      currentState[hookIndex] = value;
    } else {
      currentState[hookIndex] = previousState[hookIndex];
    }

    function stateSetter(valueOrFunction: SetStateAction<S>): void {
      if (reconciler.isRendering) {
        throw new Error('Cannot call setState while rendering.');
      }

      currentState[hookIndex] =
        valueOrFunction instanceof Function
          ? valueOrFunction(currentState[hookIndex])
          : valueOrFunction;
    }

    reconciler.currentHookIndex++;

    return [currentState[hookIndex], stateSetter];
  }
  return useState;
}
