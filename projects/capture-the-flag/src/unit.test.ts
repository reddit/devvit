import { Leaderboard, LeaderboardEntry } from './types/state.js';
import { insertFlagHolderToLeaderboard } from './utils.js';

describe('tests', () => {
  describe('live scoreboard updates', () => {
    const initialLeaderboard: LeaderboardEntry[] = [
      {
        name: 'A',
        score: 10,
        rank: 1,
      },
      {
        name: 'B',
        score: 8,
        rank: 2,
      },
      {
        name: 'C',
        score: 6,
        rank: 3,
      },
    ];

    test('keeps the scoreboard unchanged if flag holders score is lower than in loeaderboard', () => {
      const flagHolder = {
        name: 'F',
        score: 3,
      };
      const newLeaderboard = insertFlagHolderToLeaderboard(initialLeaderboard, flagHolder);
      expect(newLeaderboard).toEqual(initialLeaderboard);
    });

    test('replaces the last scoreboard entry with the flag holder if flag holder scores more than the last entry', () => {
      const flagHolder = {
        name: 'K',
        score: 7,
      };
      const newLeaderboard = insertFlagHolderToLeaderboard(initialLeaderboard, flagHolder);
      expect(newLeaderboard[0]).toEqual(initialLeaderboard[0]);
      expect(newLeaderboard[1]).toEqual(initialLeaderboard[1]);
      expect(newLeaderboard[2]).toEqual({
        name: 'K',
        score: 7,
        rank: 3,
      });
    });

    test('inserts the flag holder to second to last position if flag holder scores more than second to last player', () => {
      const flagHolder = {
        name: 'L',
        score: 9,
      };
      const newLeaderboard = insertFlagHolderToLeaderboard(initialLeaderboard, flagHolder);
      expect(newLeaderboard[0]).toEqual(initialLeaderboard[0]);
      expect(newLeaderboard[1]).toEqual({
        name: 'L',
        score: 9,
        rank: 2,
      });
    });

    test('keeps the length of leaderboard the same', () => {
      const flagHolder = {
        name: 'L',
        score: 9,
      };
      const newLeaderboard = insertFlagHolderToLeaderboard(initialLeaderboard, flagHolder);
      expect(newLeaderboard.length).toEqual(initialLeaderboard.length);
    });

    test('updates the rank of subsequent items in the leaderboard after insertion', () => {
      const flagHolder = {
        name: 'L',
        score: 9,
      };
      const newLeaderboard = insertFlagHolderToLeaderboard(initialLeaderboard, flagHolder);
      expect(newLeaderboard[0].rank).toBe(1);
      expect(newLeaderboard[1].rank).toBe(2);
      expect(newLeaderboard[2].rank).toBe(3);
    });

    test('updates the rank of subsequent items in the leaderboard after insertion', () => {
      const flagHolder = {
        name: 'M',
        score: 11,
      };
      const newLeaderboard = insertFlagHolderToLeaderboard(initialLeaderboard, flagHolder);
      expect(newLeaderboard[0].rank).toBe(1);
      expect(newLeaderboard[1].rank).toBe(2);
      expect(newLeaderboard[2].rank).toBe(3);
    });

    test('updates the score and the position if user is already in the list', () => {
      const flagHolder = {
        name: 'B',
        score: 11,
      };
      const newLeaderboard = insertFlagHolderToLeaderboard(initialLeaderboard, flagHolder);
      expect(newLeaderboard).toEqual([
        {
          name: 'B',
          score: 11,
          rank: 1,
        },
        {
          name: 'A',
          score: 10,
          rank: 2,
        },
        {
          name: 'C',
          score: 6,
          rank: 3,
        },
      ]);
    });

    test('updates the score for flagholder if it has the last position', () => {
      const initialSmallLeaderboard: Leaderboard = [
        { name: 'A', score: 20, rank: 1 },
        { name: 'B', score: 0, rank: 2 },
      ];
      const flagHolder = { name: 'B', score: 10 };
      const newLeaderboard = insertFlagHolderToLeaderboard(initialSmallLeaderboard, flagHolder);
      expect(newLeaderboard).toEqual([
        { name: 'A', score: 20, rank: 1 },
        { name: 'B', score: 10, rank: 2 },
      ]);
    });

    test('add user to the top of the leaderboard if they were the last but now are first', () => {
      const initialSmallLeaderboard: Leaderboard = [
        { name: 'A', score: 0, rank: 1 },
        { name: 'B', score: 0, rank: 2 },
      ];
      const flagHolder = { name: 'B', score: 10 };
      const newLeaderboard = insertFlagHolderToLeaderboard(initialSmallLeaderboard, flagHolder);
      expect(newLeaderboard).toEqual([
        { name: 'B', score: 10, rank: 1 },
        { name: 'A', score: 0, rank: 2 },
      ]);
    });
  });
});
