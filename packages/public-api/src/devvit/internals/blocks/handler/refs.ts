import { _activeRenderContext } from './BlocksHandler.js';
import type { HookRef } from './types.js';

/**
 * This function is mostly used for tests.  It's a way to capture the hook id without changing code too much
 *
 * Example:
 *
 * ```tsx
 * const ref: HookRef = {};
 * let [count, setCount] = captureHookRef(useState(0), ref);
 * ```
 *
 * @param value
 * @param ref
 * @returns
 */
export function captureHookRef<T>(value: T, ref: HookRef): T {
  if (!_activeRenderContext) {
    throw new Error('No active render context');
  }

  if (typeof value === 'function') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (value as any)['captureHookRef'] = () => {
      if (!_activeRenderContext) {
        throw new Error('No active render context');
      }
      const id = _activeRenderContext._prevHookId;
      ref.id = id;
    };
  } else {
    const id = _activeRenderContext._prevHookId;
    if (!id) {
      throw new Error('No hook id found');
    }
    ref.id = id;
  }

  return value;
}
