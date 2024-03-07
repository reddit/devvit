/*
const {ActionToolbarWrapper, devvRedis} = DevvTools({mode: DevvToolsMode.Dev/Prod, mocksConfig: myMocks});

 */

/*
Mocks Config:

export const handlers = [
  // Intercept the "redis.get" request with 'exact-key'
  redis.get.exact('exact-key', () => {
    return new Response('Hello world!')
  }),
  // Intercept the "redis.get" request that matches the pattern.
  redis.get.pattern(/stats_.+:.+/, (request) => {
    const [postId, userId] = request.key.replace(/^stats_/,'').split(':');
    return new Response(mockPostStats(postId, userId));
  }),
]
 */

/*
  If DevToolsMode is Prod, omit mocks, show the toolbar only to users from the allowlist
  In Dev Mode, apply mocks, show the toolbar to everyone
 */

export { redisHandler } from './redis-mock-service/index.js';
export { DevvToolsMode, DevvTools } from './devv-tools.js';
