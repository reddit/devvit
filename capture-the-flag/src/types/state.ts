import { INITIAL_ATTEMPTS_COUNT } from '../config.js';

export type TournamentState = {
  flagHolderName: string | null;
  holdingSince: number;
  cooldown: number;
  gameActive: boolean;
};

export const getDefaultTournamentState = (tournamentStartTimestamp: number): TournamentState => ({
  flagHolderName: null,
  holdingSince: tournamentStartTimestamp,
  cooldown: 0,
  gameActive: true,
});

export type UserData = {
  name: string;
  attemptsRemaining: number;
};

export const initialUserData = (username: string): UserData => {
  return {
    name: username,
    attemptsRemaining: INITIAL_ATTEMPTS_COUNT,
  };
};

export type LeaderboardEntry = {
  name: string;
  score: number; // sum amount seconds holding the flag
  rank: number;
};

export type Leaderboard = LeaderboardEntry[];
