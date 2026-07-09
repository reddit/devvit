// eslint-disable-next-line no-restricted-imports
import type { FullAppInfo } from '@devvit/protos/types/devvit/dev_portal/app/app.js';
import { describe, expect, test } from 'vitest';

import {
  canWriteAppVersion,
  getAppAuthorizationErrorMessage,
  getAppAuthorizationRole,
} from './appAuthorization.js';

describe('appAuthorization', () => {
  test('allows the app owner to write app versions', () => {
    const appInfo = {
      app: {
        owner: { displayName: 'OwnerName' },
      },
    };

    const role = getAppAuthorizationRole(appInfo as FullAppInfo, 'ownername');

    expect(role).toBe('owner');
    expect(canWriteAppVersion(role)).toBe(true);
  });

  test('allows a designated app maintainer to write app versions', () => {
    const appInfo = {
      app: {
        owner: { displayName: 'OwnerName' },
        maintainers: [{ displayName: 'MaintainerName' }],
      },
    };

    const role = getAppAuthorizationRole(appInfo as FullAppInfo, 'maintainername');

    expect(role).toBe('maintainer');
    expect(canWriteAppVersion(role)).toBe(true);
  });

  test('does not allow unrelated developers to write app versions', () => {
    const appInfo = {
      app: {
        owner: { displayName: 'OwnerName' },
        maintainers: [{ displayName: 'MaintainerName' }],
      },
    };

    const role = getAppAuthorizationRole(appInfo as FullAppInfo, 'OtherDeveloper');

    expect(role).toBe('unauthorized');
    expect(canWriteAppVersion(role)).toBe(false);
  });

  test('uses a maintainer-aware error message', () => {
    expect(
      getAppAuthorizationErrorMessage(
        { app: { owner: { displayName: 'OwnerName' } } } as FullAppInfo,
        'example-app',
        'publish'
      )
    ).toContain('owner (OwnerName) or as a designated maintainer');
  });
});
