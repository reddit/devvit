import { abbreviate } from './error-utils.js';

describe('abbreviate()', () => {
  const testCases = [
    {
      name: 'returns the original string when length is 256 or less',
      input: 'a'.repeat(256),
      expected: 'a'.repeat(256),
    },
    {
      name: 'truncates and appends ellipsis when string is longer than 256 characters',
      input: 'a'.repeat(300),
      expected: 'a'.repeat(256) + '…',
      expectedLength: 257,
    },
    {
      name: 'handles empty string',
      input: '',
      expected: '',
    },
    {
      name: 'handles single character',
      input: 'x',
      expected: 'x',
    },
  ];

  for (const testCase of testCases) {
    test(testCase.name, () => {
      const actual = abbreviate(testCase.input);
      expect(actual).toBe(testCase.expected);
      if (testCase.expectedLength != null) expect(actual.length).toBe(testCase.expectedLength);
    });
  }
});
