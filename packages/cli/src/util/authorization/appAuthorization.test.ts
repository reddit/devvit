import { describe, expect, test } from 'vitest';

import {
  canWriteAppVersion,
  getAppAuthorizationErrorMessage,
  getAppAuthorizationRole,
} from './appAuthorization.js';

describe('appAuthorization', () => {
  test('recognizes the app owner by stable account ID', () => {
    const appInfo = {
      app: {
        owner: { id: 't2_owner', displayName: 'OriginalOwnerName' },
      },
    };

    const role = getAppAuthorizationRole(appInfo, {
      id: 't2_owner',
      displayName: 'RenamedOwner',
    });

    expect(role).toBe('owner');
    expect(canWriteAppVersion(role)).toBe(true);
  });

  test('does not fall back to a matching display name when stable IDs disagree', () => {
    const appInfo = {
      app: {
        owner: { id: 't2_owner', displayName: 'SharedName' },
      },
    };

    expect(
      getAppAuthorizationRole(appInfo, {
        id: 't2_other',
        displayName: 'SharedName',
      })
    ).toBe('unauthorized');
  });

  test('recognizes a maintainer from typed authorization metadata by account ID', () => {
    const appInfo = {
      app: {
        owner: { id: 't2_owner', displayName: 'OwnerName' },
        authorization: {
          maintainers: [{ id: 't2_maintainer', displayName: 'MaintainerName' }],
        },
      },
    };

    const role = getAppAuthorizationRole(appInfo, {
      id: 't2_maintainer',
      displayName: 'RenamedMaintainer',
    });

    expect(role).toBe('maintainer');
    expect(canWriteAppVersion(role)).toBe(true);
  });

  test('accepts a backend-computed current-user role', () => {
    const appInfo = {
      app: {
        authorization: {
          currentUserRole: 'maintainer',
        },
      },
    };

    expect(getAppAuthorizationRole(appInfo, '')).toBe('maintainer');
  });

  test('temporarily supports the prototype maintainer list by display name', () => {
    const appInfo = {
      app: {
        owner: { displayName: 'OwnerName' },
        maintainers: [{ displayName: 'MaintainerName' }],
      },
    };

    expect(getAppAuthorizationRole(appInfo, ' maintainername ')).toBe('maintainer');
  });

  test('does not authorize an unrelated developer', () => {
    const appInfo = {
      app: {
        owner: { id: 't2_owner', displayName: 'OwnerName' },
        authorization: {
          maintainers: [{ id: 't2_maintainer', displayName: 'MaintainerName' }],
        },
      },
    };

    const role = getAppAuthorizationRole(appInfo, {
      id: 't2_other',
      displayName: 'OtherDeveloper',
    });

    expect(role).toBe('unauthorized');
    expect(canWriteAppVersion(role)).toBe(false);
  });

  test.each(['owner', 'maintainer'] as const)(
    'allows the %s role to upload, publish, and playtest app versions',
    (role) => {
      expect(canWriteAppVersion(role)).toBe(true);
    }
  );

  test('denies app-version writes when authorization metadata is missing', () => {
    expect(getAppAuthorizationRole(undefined, 'OwnerName')).toBe('unauthorized');
    expect(getAppAuthorizationRole({ app: null }, 'OwnerName')).toBe('unauthorized');
    expect(getAppAuthorizationRole({ app: {} }, '')).toBe('unauthorized');
  });

  test('uses a maintainer-aware error message', () => {
    expect(
      getAppAuthorizationErrorMessage(
        { app: { owner: { displayName: 'OwnerName' } } },
        'example-app',
        'publish'
      )
    ).toContain('owner (OwnerName) or as a designated maintainer');
  });
});
