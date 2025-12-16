import type { Metadata } from '@devvit/protos/lib/Types.js';
// eslint-disable-next-line no-restricted-imports
import type { FetchRequest, FetchResponse } from '@devvit/protos/types/devvit/plugin/http/http.js';
// eslint-disable-next-line no-restricted-imports
import type { HTTP } from '@devvit/protos/types/devvit/plugin/http/http.js';
import type { PluginMock } from '@devvit/shared-types/test/index.js';

export class HTTPPluginMock implements HTTP {
  async Fetch(_request: FetchRequest, _metadata?: Metadata): Promise<FetchResponse> {
    throw new Error(
      `HTTP requests are not allowed in tests by default. To mock HTTP requests, use vi.spyOn(globalThis, "fetch"). See https://developers.reddit.com/docs/guides/tools/devvit_test#http for details.`
    );
  }
}

/**
 * Mock implementation of the HTTP plugin that throws an error when requests are made.
 *
 * Use this in tests to ensure that HTTP requests are not accidentally made.
 */
export class HTTPMock implements PluginMock<HTTP> {
  readonly plugin: HTTPPluginMock;

  constructor() {
    this.plugin = new HTTPPluginMock();
  }
}
