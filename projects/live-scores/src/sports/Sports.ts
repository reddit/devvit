export type GameSubscription = {
  league: League;
  eventId: string;
  service?: APIService;
};

export enum APIService {
  ESPN = `espn`,
  SR = `sr`,
}

export enum League {
  UNKNOWN = '',
  MLB = 'mlb',
  NFL = 'nfl',
  NBA = 'nba',
  NHL = 'nhl',
  EPL = 'eng.1',
  MLS = 'usa.1',
  CFB = 'college-football',
  WNBA = 'wnba',
}

export const leaguesSupported: { label: string; value: string }[] = [
  {
    label: getDisplayNameFromLeague(League.MLB),
    value: League.MLB,
  },
  {
    label: getDisplayNameFromLeague(League.NFL),
    value: League.NFL,
  },
  {
    label: getDisplayNameFromLeague(League.NBA),
    value: League.NBA,
  },
  {
    label: getDisplayNameFromLeague(League.NHL),
    value: League.NHL,
  },
  {
    label: getDisplayNameFromLeague(League.EPL),
    value: League.EPL,
  },
  {
    label: getDisplayNameFromLeague(League.MLS),
    value: League.MLS,
  },
  // {
  //   label: getDisplayNameFromLeague(League.CFB),
  //   value: League.CFB,
  // },
  {
    label: getDisplayNameFromLeague(League.WNBA),
    value: League.WNBA,
  },
];

export function getLeagueFromString(str: string): League {
  if (str.toLowerCase() == 'mlb') {
    return League.MLB;
  }
  if (str.toLowerCase() == 'nfl') {
    return League.NFL;
  }
  if (str.toLowerCase() == 'nba') {
    return League.NBA;
  }
  if (str.toLowerCase() == 'nhl') {
    return League.NHL;
  }
  if (str.toLowerCase() == 'eng.1') {
    return League.EPL;
  }
  if (str.toLowerCase() == 'usa.1') {
    return League.MLS;
  }
  if (str.toLowerCase() == 'college-football') {
    return League.CFB;
  }
  if (str.toLowerCase() == 'wnba') {
    return League.WNBA;
  }
  return League.UNKNOWN;
}

export function getSportFromLeagueString(str: string): string {
  return getSportFromLeague(getLeagueFromString(str));
}

export function getSportFromLeague(league: League): string {
  switch (league) {
    case League.MLB:
      return 'baseball';
    case League.NFL:
      return 'football';
    case League.NBA:
      return 'basketball';
    case League.NHL:
      return 'hockey';
    case League.EPL:
      return 'soccer';
    case League.MLS:
      return 'soccer';
    case League.CFB:
      return 'football';
    case League.WNBA:
      return 'basketball';
    default:
      return '';
  }
}

export function getDisplayNameFromLeague(league: League): string {
  switch (league) {
    case League.MLB:
      return 'MLB';
    case League.NFL:
      return 'NFL';
    case League.NBA:
      return 'NBA';
    case League.NHL:
      return 'NHL';
    case League.EPL:
      return 'Premier League';
    case League.MLS:
      return 'MLS';
    case League.CFB:
      return 'College Football';
    case League.WNBA:
      return 'WNBA';
    default:
      return '';
  }
}
