import { settings } from '@devvit/settings';
import { expect } from 'vitest';

import { createDevvitTest } from './devvitTest.js';

const test = createDevvitTest();

test('settings persist across use calls within same installation', async ({ mocks }) => {
  mocks.settings.update({ key: 'value' });

  const val = await settings.get('key');
  expect(val).toBe('value');
});

test('settings are isolated across tests', async () => {
  // Should be empty unless I set something
  const val = await settings.get('key');
  expect(val).toBeUndefined();
});

const configuredTest = createDevvitTest({
  settings: { initialized: true },
});

configuredTest('can initialize settings via fixture', async () => {
  const val = await settings.get<boolean>('initialized');
  expect(val).toBe(true);
});
