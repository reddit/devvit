import type { RedditAPIClient, RedisClient } from '@devvit/public-api';
import { Devvit } from '@devvit/public-api';
import type { DevToolbarAction, HandlerOverride } from './types/internal.js';
import {
  ActionToolbarWrapper,
  getAllowedUsers,
  devAction,
} from '../../atoms/action-toolbar/index.js';

import { createDevvRedis, isRedisHandler } from './redis-mock-service/index.js';
import { createDevvRedditApi, isRedditApiHandler } from './reddit-api-mock-service/index.js';
import { createDevvFetch, isHttpApiHandler } from './http-mock-service/index.js';

export enum DevvToolsMode {
  Prod = 'Prod',
  Dev = 'Dev',
}

const createDevvToolbar = (config: {
  context: Devvit.Context;
  mode: DevvToolsMode;
}): Devvit.BlockComponent<{ actions?: DevToolbarAction[] }> => {
  const [allowedUsersFromSettings] = config.context.useState<string>(
    async () => await getAllowedUsers(config.context.settings)
  );
  const toolbarActionsAllowedUsers =
    config.mode === DevvToolsMode.Prod ? allowedUsersFromSettings : '*';
  return (props) => {
    const passedActions = props.actions || [];
    return (
      <ActionToolbarWrapper
        context={config.context}
        allowedUserString={toolbarActionsAllowedUsers}
        actions={[...passedActions]}
      >
        {props.children!}
      </ActionToolbarWrapper>
    );
  };
};

type DevvApi = {
  devvRedis: RedisClient;
  devvRedditApi: RedditAPIClient;
  devvFetch: typeof fetch;
};
const createDevvApi = (config: {
  context: Devvit.Context;
  mode: DevvToolsMode;
  handlers?: HandlerOverride[];
}): DevvApi => {
  if (config.mode === DevvToolsMode.Prod) {
    return {
      devvRedis: config.context.redis,
      devvRedditApi: config.context.reddit,
      devvFetch: fetch,
    };
  }
  const redisHandlers = config.handlers?.filter(isRedisHandler) || [];
  const devvRedis = createDevvRedis(config.context.redis, redisHandlers);

  const redditApiHandlers = config.handlers?.filter(isRedditApiHandler) || [];
  const devvRedditApi = createDevvRedditApi(config.context.reddit, redditApiHandlers);

  const httpApiHandlers = config.handlers?.filter(isHttpApiHandler) || [];
  const devvFetch = createDevvFetch(fetch, httpApiHandlers);

  return { devvRedis, devvRedditApi, devvFetch };
};

export const DevvTools = {
  toolbar: createDevvToolbar,
  api: createDevvApi,
};

export { devAction };
