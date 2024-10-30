export type PostGuesses = {
  guesses: { [guess: string]: number };
  wordCount: number;
  guessCount: number;
  playerCount?: number;
};
