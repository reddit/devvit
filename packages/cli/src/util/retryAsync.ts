import { sleep } from './sleep.js';

export function retryAsync<Args extends Array<unknown>, Retval>(
  fn: (...args: Args) => Promise<Retval>,
  attempts: number = 3,
  backoffBaseMs: number = 200
): (...args: Args) => Promise<Retval> {
  return async (...args) => {
    let lastError: unknown;

    for (let attempt = 0; attempt < attempts; attempt++) {
      try {
        return await fn(...args);
      } catch (error) {
        lastError = error;
        if (attempt < attempts) {
          await sleep(backoffBaseMs * (attempt + 1));
        }
      }
    }

    throw lastError;
  };
}
