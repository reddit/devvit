import { Scope } from '@devvit/protos/json/reddit/devvit/app_permission/v1/app_permission.js';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { assertUserScope } from '../common.js';

// Mock the getDevvitConfig function
vi.mock('@devvit/shared-types/server/get-devvit-config.js', () => ({
  getDevvitConfig: vi.fn(),
}));

// Import the mocked function
import { getDevvitConfig } from '@devvit/shared-types/server/get-devvit-config.js';

const mockGetDevvitConfig = getDevvitConfig as ReturnType<typeof vi.fn>;

describe('assertUserScope', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should not throw when permissions contains desired scope', () => {
    mockGetDevvitConfig.mockReturnValue({
      getPermissions: () => [
        {
          asUserScopes: [Scope.SUBMIT_POST, Scope.SUBMIT_COMMENT],
          requestedFetchDomains: [],
        },
      ],
    });
    expect(() => assertUserScope(Scope.SUBMIT_POST)).not.toThrow();
  });

  test('should throw when permissions does not contain desired scope', () => {
    mockGetDevvitConfig.mockReturnValue({
      getPermissions: () => [
        {
          asUserScopes: [Scope.SUBMIT_POST, Scope.SUBMIT_COMMENT],
          requestedFetchDomains: [],
        },
      ],
    });
    expect(() => assertUserScope(Scope.SUBSCRIBE_TO_SUBREDDIT)).toThrow(
      'To call this API with \'runAs: "USER"\', set \'permissions.reddit.asUser: [ "SUBSCRIBE_TO_SUBREDDIT" ]\' in your devvit.json file.'
    );
  });

  test('should throw when permissions are empty', () => {
    mockGetDevvitConfig.mockReturnValue({
      getPermissions: () => [
        {
          asUserScopes: [],
          requestedFetchDomains: [],
        },
      ],
    });
    expect(() => assertUserScope(Scope.SUBMIT_POST)).toThrow(
      'To call this API with \'runAs: "USER"\', set \'permissions.reddit.asUser: [ "SUBMIT_POST" ]\' in your devvit.json file.'
    );
  });
});
