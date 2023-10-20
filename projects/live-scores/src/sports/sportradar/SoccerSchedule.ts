import { Devvit } from '@devvit/public-api';
import { SoccerLeague } from './SoccerLeagues.js';
import { SoccerEvent, soccerGameScoreInfo } from './SoccerEvent.js';
import { GeneralGameScoreInfo } from '../GameEvent.js';

export interface SoccerSchedule {
  generated_at: string;
  schedules: SoccerEvent[];
}

export async function fetchSoccerGames(
  league: SoccerLeague,
  context: Devvit.Context
): Promise<GeneralGameScoreInfo[] | null> {
  let data;
  const apiKey = await context.settings.get('soccer-api-key');
  try {
    const request = new Request(
      `https://api.sportradar.us/soccer/trial/v4/en/seasons/${league.seasonId}/schedules.json?api_key=${apiKey}`
    );
    // console.log(request.url);
    const response = await fetch(request);
    data = await response.json();
  } catch (e) {
    console.error(e);
    return null;
  }
  const games = filterGames(parseSchedule(data).schedules);
  return games.map((game) => soccerGameScoreInfo(game));
}

function filterGames(games: SoccerEvent[]): SoccerEvent[] {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const tenDaysFromNow = new Date();
  tenDaysFromNow.setDate(tenDaysFromNow.getDate() + 10);

  // Filter the games based on start_time
  return games.filter((game) => {
    if (game.sport_event.replaced_by) {
      // get rid of games that have been replaced with a new event id
      return false;
    }
    const gameDate = new Date(game.sport_event.start_time);
    return gameDate >= yesterday && gameDate <= tenDaysFromNow;
  });
}
function parseSchedule(jsonData: any): SoccerSchedule {
  return jsonData as SoccerSchedule;
}
