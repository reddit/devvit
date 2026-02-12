import { requireNonEmptyString, requirePositiveInteger } from './requestValidation.js';

function asError(message: string): Error {
  return new Error(message);
}

describe('requestValidation', () => {
  describe('requireNonEmptyString', () => {
    it('returns a trimmed string when non-empty', () => {
      expect(requireNonEmptyString('  quiz-planet  ', 'appSlug', asError)).toStrictEqual(
        'quiz-planet'
      );
    });

    it('throws when the string is empty after trimming', () => {
      expect(() => requireNonEmptyString('   ', 'appSlug', asError)).toThrow(
        'appSlug must be a non-empty string.'
      );
    });
  });

  describe('requirePositiveInteger', () => {
    it('returns the value when it is a positive integer', () => {
      expect(requirePositiveInteger(3, 'rank', asError)).toStrictEqual(3);
    });

    it('throws for zero, negatives, and non-integers', () => {
      expect(() => requirePositiveInteger(0, 'rank', asError)).toThrow(
        'rank must be a positive integer.'
      );
      expect(() => requirePositiveInteger(-1, 'rank', asError)).toThrow(
        'rank must be a positive integer.'
      );
      expect(() => requirePositiveInteger(1.5, 'rank', asError)).toThrow(
        'rank must be a positive integer.'
      );
    });
  });
});
