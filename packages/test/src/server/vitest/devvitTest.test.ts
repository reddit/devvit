import { context } from '@devvit/server';
import { describe, expect, vi } from 'vitest';

import { createDevvitTest } from './devvitTest.js';

const test = createDevvitTest();

describe('Default Configuration', () => {
  test('provides default context values', async ({ userId, subredditId, subredditName }) => {
    expect(context.userId).toBe('t2_testuser');
    expect(context.subredditId).toBe('t5_testsub');
    expect(context.subredditName).toBe('testsub');

    // Fixtures match context
    expect(userId).toBe('t2_testuser');
    expect(subredditId).toBe('t5_testsub');
    expect(subredditName).toBe('testsub');
  });

  test('provides functional fixtures', async ({ config }) => {
    expect(config).toBeDefined();
  });
});

describe('Custom Configuration', () => {
  const customTest = createDevvitTest({
    userId: 't2_custom',
    username: 'custom_user',
    subredditId: 't5_custom',
    subredditName: 'custom_sub',
    settings: { my_setting: 'my_value' },
  });

  customTest('respects custom configuration', async ({ userId, username, settings }) => {
    expect(context.userId).toBe('t2_custom');
    expect(context.subredditId).toBe('t5_custom');
    expect(context.subredditName).toBe('custom_sub');

    expect(userId).toBe('t2_custom');
    expect(username).toBe('custom_user');
    expect(settings.my_setting).toBe('my_value');
  });
});

describe('Vitest Feature Support', () => {
  test.skip('should skip this test', () => {
    throw new Error('This should not run');
  });

  test.concurrent('runs concurrently', async () => {
    expect(true).toBe(true);
  });

  test.todo('should be implemented later');

  test.fails('should fail explicitly', async () => {
    expect(true).toBe(false);
  });

  test.skipIf(true)('should be skipped via skipIf', () => {
    throw new Error('This should not run');
  });

  test.runIf(false)('should be skipped via runIf', () => {
    throw new Error('This should not run');
  });

  test.runIf(true)('should run via runIf', async ({ userId }) => {
    expect(userId).toBe('t2_testuser');
  });

  test.sequential('should run sequentially', async ({ userId }) => {
    expect(userId).toBe('t2_testuser');
  });
});

describe('Mock Isolation', () => {
  const dependency = {
    method: () => 'original',
  };

  test('mocks method', async () => {
    const spy = vi.spyOn(dependency, 'method').mockReturnValue('mocked');
    dependency.method();
    expect(spy).toHaveBeenCalledTimes(1);
    expect(dependency.method()).toBe('mocked');
  });

  test('restores method', async () => {
    expect(dependency.method()).toBe('original');
    expect(vi.isMockFunction(dependency.method)).toBe(false);
  });
});

describe('Parameterised Tests', () => {
  test.each([
    ['A', 't2_testuser'],
    ['B', 't2_testuser'],
  ])('runs with parameters %s', async (arg, expectedUserId) => {
    expect(arg).toBeDefined();
    expect(context.userId).toBe(expectedUserId);
  });

  test.each([
    { input: 'A', expected: 't2_testuser' },
    { input: 'B', expected: 't2_testuser' },
  ])('runs with object parameters $input', async ({ input, expected }) => {
    expect(input).toBeDefined();
    expect(context.userId).toBe(expected);
  });

  test.each`
    input  | expected
    ${'A'} | ${'t2_testuser'}
    ${'B'} | ${'t2_testuser'}
  `('runs with template literal $input', async ({ input, expected }) => {
    expect(input).toBeDefined();
    expect(context.userId).toBe(expected);
  });
});
