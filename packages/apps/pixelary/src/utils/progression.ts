import Levels from '../data/levels.json';
import type { Level } from '../types/Level.js';

/**
 * Performs a binary search to find the users level based on their score value.
 *
 * @param score The score value to evaluate.
 * @returns The level object or a default level if not found.
 */

export function getLevelByScore(score: number = 0): Level {
  let left = 0;
  let right = Levels.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const level = Levels[mid] as Level;

    // Check if points fall within the current tier
    if (score >= level.min && score <= level.max) {
      return level;
    }

    // If points are less than the min of the mid level, search left
    else if (score < level.min) {
      right = mid - 1;
    }

    // If points are greater than the max of the mid level, search right
    else {
      left = mid + 1;
    }
  }

  return Levels[0] as Level;
}

/**
 * Get the level details for a given level rank.
 * @param rank The rank of the level to retrieve.
 * @returns The associated Level object
 */

export function getLevel(rank: number): Level {
  return Levels[rank - 1] as Level;
}
