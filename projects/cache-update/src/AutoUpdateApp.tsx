import { Devvit } from '@devvit/public-api';
import { jobKey, lastUpdateKey } from './redis.js';
import { AutoUpdate } from './AutoUpdate.js';
import { startCron } from './scheduler.js';
import { updateCustomPost } from './customPost.js';
import { AutoUpdateCache } from './AutoUpdateCache.js';
import BlockComponent = Devvit.BlockComponent;

export const AutoUpdateApp: BlockComponent = (_, context) => {
  const { useState, redis, reddit, postId, useInterval, scheduler } = context;

  const [lastUpdate, setLastUpdate] = useState(async () =>
    postId ? await redis.get(lastUpdateKey(postId)) : '0'
  );
  const [isMod] = useState(async () => {
    const sub = await reddit.getCurrentSubreddit();
    const user = await reddit.getCurrentUser();

    const perms = await user.getModPermissionsForSubreddit(sub.name);
    return perms.includes('all');
  });
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(async () => {
    try {
      if (postId) {
        return !!(await redis.get(jobKey(postId)));
      }
    } catch {
      //
    }
    return false;
  });
  const [showModActions, setShowModActions] = useState(false);

  const lastUpdateDate = new Date(lastUpdate ?? Date.now());
  let updating = false;

  const toggleAutoUpdate = async () => {
    try {
      if (postId) {
        if (autoUpdateEnabled) {
          const jobId = await redis.get(jobKey(postId));
          if (jobId) {
            await scheduler.cancelJob(jobId);
          }
          await redis.del(jobKey(postId));
        } else {
          await startCron(context, postId);
        }
        setAutoUpdateEnabled(!autoUpdateEnabled);

        await updateCustomPost(context, postId, () => (
          <AutoUpdateCache liveRenderTime={new Date()} autoUpdateEnabled={autoUpdateEnabled} />
        ));
      }
    } catch (e) {
      if ((e as Error).message === 'ServerCallRequired') {
        updating = true;
      }
    }
  };

  const forceUpdate = async () => {
    if (postId) {
      try {
        await updateCustomPost(context, postId, () => (
          <AutoUpdateCache liveRenderTime={new Date()} autoUpdateEnabled={autoUpdateEnabled} />
        ));
      } catch (e) {
        if ((e as Error).message === 'ServerCallRequired') {
          updating = true;
        }
      }
    }
  };

  useInterval(async () => {
    const intervalNow = Date.now();
    if (postId && intervalNow - lastUpdateDate.getTime() > 60_000) {
      // Refresh lastUpdate every ~1 minute along with the scheduled job
      try {
        setLastUpdate(await redis.get(lastUpdateKey(postId)));
      } catch (e) {
        if ((e as Error).message === 'ServerCallRequired') {
          updating = true;
        }
      }
    }
  }, 1000).start();

  const toggleModActions = () => {
    setShowModActions(!showModActions);
  };

  return (
    <AutoUpdate
      autoUpdateEnabled={autoUpdateEnabled}
      isMod={isMod}
      toggleAutoUpdate={toggleAutoUpdate}
      forceUpdate={forceUpdate}
      updating={updating || !postId}
      lastScheduledUpdateTime={lastUpdateDate}
      liveRenderTime={new Date()}
      showModActions={showModActions}
      toggleModActions={isMod ? toggleModActions : undefined}
    />
  );
};
