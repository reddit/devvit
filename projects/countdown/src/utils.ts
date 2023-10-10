import { TIMEZONES } from './timezones.js';

const MINUTES_IN_HOUR = 60;
const HOURS_IN_DAY = 24;

export const getHourOptions = (hourDividedTimes: number = 1): string[] => {
  const minuteIncrement = MINUTES_IN_HOUR / hourDividedTimes;
  const numberOfEntries = HOURS_IN_DAY * hourDividedTimes;

  function formatStringValue(numberValue: number): string {
    return `${numberValue > 9 ? '' : '0'}${numberValue}`;
  }

  return Array(numberOfEntries)
    .fill(null)
    .map((_, index) => {
      const minutes = (index % numberOfEntries) * minuteIncrement;
      const hourValue = Math.floor(minutes / MINUTES_IN_HOUR);
      const minuteValue = minutes % MINUTES_IN_HOUR;
      const hourStringValue = formatStringValue(hourValue);
      const minuteStringValue = formatStringValue(minuteValue);
      return `${hourStringValue}:${minuteStringValue}`;
    });
};

export const getTimezones = (): string[] => {
  return [...TIMEZONES];
};

export const createDatetime = (
  dateString: string, // expected in `yyyy-mm-dd` format
  timeString: string,
  timezoneName: string
): string => {
  const date = new Date(`${dateString}T${timeString}`);
  const sameDateInCorrectTimezone = new Date(
    date.toLocaleString('en-US', { timeZone: timezoneName })
  );
  const timeDiff = date.getTime() - sameDateInCorrectTimezone.getTime();
  const timezonedDate = new Date(date.getTime() + timeDiff);
  return timezonedDate.toISOString();
};

/**
 * Returns a formatted due date string
 * @param dateTime ISO-8601 string
 * @param timeZone Timezone name as in Intl.supportedValuesOf('timeZone'). e.g. Europe/Amsterdam
 */
export const getFormattedDueDate = (dateTime: string, timeZone?: string): string => {
  return new Date(dateTime).toLocaleString(['en-US'], {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
    timeZone,
  });
};

type CountdownEntry = {
  value: number;
  label: string;
};
export type TimeLeft = [CountdownEntry, CountdownEntry, CountdownEntry, CountdownEntry];

export const getFormattedTimeLeft = (timeDiffMs: number): TimeLeft | null => {
  if (timeDiffMs <= 0) {
    return null;
  }
  const timeDiffSeconds = timeDiffMs / 1000;
  const seconds = Math.floor(timeDiffSeconds % 60);
  const minutes = Math.floor((timeDiffSeconds / 60) % 60);
  const hours = Math.floor((timeDiffSeconds / (60 * 60)) % 24);
  const days = Math.floor(timeDiffSeconds / (60 * 60 * 24));

  return [
    { value: days, label: 'days' },
    { value: hours, label: 'hours' },
    { value: minutes, label: 'mins' },
    { value: seconds, label: 'sec' },
  ];
};
