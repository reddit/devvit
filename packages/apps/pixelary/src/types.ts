import { FlairTextColor } from '@devvit/public-api';

export type CandidateWord = {
  dictionaryName: string;
  word: string;
};

export type Dictionary = {
  name: string;
  words: string[];
};

export type GameSettings = {
  subredditName: string;
  selectedDictionary: string;
};

export enum PostType {
  DRAWING = 'drawing',
  COLLECTION = 'collection',
  PINNED = 'pinned',
}

/*
 * Thing Identifiers
 */

export type CommentId = `t1_${string}`;
export type UserId = `t2_${string}`;
export type PostId = `t3_${string}`;
export type SubredditId = `t5_${string}`;

/*
 * Scheduled Jobs
 */

export type JobData = { answer: string; postId: PostId };

/*
 * Progression
 */

export type Level = {
  rank: number;
  name: string;
  min: number;
  max: number;
  backgroundColor: string;
  textColor: FlairTextColor;
  extraTime: number;
};

/*
 * Navigation
 */

export type Page =
  | 'card-draw'
  | 'editor'
  | 'info'
  | 'leaderboard'
  | 'overview'
  | 'review'
  | 'viewer';

// Base post data
export type PostData = {
  postId: PostId;
  postType: string;
};

// Drawing post
export type DrawingPostData = {
  postId: PostId;
  postType: string;
  word: string;
  dictionaryName: string;
  data: number[];
  authorUsername: string;
  date: number;
  solves: number;
  skips: number;
};

// Collections
export type CollectionData = Pick<DrawingPostData, 'postId' | 'data' | 'authorUsername'>;
export type CollectionPostData = {
  postId: PostId;
  postType: string;
  data: CollectionData[];
  timeframe: string;
};

// Pinned post
export type PinnedPostData = {
  postId: PostId;
  postType: string;
};

export type PostGuesses = {
  guesses: { [guess: string]: number };
  wordCount: number;
  guessCount: number;
  playerCount?: number;
};

export type ScoreBoardEntry = {
  member: string;
  score: number;
  description?: string;
};

export type UserData = {
  score: number;
  solved: boolean; // Has the user solved this post?
  skipped: boolean; // Has the user skipped this post?
  levelRank: number;
  levelName: string;
  guessCount: number;
};

export type WordSelectionEvent = {
  userId: UserId;
  postId: PostId;
  options: { word: string; dictionaryName: string }[];
  word?: string;
  type: 'refresh' | 'manual' | 'auto';
};
