import { describe, expect, it } from 'vitest';

import { retryAsync } from './retryAsync.js';

describe('retryAsync', () => {
  it('passes params in correctly, and returns the right value', async () => {
    const add = retryAsync(async (a: number, b: number) => a + b);
    await expect(add(2, 3)).resolves.toBe(5);
  });

  it('re-throws only the last error', async () => {
    let errorCount = 0;
    const errorWithCount = retryAsync(async () => {
      errorCount++;
      throw new Error(`Error number ${errorCount}`);
    });
    await expect(errorWithCount()).rejects.toThrow('Error number 3');
  });
});
