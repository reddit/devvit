// Type that repsents event of solved drawing.
// Immutable.
export type SolvedDrawingEvent = {
  drawingId: string; // Could be the same as postId
  userId: string;
  points: number;
  date: Date;
};
