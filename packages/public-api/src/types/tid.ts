import { assert } from '@devvit/shared-types/assert.js';

// CALMS!
export enum T_PREFIX {
  COMMENT = 't1_',
  ACCOUNT = 't2_',
  LINK = 't3_', // Same as POST
  MESSAGE = 't4_',
  SUBREDDIT = 't5_',
  AWARD = 't6_',
}

// string literal types
/** Commment thing ID. */
export type T1ID = `${T_PREFIX.COMMENT}${string}`;
/** Account thing ID. */
export type T2ID = `${T_PREFIX.ACCOUNT}${string}`;
/** Post (also called link) thing ID. */
export type T3ID = `${T_PREFIX.LINK}${string}`;
/** Message thing ID. */
export type T4ID = `${T_PREFIX.MESSAGE}${string}`;
/** Subreddit thing ID. */
export type T5ID = `${T_PREFIX.SUBREDDIT}${string}`;
/** Award thing ID. */
export type T6ID = `${T_PREFIX.AWARD}${string}`;

export type TID = T1ID | T2ID | T3ID | T4ID | T5ID | T6ID;

// type guards
export function isT1ID(id: string): id is T1ID {
  return id.startsWith(T_PREFIX.COMMENT);
}
export function isT2ID(id: string): id is T2ID {
  return id.startsWith(T_PREFIX.ACCOUNT);
}
export function isT3ID(id: string): id is T3ID {
  return id.startsWith(T_PREFIX.LINK);
}
export function isT4ID(id: string): id is T4ID {
  return id.startsWith(T_PREFIX.MESSAGE);
}
export function isT5ID(id: string): id is T5ID {
  return id.startsWith(T_PREFIX.SUBREDDIT);
}
export function isT6ID(id: string): id is T6ID {
  return id.startsWith(T_PREFIX.AWARD);
}

// assertion functions
export function assertT1ID(id: string): asserts id is T1ID {
  assert(isT1ID(id), `Expected comment id to start with ${T_PREFIX.COMMENT}, got ${id}}`);
}
export function assertT2ID(id: string): asserts id is T2ID {
  assert(isT2ID(id), `Expected account id to start with ${T_PREFIX.ACCOUNT}, got ${id}}`);
}
export function assertT3ID(id: string): asserts id is T3ID {
  assert(isT3ID(id), `Expected link id to start with ${T_PREFIX.LINK}, got ${id}}`);
}
export function assertT4ID(id: string): asserts id is T4ID {
  assert(isT4ID(id), `Expected message id to start with ${T_PREFIX.MESSAGE}, got ${id}}`);
}
export function assertT5ID(id: string): asserts id is T5ID {
  assert(isT5ID(id), `Expected subreddit id to start with ${T_PREFIX.SUBREDDIT}, got ${id}}`);
}
export function assertT6ID(id: string): asserts id is T6ID {
  assert(isT6ID(id), `Expected award id to start with ${T_PREFIX.AWARD}, got ${id}}`);
}

// factory functions
export function asT1ID(id: string): T1ID {
  assertT1ID(id);
  return id;
}
export function asT2ID(id: string): T2ID {
  assertT2ID(id);
  return id;
}
export function asT3ID(id: string): T3ID {
  assertT3ID(id);
  return id;
}
export function asT4ID(id: string): T4ID {
  assertT4ID(id);
  return id;
}
export function asT5ID(id: string): T5ID {
  assertT5ID(id);
  return id;
}
export function asT6ID(id: string): T6ID {
  assertT6ID(id);
  return id;
}

export function asTID<T extends TID>(id: string): T {
  if (isT1ID(id)) {
    return asT1ID(id) as T;
  }
  if (isT2ID(id)) {
    return asT2ID(id) as T;
  }
  if (isT3ID(id)) {
    return asT3ID(id) as T;
  }
  if (isT4ID(id)) {
    return asT4ID(id) as T;
  }
  if (isT5ID(id)) {
    return asT5ID(id) as T;
  }
  if (isT6ID(id)) {
    return asT6ID(id) as T;
  }
  throw new Error(
    `Expected thing id to start with ${Object.values(T_PREFIX).join(', ')} got ${id}}`
  );
}

// convenience functions
export function isCommentId(id: string): boolean {
  return isT1ID(id);
}
export function isAccountId(id: string): boolean {
  return isT2ID(id);
}
export function isLinkId(id: string): boolean {
  return isT3ID(id);
}
export function isMessageId(id: string): boolean {
  return isT4ID(id);
}
export function isSubredditId(id: string): boolean {
  return isT5ID(id);
}
export function isAwardId(id: string): boolean {
  return isT6ID(id);
}
