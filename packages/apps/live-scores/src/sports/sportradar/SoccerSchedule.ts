import { Devvit } from '@devvit/public-api';

import { GeneralGameScoreInfo } from '../GameEvent.js';
import { APIKey } from './APIKeys.js';
import { SoccerEvent, soccerScoreInfo } from './SoccerEvent.js';
import { SoccerLeague } from './SoccerLeagues.js';

export type SoccerSchedule = {
  generated_at: string;
  schedules: SoccerEvent[];
};

export async function fetchSoccerGames(
  league: SoccerLeague,
  context: Devvit.Context
): Promise<GeneralGameScoreInfo[] | null> {
  let data;
  const apiKey = await context.settings.get(APIKey.soccer);
  try {
    const request = new Request(
      `https://api.sportradar.us/soccer/production/v4/en/seasons/${league.seasonId}/schedules.json?api_key=${apiKey}`
    );
    // console.log(request.url);
    const response = await fetch(request);
    data = await response.json();
  } catch (e) {
    console.error(e);
    return null;
  }
  const games = filterGames(parseSchedule(data).schedules);
  return games.map((game) => soccerScoreInfo(league.league, game));
}

function filterGames(games: SoccerEvent[]): SoccerEvent[] {
  const eightDaysAgo = new Date();
  eightDaysAgo.setDate(eightDaysAgo.getDate() - 8);

  const tenDaysFromNow = new Date();
  tenDaysFromNow.setDate(tenDaysFromNow.getDate() + 10);

  // Filter the games based on start_time
  return games.filter((game) => {
    if (game.sport_event.replaced_by) {
      // get rid of games that have been replaced with a new event id
      return false;
    }
    const gameDate = new Date(game.sport_event.start_time);
    return gameDate >= eightDaysAgo && gameDate <= tenDaysFromNow;
  });
}
function parseSchedule(jsonData: unknown): SoccerSchedule {
  return jsonData as SoccerSchedule;
}
