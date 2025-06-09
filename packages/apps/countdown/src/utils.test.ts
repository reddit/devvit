import { TIMEZONES } from './timezones.js';
import {
  createDatetime,
  getFormattedDueDate,
  getFormattedTimeLeft,
  getHourOptions,
  truncateString,
} from './utils.js';

let initialTimezone = process.env.TZ;
describe('utils', () => {
  beforeAll(() => {
    initialTimezone = process.env.TZ;
    process.env.TZ = 'UTC';
  });
  afterAll(() => {
    process.env.TZ = initialTimezone!;
  });

  describe('get hour options', () => {
    test('has 00:00 as first option', () => {
      expect(getHourOptions()[0]).toBe('00:00');
    });
    test('has 23:00 as last option', () => {
      const hourOptions = getHourOptions();
      expect(hourOptions[hourOptions.length - 1]).toBe('23:00');
    });
    test('has 01:00 as second option', () => {
      expect(getHourOptions()[1]).toBe('01:00');
    });
    test('has 24 entries', () => {
      expect(getHourOptions().length).toBe(24);
    });
    describe('with hourDividedTimes = 2', () => {
      test('has 00:30 as second option', () => {
        expect(getHourOptions(2)[1]).toBe('00:30');
      });
      test('has 23:30 as last option', () => {
        const hourOptions = getHourOptions(2);
        expect(hourOptions[hourOptions.length - 1]).toBe('23:30');
      });
      test('has 01:00 as a third option', () => {
        expect(getHourOptions(2)[2]).toBe('01:00');
      });
      test('has 48 entries', () => {
        expect(getHourOptions(2).length).toBe(48);
      });
    });
  });

  describe('create date from user input', () => {
    test('should set datetime from east', () => {
      const datetime = createDatetime('1991-08-24', '12:00', 'Europe/Amsterdam');
      expect(datetime).toBe('1991-08-24T10:00:00.000Z');
    });
    test('should set datetime from west', () => {
      const datetime = createDatetime('1991-08-24', '09:00', 'America/New_York');
      expect(datetime).toBe('1991-08-24T13:00:00.000Z');
    });
    test('should set datetime from UTC-0', () => {
      const datetime = createDatetime('1964-12-30', '09:00', 'Europe/London');
      expect(datetime).toBe('1964-12-30T09:00:00.000Z');
    });
  });

  describe('format datetime from user input', () => {
    test('London timezone', () => {
      const datetime = getFormattedDueDate('2023-10-27T16:00:00.000Z', 'Europe/London');
      expect(datetime).toBe('October 27, 2023 at 5:00 PM BST');
    });
    test('CET timezone', () => {
      const datetime = getFormattedDueDate('2023-09-16T14:00:00.000+02:00', 'Europe/Amsterdam');
      expect(datetime).toBe('September 16, 2023 at 2:00 PM CEST');
    });
    test('ET timezone', () => {
      const datetime = getFormattedDueDate('2023-10-27T16:00:00.000Z', 'America/New_York');
      expect(datetime).toBe('October 27, 2023 at 12:00 PM EDT');
    });
    test('PT timezone', () => {
      const datetime = getFormattedDueDate('2023-10-27T16:00:00.000Z', 'America/Los_Angeles');
      expect(datetime).toBe('October 27, 2023 at 9:00 AM PDT');
    });
    test('When no timezone specified, defaults to UTC-0', () => {
      const datetime = getFormattedDueDate('2023-10-27T16:00:00.000Z', undefined);
      expect(datetime).toBe('October 27, 2023 at 4:00 PM UTC');
    });
  });

  describe('get time left', () => {
    test('returns null if dates are equal', () => {
      expect(getFormattedTimeLeft(0)).toEqual([
        { label: 'days', value: 0 },
        { label: 'hours', value: 0 },
        { label: 'mins', value: 0 },
        { label: 'sec', value: 0 },
      ]);
    });

    test('returns null if date provided has already passed', () => {
      expect(getFormattedTimeLeft(-1000)).toEqual([
        { label: 'days', value: 0 },
        { label: 'hours', value: 0 },
        { label: 'mins', value: 0 },
        { label: 'sec', value: 0 },
      ]);
    });

    test('returns null if date provided has already passed', () => {
      const dateNow = new Date('2023-08-18T09:00:00');
      const targetDate = new Date('2023-08-24T10:15:30');
      const timeDiff = targetDate.getTime() - dateNow.getTime();
      expect(getFormattedTimeLeft(timeDiff)).toEqual([
        { label: 'days', value: 6 },
        { label: 'hours', value: 1 },
        { label: 'mins', value: 15 },
        { label: 'sec', value: 30 },
      ]);
    });
  });
  describe('timezones', () => {
    test('should have a lot of timezones', () => {
      expect(TIMEZONES.length).toBe(434);
    });
    test('should have priority timezones first', () => {
      const firstTimezones = TIMEZONES.slice(0, 6);
      expect(firstTimezones).toEqual([
        'America/Los_Angeles',
        'America/Denver',
        'America/Chicago',
        'America/New_York',
        'Europe/London',
        'Europe/Amsterdam',
      ]);
    });
  });

  describe('string truncate', () => {
    test('should do nothing if no maxLength is passed', () => {
      const originalString = 'The quick brown fox jumps over the lazy dog';
      expect(truncateString(originalString, undefined)).toBe(originalString);
    });
    test('should return empty string if 0 is passed', () => {
      const originalString = 'The quick brown fox jumps over the lazy dog';
      expect(truncateString(originalString, 0)).toBe('');
    });
    test('should trim the string to contain exactly maxLength characters', () => {
      const originalString = 'The quick brown fox jumps over the lazy dog';
      expect(truncateString(originalString, 2)).toBe('Th');
    });
    test('should remove trailing whitespace in output string', () => {
      const originalString = 'The quick brown fox jumps over the lazy dog';
      expect(truncateString(originalString, 4)).toBe('The');
    });
    test('should add the overflow character when it is specified', () => {
      const originalString = 'The quick brown fox jumps over the lazy dog';
      expect(truncateString(originalString, 2, '…')).toBe('Th…');
    });
    test('should not have whitespace before the overflow character', () => {
      const originalString = 'The quick brown fox jumps over the lazy dog';
      expect(truncateString(originalString, 10, '…')).toBe('The quick…');
    });
    test('should not add the overflow character if input is shorter than maxLength', () => {
      const originalString = 'Hello world!';
      expect(truncateString(originalString, 100, '…')).toBe(originalString);
    });
    test('should not add the overflow character if input is equal to maxLength', () => {
      const originalString = 'ABC';
      expect(truncateString(originalString, 3, '…')).toBe(originalString);
    });
  });
});
