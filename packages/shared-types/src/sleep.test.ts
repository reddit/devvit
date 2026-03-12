import { expect, test } from 'vitest';

import { sleep } from './sleep.js';

test('sleep returns a Promise', () => {
  expect(sleep(0)).toBeInstanceOf(Promise);
});

test('sleep resolves after at least the requested delay', async () => {
  const delayMS = 20;
  const timingFuzzMS = 1;
  const startedAt = performance.now();

  await sleep(delayMS);

  const elapsedMS = performance.now() - startedAt;
  expect(elapsedMS).toBeGreaterThanOrEqual(delayMS - timingFuzzMS);
});
