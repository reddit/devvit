import '@devvit/shared-types/shared/devvit-worker-global.js';

import type { Config } from '@devvit/shared-types/Config.js';
import { describe, expect } from 'vitest';

import { createDevvitTest } from './devvitTest.js';

type TestConfig = Config & { _testId?: string };

const test1 = createDevvitTest({ username: 'user1' });
const test2 = createDevvitTest({ username: 'user2' });
const seenConfigs = new Set<Config>();

describe('context isolation', () => {
  // We use test.concurrent to run these tests in parallel.
  // If isolation is broken, globalThis.devvit.config will be overwritten
  // by the other test and assertions will fail.

  test1.concurrent('test 1 sees its own config', async ({ config }) => {
    expect(seenConfigs.has(config)).toBe(false);
    seenConfigs.add(config);

    // Tag config with a unique value to verify identity beyond just reference equality
    const testId = 'test1-' + Math.random();
    (config as TestConfig)._testId = testId;

    const globalConfig = globalThis.devvit?.config;

    expect(globalConfig).toBe(config);
    expect((globalConfig as TestConfig)._testId).toBe(testId);

    // Simulate work to allow overlap with test 2
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Check again after delay
    expect(globalThis.devvit?.config).toBe(config);
    expect((globalThis.devvit?.config as TestConfig)._testId).toBe(testId);
  });

  test2.concurrent('test 2 sees its own config', async ({ config }) => {
    expect(seenConfigs.has(config)).toBe(false);
    seenConfigs.add(config);

    // Tag config with a unique value
    const testId = 'test2-' + Math.random();
    (config as TestConfig)._testId = testId;

    const globalConfig = globalThis.devvit?.config;

    expect(globalConfig).toBe(config);
    expect((globalConfig as TestConfig)._testId).toBe(testId);

    // Simulate work to allow overlap with test 1
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Check again after delay
    expect(globalThis.devvit?.config).toBe(config);
    expect((globalThis.devvit?.config as TestConfig)._testId).toBe(testId);
  });

  test1.concurrent('fetch polyfill uses correct context', async ({ config }) => {
    expect(seenConfigs.has(config)).toBe(false);
    seenConfigs.add(config);

    // The fetch polyfill accesses globalThis.devvit.config internally.
    // We verify that it resolves to the correct config for this test.

    // We can't easily mock the internal logic of fetchPolyfill without more spies,
    // but we can verify that accessing the global object works.

    const globalDevvit = globalThis.devvit;

    expect(globalDevvit?.config).toBe(config);
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(globalDevvit?.config).toBe(config);
  });
});
