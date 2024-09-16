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
    guesses: number;
    words: number;
  };
  user: {
    guesses: number;
    solved: boolean;
    points: number;
  };
  guesses: {
    word: string;
    count: number;
  }[];
};
