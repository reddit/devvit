import type { Context, Metadata } from '@devvit/public-api';
import { Header } from '@devvit/shared-types/Header.js';

import { currentUserHasModPermissions } from './index.js';

describe('currentUserHasModPermissions', () => {
  it('should check mod permissions from metadata', async () => {
    const context = TestContext({
      [Header.ModPermissions]: { values: ['posts'] },
    });

    const callback = vi.fn();

    await currentUserHasModPermissions(context, ['posts'], callback);

    expect(callback).toHaveBeenCalled();
  });

  it('should support multiple mod permissions', async () => {
    const context = TestContext({
      [Header.ModPermissions]: { values: ['posts', 'flair'] },
    });

    const callback = vi.fn();

    await currentUserHasModPermissions(context, ['posts', 'flair'], callback);

    expect(callback).toHaveBeenCalled();
  });

  it('should throw when called with missing permissions', async () => {
    const context = TestContext({ [Header.ModPermissions]: { values: [] } });

    const callback = vi.fn();

    try {
      await currentUserHasModPermissions(context, ['all'], callback);
      expect(true).toBe(false);
    } catch {} // eslint-disable-line no-empty

    expect(callback).not.toHaveBeenCalled();
  });

  it('can parse merged headers', async () => {
    const context = TestContext({
      [Header.ModPermissions]: { values: ['config, flair'] },
    });

    const callback = vi.fn();

    await currentUserHasModPermissions(context, ['config', 'flair'], callback);

    expect(callback).toHaveBeenCalled();
  });
});

function TestContext(metadata: Metadata): Context {
  return { metadata } as unknown as Context;
}
