import type { RedditAPIClient } from '@devvit/public-api';
import type { RedditApiOverride } from './types.js';
import type { HandlerOverride } from '../types/internal.js';

export const createDevvRedditApi = (
  realRedditApi: RedditAPIClient,
  overrides: RedditApiOverride[]
): RedditAPIClient => {
  const customHandlers: RedditAPIClient = {} as RedditAPIClient;
  overrides.forEach((override) => {
    // @ts-expect-error
    customHandlers[override.method] = override.handler;
  });
  return Object.assign({}, realRedditApi, customHandlers);
};

export const redditApiHandler = {
  getSubredditById: (handler: Function): RedditApiOverride => {
    return {
      handler,
      method: 'getSubredditById',
      __type: 'RedditApi',
    };
  },
} as const;

export const isRedditApiHandler = (handler: HandlerOverride): handler is RedditApiOverride =>
  handler.__type === 'RedditApi';
