export type DebounceCallback<Args extends unknown[]> = ((...args: Args) => unknown) & {
  clear: () => void;
};

/**
 * Debounce a function. Wraps a function, ensuring it's only called after it
 * hasn't been called for a certain amount of time.
 * @param callback Function to call
 * @param delayArg Delay in milliseconds, or a function that returns the delay
 */
export function debounce<Args extends unknown[]>(
  callback: (...args: Args) => unknown,
  delayArg: number | ((...args: Args) => number)
): DebounceCallback<Args> {
  let timeout: NodeJS.Timeout | undefined;

  const retval = (...args: Args) => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = undefined;
    }

    const delay = typeof delayArg === 'function' ? delayArg(...args) : delayArg;

    timeout = setTimeout(() => {
      timeout = undefined;
      callback(...args);
    }, delay);
  };

  retval.clear = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = undefined;
    }
  };

  return retval;
}
