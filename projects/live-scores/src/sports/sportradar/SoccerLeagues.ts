import { League } from '../Sports.js';

export interface SoccerLeague {
  leagueId: string;
  seasonId: string;
}

// Eventually we can fetch these season IDs, but this will suffice for now (2023-2024 season)
export function infoForLeague(league: League): SoccerLeague {
  switch (league) {
    case League.EPL:
      return { leagueId: 'sr:competition:17', seasonId: 'sr:season:105353' };
    case League.LALIGA:
      return { leagueId: 'sr:competition:8', seasonId: 'sr:season:106501' };
    case League.SERIEA:
      return { leagueId: 'sr:competition:23', seasonId: 'sr:season:106499' };
    case League.SUPERLIG:
      return { leagueId: 'sr:competition:52', seasonId: 'sr:season:107293' };
    case League.EFL:
      return { leagueId: 'sr:competition:21', seasonId: 'sr:season:105951' };
    case League.BUNDESLIGA:
      return { leagueId: 'sr:competition:35', seasonId: 'sr:season:105937' };
    case League.MLS:
      // 2023 only, need new season ID in february 2024
      return { leagueId: 'sr:competition:242', seasonId: 'sr:season:101055' };
  }
  return { leagueId: 'unknown', seasonId: 'unknown' };
}
