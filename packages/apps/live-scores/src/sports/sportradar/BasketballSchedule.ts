import type { Devvit } from '@devvit/public-api';
import { APIKey } from './APIKeys.js';
import { getRelativeDate } from '../Timezones.js';
import type { BasketballSeason, BasketballGame } from './BasketballModels.js';

export async function filterGamesFromNbaSeason(
  season: BasketballSeason | undefined
): Promise<BasketballGame[]> {
  if (!season?.games) {
    return [];
  }
  const earliestScheduleDate = getRelativeDate(-1);
  const latestScheduleDate = getRelativeDate(2);

  // Filter the games based on start_time
  return season.games.filter((game) => {
    const gameDate = new Date(game.scheduled);
    return gameDate >= earliestScheduleDate && gameDate <= latestScheduleDate;
  });
}

export async function fetchNbaSchedule(
  seasonType: string,
  context: Devvit.Context
): Promise<BasketballSeason | undefined> {
  let data;
  const apiKey = await context.settings.get(APIKey.nba);
  try {
    const url = `https://api.sportradar.us/nba/production/v8/en/games/2023/${seasonType}/schedule.json?api_key=${apiKey}`;
    // console.log(request.url);
    const response = await fetch(url);
    if (!response.ok) throw Error(`HTTP error ${response.status}: ${response.statusText}`);
    data = await response.json();
  } catch (e) {
    console.error(e);
    return;
  }
  return data;
}

export async function fetchNbaSimSchedule(
  context: Devvit.Context
): Promise<BasketballSeason | undefined> {
  let data;
  const apiKey = await context.settings.get(APIKey.nba);
  try {
    const url = `https://api.sportradar.com/nba/simulation/v8/en/games/2017/SIM/schedule.json?api_key=${apiKey}`;
    // console.log(request.url);
    const response = await fetch(url);
    if (!response.ok) throw Error(`HTTP error ${response.status}: ${response.statusText}`);
    data = await response.json();
  } catch (e) {
    console.error(e);
    return;
  }
  return data;
}

export async function fetchNcaaMensBasketballSchedule(
  seasonType: string,
  context: Devvit.Context
): Promise<BasketballSeason | undefined> {
  let data;
  const apiKey = await context.settings.get(APIKey.ncaamb);
  try {
    const url = `https://api.sportradar.us/ncaamb/production/v8/en/games/2023/${seasonType}/schedule.json?api_key=${apiKey}`;
    // console.log(url)
    const response = await fetch(url);
    if (!response.ok) throw Error(`HTTP error ${response.status}: ${response.statusText}`);
    data = await response.json();
  } catch (e) {
    console.error(e);
    return;
  }
  return data;
}
