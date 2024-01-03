import { Leaderboard } from './types/state.js';

const MS_IN_SEC = 1000;
const SEC_IN_MIN = 60;
const MIN_IN_HOUR = 60;

export const formatDurationRough = (durationMs: number): string => {
  const seconds = Math.floor(durationMs / MS_IN_SEC) || 1;
  if (seconds < 60) {
    return `${seconds} ${seconds === 1 ? 'second' : 'seconds'}`;
  }
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 60) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  }
  const days = Math.floor(hours / 24);
  return `${days} ${days === 1 ? 'day' : 'days'}`;
};

export const formatDurationFull = (durationSeconds: number): string => {
  if (!durationSeconds) {
    return '0s';
  }
  const secondsDisplay = durationSeconds % SEC_IN_MIN;
  const minutes = Math.floor(durationSeconds / SEC_IN_MIN);
  const minutesDisplay = minutes % MIN_IN_HOUR;
  const hoursDisplay = Math.floor(minutes / MIN_IN_HOUR);

  return [
    hoursDisplay ? `${hoursDisplay}h` : undefined,
    minutesDisplay ? `${minutesDisplay}m` : undefined,
    secondsDisplay ? `${secondsDisplay}s` : undefined,
  ]
    .filter(Boolean)
    .join(' ');
};

export const getHoldingDurationMs = (holdingSince: number) => {
  return Date.now() - holdingSince;
};

export const randomNumber = (min: number, max: number): number => {
  return Math.round(Math.random() * (max - min) + min);
};

export const hoursToMs = (hours: number): number => {
  return hours * 60 * 60 * 1000;
};
export const minutesToMs = (minutes: number): number => {
  return minutes * 60 * 1000;
};

export const insertFlagHolderToLeaderboard = (
  initialLeaderboard: Leaderboard,
  flagHolder: { name: string; score: number }
): Leaderboard => {
  const leaderboardCopy: Leaderboard = initialLeaderboard.map((entry) => ({ ...entry }));
  const currentEntryForFlagHolder = leaderboardCopy.find((entry) => entry.name === flagHolder.name);
  if (currentEntryForFlagHolder) {
    currentEntryForFlagHolder.score = flagHolder.score;
    return leaderboardCopy
      .sort((entryA, entryB) => entryB.score - entryA.score)
      .map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));
  }
  for (let i = 0; i < leaderboardCopy.length; i++) {
    const currentScorer = leaderboardCopy[i];
    if (flagHolder.score > currentScorer.score) {
      leaderboardCopy.splice(i, 0, { ...flagHolder, rank: currentScorer.rank });
      for (let j = i + 1; j < leaderboardCopy.length; j++) {
        leaderboardCopy[j].rank += 1;
      }
      return leaderboardCopy.slice(0, initialLeaderboard.length);
    }
  }
  return leaderboardCopy;
};
