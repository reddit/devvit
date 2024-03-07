import { Devvit } from '@devvit/public-api';
import { DevvTools, redisHandler } from '../../external/devv-tools/index.js';
import { APP_MODE } from '../../config.js';

Devvit.addSchedulerJob({
  name: 'job-1',
  onRun: async (_event, context) => {
    console.log('scheduled job');
    const { devvRedis } = DevvTools.api({
      context,
      mode: APP_MODE,
      handlers: [redisHandler.get('mocked_key', () => 'Value from mocks!')],
    });

    const value = await devvRedis.get('mocked_key');
    console.log(value);
  },
});
