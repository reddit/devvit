import type { Devvit } from '@devvit/public-api';
import type { CricketLeague } from './CricketLeague.js';
import type { CricketSportEvent } from './CricketModels.js';
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

    if (!isCricketTournaments(data)) {
      console.error('error parsing cricket tournament');
      return null;
    }

    let matches = parseMatches(data).sport_events;
    matches = matches.map((match, index) => {
      match.matchNumber = `${index + 1}-${matches.length}`;
      return match;
    });
    return filterMatches(matches);
  } catch (e) {
    console.error(e);
    return null;
  }
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
  const earliestScheduleDate = getRelativeDate(-10);
  const latestScheduleDate = getRelativeDate(10);

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
