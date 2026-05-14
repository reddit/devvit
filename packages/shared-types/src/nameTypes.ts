import { assert } from './assert.js';

// regexes
const ACCOUNT_NAME_REGEX = /^[\w-]+$/;

// type definitions
// prettier-ignore
type AccountNameChars = string & {readonly _isAccountName: '✅'};

type IsAccountName<T extends string> = T extends `${infer Char}${infer Rest}`
  ? Char extends AccountNameChars
    ? IsAccountName<Rest> // Character is valid, check the rest
    : never // Invalid character found
  : T extends ''
    ? string // Base case: string is empty (all previous chars were valid)
    : never;

export type AccountName = IsAccountName<string>;

// type guards
export function isAccountName(candidate: unknown): candidate is AccountName {
  if (!(typeof candidate === 'string')) {
    return false;
  }

  return Boolean(candidate.match(ACCOUNT_NAME_REGEX));
}

// assertion functions
export function assertAccountName(candidate: unknown): asserts candidate is AccountName {
  assert(
    isAccountName(candidate),
    `"${candidate}" is not an account name; expected to match ${ACCOUNT_NAME_REGEX}`
  );
}

// factory functions
export function AccountName(candidate: unknown): AccountName {
  assertAccountName(candidate);
  return candidate;
}
