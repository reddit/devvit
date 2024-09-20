import type { Devvit } from '@devvit/public-api';

import { getRelativeDate } from '../Timezones.js';
import { APIKey } from './APIKeys.js';
import type { Period, Team } from './GenericModels.js';

export type NFLGame = {
  id: string;
  status: string;
  scheduled: string;
  attendance?: number;
  sr_id: string;
  game_type: string;
  conference_game: boolean;
  duration?: string;
  home?: Team;
  away?: Team;
  scoring?: {
    home_points?: number;
    away_points?: number;
    periods: Period[];
  };
};

export type NFLWeek = {
  id: string;
  sequence: number;
  title: string;
  games?: NFLGame[];
};

export type NFLSeason = {
  season: NFLSeasonInfo;
  weeks: NFLWeek[];
};

export type NFLSeasonInfo = {
  id: string;
  year: number;
  type: string;
  name: string;
  week?: NFLWeek;
};

export async function filteredGamesFromSeason(season: NFLSeason | undefined): Promise<NFLGame[]> {
  const games: NFLGame[] = [];
  if (!season) {
    return games;
  }
  for (const week of season.weeks) {
    if (week.games) {
      games.push(...week.games);
    }
  }

  const eightDaysAgo = getRelativeDate(-8);
  const tenDaysFromNow = getRelativeDate(10);

  // Filter the games based on start_time
  return games.filter((game) => {
    const gameDate = new Date(game.scheduled);
    return gameDate >= eightDaysAgo && gameDate <= tenDaysFromNow;
  });
}

export async function fetchNflSchedule(
  seasonType: string,
  context: Devvit.Context
): Promise<NFLSeason | undefined> {
  let data;
  const apiKey = await context.settings.get(APIKey.nfl);
  try {
    const request = new Request(
      `https://api.sportradar.us/nfl/official/production/v7/en/games/2024/${seasonType}/schedule.json?api_key=${apiKey}`
    );
    // console.log(request.url);
    const response = await fetch(request);
    data = await response.json();
  } catch (e) {
    console.error(e);
    return;
  }
  return parseScheduleData(data);
}

function parseScheduleData(jsonData: unknown): NFLSeason {
  return {
    season: {
      id: jsonData.id,
      year: jsonData.year,
      type: jsonData.type,
      name: jsonData.name,
    },
    weeks: jsonData.weeks.map((week: unknown) => parseWeekData(week)),
  };
}

function parseWeekData(jsonData: unknown): NFLWeek {
  return {
    id: jsonData.id,
    sequence: jsonData.sequence,
    title: jsonData.title,
    games: parseGames(jsonData.games),
  };
}

function parseGames(jsonData: unknown): NFLGame[] {
  return jsonData.map((game: unknown) => ({
    id: game.id,
    status: game.status,
    scheduled: game.scheduled,
    attendance: game.attendance,
    entry_mode: game.entry_mode,
    sr_id: game.sr_id,
    game_type: game.game_type,
    conference_game: game.conference_game,
    duration: game.duration,
    home: {
      id: game.home.id,
      name: game.home.name,
      alias: game.home.alias,
      sr_id: game.home.sr_id,
    },
    away: {
      id: game.away.id,
      name: game.away.name,
      alias: game.away.alias,
      sr_id: game.away.sr_id,
    },
  }));
}
