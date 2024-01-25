export type DailyDrawingRecord =
  | null
  | false
  | {
      word: string;
      postId: string;
      data: number[];
    };
