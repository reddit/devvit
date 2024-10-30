// Base post data
export type PostData = {
  postId: string;
  postType: string;
};

// Drawing post
export type DrawingPostData = {
  postId: string;
  postType: string;
  word: string;
  dictionaryName: string;
  data: number[];
  authorUsername: string;
  date: number;
  expired?: boolean;
  solves: number;
  skips: number;
};

// Collections
export type CollectionData = Pick<DrawingPostData, 'postId' | 'data' | 'authorUsername'>;
export type CollectionPostData = {
  postId: string;
  postType: string;
  data: CollectionData[];
  timeframe: string;
};

// Pinned post
export type PinnedPostData = {
  postId: string;
  postType: string;
};
