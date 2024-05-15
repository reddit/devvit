import type { RedditAPIClient } from '@devvit/public-api';

export type RedditApiOverride = {
  __type: 'RedditApi';
  method: keyof RedditAPIClient;
  handler: Function;
};
