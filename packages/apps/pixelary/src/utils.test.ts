import { describe, expect, it, test } from 'vitest';

import Levels from './data/levels.json';
import Settings from './settings.json';
import type { Dictionary } from './types.js';
import {
  abbreviateNumber,
  binFind,
  blankCanvas,
  capitalize,
  getCandidates,
  getLevel,
  getLevelByScore,
  obfuscateString,
  shuffle,
  splitArray,
} from './utils.js';

/*
 * binFind
 */

describe('binFind', () => {
  test('Handles zero score', () => {
    const score = 0;
    expect(
      binFind(Levels, (level) => {
        if (score >= level.min && score <= level.max) {
          return 0;
        } else if (score < level.min) {
          return 1;
        } else {
          return -1;
        }
      })
    ).toBe(Levels[0]);
  });

  test('Handles negative score', () => {
    const score = -5;
    expect(
      binFind(Levels, (level) => {
        if (score >= level.min && score <= level.max) {
          return 0;
        } else if (score < level.min) {
          return 1;
        } else {
          return -1;
        }
      })
    ).toBe(undefined);
  });

  test('Handles undefined score', () => {
    expect(binFind(Levels, () => -1)).toBe(undefined);
  });

  test('Handles score 1', () => {
    const score = 1;
    expect(
      binFind(Levels, (level) => {
        if (score >= level.min && score <= level.max) {
          return 0;
        } else if (score < level.min) {
          return 1;
        } else {
          return -1;
        }
      })
    ).toBe(Levels[0]);
  });

  test('Handles score 420', () => {
    const score = 420;
    expect(
      binFind(Levels, (level) => {
        if (score >= level.min && score <= level.max) {
          return 0;
        } else if (score < level.min) {
          return 1;
        } else {
          return -1;
        }
      })
    ).toBe(Levels[8]);
  });

  test('Handles score Infinty', () => {
    const score = Infinity;
    expect(
      binFind(Levels, (level) => {
        if (score >= level.min && score <= level.max) {
          return 0;
        } else if (score < level.min) {
          return 1;
        } else {
          return -1;
        }
      })
    ).toBe(undefined);
  });
});

/*
 * getLevelByScore
 */

describe('getLevelByScore', () => {
  test('Get level by score 0', () => {
    expect(getLevelByScore(0)).toBe(Levels[0]);
  });

  test('Get level by score 1', () => {
    expect(getLevelByScore(1)).toBe(Levels[0]);
  });

  test('Get level by score 5', () => {
    expect(getLevelByScore(5)).toBe(Levels[2]);
  });

  test('Get level by score 69', () => {
    expect(getLevelByScore(69)).toBe(Levels[6]);
  });

  test('Get level by score 420', () => {
    expect(getLevelByScore(420)).toBe(Levels[8]);
  });

  test('Get level by score Infinity', () => {
    expect(getLevelByScore(Infinity)).toBe(Levels[0]);
  });

  test('Get level by score -1', () => {
    expect(getLevelByScore(-1)).toBe(Levels[0]);
  });
});

/*
 * getLevel
 */

describe('getLevel', () => {
  test('Get level 1', () => {
    expect(getLevel(1)).toBe(Levels[0]);
  });

  test('Get level 5', () => {
    expect(getLevel(5)).toBe(Levels[4]);
  });

  test('Get level 42', () => {
    expect(getLevel(42)).toBe(Levels[41]);
  });

  test('0 is too small, returning first level', () => {
    expect(getLevel(0)).toBe(Levels[0]);
  });

  test('-1 is too small, returning first level', () => {
    expect(getLevel(-1)).toBe(Levels[0]);
  });

  test('9001 is too large, returning last level', () => {
    expect(getLevel(9001)).toBe(Levels[41]);
  });
});

/*
 * splitArray
 */

describe('splitArray', () => {
  test('Split empty array', () => {
    expect(splitArray([], 1)).toEqual([]);
  });

  test('Split array of 1', () => {
    expect(splitArray([1], 1)).toEqual([[1]]);
  });

  test('Split array of 2', () => {
    expect(splitArray([1, 2], 1)).toEqual([[1], [2]]);
  });

  test('Split array of 2 with segment length 2', () => {
    expect(splitArray([1, 2], 2)).toEqual([[1, 2]]);
  });

  test('Split array of 3 with segment length 2', () => {
    expect(splitArray([1, 2, 3], 2)).toEqual([[1, 2], [3]]);
  });

  test('Split array of 4 with segment length 2', () => {
    expect(splitArray([1, 2, 3, 4], 2)).toEqual([
      [1, 2],
      [3, 4],
    ]);
  });

  test('Split array of 5 with segment length 3', () => {
    expect(splitArray([1, 2, 3, 4, 5], 3)).toEqual([
      [1, 2, 3],
      [4, 5],
    ]);
  });

  test('Split array of 6 with segment length 3', () => {
    expect(splitArray([1, 2, 3, 4, 5, 6], 3)).toEqual([
      [1, 2, 3],
      [4, 5, 6],
    ]);
  });
});

/*
 * obfuscateString
 */

describe('obfuscateString', () => {
  test('Obfuscate string', () => {
    expect(obfuscateString('hello')).toBe('*****');
  });

  test('Obfuscate empty string', () => {
    expect(obfuscateString('')).toBe('');
  });

  test('Obfuscate string with spaces', () => {
    expect(obfuscateString('hello world')).toBe('***** *****');
  });

  test('Obfuscate string with numbers', () => {
    expect(obfuscateString('123456')).toBe('******');
  });

  test('Obfuscate string with special characters', () => {
    expect(obfuscateString('!@#$%^&*()')).toBe('**********');
  });

  test('Obfuscate string with spaces and special characters', () => {
    expect(obfuscateString('!@#$%^&*() ')).toBe('********** ');
  });
});

/*
 * capitalize
 */

describe('capitalize', () => {
  test('Capitalize word', () => {
    expect(capitalize('hello')).toBe('Hello');
  });

  test('Capitalize empty string', () => {
    expect(capitalize('')).toBe('');
  });

  test('Capitalize string with spaces', () => {
    expect(capitalize('hello world')).toBe('Hello world');
  });

  test('Capitalize string with numbers', () => {
    expect(capitalize('123456')).toBe('123456');
  });

  test('Capitalize string with special characters', () => {
    expect(capitalize('!@#$%^&*()')).toBe('!@#$%^&*()');
  });

  test('Capitalize first character only', () => {
    expect(capitalize('HELLO')).toBe('Hello');
  });
});

/*
 * blankCanvas
 */

describe('blankCanvas', () => {
  test('Canvas is correct length', () => {
    expect(blankCanvas).toHaveLength(Settings.resolution * Settings.resolution);
  });

  test('Canvas is filled with -1', () => {
    expect(blankCanvas).toEqual(new Array(Settings.resolution * Settings.resolution).fill(-1));
  });
});

/*
 * abbreviateNumber
 */

describe('abbreviateNumber', () => {
  it('should return the number as is if less than 1000', () => {
    expect(abbreviateNumber(500)).toBe('500');
    expect(abbreviateNumber(999)).toBe('999');
  });

  it('should abbreviate thousands to "k"', () => {
    expect(abbreviateNumber(1000)).toBe('1.0k');
    expect(abbreviateNumber(9999)).toBe('10.0k');
    expect(abbreviateNumber(50000)).toBe('50.0k');
  });

  it('should abbreviate millions to "M"', () => {
    expect(abbreviateNumber(1000000)).toBe('1.0M');
    expect(abbreviateNumber(5000000)).toBe('5.0M');
    expect(abbreviateNumber(9999999)).toBe('10.0M');
  });

  it('should abbreviate billions to "B"', () => {
    expect(abbreviateNumber(1000000000)).toBe('1.0B');
    expect(abbreviateNumber(2500000000)).toBe('2.5B');
    expect(abbreviateNumber(9999999999)).toBe('10.0B');
  });

  it('should abbreviate trillions to "T"', () => {
    expect(abbreviateNumber(1000000000000)).toBe('1.0T');
    expect(abbreviateNumber(5000000000000)).toBe('5.0T');
    expect(abbreviateNumber(9999999999999)).toBe('10.0T');
  });

  it('should round the result to one decimal place when needed', () => {
    expect(abbreviateNumber(12345)).toBe('12.3k');
    expect(abbreviateNumber(9876543)).toBe('9.9M');
    expect(abbreviateNumber(1234567890)).toBe('1.2B');
  });

  it('should not add a suffix for values less than 1000', () => {
    expect(abbreviateNumber(999)).toBe('999');
  });

  it('should correctly handle edge case values like 1000, 1000000, etc.', () => {
    expect(abbreviateNumber(1000)).toBe('1.0k');
    expect(abbreviateNumber(1000000)).toBe('1.0M');
    expect(abbreviateNumber(1000000000)).toBe('1.0B');
    expect(abbreviateNumber(1000000000000)).toBe('1.0T');
  });
});

/*
 * shuffle
 */

describe('shuffle', () => {
  it('should shuffle an array', () => {
    const array = ['a', 'b', 'c', 'd', 'e'];
    const shuffled = shuffle(array);

    expect(shuffled).not.toEqual(array);
    expect(shuffled).toHaveLength(array.length);
    expect(shuffled).toEqual(expect.arrayContaining(array));
  });

  it('should return an empty array if input is empty', () => {
    expect(shuffle([])).toEqual([]);
  });

  it('should return a new array', () => {
    const array = ['a', 'b', 'c', 'd', 'e'];
    const shuffled = shuffle(array);
    expect(shuffled).not.toBe(array);
  });

  it('should not modify the original array', () => {
    const array = ['a', 'b', 'c', 'd', 'e'];
    const copy = [...array];
    shuffle(array);

    expect(array).toEqual(copy);
  });

  it('should shuffly any element type', () => {
    const array = ['a', 1, true, { key: 'value' }];
    expect(shuffle(array)).not.toEqual(array);
  });
});

/*
 * getCandidates
 */

describe('getCandidates', () => {
  const mainDictionary: Dictionary = {
    name: 'main',
    words: ['apple', 'banana', 'cherry', 'date', 'elderberry'],
  };

  const secondaryDictionary: Dictionary = {
    name: 'secondary',
    words: ['fig', 'grape', 'honeydew'],
  };

  test('should return candidates from a single dictionary', () => {
    const dictionaries = [mainDictionary];
    const candidates = getCandidates(dictionaries);
    expect(candidates.length).toBe(3);
    candidates.forEach((candidate) => {
      expect(candidate.dictionaryName).toBe('main');
      expect(mainDictionary.words).toContain(candidate.word);
    });
  });

  test('should return candidates from multiple dictionaries', () => {
    const dictionaries = [mainDictionary, secondaryDictionary];
    const candidates = getCandidates(dictionaries);
    expect(candidates.length).toBe(3); // 2 from main, 1 from secondary
    const mainCandidates = candidates.filter((c) => c.dictionaryName === 'main');
    const secondaryCandidates = candidates.filter((c) => c.dictionaryName === 'secondary');
    expect(mainCandidates.length).toBe(2);
    expect(secondaryCandidates.length).toBe(1);
  });

  test('should return an empty array if no dictionaries are provided', () => {
    const dictionaries: Dictionary[] = [];
    const candidates = getCandidates(dictionaries);
    expect(candidates).toEqual([]);
  });
});
