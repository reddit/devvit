import { Header } from '@devvit/shared-types/Header.js';
import { expect, test } from 'vitest';

import { getContextFromMetadata, parseDebug } from './context.js';

function makeContextJwt(devvit: object): string {
  const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ devvit }));
  return `${header}.${payload}.`;
}

function metadataWith(devvit: object): { [key: string]: { values: string[] } } {
  return {
    [Header.Subreddit]: { values: ['t5_test'] },
    [Header.Context]: { values: [makeContextJwt(devvit)] },
  };
}

test('reads loid from camelCase devvitLoid', () => {
  const ctx = getContextFromMetadata(metadataWith({ user: { devvitLoid: 'camel-loid' } }));
  expect(ctx.loid).toBe('camel-loid');
});

test('reads loid from snake_case devvit_loid', () => {
  const ctx = getContextFromMetadata(metadataWith({ user: { devvit_loid: 'snake-loid' } }));
  expect(ctx.loid).toBe('snake-loid');
});

test('loid is undefined when neither key is present', () => {
  const ctx = getContextFromMetadata(metadataWith({ user: {} }));
  expect(ctx.loid).toBeUndefined();
});

test('one header', () => {
  const meta = { 'devvit-debug': { values: ['blocks'] } };
  const debug = parseDebug(meta);
  expect(debug).toStrictEqual({ blocks: 'true' });
});

test('headers are case-insensitive', () => {
  const meta = { 'devvit-debug': { values: ['EmitSnapshots=foo'] } };
  const debug = parseDebug(meta);
  expect(debug).toStrictEqual({ emitSnapshots: 'foo' });
});

test('multiple headers', () => {
  const meta = { 'devvit-debug': { values: ['blocks=foo,runtime,surface=bar'] } };
  const debug = parseDebug(meta);
  expect(debug).toStrictEqual({ blocks: 'foo', runtime: 'true', surface: 'bar' });
});

test('multiple distinct headers', () => {
  const meta = {
    'devvit-debug': { values: ['blocks=foo', 'runtime', 'surface=bar'] },
  };
  const debug = parseDebug(meta);
  expect(debug).toStrictEqual({ blocks: 'foo', runtime: 'true', surface: 'bar' });
});

test('unknown header', () => {
  const meta = { 'devvit-debug': { values: ['foo=bar,baz,runtime'] } };
  const debug = parseDebug(meta);
  expect(debug).toStrictEqual({ foo: 'bar', baz: 'true', runtime: 'true' });
});

test('no header', () => {
  const meta = { 'devvit-debug': { values: [] } };
  const debug = parseDebug(meta);
  expect(debug).toStrictEqual({});
});
