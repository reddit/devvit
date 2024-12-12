import Levels from './data/levels.json';
import Settings from './settings.json';
import type { CandidateWord, Dictionary, Level } from './types.js';

/**
 * Binary search for an element in an array.
 * @param list The array to search.
 * @param compareFunction The comparison function to use.
 * @returns The found element or undefined.
 */

export function binFind<T>(
  list: readonly T[],
  compareFunction: (element: T) => number
): T | undefined {
  let min = 0; // Inclusive
  let max = list.length - 1; // Inclusive

  while (min <= max) {
    const mid = min + Math.trunc((max - min) / 2);
    const direction = compareFunction(list[mid]);
    if (direction === 0) return list[mid];
    if (direction < 0) min = mid + 1;
    else max = mid - 1;
  }

  return undefined;
}

/**
 * Get the level details for a given score.
 * @param score The score to retrieve the level for.
 * @returns The associated Level object or the first level if not found.
 */

export const getLevelByScore = (score: number = 0) =>
  (binFind(Levels, (level) => {
    if (score >= level.min && score <= level.max) {
      return 0;
    } else if (score < level.min) {
      return 1;
    } else {
      return -1;
    }
  }) as Level) ?? (Levels[0] as Level);

/**
 * Get the level details for a given level rank.
 * @param rank The rank of the level to retrieve.
 * @returns The associated Level object
 */

export function getLevel(rank: number) {
  if (rank < 1) {
    return Levels[0] as Level;
  } else if (rank > Levels.length) {
    return Levels[Levels.length - 1] as Level;
  }
  return Levels[rank - 1] as Level;
}

/**
 * Splits an array into segments of a specified length.
 * @param array The array to split.
 * @param segmentLength The length of each segment.
 * @returns An array of segments.
 */

export function splitArray<T>(array: T[], segmentLength: number): T[][] {
  if (segmentLength <= 0) {
    throw new Error('Segment length must be greater than 0.');
  }

  const result: T[][] = [];
  for (let i = 0; i < array.length; i += segmentLength) {
    result.push(array.slice(i, i + segmentLength));
  }

  return result;
}

/**
 * Obfuscates a string by replacing all characters with asterisks.
 * @param input The string to obfuscate.
 * @returns The obfuscated string.
 */

export function obfuscateString(input: string): string {
  return input
    .split('')
    .map((char) => (char === ' ' ? ' ' : '*'))
    .join('');
}

/**
 * Capitalizes the first letter of a word.
 * @param word The word to capitalize.
 * @returns The capitalized word.
 */

export function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

/**
 * Returns a blank canvas with a specified resolution.
 * @returns An array of -1 values.
 */

export const blankCanvas = new Array(Settings.resolution * Settings.resolution).fill(-1);

/**
 * Abbreviates a number by appending a suffix.
 * @param value The number to abbreviate.
 * @returns The abbreviated number.
 */

export function abbreviateNumber(value: number): string {
  if (value < 1000) {
    return value.toString();
  }

  const suffixes = ['k', 'M', 'B', 'T']; // Thousands, Millions, Billions, Trillions
  const tier = (Math.log10(value) / 3) | 0; // Determine the tier (0 for 'k', 1 for 'M', etc.)

  if (tier === 0) return value.toString(); // No abbreviation needed

  const suffix = suffixes[tier - 1];
  const scale = Math.pow(10, tier * 3);
  const scaledValue = value / scale;

  // Use toFixed(1) to keep one decimal place and ensure proper rounding
  return scaledValue.toFixed(1) + suffix;
}

/**
 * Shuffles an array of words using the Fisher-Yates algorithm. Uses i-- to ensure each element is swapped only once, moving backward.
 * (Math.random() * (i + 1)) limits the random index to unshuffled elements so no previously shuffled elements are reswapped.
 *
 * @param words List of elements to shuffle.
 * @returns T[] Shuffled list.
 */

export function shuffle<T>(elements: T[]) {
  const shuffled = [...elements];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Returns a list of candidate words from the provided dictionaries.
 * @param dictionaries The list of dictionaries to draw words from.
 * @returns The list of candidate words.
 */

export const getCandidates = (dictionaries: Dictionary[]): CandidateWord[] => {
  const candidates: CandidateWord[] = [];
  const isTakeoverActive = dictionaries.length > 1;
  dictionaries.forEach((dictionary) => {
    const isMainDictionary = dictionary.name === 'main';
    const shuffledWords = shuffle(dictionary.words);
    const count = isMainDictionary ? (isTakeoverActive ? 2 : 3) : 1;
    const words = shuffledWords.slice(0, Math.min(shuffledWords.length, count));
    words.forEach((word) => {
      candidates.push({
        dictionaryName: dictionary.name,
        word,
      });
    });
  });
  return candidates;
};
