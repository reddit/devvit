export const key_post = (key: string, postId: string): string => {
  return `${postId}_${key}`;
};

export const key_post_user = (key: string, postId: string, userId: string): string => {
  return `${postId}_${userId}_${key}`;
};

export const Keys = {
  tournamentState: 'tournamentState',
  leaderboard: 'leaderboard',
  user: 'user',
  gameOverJob: 'gameOverJob',
  autoDropJob: 'autoDropJob',
  flagCaptureLock: 'flagCaptureLock',
} as const;
