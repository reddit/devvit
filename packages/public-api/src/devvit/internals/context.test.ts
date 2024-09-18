import { expect, test } from 'vitest';

import { parseDebug } from './context.js';

test('one header', () => {
  const meta = { 'devvit-debug': { values: ['blocks'] } };
  const debug = parseDebug(meta);
  expect(debug).toStrictEqual({ metadata: meta, blocks: 'true' });
});

test('headers are case-insensitive', () => {
  const meta = { 'devvit-debug': { values: ['EmitSnapshots=foo'] } };
  const debug = parseDebug(meta);
  expect(debug).toStrictEqual({ metadata: meta, emitSnapshots: 'foo' });
});

test('multiple headers', () => {
  const meta = { 'devvit-debug': { values: ['blocks=foo,runtime,surface=bar'] } };
  const debug = parseDebug(meta);
  expect(debug).toStrictEqual({ metadata: meta, blocks: 'foo', runtime: 'true', surface: 'bar' });
});

test('multiple distinct headers', () => {
  const meta = {
    'devvit-debug': { values: ['blocks=foo', 'runtime', 'surface=bar'] },
  };
  const debug = parseDebug(meta);
  expect(debug).toStrictEqual({ metadata: meta, blocks: 'foo', runtime: 'true', surface: 'bar' });
});

test('unknown header', () => {
  const meta = { 'devvit-debug': { values: ['foo=bar,baz,runtime'] } };
  const debug = parseDebug(meta);
  expect(debug).toStrictEqual({ metadata: meta, foo: 'bar', baz: 'true', runtime: 'true' });
});

test('no header', () => {
  const meta = { 'devvit-debug': { values: [] } };
  const debug = parseDebug(meta);
  expect(debug).toStrictEqual({ metadata: meta });
});
