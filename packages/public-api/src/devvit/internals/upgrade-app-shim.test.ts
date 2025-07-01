import type { ParsedDevvitUserAgent } from './upgrade-app-shim.js';
import { parseDevvitUserAgent, shouldShowUpgradeAppScreen } from './upgrade-app-shim.js';

describe('parseDevvitUserAgent', () => {
  it.each<[userAgent: string, parsed: ParsedDevvitUserAgent]>([
    // Android
    [
      'Reddit;Android;2024.32.0+5262029.1794506',
      {
        company: 'Reddit',
        platform: 'Android',
        rawVersion: '2024.32.0+5262029.1794506',
        versionNumber: 1794506,
      },
    ],
    // iOS
    [
      'Reddit;iOS;2024.31.0.2090580',
      {
        company: 'Reddit',
        platform: 'iOS',
        rawVersion: '2024.31.0.2090580',
        versionNumber: 2090580,
      },
    ],
    // Shreddit
    [
      'Reddit;Shreddit;not-provided',
      {
        company: 'Reddit',
        platform: 'Shreddit',
        rawVersion: 'not-provided',
      },
    ],
  ])('%s parses successfully', (userAgent, parsed) => {
    expect(parseDevvitUserAgent(userAgent)).toEqual(parsed);
  });

  it.each<[userAgent: string]>([
    [''],
    ['Reddit;'],
    ['Reddit;foo;'],
    ['Reddit;Android;foo'],
    ['Reddit;iOS;foo'],
    ['Reddit;iOS;foo'],
    ['Reddit;Android;foo'],
    ['Reddit;Web;foo'],
  ])('%s parses fails to parse', (userAgent) => {
    expect(parseDevvitUserAgent(userAgent)).toEqual(undefined);
  });
});

describe('shouldShowUpgradeAppScreen', () => {
  it.each<[userAgent: string, shouldShow: boolean]>([
    // Android
    ['Reddit;Android;2024.32.0+5262029.1875013', false],
    ['Reddit;Android;2024.32.0+5262029.1875012', false],
    ['Reddit;Android;2024.32.0+5262029.1875011', true],
    // iOS
    ['Reddit;iOS;2024.31.0.614974', false],
    ['Reddit;iOS;2024.31.0.614973', false],
    ['Reddit;iOS;2024.31.0.614972', true],
    // Shreddit
    ['Reddit;Shreddit;not-provided', false],
  ])('%s should return %s', (userAgent, shouldShow) => {
    expect(shouldShowUpgradeAppScreen(parseDevvitUserAgent(userAgent))).toEqual(shouldShow);
  });
});
