import { Devvit } from '@devvit/public-api';

import { jobKey, lastUpdateKey } from './redis.js';
import { updateCustomPost } from './customPost.js';
import { AutoUpdateCache } from './AutoUpdateCache.js';
import Context = Devvit.Context;

const JOB_NAME = 'updateCache';

export const startCron = async ({ scheduler, redis }: Context, postId: string) => {
  console.log(`Scheduling job to update post ID ${postId}`);
  const jobId = await scheduler.runJob({
    name: JOB_NAME,
    cron: '* * * * *',
    data: {
      postId: postId,
    },
  });

  await redis.set(`job:${postId}`, jobId);
};

Devvit.addSchedulerJob({
  name: JOB_NAME,
  onRun: async (event, context) => {
    const postId = event.data?.postId;
    if (!postId) {
      return;
    }

    try {
      await context.redis.get(jobKey(postId));
    } catch {
      console.warn('skipping stale job');
      return;
    }

    const now = new Date();

    console.log(`Updating post with ID ${postId}...`);
    await context.redis.set(lastUpdateKey(postId), now.toISOString());

    await updateCustomPost(context, postId, () => (
      <AutoUpdateCache autoUpdateEnabled={true} schedulerUpdateTime={now} />
    ));
  },
});
