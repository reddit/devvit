import Settings from '../settings.json';

interface Range {
  start: number;
  end: number;
  multiplier: number;
}

const ranges: Range[] = Settings.guesserPointMultiplier;

export function getScoreMultiplier(inputDate: Date): number {
  const then = new Date(inputDate);
  const now = new Date();
  const durationInMilliseconds = now.getTime() - then.getTime();

  for (const range of ranges) {
    if (durationInMilliseconds >= range.start && durationInMilliseconds < range.end) {
      return range.multiplier;
    }
  }

  // Return default multiplier if no range matches
  return 0;
}
