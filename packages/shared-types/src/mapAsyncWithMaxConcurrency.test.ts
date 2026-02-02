import { expect } from 'vitest';

import { mapAsyncWithMaxConcurrency } from './mapAsyncWithMaxConcurrency.js';

const addTwoSlowly = async (num: number): Promise<number> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(num + 2);
    }, 50);
  });
};

describe('mapAsyncWithMaxConcurrency', () => {
  it('should error for invalid thread counts', async () => {
    await expect(mapAsyncWithMaxConcurrency([1, 2, 3], addTwoSlowly, -1)).rejects.toThrow(
      'threadLimit must be greater than 0'
    );
    await expect(mapAsyncWithMaxConcurrency([1, 2, 3], addTwoSlowly, 0)).rejects.toThrow(
      'threadLimit must be greater than 0'
    );
    await expect(mapAsyncWithMaxConcurrency([1, 2, 3], addTwoSlowly, 1.5)).rejects.toThrow(
      'threadLimit must be an integer'
    );
  });
  it('should work properly for a single thread', async () => {
    await expect(mapAsyncWithMaxConcurrency([1, 2, 3], addTwoSlowly, 1)).resolves.toEqual([
      3, 4, 5,
    ]);
  });
  it('should work properly for a dual thread', async () => {
    await expect(mapAsyncWithMaxConcurrency([1, 2, 3], addTwoSlowly, 2)).resolves.toEqual([
      3, 4, 5,
    ]);
  });
  it('should work properly when thread count === item count', async () => {
    await expect(mapAsyncWithMaxConcurrency([1, 2, 3], addTwoSlowly, 3)).resolves.toEqual([
      3, 4, 5,
    ]);
  });
  it('should work properly when thread count > item count', async () => {
    await expect(mapAsyncWithMaxConcurrency([1, 2, 3], addTwoSlowly, 10)).resolves.toEqual([
      3, 4, 5,
    ]);
  });
  it(
    'should actually multi-thread things',
    async () => {
      // Note the timeout on this test!
      await expect(
        mapAsyncWithMaxConcurrency([1, 2, 3, 4, 5, 6, 7, 8, 9], addTwoSlowly, 2)
      ).resolves.toEqual([3, 4, 5, 6, 7, 8, 9, 10, 11]);
    },
    50 * 5 + 50
  ); // 5 "batches" of 2 items at 50ms each, plus some wiggle room. (Note that this test times out if the threadLimit is 1!
});
