import type { Devvit } from '@devvit/public-api';
import type { RedisOverride } from '../redis-mock-service/types.js';
import type { RedditApiOverride } from '../reddit-api-mock-service/types.js';
import type { HttpOverride } from '../http-mock-service/types.js';

export type DevToolbarAction = { run: () => void; label?: string };
export type AppActionsProps = Devvit.BlockComponentProps<{
  context: Devvit.Context;
  actions: DevToolbarAction[];
  /* Space separated list of usernames that can see the developer panel */
  allowedUserString?: string;
}>;
export type HandlerOverride = RedisOverride | RedditApiOverride | HttpOverride;
