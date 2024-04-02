import type { Devvit } from '@devvit/public-api';
import type { CricketLeague } from './CricketLeague.js';
import type { CricketSportEvent } from './CricketMatch.js';
import { APIKey } from './APIKeys.js';
import { getRelativeDate } from '../Timezones.js';

export type CricketTournaments = {
  generated_at: string;
  tournament: CricketTournament;
  sport_events: CricketSportEvent[];
};

type CricketTournament = {
  id: string;
};

export async function fetchCricketSportEvents(
  league: CricketLeague,
  context: Devvit.Context
): Promise<CricketSportEvent[] | null> {
  let data;
  const apiKey = await context.settings.get(APIKey.cricket);
  try {
    const request = new Request(
      `https://api.sportradar.com/cricket-t2/en/tournaments/${league.tournamentId}/schedule.json?api_key=${apiKey}`
    );
    const response = await fetch(request);
    data = await response.json();
  } catch (e) {
    console.error(e);
    return null;
  }

  if (!isCricketTournaments(data)) {
    console.error('Error when parsing cricket tournaments, invalid data');
    return null;
  }

  return filterMatches(parseMatches(data).sport_events);
}

function isCricketTournaments(jsonData: unknown): jsonData is CricketTournaments {
  if (typeof jsonData !== 'object' || !jsonData) {
    return false;
  }

  return (
    Object.prototype.hasOwnProperty.call(jsonData, 'generated_at') &&
    Object.prototype.hasOwnProperty.call(jsonData, 'tournament') &&
    Object.prototype.hasOwnProperty.call(jsonData, 'sport_events')
  );
}

function filterMatches(games: CricketSportEvent[]): CricketSportEvent[] {
  const earliestScheduleDate = getRelativeDate(-1);
  const latestScheduleDate = getRelativeDate(2);

  // Filter the games based on start_time
  return games.filter((game) => {
    if (game.start_time_tbd) {
      return false;
    }
    const gameDate = new Date(game.scheduled);
    return gameDate >= earliestScheduleDate && gameDate <= latestScheduleDate;
  });
}

function parseMatches(jsonData: unknown): CricketTournaments {
  return jsonData as CricketTournaments;
}
