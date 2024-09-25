export type PostData = {
  word: string;
  data: number[];
  authorUsername: string;
  date: number;
  expired?: boolean;
  postId: string;
  count: {
    players: number;
    winners: number;
    skipped: number;
    guesses: number;
    words: number;
  };
  user: {
    guesses: number;
    solved: boolean;
    skipped: boolean;
    points: number;
  };
  guesses: {
    word: string;
    count: number;
    commentId?: string;
  }[];
  postType: string;
};

// Collections
export type CollectionData = Pick<PostData, 'postId' | 'data' | 'authorUsername'>;
export type CollectionPostData = {
  postId: string;
  data: CollectionData[];
  timeframe: string;
  postType: string;
};
