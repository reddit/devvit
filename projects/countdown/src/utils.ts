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

export const getTimezones = (): { name: string; tzValue: string }[] => {
  return [...TIMEZONES];
};

export const createDatetime = (
  dateString: string,
  timeString: string,
  tzOffset: string
): string => {
  const [dd, mm, yyyy] = dateString.split('-');
  return `${yyyy}-${mm}-${dd}T${timeString}:00.000${tzOffset}`;
};

// gets offset in format +-hh:mm
// for whole hours expected output is +-h
// otherwise +-h:mm
function getTimezoneString(timezoneOffset: string | undefined): string {
  if (!timezoneOffset) {
    return '';
  }
  try {
    const [hours, minutes] = timezoneOffset.replace(/[+-]/, '').split(':');
    const hoursFormatted = Intl.NumberFormat().format(Number(hours));
    const minutesFormatted = minutes == '00' ? '' : `:${minutes}`;
    return `${timezoneOffset[0]}${hoursFormatted}${minutesFormatted}`;
  } catch (e) {
    return '';
  }
}

export const formatDateTime = (dateString: string): string => {
  const utc0regex = /Z$/;
  const timezoneOffsetRegex = /[+-]\d\d:\d\d$/;
  const dateStringWithoutTimezone = dateString
    .replace(utc0regex, '')
    .replace(timezoneOffsetRegex, '');
  const formattedDate = new Date(dateStringWithoutTimezone).toLocaleString([], {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
  const timezone = utc0regex.test(dateString)
    ? '+00:00'
    : dateString.match(timezoneOffsetRegex)?.[0];
  const timezoneOffset = getTimezoneString(timezone);
  const timezoneString = timezoneOffset ? ` (UTC${timezoneOffset})` : '';
  return `${formattedDate}${timezoneString}`;
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
