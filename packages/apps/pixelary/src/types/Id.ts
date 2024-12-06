enum THING_PREFIX {
  COMMENT = 't1_',
  USER = 't2_',
  POST = 't3_',
  SUBREDDIT = 't5_',
}

// String literal types
/** Commment Thing ID. */
export type CommentId = `${THING_PREFIX.COMMENT}${string}`;
/** User Thing ID. */
export type UserId = `${THING_PREFIX.USER}${string}`;
/** Post (also called link) Thing ID. */
export type PostId = `${THING_PREFIX.POST}${string}`;
/** Subreddit Thing ID. */
export type SubredditId = `${THING_PREFIX.SUBREDDIT}${string}`;
