import { type HTTP, type Metadata } from '@devvit/protos';
import type { FetchRequest, FetchResponse } from '@devvit/protos/types/devvit/plugin/http/http.js';

/**
 * Mock implementation of the HTTP plugin that throws an error when requests are made.
 *
 * Use this in tests to ensure that HTTP requests are not accidentally made.
 */
export class HTTPMock implements HTTP {
  async Fetch(_request: FetchRequest, _metadata?: Metadata): Promise<FetchResponse> {
    throw new Error(
      `HTTP requests are not allowed in tests by default. To mock HTTP requests, use vi.spyOn(globalThis, "fetch"). See https://developers.reddit.com/docs/guides/tools/devvit_test#http for details.`
    );
  }
}
