import { beforeEach, describe, expect, test, vi } from 'vitest';

import type { BaseContext } from '../types/context.js';
import { fetchDevvitWeb } from './index.js';

// Mock getServerPort
vi.mock('@devvit/shared-types/server/get-server-port.js', () => ({
  getServerPort: vi.fn(() => 3000),
}));

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

function baseContext(): BaseContext {
  const ctx = {
    subredditId: 't5_123',
    subredditName: 'test-subreddit',
    appVersion: '1.0.0',
    appName: 'test-app',
    appAccountId: 't2_456',
    userId: 't2_123',
    postData: {},
  };

  const metadata = {
    'devvit-app': { values: [ctx.appName] },
    'devvit-subreddit': { values: [ctx.subredditId] },
    'devvit-subreddit-name': { values: [ctx.subredditName] },
    'devvit-version': { values: [ctx.appVersion] },
    'devvit-app-user': { values: [ctx.appAccountId] },
    'devvit-user': { values: [ctx.userId] },
  };

  return {
    ...ctx,
    metadata,
    debug: { metadata },
    toJSON: () => ({ ...ctx, metadata, debug: { metadata } }),
  };
}

describe('fetchDevvitWeb', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('throws error if endpoint does not start with /api/ or /internal/', async () => {
    const ctx = baseContext();

    await expect(fetchDevvitWeb(ctx, '/test')).rejects.toThrow(
      'url must start with prefixes: /api or /internal. Got: /test'
    );
    await expect(fetchDevvitWeb(ctx, 'api/test')).rejects.toThrow(
      'url must start with prefixes: /api or /internal. Got: api/test'
    );
  });

  test('makes fetch request with correct URL for /api/ paths', async () => {
    const ctx = baseContext();
    ctx.metadata = {};

    mockFetch.mockResolvedValue(new Response('{}', { status: 200 }));

    await fetchDevvitWeb(ctx, '/api/test');

    expect(mockFetch).toHaveBeenCalledWith(
      new URL('/api/test', 'http://webbit.local:3000/'),
      expect.objectContaining({
        headers: {},
      })
    );
  });

  test('makes fetch request with correct URL for /internal/ paths', async () => {
    const ctx = baseContext();
    ctx.metadata = {};

    mockFetch.mockResolvedValue(new Response('{}', { status: 200 }));

    await fetchDevvitWeb(ctx, '/internal/test');

    expect(mockFetch).toHaveBeenCalledWith(
      new URL('/internal/test', 'http://webbit.local:3000/'),
      expect.objectContaining({
        headers: {},
      })
    );
  });

  test('converts context metadata to headers', async () => {
    const ctx = baseContext();

    mockFetch.mockResolvedValue(new Response('{}', { status: 200 }));

    await fetchDevvitWeb(ctx, '/api/test');

    expect(mockFetch).toHaveBeenCalledWith(
      new URL('/api/test', 'http://webbit.local:3000/'),
      expect.objectContaining({
        headers: {
          'devvit-app': 'test-app',
          'devvit-subreddit': 't5_123',
          'devvit-subreddit-name': 'test-subreddit',
          'devvit-version': '1.0.0',
          'devvit-app-user': 't2_456',
          'devvit-user': 't2_123',
        },
      })
    );
  });

  test('merges init headers with metadata headers', async () => {
    const ctx = baseContext();
    ctx.metadata = {
      'x-metadata-header': { values: ['metadata-value'] },
    };

    mockFetch.mockResolvedValue(new Response('{}', { status: 200 }));

    await fetchDevvitWeb(ctx, '/api/test', {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    expect(mockFetch).toHaveBeenCalledWith(
      new URL('/api/test', 'http://webbit.local:3000/'),
      expect.objectContaining({
        headers: {
          'Content-Type': 'application/json',
          'x-metadata-header': 'metadata-value',
        },
      })
    );
  });

  test('metadata headers override init headers with same key', async () => {
    const ctx = baseContext();
    ctx.metadata = {
      'x-custom-header': { values: ['metadata-value'] },
    };

    mockFetch.mockResolvedValue(new Response('{}', { status: 200 }));

    await fetchDevvitWeb(ctx, '/api/test', {
      headers: {
        'x-custom-header': 'init-value',
      },
    });

    expect(mockFetch).toHaveBeenCalledWith(
      new URL('/api/test', 'http://webbit.local:3000/'),
      expect.objectContaining({
        headers: {
          'x-custom-header': 'metadata-value',
        },
      })
    );
  });

  test('passes through other RequestInit options', async () => {
    const ctx = baseContext();
    ctx.metadata = {};

    mockFetch.mockResolvedValue(new Response('{}', { status: 200 }));

    await fetchDevvitWeb(ctx, '/api/test', {
      method: 'POST',
      body: JSON.stringify({ test: 'data' }),
    });

    expect(mockFetch).toHaveBeenCalledWith(
      new URL('/api/test', 'http://webbit.local:3000/'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ test: 'data' }),
        headers: {},
      })
    );
  });

  test('handles empty metadata', async () => {
    const ctx: BaseContext = baseContext();
    ctx.metadata = {};

    mockFetch.mockResolvedValue(new Response('{}', { status: 200 }));

    await fetchDevvitWeb(ctx, '/api/test');

    expect(mockFetch).toHaveBeenCalledWith(
      new URL('/api/test', 'http://webbit.local:3000/'),
      expect.objectContaining({
        headers: {},
      })
    );
  });

  test('returns the Response from fetch', async () => {
    const ctx = baseContext();
    ctx.metadata = {};

    const mockResponse = new Response('{"success":true}', {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    mockFetch.mockResolvedValue(mockResponse);

    const response = await fetchDevvitWeb(ctx, '/api/test');

    expect(response).toBe(mockResponse);
    expect(await response.text()).toBe('{"success":true}');
  });

  test('handles endpoints with query parameters', async () => {
    const ctx = baseContext();
    ctx.metadata = {};

    mockFetch.mockResolvedValue(new Response('{}', { status: 200 }));

    await fetchDevvitWeb(ctx, '/api/test?foo=bar&baz=qux');

    expect(mockFetch).toHaveBeenCalledWith(
      new URL('/api/test?foo=bar&baz=qux', 'http://webbit.local:3000/'),
      expect.objectContaining({
        headers: {},
      })
    );
  });

  test('propagates fetch errors', async () => {
    const ctx = baseContext();
    ctx.metadata = {};

    const error = new Error('Network error');
    mockFetch.mockRejectedValue(error);

    await expect(fetchDevvitWeb(ctx, '/api/test')).rejects.toThrow('Network error');
  });
});
