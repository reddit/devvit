import type { APIService } from './Sports.js';

export type GeneralGameScoreInfo = {
  event: GameEvent;
  homeScore: string;
  awayScore: string;
  extraContent?: string;
  service: APIService;
  generatedDate?: string;
};

export type GameEvent = {
  id: string;
  name: string;
  date: string;
  homeTeam: TeamInfo;
  awayTeam: TeamInfo;
  state: EventState;
  gameType: string;
  // the league (i.e. `mlb` or `nfl`)
  league: string;
  // Timing info (i.e. clock & period/quarter/half)
  timingInfo: GameEventTimingInfo;
};

export type GameEventTimingInfo = {
  clock?: number;
  displayClock: string;
  period: number;
};

export type TeamInfo = {
  id: string;
  // "Rangers", "Packers", "Blue Jays"
  name: string;
  // "NYR", "GB", "TOR"
  abbreviation: string;
  // "New York Rangers", "Green Bay Packers", "Toronto Blue Jays"
  fullName: string;
  // "New York", "Green Bay", "Toronto"
  location: string;
  // Generated asset name from abbreviation + png file extension
  logo: string;
};

export enum EventState {
  UNKNOWN = '',
  PRE = 'pre',
  LIVE = 'live',
  FINAL = 'final',
  DELAYED = 'delayed',
}

export function leagueAssetPath(event: GameEvent): string {
  const sport = event.gameType;
  const league = event.league;
  return sport + '/' + league + '/';
}

export function compareEvents(event1: GameEvent, event2: GameEvent): number {
  const eventPriority: EventState[] = [
    EventState.PRE,
    EventState.LIVE,
    EventState.DELAYED,
    EventState.FINAL,
    EventState.UNKNOWN,
  ];
  const event1Index = eventPriority.indexOf(event1.state);
  const event2Index = eventPriority.indexOf(event2.state);
  if (event1Index !== event2Index) {
    return event1Index - event2Index;
  } else {
    if (event1.date < event2.date) {
      return -1;
    } else if (event1.date > event2.date) {
      return 1;
    }
  }
  return 0;
}
