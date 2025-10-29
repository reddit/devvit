/** Limit function execution frequency. */
export function throttle<T extends unknown[]>(
  fn: (...args: T) => void,
  period: number
): (...args: T) => void {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  let prev = 0;
  let nextArgs: T | undefined;
  return function (this: unknown, ...args: T): () => void {
    nextArgs = args;
    timeout ??= setTimeout(
      () => {
        prev = Date.now();
        timeout = undefined;
        const args = nextArgs!;
        nextArgs = undefined;
        fn.apply(this, args);
      },
      Math.max(0, period - (Date.now() - prev))
    );
    return () => {
      if (timeout != null) clearTimeout(timeout);
      timeout = undefined;
      nextArgs = undefined;
    };
  };
}
