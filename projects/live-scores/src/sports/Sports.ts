export type GameSubscription = {
  league: League;
  eventId: string;
  service: APIService;
};

export enum APIService {
  ESPN = `espn`,
  SRNFL = `sr_nfl`,
  SRSoccer = `sr_soccer`,
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
  LALIGA = `es_laliga`,
  SERIEA = `it_serie_a`,
  SUPERLIG = `tr_super_lig`,
  EFLCUP = `eng_efl_cup`,
  ECL = `eng_championship`,
  BUNDESLIGA = `de_bundesliga`,
  UEFACHAMPIONS = `uefa_champions`,
}

export enum Sport {
  BASEBALL = 'baseball',
  FOOTBALL = 'football',
  BASKETBALL = 'basketball',
  SOCCER = 'soccer',
  HOCKEY = 'hockey',
  UNKNOWN = '',
}

export function leaguesSupported(service: APIService): { label: string; value: string }[] {
  if (service === APIService.ESPN) {
    return [
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
  } else if (service === APIService.SRNFL) {
    return [
      {
        label: getDisplayNameFromLeague(League.NFL),
        value: League.NFL,
      },
    ];
  } else if (service === APIService.SRSoccer) {
    return [
      {
        label: getDisplayNameFromLeague(League.UEFACHAMPIONS),
        value: League.UEFACHAMPIONS,
      },
      {
        label: getDisplayNameFromLeague(League.EPL),
        value: League.EPL,
      },
      {
        label: getDisplayNameFromLeague(League.ECL),
        value: League.ECL,
      },
      {
        label: getDisplayNameFromLeague(League.LALIGA),
        value: League.LALIGA,
      },
      {
        label: getDisplayNameFromLeague(League.SERIEA),
        value: League.SERIEA,
      },
      {
        label: getDisplayNameFromLeague(League.BUNDESLIGA),
        value: League.BUNDESLIGA,
      },
      {
        label: getDisplayNameFromLeague(League.SUPERLIG),
        value: League.SUPERLIG,
      },
      // {
      //   label: getDisplayNameFromLeague(League.EFLCUP),
      //   value: League.EFLCUP,
      // },
      {
        label: getDisplayNameFromLeague(League.MLS),
        value: League.MLS,
      },
    ];
  }
  return [];
}

export function getLeagueFromString(str: string): League {
  if (str.toLowerCase() === 'mlb') {
    return League.MLB;
  }
  if (str.toLowerCase() === 'nfl') {
    return League.NFL;
  }
  if (str.toLowerCase() === 'nba') {
    return League.NBA;
  }
  if (str.toLowerCase() === 'nhl') {
    return League.NHL;
  }
  if (str.toLowerCase() === 'eng.1') {
    return League.EPL;
  }
  if (str.toLowerCase() === 'epl') {
    return League.EPL;
  }
  if (str.toLowerCase() === 'usa.1') {
    return League.MLS;
  }
  if (str.toLowerCase() === 'college_football') {
    return League.CFB;
  }
  if (str.toLowerCase() === 'wnba') {
    return League.WNBA;
  }
  if (str.toLowerCase() === 'es_laliga') {
    return League.LALIGA;
  }
  if (str.toLowerCase() === 'it_serie_a') {
    return League.SERIEA;
  }
  if (str.toLowerCase() === 'tr_super_lig') {
    return League.SUPERLIG;
  }
  if (str.toLowerCase() === 'eng_efl_cup') {
    return League.EFLCUP;
  }
  if (str.toLowerCase() === 'eng_championship') {
    return League.ECL;
  }
  if (str.toLowerCase() === 'de_bundesliga') {
    return League.BUNDESLIGA;
  }
  if (str.toLowerCase() === 'uefa_champions') {
    return League.UEFACHAMPIONS;
  }

  return League.UNKNOWN;
}

export function getSportFromLeagueString(str: string): Sport {
  return getSportFromLeague(getLeagueFromString(str));
}

export function getSportFromLeague(league: League): Sport {
  switch (league) {
    case League.MLB:
      return Sport.BASEBALL;
    case League.NFL:
    case League.CFB:
      return Sport.FOOTBALL;
    case League.NBA:
    case League.WNBA:
      return Sport.BASKETBALL;
    case League.NHL:
      return Sport.HOCKEY;
    case League.EPL:
    case League.MLS:
    case League.LALIGA:
    case League.SERIEA:
    case League.SUPERLIG:
    case League.EFLCUP:
    case League.ECL:
    case League.BUNDESLIGA:
    case League.UEFACHAMPIONS:
      return Sport.SOCCER;
    default:
      return Sport.UNKNOWN;
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
      return 'English Premier League';
    case League.ECL:
      return 'English Championship League';
    case League.MLS:
      return 'MLS';
    case League.CFB:
      return 'College Football';
    case League.WNBA:
      return 'WNBA';
    case League.LALIGA:
      return 'La Liga (ES)';
    case League.SERIEA:
      return 'Serie A (IT)';
    case League.SUPERLIG:
      return 'Süper Lig (TR)';
    case League.EFLCUP:
      return 'EFL Cup';
    case League.BUNDESLIGA:
      return 'Bundesliga (DE)';
    case League.UEFACHAMPIONS:
      return 'UEFA Champions League';
    default:
      return '';
  }
}
