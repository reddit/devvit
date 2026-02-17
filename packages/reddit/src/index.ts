import { RedditClient } from './RedditClient.js';

export type * from './models/index.js';
export type { RedditClient };
export { EntrypointHeight } from '@devvit/protos/json/reddit/devvit/post/v1/post.js';
export * from '@devvit/shared-types/richtext/index.js';

export const reddit: RedditClient = new RedditClient();
