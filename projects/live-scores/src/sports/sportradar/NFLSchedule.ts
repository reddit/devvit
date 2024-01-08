import { Devvit } from '@devvit/public-api';
import { Team, Period } from './GenericModels.js';
import { APIKey } from './APIKeys.js';

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
  id: string;
  year: number;
  type: string;
  name: string;
  week?: NFLWeek;
};

export async function fetchNflCurrentWeek(context: Devvit.Context): Promise<NFLWeek | undefined> {
  let data;
  const apiKey = await context.settings.get(APIKey.nfl);
  try {
    const request = new Request(
      `https://api.sportradar.us/nfl/official/production/v7/en/games/current_week/schedule.json?api_key=${apiKey}`
    );
    // console.log(request.url);
    const response = await fetch(request);
    data = await response.json();
  } catch (e) {
    console.error(e);
    return;
  }
  return parseSeasonData(data).week;
}

function parseSeasonData(jsonData: any): NFLSeason {
  return {
    id: jsonData.id,
    year: jsonData.year,
    type: jsonData.type,
    name: jsonData.name,
    week: {
      id: jsonData.week.id,
      sequence: jsonData.week.sequence,
      title: jsonData.week.title,
      games: jsonData.week.games.map((game: any) => ({
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
      })),
    },
  };
}
