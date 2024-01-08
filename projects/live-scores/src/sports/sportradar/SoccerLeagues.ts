import { League } from '../Sports.js';

export type SoccerLeague = {
  leagueId: string;
  seasonId: string;
  league: League;
};

// Eventually we can fetch these season IDs, but this will suffice for now (2023-2024 season)
export function infoForLeague(league: League): SoccerLeague {
  switch (league) {
    case League.EPL:
      return { leagueId: 'sr:competition:17', seasonId: 'sr:season:105353', league: League.EPL };
    case League.ECL:
      return { leagueId: 'sr:competition:18', seasonId: 'sr:season:105943', league: League.ECL };
    case League.LALIGA:
      return { leagueId: 'sr:competition:8', seasonId: 'sr:season:106501', league: League.LALIGA };
    case League.SERIEA:
      return { leagueId: 'sr:competition:23', seasonId: 'sr:season:106499', league: League.SERIEA };
    case League.SUPERLIG:
      return {
        leagueId: 'sr:competition:52',
        seasonId: 'sr:season:107293',
        league: League.SUPERLIG,
      };
    case League.EFLCUP:
      return { leagueId: 'sr:competition:21', seasonId: 'sr:season:105951', league: League.EFLCUP };
    case League.BUNDESLIGA:
      return {
        leagueId: 'sr:competition:35',
        seasonId: 'sr:season:105937',
        league: League.BUNDESLIGA,
      };
    case League.MLS:
      // 2023 only, need new season ID in february 2024
      return { leagueId: 'sr:competition:242', seasonId: 'sr:season:101055', league: League.MLS };
    case League.UEFACHAMPIONS:
      return {
        leagueId: 'sr:competition:7',
        seasonId: 'sr:season:106479',
        league: League.UEFACHAMPIONS,
      };
    case League.EFLLEAGUEONE:
      return {
        leagueId: 'sr:competition:24',
        seasonId: 'sr:season:105945',
        league: League.EFLLEAGUEONE,
      };
    case League.EFLLEAGUETWO:
      return {
        leagueId: 'sr:competition:25',
        seasonId: 'sr:season:105947',
        league: League.EFLLEAGUETWO,
      };
    case League.LIGAMXAPERTURA:
      return {
        leagueId: 'sr:competition:27464',
        seasonId: 'sr:season:106433',
        league: League.LIGAMXAPERTURA,
      };
    case League.LIGAMXCLAUSURA:
      return {
        leagueId: 'sr:competition:27466',
        seasonId: 'sr:season:100751',
        league: League.LIGAMXCLAUSURA,
      };
    case League.CROATIA_HNL:
      return {
        leagueId: 'sr:competition:170',
        seasonId: 'sr:season:106503',
        league: League.CROATIA_HNL,
      };
  }
  return { leagueId: 'unknown', seasonId: 'unknown', league: League.UNKNOWN };
}
