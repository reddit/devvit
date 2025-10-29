import { makeSlug, validateSluggable } from './slug.js';

describe('sluggable', () => {
  describe('Should return false if string is not sluggable', () => {
    const invalidString = [
      '',
      '@@@@@@@@@',
      '1234567890@@',
      '"123456',
      "''''''",
      '.abcdefghi',
      'shaun.sheep',
      'i_love_snake_case',
      'hello~hello~',
      'r2',
      't23456789012345678',
      'devvit-post_filter~',
      'reddit-app',
    ];
    it.each(invalidString)('String %#: %s', (input) => {
      expect(validateSluggable(input)).toBeTypeOf('string');
    });
  });
  describe('Should return true if string is sluggable', () => {
    const validStrings = ['ALLCAPSSSSSSSS', 'abcdef', 'abc', 'test-app-1', 'Test app 1 App'];
    it.each(validStrings)('String %#: %s', (input) => {
      console.log(validateSluggable(input));
      expect(validateSluggable(input)).toBeUndefined();
    });
  });
});

describe('makeSlug', () => {
  describe('Makes a slug if the input is valid', () => {
    test.each([
      ['dev post filter-', 'dev-post-filter-'],
      ['a123456 7', 'a123456-7'],
      ['dev-post filter', 'dev-post-filter'],
      ['b123456', 'b123456'],
    ])('String %#: %s', (input, expected) => {
      expect(makeSlug(input)).toBe(expected);
    });
  });
  describe('Throws if the input is not sluggable', () => {
    test.each([
      '--------',
      '@devvit/post-filter',
      '1',
      'a',
      '',
      'shaun.the.sheep',
      'dot.dot',
      'mynameis~mynameis',
      'under_score',
      [...Array(201).keys()].map((_) => 'a').join(''),
    ])('String %#: %s', (input) => {
      expect(() => makeSlug(input)).toThrow();
    });
  });
});
