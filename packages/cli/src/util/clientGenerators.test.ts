import { TwirpError, TwirpErrorCode } from 'twirp-ts';
import { beforeAll } from 'vitest';

import { createAppClient } from './clientGenerators.js';

const NodeFetchRPC = {
  request: vi.fn(),
};

beforeAll(() => {
  vi.mock('./node-fetch-twirp-rpc.js', () => ({
    NodeFetchRPC: () => NodeFetchRPC,
  }));
});

it('retries on error', async () => {
  NodeFetchRPC.request.mockRejectedValueOnce(new Error('foo'));
  NodeFetchRPC.request.mockRejectedValueOnce(new Error('bar'));
  NodeFetchRPC.request.mockRejectedValueOnce(new Error('baz'));

  const clientWithRetry = createAppClient();

  await expect(
    clientWithRetry.GetBySlug({
      slug: 'some-slug',
    })
  ).rejects.toThrowError('Last error: Error: baz');
  expect(NodeFetchRPC.request).toHaveBeenCalledTimes(3);
});

it("doesn't retry on twirp errors that are 4xx status codes", async () => {
  NodeFetchRPC.request.mockRejectedValueOnce(new TwirpError(TwirpErrorCode.NotFound, 'foo'));

  const clientWithRetry = createAppClient();

  await expect(
    clientWithRetry.GetBySlug({
      slug: 'some-slug',
    })
  ).rejects.toThrow('foo');
  expect(NodeFetchRPC.request).toHaveBeenCalledTimes(1);
});

it('throws a hybrid error if it gets a 4xx error during a retry', async () => {
  NodeFetchRPC.request.mockRejectedValueOnce(new Error('foo'));
  NodeFetchRPC.request.mockRejectedValueOnce(new TwirpError(TwirpErrorCode.NotFound, 'bar'));

  const clientWithRetry = createAppClient();

  await expect(
    clientWithRetry.GetBySlug({
      slug: 'some-slug',
    })
  ).rejects.toThrowError('Last error: Error: bar');
  expect(NodeFetchRPC.request).toHaveBeenCalledTimes(2);
});
