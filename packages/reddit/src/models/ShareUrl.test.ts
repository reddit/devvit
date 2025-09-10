import { beforeEach, describe, expect, test, vi } from 'vitest';

vi.mock('../graphql/GraphQL.js', () => ({
  GraphQL: {
    query: vi.fn(),
  },
}));

import { GraphQL } from '../graphql/GraphQL.js';
import { createShareUrl } from './ShareUrl.js';

const mockQuery = GraphQL.query as ReturnType<typeof vi.fn>;

describe('createShareUrl', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('throws for invalid absolute URL', async () => {
    await expect(createShareUrl('not-a-url')).rejects.toThrow(
      'Invalid URL. Provide an absolute URL such as https://reddit.com/r/gamesonreddit.'
    );
  });

  test('throws for non-Reddit domain', async () => {
    await expect(createShareUrl('https://example.com/r/gamesonreddit')).rejects.toThrow(
      'Invalid domain. Only reddit.com and old.reddit.com URLs are supported.'
    );
  });

  test('throws for reddit.com root without a path', async () => {
    await expect(createShareUrl('https://reddit.com/')).rejects.toThrow(
      'Cannot shorten reddit.com. Must include a path such as /r/ or /u/.'
    );
  });

  test('throws for unsupported path that does not start with /r/ or /u/', async () => {
    await expect(createShareUrl('https://reddit.com/help')).rejects.toThrow(
      'Only reddit.com URLs under /r/ or /u/ are supported.'
    );
  });

  test('throws for unsupported query parameters (deduped and sorted)', async () => {
    await expect(
      createShareUrl(
        'https://reddit.com/r/gamesonreddit?utm_source=x&utm_medium=y&foo=1&bar=2&foo=3'
      )
    ).rejects.toThrow(
      'Unsupported query parameters: bar, foo. Allowed query params are: utm_source, utm_medium, devvitshare. Remove other params and try again.'
    );
  });

  test('throws when GraphQL returns not ok', async () => {
    mockQuery.mockResolvedValue({
      data: { createShareUrl: { ok: false } },
    } as unknown as object);

    await expect(createShareUrl('https://reddit.com/r/gamesonreddit')).rejects.toThrow(
      'Unable to create a share URL. Please try again later.'
    );
  });

  test('throws when GraphQL returns ok but missing shareUrl', async () => {
    mockQuery.mockResolvedValue({
      data: { createShareUrl: { ok: true, shareUrl: '' } },
    } as unknown as object);

    await expect(createShareUrl('https://reddit.com/r/gamesonreddit')).rejects.toThrow(
      'Unable to create a share URL. Please try again later.'
    );
  });

  test('returns shareUrl on success and calls GraphQL.query', async () => {
    const inputUrl = 'https://reddit.com/r/gamesonreddit?utm_source=devvit';
    const returnedShareUrl = 'https://reddit.com/r/gamesonreddit/s/foo';
    mockQuery.mockResolvedValue({
      data: { createShareUrl: { ok: true, shareUrl: returnedShareUrl } },
    } as unknown as object);

    await expect(createShareUrl(inputUrl)).resolves.toBe(returnedShareUrl);

    expect(mockQuery).toHaveBeenCalledTimes(1);
    const lastCallArgs = mockQuery.mock.calls[0];
    expect(lastCallArgs[2]).toEqual({ input: { url: inputUrl } });
  });

  test('allows internal /x/ path (not exposed in error messaging)', async () => {
    const inputUrl = 'https://reddit.com/x/debug?utm_source=devvit';
    const returnedShareUrl = 'https://reddit.com/r/gamesonreddit/s/foo';
    mockQuery.mockResolvedValue({
      data: { createShareUrl: { ok: true, shareUrl: returnedShareUrl } },
    } as unknown as object);

    await expect(createShareUrl(inputUrl)).resolves.toBe(returnedShareUrl);
  });

  test('supports old.reddit.com domain', async () => {
    const inputUrl = 'https://old.reddit.com/r/gamesonreddit?utm_source=devvit';
    const returnedShareUrl = 'https://reddit.com/r/gamesonreddit/s/foo';
    mockQuery.mockResolvedValue({
      data: { createShareUrl: { ok: true, shareUrl: returnedShareUrl } },
    } as unknown as object);

    await expect(createShareUrl(inputUrl)).resolves.toBe(returnedShareUrl);
  });
});
