import type { Devvit } from '@devvit/public-api';

import { APIService, League } from '../Sports.js';
import { APIKey } from './APIKeys.js';

export async function fetchBasketballSummary(
  gameId: string,
  league: string,
  context: Devvit.Context,
  service: APIService
): Promise<BasketballSummary | null> {
  const leagueKey = league === League.NBA ? APIKey.nba : APIKey.ncaamb;
  const apiKey = await context.settings.get(leagueKey);
  const apiType = service === APIService.SRNBASim ? 'simulation' : 'production';
  try {
    const url = `https://api.sportradar.us/${league}/${apiType}/v8/en/games/${gameId}/summary.json?api_key=${apiKey}`;
    // console.log(url);
    const response = await fetch(url);
    if (!response.ok) throw Error(`HTTP error ${response.status}: ${response.statusText}`);
    return await response.json();
  } catch (e) {
    console.error(e);
    return null;
  }
}

export function getPlayerStatsForTeam(team: BasketballSummaryTeam): BasketballSummaryPlayer[] {
  // sort by points, tiebreak by starter, then onCourt, then alphabetical last name
  return team.players.sort((a, b) => {
    if (a.statistics && b.statistics) {
      if (a.statistics.points !== b.statistics.points)
        return b.statistics.points - a.statistics.points;
      if (a.starter !== b.starter) return b.starter ? 1 : -1;
      if (a.on_court !== b.on_court) return b.on_court ? 1 : -1;
      if (a.statistics.assists !== b.statistics.assists)
        return b.statistics.assists - a.statistics.assists;
      if (a.statistics.rebounds !== b.statistics.rebounds)
        return b.statistics.rebounds - a.statistics.rebounds;
      if (a.statistics.minutes !== b.statistics.minutes)
        return b.statistics.minutes !== '00:00' ? 1 : -1;
    }
    // Some small time college games don't have comprehensive stats, sort those with stats first
    const aHasStats = a.statistics !== undefined;
    const bHasStats = b.statistics !== undefined;
    if (aHasStats !== bHasStats) return aHasStats ? -1 : 1;
    return a.last_name.localeCompare(b.last_name);
  });
}

export type BasketballSummary = {
  id: string;
  status: string;
  scheduled: string;
  clock: string;
  quarter: number;
  sr_id: string;
  clock_decimal: string;
  home: BasketballSummaryTeam;
  away: BasketballSummaryTeam;
};

export type BasketballSummaryTeam = {
  name: string;
  alias: string;
  market: string;
  id: string;
  points: number;
  sr_id: string;
  remaining_timeouts: number;
  record: BasketballSummaryRecord;
  scoring: BasketballSummaryScoring[];
  statistics: BasketballSummaryTeamStatistics;
  players: BasketballSummaryPlayer[];
};

export type BasketballSummaryScoring = {
  type: string;
  number: number;
  sequence: number;
  points: number;
};

export type BasketballSummaryRecord = {
  wins: number;
  losses: number;
};

export type BasketballSummaryPlayer = {
  full_name: string;
  jersey_number: string;
  id: string;
  first_name: string;
  last_name: string;
  position: string;
  primary_position: string;
  played?: boolean;
  active?: boolean;
  starter?: boolean;
  on_court?: boolean;
  sr_id?: string;
  reference?: string;
  statistics?: BasketballSummaryPlayerStatistics;
  not_playing_reason?: string;
  not_playing_description?: string;
};

export type BasketballSummaryStatistics = {
  minutes: string;
  field_goals_made: number;
  field_goals_att: number;
  field_goals_pct: number;
  three_points_made: number;
  three_points_att: number;
  three_points_pct: number;
  two_points_made: number;
  two_points_att: number;
  two_points_pct: number;
  blocked_att: number;
  free_throws_made: number;
  free_throws_att: number;
  free_throws_pct: number;
  offensive_rebounds: number;
  defensive_rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  assists_turnover_ratio: number;
  personal_fouls: number;
  flagrant_fouls: number;
  pls_min: number;
  points: number;
  effective_fg_pct: number;
  efficiency: number;
  efficiency_game_score: number;
  points_in_paint: number;
  points_in_paint_att: number;
  points_in_paint_made: number;
  points_in_paint_pct: number;
  true_shooting_att: number;
  true_shooting_pct: number;
  fouls_drawn: number;
  offensive_fouls: number;
  points_off_turnovers: number;
  fast_break_pts: number;
  fast_break_att: number;
  fast_break_made: number;
  fast_break_pct: number;
  defensive_rating?: number;
  offensive_rating?: number;
  coach_ejections: number;
  second_chance_att: number;
  second_chance_made: number;
  second_chance_pct: number;
};

export type BasketballSummaryPlayerStatistics = BasketballSummaryStatistics & {
  rebounds: number;
  turnovers: number;
  tech_fouls: number;
  double_double: boolean;
  triple_double: boolean;
  second_chance_pts: number;
  minus: number;
  plus: number;
  defensive_rebounds_pct: number;
  offensive_rebounds_pct: number;
  rebounds_pct: number;
  steals_pct: number;
  turnovers_pct: number;
  coach_tech_fouls: number;
};

export type BasketballSummaryTeamStatistics = BasketballSummaryStatistics & {
  ejections: number;
  foulouts: number;
  team_turnovers: number;
  team_rebounds: number;
  player_tech_fouls: number;
  team_tech_fouls: number;
  coach_tech_fouls: number;
  team_offensive_rebounds: number;
  team_defensive_rebounds: number;
  total_rebounds: number;
  total_turnovers: number;
  personal_rebounds: number;
  player_turnovers: number;
  bench_points: number;
  biggest_lead: number;
  points_against: number;
  possessions: number;
  opponent_possessions: number;
  time_leading: string;
  defensive_points_per_possession: number;
  offensive_points_per_possession: number;
  team_fouls: number;
  total_fouls: number;
};
