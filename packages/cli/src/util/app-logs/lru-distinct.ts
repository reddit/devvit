import { Observable, type OperatorFunction } from 'rxjs';

/**
 * Internal helper function, same as rxjs distinct, but adding an LRU flavor to keep memory bounded.
 */
export function lruDistinct<T, K>(
  keySelector?: (value: T) => K,
  maxKeys: number = 1000
): OperatorFunction<T, T> {
  return (source: Observable<T>) =>
    new Observable<T>((subscriber) => {
      const distinctKeys = new Map<K, true>();

      return source.subscribe({
        next(value) {
          const key = keySelector ? keySelector(value) : (value as unknown as K);

          if (!distinctKeys.has(key)) {
            // If at max capacity, remove oldest entry
            if (distinctKeys.size >= maxKeys) {
              const firstKey = distinctKeys.keys().next().value;
              distinctKeys.delete(firstKey!);
            }
            distinctKeys.set(key, true);
            subscriber.next(value);
          } else {
            // Move key to "most recently used" position
            distinctKeys.delete(key);
            distinctKeys.set(key, true);
          }
        },
        error(err) {
          subscriber.error(err);
        },
        complete() {
          subscriber.complete();
        },
      });
    });
}
