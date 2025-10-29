import { debounce } from './debounce.js';

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let called = 0;
const cb = debounce(() => {
  called++;
}, 100);

test('Debounce calls a function only once if called repeatedly', async () => {
  called = 0;

  cb();
  cb();
  await sleep(50);
  cb();
  cb();
  await sleep(50);
  cb();
  cb();

  await sleep(200);

  expect(called).toBe(1);
});

test('Debounce cleanup works as expected', async () => {
  called = 0;

  cb();
  await sleep(50);
  cb.clear();

  await sleep(200);

  expect(called).toBe(0);
});

test('Debounce making multiple calls over longer periods works as expected', async () => {
  called = 0;

  cb();
  await sleep(200);
  cb();
  cb();
  await sleep(200);
  cb();

  await sleep(200);

  expect(called).toBe(3);
});
