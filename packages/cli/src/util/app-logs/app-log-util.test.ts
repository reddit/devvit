import { Severity } from '@devvit/protos';

import { formatAppLogDivider, formatAppLogMessage, parseAppLogDuration } from './app-log-util.js';

describe('parseAppLogDuration', () => {
  test.each([
    ['1s', { seconds: 1 }],
    ['2m', { minutes: 2 }],
    ['3h', { hours: 3 }],
    ['4d', { days: 4 }],
    ['5w', { weeks: 5 }],
  ])('%s', (str, out) => {
    expect(parseAppLogDuration(str)).toEqual(out);
  });

  test('an empty string', () => expect(() => parseAppLogDuration('')).toThrow());

  test('an invalid duration', () => expect(() => parseAppLogDuration('abc')).toThrow());
});

describe('formatAppLogMessage', () => {
  test('an informational message', () =>
    expect(
      formatAppLogMessage(
        { message: 'abc', severity: Severity.INFO, tags: [] },
        { dateFormat: undefined, runtime: false, verbose: false }
      )
    ).toBe('abc'));
  test('an informational message with local runtime', () =>
    expect(
      formatAppLogMessage(
        { message: 'abc', severity: Severity.INFO, tags: [] },
        { dateFormat: undefined, runtime: true, verbose: false },
        true
      )
    ).toBe('[local] abc'));
  test('an informational message with remote runtime', () =>
    expect(
      formatAppLogMessage(
        { message: 'abc', severity: Severity.INFO, tags: [] },
        { dateFormat: undefined, runtime: true, verbose: false }
      )
    ).toBe('[remote] abc'));
  test('an informational message with verbose level', () =>
    expect(
      formatAppLogMessage(
        { message: 'abc', severity: Severity.INFO, tags: [] },
        { dateFormat: undefined, runtime: false, verbose: true }
      )
    ).toBe('[INFO] abc'));
});

describe('formatAppLogDivider', () => {
  test('message < width', () => {
    process.stdout.columns = 50;
    expect(formatAppLogDivider('abc', undefined)).toMatchInlineSnapshot(
      '"────────────────────── abc ───────────────────────"'
    );
  });
  test('message === width', () => {
    process.stdout.columns = 50;
    expect(
      formatAppLogDivider('ABCDEFGHIJKLMNOPQRSTUWVXYZabcdefghijklmnopqrstuvwx', undefined)
    ).toMatchInlineSnapshot('"─ ABCDEFGHIJKLMNOPQRSTUWVXYZabcdefghijklmnopqrstuvwx ─"');
  });
  test('message > width', () => {
    process.stdout.columns = 50;
    expect(
      formatAppLogDivider('ABCDEFGHIJKLMNOPQRSTUWVXYZabcdefghijklmnopqrstuvwxyz', undefined)
    ).toMatchInlineSnapshot('"─ ABCDEFGHIJKLMNOPQRSTUWVXYZabcdefghijklmnopqrstuvwxyz ─"');
  });

  test('message < width, truncated', () => {
    process.stdout.columns = 50;
    expect(formatAppLogDivider('abc', 'TruncStart')).toMatchInlineSnapshot(
      '"────────────────────── abc ───────────────────────"'
    );
  });
  test('message === width, truncated', () => {
    process.stdout.columns = 50;
    expect(
      formatAppLogDivider('ABCDEFGHIJKLMNOPQRSTUWVXYZabcdefghijklmnopqrstuvwx', 'TruncStart')
    ).toMatchInlineSnapshot('"─ …FGHIJKLMNOPQRSTUWVXYZabcdefghijklmnopqrstuvwx ─"');
  });
  test('message > width, truncated', () => {
    process.stdout.columns = 50;
    expect(
      formatAppLogDivider('ABCDEFGHIJKLMNOPQRSTUWVXYZabcdefghijklmnopqrstuvwxyz', 'TruncStart')
    ).toMatchInlineSnapshot('"─ …HIJKLMNOPQRSTUWVXYZabcdefghijklmnopqrstuvwxyz ─"');
  });
});
