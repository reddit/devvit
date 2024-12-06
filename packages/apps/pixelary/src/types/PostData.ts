import type { PostId } from './Id.js';

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
