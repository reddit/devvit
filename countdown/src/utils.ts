import moment from 'moment-timezone';
import { TIMEZONES } from './timezones.js';
import { KVStore } from '@devvit/public-api';
import { POST_DATA_KEY } from './constants.js';

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
export const getFormattedDueDate = (dateTime: string, timeZone: string = 'UTC'): string => {
  // desired date format "October 27, 2023 at 12:00 PM EDT"
  return moment(dateTime).tz(timeZone).format('MMMM D, YYYY [at] h:mm A z');
};

type CountdownEntry = {
  value: number;
  label: string;
};
export type TimeLeft = [CountdownEntry, CountdownEntry, CountdownEntry, CountdownEntry];

export const getFormattedTimeLeft = (timeDiffMs: number): TimeLeft | null => {
  if (timeDiffMs <= 0) {
    return [
      { value: 0, label: 'days' },
      { value: 0, label: 'hours' },
      { value: 0, label: 'mins' },
      { value: 0, label: 'sec' },
    ];
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

export const truncateString = (
  input: string,
  maxLength: number | undefined,
  overflowCharacter: string = ''
): string => {
  if (maxLength === undefined || input.length <= maxLength) {
    return input;
  }
  return `${input.slice(0, maxLength).trimEnd()}${overflowCharacter}`;
};

export type CountdownFormData = {
  title: string;
  description?: string;
  date: string; // yyyy-mm-dd
  time: [string]; // hh:mm 24h format
  timezone: [string]; // Intl timezoneName
  link_url?: string;
  link_title?: string;
  img_url?: string;
};
export type CountdownData = {
  title: string;
  description?: string;
  dateTime: string; // ISO-8601
  timezone?: string; // as in Intl.supportedValuesOf('timeZone'). e.g. Europe/Amsterdam
  link_url?: string;
  link_title?: string;
  img_url: string | null;
};

export async function getPostAssociatedData(postId: string = 'test', kvStore: KVStore) {
  if (!postId) {
    return null;
  }
  const postAssociatedData: CountdownData | undefined = await kvStore.get(POST_DATA_KEY(postId));
  if (!postAssociatedData) {
    return null;
  }

  return postAssociatedData;
}
