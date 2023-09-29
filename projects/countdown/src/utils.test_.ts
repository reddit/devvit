import { createDatetime, getHourOptions, getFormattedTimeLeft, formatDateTime } from './utils.js';
import { describe, expect } from 'vitest';

describe('utils', () => {
  describe('get hour options', () => {
    it('has 00:00 as first option', () => {
      expect(getHourOptions()[0]).toBe('00:00');
    });
    it('has 23:00 as last option', () => {
      const hourOptions = getHourOptions();
      expect(hourOptions[hourOptions.length - 1]).toBe('23:00');
    });
    it('has 01:00 as second option', () => {
      expect(getHourOptions()[1]).toBe('01:00');
    });
    it('has 24 entries', () => {
      expect(getHourOptions().length).toBe(24);
    });
    describe('with hourDividedTimes = 2', () => {
      it('has 00:30 as second option', () => {
        expect(getHourOptions(2)[1]).toBe('00:30');
      });
      it('has 23:30 as last option', () => {
        const hourOptions = getHourOptions(2);
        expect(hourOptions[hourOptions.length - 1]).toBe('23:30');
      });
      it('has 01:00 as a third option', () => {
        expect(getHourOptions(2)[2]).toBe('01:00');
      });
      it('has 48 entries', () => {
        expect(getHourOptions(2).length).toBe(48);
      });
    });
  });
  describe('create date from user input', () => {
    it('should set datetime from east', () => {
      const datetime = createDatetime('24-08-1991', '12:00', '+02:00');
      expect(datetime).toBe('1991-08-24T12:00:00.000+02:00');
    });
    it('should set datetime from west', () => {
      const datetime = createDatetime('24-08-1991', '09:00', '-04:00');
      expect(datetime).toBe('1991-08-24T09:00:00.000-04:00');
    });
    it('should set datetime from UTC-0', () => {
      const datetime = createDatetime('24-08-1991', '09:00', 'Z');
      expect(datetime).toBe('1991-08-24T09:00:00.000Z');
    });
  });
  describe('format datetime from user input', () => {
    it('should print date as is for UTC-0', () => {
      const datetime = formatDateTime('2023-09-16T14:00:00.000Z');
      expect(datetime).toBe('September 16, 2023 at 2:00 PM (UTC+0)');
    });
    it('should print timezone UTC+02:00', () => {
      const datetime = formatDateTime('2023-09-16T14:00:00.000+02:00');
      expect(datetime).toBe('September 16, 2023 at 2:00 PM (UTC+2)');
    });
    it('should print timezone for UTC-04:30', () => {
      const datetime = formatDateTime('2023-09-16T14:00:00.000-04:30');
      expect(datetime).toBe('September 16, 2023 at 2:00 PM (UTC-4:30)');
    });
  });
  describe('get time left', () => {
    it('returns null if dates are equal', () => {
      expect(getFormattedTimeLeft(0)).toBeNull();
    });

    it('returns null if date provided has already passed', () => {
      expect(getFormattedTimeLeft(-1000)).toBeNull();
    });

    it('returns null if date provided has already passed', () => {
      const dateNow = new Date('2023-08-18T09:00:00');
      const targetDate = new Date('2023-08-24T10:15:30');
      const timeDiff = targetDate.getTime() - dateNow.getTime();
      expect(getFormattedTimeLeft(timeDiff)).toEqual([
        { label: 'days', value: 6 },
        { label: 'hours', value: 1 },
        { label: 'mins', value: 15 },
        { label: 'sec', value: 30 },
      ]);
      vi.useRealTimers();
    });
  });
});
