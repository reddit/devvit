import { omit } from './omit.js';

test('omit returns a copy without the selected key', () => {
  const input = {
    keep: 'value',
    remove: 'discarded',
    count: 7,
  };

  expect(omit(input, 'remove')).toEqual({
    keep: 'value',
    count: 7,
  });
  expect(input).toEqual({
    keep: 'value',
    remove: 'discarded',
    count: 7,
  });
});
