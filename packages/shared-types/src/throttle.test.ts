import { expect, test } from 'vitest';

import { throttle } from './throttle.js';

test('a throttled function is invoked with the latest arguments', async () => {
  const out = { val: 0 };
  const fn = throttle((val: number) => (out.val = val), 50);
  fn(1);
  expect(out.val).toBe(0);
  await new Promise((resolve) => setTimeout(resolve, 0));
  expect(out.val).toBe(1);
  fn(2);
  await new Promise((resolve) => setTimeout(resolve, 0));
  expect(out.val).toBe(1);
  await new Promise((resolve) => setTimeout(resolve, 50));
  expect(out.val).toBe(2);
});
