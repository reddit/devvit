import { Devvit, RedisClient, Scheduler } from '@devvit/public-api';
import { TxClientLike } from '@devvit/public-api/apis/redis/RedisClient.js';

import {
  clearAutoDropJobId,
  getAutoDropJobId,
  getNewUserScore,
  getTournamentState,
  saveTournamentStateSafe,
  setAutoDropJobId,
  setGameEndJobId,
  updateScore,
} from './api.js';
import { key_post, Keys } from './keys.js';
import { TournamentState } from './types/state.js';

const STOP_GAME_ACTION_ID = 'STOP_GAME';
const AUTO_DROP_ACTION_ID = 'DROP_THE_FLAG';

Devvit.addSchedulerJob({
  name: STOP_GAME_ACTION_ID,
  onRun: async (event, context) => {
    const { postId } = event.data!;
    console.log(`SCHEDULED JOB for ${postId}`);
    const gameEndTime = Date.now();
    const state = await getTournamentState(context.redis, postId);
    if (!state) {
      return;
    }
    const lockExpiration = new Date(gameEndTime + 5000);
    const lockLey = key_post(Keys.flagCaptureLock, postId);
    const lockAcquired = await context.redis.set(lockLey, 'locked', {
      expiration: lockExpiration,
      nx: true,
    });

    if (!lockAcquired) {
      console.log(`\n SCHEDULED JOB Failed to get lock for ${postId} \n`);
      // retry finishing the game
      const scheduledJobId = await context.scheduler.runJob({
        name: STOP_GAME_ACTION_ID,
        data: { postId },
        runAt: new Date(gameEndTime + 2000),
      });
      await setGameEndJobId(context.redis, postId, scheduledJobId);
      return;
    }

    console.log(`\n SCHEDULED JOB Acquired the lock for ${postId} \n`);
    const transaction = await context.redis.watch(
      key_post(Keys.tournamentState, postId),
      key_post(Keys.leaderboard, postId)
    );
    await transaction.multi();
    try {
      if (state.flagHolderName) {
        const previousAutoDropJobId = await getAutoDropJobId(
          context.redis,
          postId,
          state.flagHolderName
        );
        if (previousAutoDropJobId) {
          console.log(`Cancelling AUTO_DROP job for ${state.flagHolderName}`);
          await context.scheduler.cancelJob(previousAutoDropJobId);
        }
        const timeDiffMs = gameEndTime - state.holdingSince;
        const newScore = await getNewUserScore(
          context.redis,
          postId,
          state.flagHolderName,
          timeDiffMs
        );
        await updateScore(transaction, postId, state.flagHolderName, newScore);
      }
      const newState: TournamentState = {
        flagHolderName: null,
        holdingSince: gameEndTime,
        gameActive: false,
        cooldown: Infinity,
      };
      await saveTournamentStateSafe(transaction, postId, newState);
      await transaction.exec();

      console.log(`\n SCHEDULED JOB successfully executed for ${postId} \n`);
    } catch {
      console.log('SCHEDULED JOB failed, discarding transaction \n\n\n');
      await transaction.discard();
    }
  },
});

export const setGameOverScheduler = async (
  postId: string,
  gameEndTimestamp: number,
  scheduler: Scheduler,
  redis: RedisClient
): Promise<void> => {
  const scheduledJobId = await scheduler.runJob({
    name: STOP_GAME_ACTION_ID,
    data: { postId },
    runAt: new Date(gameEndTimestamp),
  });
  await setGameEndJobId(redis, postId, scheduledJobId);
};

Devvit.addSchedulerJob({
  name: AUTO_DROP_ACTION_ID,
  onRun: async (event, context) => {
    const { postId, username } = event.data!;
    console.log(`AUTO_DROP on ${postId} for ${username}`);
    const currentTime = Date.now();
    const state = await getTournamentState(context.redis, postId);
    // schedule an auto drop for each user. Delete the auto drop job on flag capture
    if (!state || !state.flagHolderName || state.flagHolderName !== username) {
      return;
    }
    const lockExpiration = new Date(currentTime + 1000);
    const lockLey = key_post(Keys.flagCaptureLock, postId);
    const lockAcquired = await context.redis.set(lockLey, 'locked', {
      expiration: lockExpiration,
      nx: true,
    });

    if (!lockAcquired) {
      console.log(`\n AUTO_DROP Failed to get lock on ${postId} for ${username} \n`);
      // retry AUTO_DROP
      const scheduledJobId = await context.scheduler.runJob({
        name: AUTO_DROP_ACTION_ID,
        data: { postId, username },
        runAt: new Date(currentTime + 2000),
      });
      console.log(`\n AUTO_DROP Retry scheduled on ${postId} for ${username} \n`);
      await setAutoDropJobId(context.redis, postId, username, scheduledJobId);
      return;
    }

    console.log(`\n AUTO_DROP JOB Acquired the lock for ${postId} \n`);
    const transaction = await context.redis.watch(
      key_post(Keys.tournamentState, postId),
      key_post(Keys.leaderboard, postId)
    );

    const timeDiffMs = currentTime - state.holdingSince;
    const newScore = await getNewUserScore(context.redis, postId, state.flagHolderName, timeDiffMs);
    await updateScore(transaction, postId, state.flagHolderName, newScore);

    const newState: TournamentState = {
      flagHolderName: null,
      holdingSince: currentTime,
      gameActive: true,
      cooldown: 0,
    };
    await saveTournamentStateSafe(transaction, postId, newState);
    await clearAutoDropJobId(transaction, postId, username);
    await transaction.del(lockLey);
    await transaction.exec();

    console.log(`\n AUTO_DROP successfully executed for ${postId} \n`);
  },
});

export const scheduleAutoDropJob = async (
  transaction: TxClientLike,
  scheduler: Scheduler,
  postId: string,
  flagHolder: string,
  scheduledDropTimestamp: number
): Promise<void> => {
  const autoDropDateTime = new Date(scheduledDropTimestamp);
  console.log(`Scheduling AUTO_DROP on ${postId} for ${flagHolder} at ${autoDropDateTime}`);
  const scheduledJobId = await scheduler.runJob({
    name: AUTO_DROP_ACTION_ID,
    data: { postId, username: flagHolder },
    runAt: autoDropDateTime,
  });
  await setAutoDropJobId(transaction, postId, flagHolder, scheduledJobId);
};
