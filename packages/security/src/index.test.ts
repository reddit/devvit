import type { Devvit } from '@devvit/public-api';
import { Header } from '@devvit/shared-types/Header.js';

import { currentUserHasModPermissions } from './index.js';

test('index', () => {
  expect(currentUserHasModPermissions).toBeDefined();
});

describe('currentUserHasModPermissions', () => {
  it('should check mod permissions from metadata', async () => {
    const context = {
      debug: {
        metadata: {
          [Header.ModPermissions]: {
            values: ['posts'],
          },
        },
      },
    } as unknown as Devvit.Context;

    const callback = vi.fn();

    await currentUserHasModPermissions(context, ['posts'], callback);

    expect(callback).toHaveBeenCalled();
  });

  it('should support multiple mod permissions', async () => {
    const context = {
      debug: {
        metadata: {
          [Header.ModPermissions]: {
            values: ['posts', 'flair'],
          },
        },
      },
    } as unknown as Devvit.Context;

    const callback = vi.fn();

    await currentUserHasModPermissions(context, ['posts', 'flair'], callback);

    expect(callback).toHaveBeenCalled();
  });

  it('should throw when called with missing permissions', async () => {
    const context = {
      debug: {
        metadata: {
          [Header.ModPermissions]: {
            values: [],
          },
        },
      },
    } as unknown as Devvit.Context;

    const callback = vi.fn();

    try {
      await currentUserHasModPermissions(context, ['all'], callback);
      expect(true).toBe(false);
    } catch {} // eslint-disable-line no-empty

    expect(callback).not.toHaveBeenCalled();
  });

  it('can parse merged headers', async () => {
    const context = {
      debug: {
        metadata: {
          [Header.ModPermissions]: {
            values: ['config, flair'],
          },
        },
      },
    } as unknown as Devvit.Context;

    const callback = vi.fn();

    await currentUserHasModPermissions(context, ['config', 'flair'], callback);

    expect(callback).toHaveBeenCalled();
  });
});
