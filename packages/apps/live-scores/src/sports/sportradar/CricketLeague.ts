import { League } from '../Sports.js';

export type CricketLeague = {
  tournamentId: string;
  seasonId: string;
  league: League;
};

// Eventually we can fetch these season IDs, but this will suffice for now (2023-2024 season)
export function infoForCricketLeague(league: League): CricketLeague {
  if (league === League.ICCT20) {
    return {
      tournamentId: 'sr:tournament:35516',
      seasonId: 'sr:season:100587',
      league: League.ICCT20,
    };
  }
  if (league === League.IPL) {
    return {
      tournamentId: 'sr:tournament:2472',
      seasonId: 'sr:season:108375',
      league: League.IPL,
    };
  }
  if (league === League.ICCCT) {
    return {
      tournamentId: 'sr:tournament:15331',
      seasonId: 'sr:season:127467',
      league: League.ICCCT,
    };
  }
  return { tournamentId: 'unknown', seasonId: 'unknown', league: League.UNKNOWN };
}
