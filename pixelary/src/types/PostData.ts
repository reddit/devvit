export type PostData = {
  word: string;
  data: number[];
  authorUsername: string;
  date: number;
  expired?: boolean;
  published: boolean;
  postId?: string;
  solved?: boolean;
  pointsEarnedByUser?: number;
};
