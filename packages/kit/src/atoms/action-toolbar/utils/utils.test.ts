// Run me with `npm test`.
import type { SettingsClient } from '@devvit/public-api';
import { devAction, getAllowedUsers } from './external.js';
import type { Mock } from 'vitest';
import { canSeeToolbar, validateUserAllowlist } from './utils.js';

describe('utils', () => {
  describe('settings retriever', () => {
    const settingsClientMock: SettingsClient = { get: vi.fn(), getAll: vi.fn() } as SettingsClient;

    beforeEach(() => {
      (settingsClientMock.get as Mock).mockReset();
    });

    it('queries settings from "devvtools:allowed_users"', async () => {
      await getAllowedUsers(settingsClientMock);
      expect(settingsClientMock.get).toHaveBeenCalledOnce();
      expect(settingsClientMock.get).toHaveBeenCalledWith('devvtools:allowed_users');
    });

    it('returns the value that is stored in settings', async () => {
      (settingsClientMock.get as Mock).mockResolvedValue('spez kebakark');
      const users = await getAllowedUsers(settingsClientMock);
      expect(users).toBe('spez kebakark');
    });

    it('returns empty string if settings are undefined', async () => {
      (settingsClientMock.get as Mock).mockResolvedValue(undefined);
      const users = await getAllowedUsers(settingsClientMock);
      expect(users).toBe('');
    });

    it('returns empty string if settings is number', async () => {
      (settingsClientMock.get as Mock).mockResolvedValue(11);
      const usersNumber = await getAllowedUsers(settingsClientMock);
      expect(usersNumber).toBe('');
    });
    it('returns empty string if settings is array', async () => {
      (settingsClientMock.get as Mock).mockResolvedValue(['spez', 'kebakark']);
      const usersArray = await getAllowedUsers(settingsClientMock);
      expect(usersArray).toBe('');
    });
  });

  describe('allowed users validation', () => {
    it('returns type error for non-string values', () => {
      expect(validateUserAllowlist(undefined)).toBe('Invalid type');
      expect(validateUserAllowlist(11)).toBe('Invalid type');
      expect(validateUserAllowlist(['a', 'b'])).toBe('Invalid type');
    });

    it('allows empty string', () => {
      expect(validateUserAllowlist('')).toBe(undefined);
    });

    it('allows letters, numbers, spaces, dash and underscore', () => {
      expect(validateUserAllowlist('kebakark num6ers un_derscore d-ashe')).toBe(undefined);
    });

    it('disallows non- letters, numbers, spaces, dash and underscore', () => {
      expect(validateUserAllowlist('{weird}')).toBe(
        'User string can only contain spaces, letters, numbers, "-", and "_"'
      );
      expect(validateUserAllowlist('a, b')).toBe(
        'User string can only contain spaces, letters, numbers, "-", and "_"'
      );
      expect(validateUserAllowlist('[a b]')).toBe(
        'User string can only contain spaces, letters, numbers, "-", and "_"'
      );
    });

    it('allows asterisk as a value', () => {
      expect(validateUserAllowlist('*')).toBe(undefined);
    });
  });

  describe('canSeeToolbar', () => {
    it('returns true if value is *', () => {
      expect(canSeeToolbar('*', undefined)).toBe(true);
      expect(canSeeToolbar('*', 'kebakark')).toBe(true);
    });
    it('returns false if value is undefined', () => {
      expect(canSeeToolbar(undefined, undefined)).toBe(false);
      expect(canSeeToolbar(undefined, 'kebakark')).toBe(false);
    });
    it('returns false if value is empty string', () => {
      expect(canSeeToolbar('', undefined)).toBe(false);
      expect(canSeeToolbar('', 'kebakark')).toBe(false);
    });
    it('returns false if username is undefined', () => {
      expect(canSeeToolbar('spez kebakark', undefined)).toBe(false);
    });
    it('returns true if username is in the list', () => {
      expect(canSeeToolbar('spez kebakark', 'kebakark')).toBe(true);
      expect(canSeeToolbar('spez   kebakark', 'kebakark')).toBe(true);
      expect(canSeeToolbar('spez  kebakark somebody', 'kebakark')).toBe(true);
    });
  });

  describe('action creator', () => {
    it('accepts function as the only parameter', () => {
      const actionFn = (): void => {
        console.log('hehe');
      };
      expect(devAction(actionFn)).toEqual({ run: actionFn });
    });
    it('accepts label as first param and function as a second parameter', () => {
      const actionFn = (): void => {
        console.log('hehe');
      };
      expect(devAction('log hehe', actionFn)).toEqual({ label: 'log hehe', run: actionFn });
    });
  });
});
