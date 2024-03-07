import { ValidUserString } from '../constants.js';

/**
 * returns undefined for valid allowlist
 * returns error message otherwise
 */
export const validateUserAllowlist = (input: unknown): undefined | string => {
  if (typeof input !== 'string') {
    return 'Invalid type';
  }
  // empty string is always valid
  if (input === '' || input === '*') {
    return;
  }
  if (!ValidUserString.test(input)) {
    return 'User string can only contain spaces, letters, numbers, "-", and "_"';
  }
};

export const canSeeToolbar = (
  allowlist: string | undefined,
  username: string | undefined
): boolean => {
  if (allowlist === '*') {
    return true;
  }

  if (!allowlist || !username) {
    return false;
  }

  return allowlist.split(' ').includes(username);
};
