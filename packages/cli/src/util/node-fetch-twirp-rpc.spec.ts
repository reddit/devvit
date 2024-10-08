import type { TwirpError } from 'twirp-ts';
import { vi } from 'vitest';

import { StoredToken } from '../lib/auth/StoredToken.js';
import { ContentType, NodeFetchRPC } from './node-fetch-twirp-rpc.js';

const { mockFetch } = vi.hoisted(() => {
  return { mockFetch: vi.fn(), Headers: vi.fn() };
});

beforeEach(() => {
  globalThis.fetch = mockFetch;
});

vi.mock('node-fetch', async (importOriginal) => {
  const mod = await importOriginal<object>();
  return {
    ...mod,
    default: mockFetch,
  };
});

const rpc = NodeFetchRPC({
  baseUrl: 'https://test.com',
  getToken: () =>
    Promise.resolve(
      new StoredToken({
        expiresAt: Date.now() + 99999,
        refreshToken: 'refreshToken_test',
        accessToken: 'accessToken_test',
        scope: 'scope_test',
        tokenType: 'tokenType_test',
      })
    ),
});

describe('NodeFetchRPC', () => {
  test('Will surface helpful error if fetch response is not json', async () => {
    mockFetch.mockResolvedValue(
      new Response('<hml><body>500 Internal server error</body> </html>', {
        status: 500,
        statusText: 'Internal Server Error',
        headers: {
          'content-type': 'plain/text',
        },
      })
    );

    const expectedError: TwirpError = await rpc
      .request('test_service', 'test_method', ContentType.Json, {
        blep: 'blep',
      })
      .catch((e) => e);

    expect(expectedError.code).toBe(
      '500 Internal Server Error: <hml><body>500 Internal server error</body> </html>'
    );
  });

  test('Will surface helpful error if fetch response is json', async () => {
    mockFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          code: '500',
          msg: '500 Internal Server Error',
        }),
        {
          status: 500,
          statusText: 'Internal Server Error',
          headers: {
            'content-type': ContentType.Json,
          },
        }
      )
    );

    const expectedError: TwirpError = await rpc
      .request('test_service', 'test_method', ContentType.Json, {
        blep: 'blep',
      })
      .catch((e) => e);

    expect(expectedError.message).toBe('500 Internal Server Error');
  });
});
