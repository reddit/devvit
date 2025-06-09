import { RedditAPIClient, RedisClient } from '@devvit/public-api';
import { TxClientLike } from '@devvit/public-api/apis/redis/RedisClient.js';

import { MAX_LEADERBOARD_ROWS } from './config.js';
import { key_post, key_post_user, Keys } from './keys.js';
import {
  getDefaultTournamentState,
  initialUserData,
  Leaderboard,
  TournamentState,
  UserData,
} from './types/state.js';

export const fetchUserData = async (
  redis: RedisClient,
  redditApi: RedditAPIClient,
  postId: string,
  userId: string | undefined
): Promise<UserData | null> => {
  if (!userId) {
    return null;
  }

  const userDataJSON = await redis.get(key_post_user(Keys.user, postId, userId));
  if (!userDataJSON) {
    const user = await redditApi.getUserById(userId);
    const userData = initialUserData(user.username);
    await Promise.all([
      updateUserData(redis, postId, userId, userData), // register user data in game
      redis.zAdd(key_post(Keys.leaderboard, postId), { score: 0, member: user.username }), // register user score
    ]);
    return userData;
  }
  return JSON.parse(userDataJSON) as UserData;
};

export const updateUserData = async (
  redis: RedisClient,
  postId: string,
  userId: string,
  userData: UserData
): Promise<void> => {
  void redis.set(key_post_user(Keys.user, postId, userId), JSON.stringify(userData));
};

export const getTournamentState = async (
  redis: RedisClient,
  postId: string
): Promise<TournamentState> => {
  const state = await redis.get(key_post(Keys.tournamentState, postId));
  if (!state) {
    // should not happen, but better be safe
    console.log('Initial state is not found!');
    return getDefaultTournamentState(Date.now());
  }
  return JSON.parse(state);
};

export const saveTournamentStateRisky = async (
  redis: RedisClient,
  postId: string,
  tournament: TournamentState
): Promise<void> => saveTournamentStateInternal(redis, postId, tournament);

export const saveTournamentStateSafe = async (
  transaction: TxClientLike,
  postId: string,
  tournament: TournamentState
): Promise<void> => saveTournamentStateInternal(transaction, postId, tournament);

const saveTournamentStateInternal = async (
  redisOrTransaction: RedisClient | TxClientLike,
  postId: string,
  tournament: TournamentState
): Promise<void> => {
  void redisOrTransaction.set(key_post(Keys.tournamentState, postId), JSON.stringify(tournament));
};

export const getLeaderboardState = async (
  redis: RedisClient,
  postId: string,
  _username: string | undefined
): Promise<Leaderboard> => {
  const leaderboardKey = key_post(Keys.leaderboard, postId);
  const top9users = await redis.zRange(leaderboardKey, 0, MAX_LEADERBOARD_ROWS - 1, {
    reverse: true,
    by: 'rank',
  });
  const top9UsersWithRank: Leaderboard = top9users.map((entry, index) => ({
    name: entry.member,
    score: entry.score,
    rank: index + 1,
  }));

  return top9UsersWithRank;

  // if (!username || !!top9UsersWithRank.find((entry) => entry.name === username)){
  //     return top9UsersWithRank;
  // }
  // TODO check current user's rank and add to the list if they are not in the leaderboard
  // return top9UsersWithRank[...]
};

export const getNewUserScore = async (
  redis: RedisClient,
  postId: string,
  username: string,
  holdingDurationMs: number
) => {
  const leaderboardKey = key_post(Keys.leaderboard, postId);
  const userScore = (await redis.zScore(leaderboardKey, username)) ?? 0;
  const scoreIncrement = Math.ceil(holdingDurationMs / 1000);
  return userScore + scoreIncrement;
};

export const updateScore = async (
  transaction: TxClientLike,
  postId: string,
  username: string | null,
  newScore: number
): Promise<void> => {
  if (!username) {
    return;
  }
  const leaderboardKey = key_post(Keys.leaderboard, postId);
  void transaction.zAdd(leaderboardKey, { member: username, score: newScore });
};

export const setGameEndJobId = async (
  redis: RedisClient,
  postId: string,
  jobId: string
): Promise<void> => {
  void redis.set(key_post(Keys.gameOverJob, postId), jobId);
};

export const getAutoDropJobId = async (
  redis: RedisClient,
  postId: string,
  username: string
): Promise<string | undefined> => {
  return redis.get(key_post_user(Keys.autoDropJob, postId, username));
};
export const setAutoDropJobId = async (
  transactionOrRedis: RedisClient | TxClientLike,
  postId: string,
  username: string,
  jobId: string
): Promise<void> => {
  void transactionOrRedis.set(key_post_user(Keys.autoDropJob, postId, username), jobId);
};

export const clearAutoDropJobId = async (
  transaction: TxClientLike,
  postId: string,
  username: string
): Promise<void> => {
  void transaction.del(key_post_user(Keys.autoDropJob, postId, username));
};

export const setAutoDropActionData = async (
  redis: RedisClient,
  postId: string,
  actionData: {
    jobId: string;
    username: string;
    attemptTime: number;
  }
): Promise<void> => {
  void redis.set(key_post(Keys.gameOverJob, postId), JSON.stringify(actionData));
};

export const getScoreByName = async (
  redis: RedisClient,
  postId: string,
  username: string
): Promise<number> => {
  return redis.zScore(key_post(Keys.leaderboard, postId), username);
};
