import { GIGABYTE, KILOBYTE, prettyPrintSize } from './Assets.js';

test('Pretty printing works as expected.', () => {
  assert.equal(prettyPrintSize(KILOBYTE), '1KB');
  assert.equal(prettyPrintSize(2 * KILOBYTE), '2KB');
  assert.equal(prettyPrintSize(3.04 * GIGABYTE), '3.04GB');
});
