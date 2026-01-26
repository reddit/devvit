import { assert } from './assert.js';

/**
 * - **C**omment (T1).
 * - **A**ccount (T2).
 * - **L**ink (T3).
 * - **M**essage (T4).
 * - **S**ubreddit (T5).
 * - **T**rophies (T6).
 */
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
export type T1 = `${T_PREFIX.COMMENT}${string}`;
/** Account thing ID. */
export type T2 = `${T_PREFIX.ACCOUNT}${string}`;
/** Post (also called link) thing ID. */
export type T3 = `${T_PREFIX.LINK}${string}`;
/** Message thing ID. */
export type T4 = `${T_PREFIX.MESSAGE}${string}`;
/** Subreddit thing ID. */
export type T5 = `${T_PREFIX.SUBREDDIT}${string}`;
/** Award thing ID. */
export type T6 = `${T_PREFIX.AWARD}${string}`;

export type Tid = T1 | T2 | T3 | T4 | T5 | T6;

// type guards
export function isT1(id: string | null | undefined): id is T1 {
  return !!id?.startsWith(T_PREFIX.COMMENT);
}
export function isT2(id: string | null | undefined): id is T2 {
  return !!id?.startsWith(T_PREFIX.ACCOUNT);
}
export function isT3(id: string | null | undefined): id is T3 {
  return !!id?.startsWith(T_PREFIX.LINK);
}
export function isT4(id: string | null | undefined): id is T4 {
  return !!id?.startsWith(T_PREFIX.MESSAGE);
}
export function isT5(id: string | null | undefined): id is T5 {
  return !!id?.startsWith(T_PREFIX.SUBREDDIT);
}
export function isT6(id: string | null | undefined): id is T6 {
  return !!id?.startsWith(T_PREFIX.AWARD);
}

// assertion functions
export function assertT1(id: string | null | undefined): asserts id is T1 {
  assert(isT1(id), `Expected comment id to start with ${T_PREFIX.COMMENT}, got ${id}`);
}
export function assertT2(id: string | null | undefined): asserts id is T2 {
  assert(isT2(id), `Expected account id to start with ${T_PREFIX.ACCOUNT}, got ${id}`);
}
export function assertT3(id: string | null | undefined): asserts id is T3 {
  assert(isT3(id), `Expected link id to start with ${T_PREFIX.LINK}, got ${id}`);
}
export function assertT4(id: string | null | undefined): asserts id is T4 {
  assert(isT4(id), `Expected message id to start with ${T_PREFIX.MESSAGE}, got ${id}`);
}
export function assertT5(id: string | null | undefined): asserts id is T5 {
  assert(isT5(id), `Expected subreddit id to start with ${T_PREFIX.SUBREDDIT}, got ${id}`);
}
export function assertT6(id: string | null | undefined): asserts id is T6 {
  assert(isT6(id), `Expected award id to start with ${T_PREFIX.AWARD}, got ${id}`);
}

// factory functions
export function T1(id: string | null | undefined): T1 {
  assertT1(id);
  return id;
}
export function T2(id: string | null | undefined): T2 {
  assertT2(id);
  return id;
}
export function T3(id: string | null | undefined): T3 {
  assertT3(id);
  return id;
}
export function T4(id: string | null | undefined): T4 {
  assertT4(id);
  return id;
}
export function T5(id: string | null | undefined): T5 {
  assertT5(id);
  return id;
}
export function T6(id: string | null | undefined): T6 {
  assertT6(id);
  return id;
}

export function asTid<T extends Tid>(id: string | null | undefined): T {
  if (isT1(id)) {
    return T1(id) as T;
  }
  if (isT2(id)) {
    return T2(id) as T;
  }
  if (isT3(id)) {
    return T3(id) as T;
  }
  if (isT4(id)) {
    return T4(id) as T;
  }
  if (isT5(id)) {
    return T5(id) as T;
  }
  if (isT6(id)) {
    return T6(id) as T;
  }
  throw new Error(
    `Expected thing id to start with ${Object.values(T_PREFIX).join(', ')} got ${id}}`
  );
}
