import type { Devvit } from '@devvit/public-api';
import { APIService } from '../Sports.js';
import { APIKey } from './APIKeys.js';
import { EventState } from '../GameEvent.js';
import type { TeamInfo } from '../GameEvent.js';
import type {
  BattingResult,
  CricketMatch,
  CricketMatchScoreInfo,
  CricketCompetitor,
} from './CricketModels.js';
import { CricketQualifierType, CricketEventStatusType } from './CricketModels.js';
import { makeKeyForEventNumber } from '../GameFetch.js';

export async function fetchCricketMatch(
  league: string,
  matchId: string,
  context: Devvit.Context
): Promise<CricketMatchScoreInfo | null> {
  let data;
  const apiKey = await context.settings.get(APIKey.cricket);
  try {
    const request = new Request(
      `https://api.sportradar.com/cricket-t2/en/matches/${matchId}/summary.json?api_key=${apiKey}`
    );

    // console.log(request.url);
    const response = await fetch(request);
    data = await response.json();

    const match = parseCricketMatch(data);

    let matchNumber: string | undefined = undefined;
    let totalMatches: string | undefined = undefined;
    let timezone: string | undefined = undefined;

    const matchInfo: string | undefined = await context.kvStore.get(
      makeKeyForEventNumber(match.sport_event.id)
    );
    if (matchInfo !== undefined) {
      matchNumber = matchInfo.split('-')[0];
      totalMatches = matchInfo.split('-')[1];
      timezone = matchInfo.split('-')[2];
    }

    return cricketMatchInfo(league, match, matchNumber, totalMatches, timezone);
  } catch (e) {
    console.error(e);
    return null;
  }
}

export function parseCricketMatch(jsonData: unknown): CricketMatch {
  return jsonData as CricketMatch;
}

export function cricketMatchInfo(
  league: string,
  cricketMatch: CricketMatch,
  matchNumber: string | undefined,
  totalMatches: string | undefined,
  timezone: string | undefined
): CricketMatchScoreInfo | null {
  const event = cricketMatch.sport_event;
  const status = cricketMatch.sport_event_status;
  const currentDate = new Date();

  const homeTeam = getTeam(cricketMatch.sport_event.competitors, CricketQualifierType.Home);
  const awayTeam = getTeam(cricketMatch.sport_event.competitors, CricketQualifierType.Away);

  if (homeTeam === undefined || awayTeam === undefined) {
    return null;
  }

  const isLive =
    cricketMatch.sport_event_status.status === CricketEventStatusType.LIVE ||
    cricketMatch.sport_event_status.status === CricketEventStatusType.INPROGRESS;

  const matchTime = isLive
    ? 'LIVE'
    : getMatchTimeString(cricketMatch.sport_event.scheduled, new Date(), timezone);

  let matchNumberString: string | undefined = undefined;
  if (matchNumber !== undefined) {
    const suffix = ordinalSuffixOf(Number(matchNumber));
    matchNumberString = suffix + ' match';
  }

  const homeTeamInfo = cricketCompetitorToTeamInfo(league, homeTeam);
  const awayTeamInfo = cricketCompetitorToTeamInfo(league, awayTeam);

  const sortedBattingResults = getSortedBattingResults(cricketMatch, homeTeamInfo);

  const homeResults = sortedBattingResults
    .filter((result) => result.qualifierType === CricketQualifierType.Home)
    .find(Boolean);
  const awayResults = sortedBattingResults
    .filter((result) => result.qualifierType === CricketQualifierType.Away)
    .find(Boolean);

  const winningQualifier = getWinningQualifier(
    cricketMatch,
    homeTeam,
    awayTeam,
    sortedBattingResults
  );

  const firstLine = getFirstLine(
    cricketMatch,
    winningQualifier,
    homeTeam,
    awayTeam,
    sortedBattingResults,
    new Date(),
    timezone
  );

  let homeDisplayOvers = 0;
  let awayDisplayOvers = 0;
  if (winningQualifier === CricketQualifierType.Home) {
    if (homeResults !== undefined) {
      homeDisplayOvers = cricketMatch.sport_event_status.display_overs;
    }
    if (awayResults !== undefined) {
      awayDisplayOvers = cricketMatch.sport_event_status.allotted_overs;
    }
  } else if (winningQualifier === CricketQualifierType.Away) {
    if (homeResults !== undefined) {
      homeDisplayOvers = cricketMatch.sport_event_status.allotted_overs;
    }
    if (awayResults !== undefined) {
      awayDisplayOvers = cricketMatch.sport_event_status.display_overs;
    }
  }

  return {
    event: {
      id: event.id,
      name: `${homeTeam?.name} vs ${awayTeam?.name}`,
      date: event.scheduled,
      homeTeam: homeTeamInfo!,
      awayTeam: awayTeamInfo!,
      state: eventState(status.status),
      gameType: 'cricket',
      league: league,
      timingInfo: {
        displayClock: '',
        period: 0,
      },
    },
    homeScore: homeResults?.displayScore ?? '0',
    awayScore: awayResults?.displayScore ?? '0',
    service: APIService.SRCricket,
    generatedDate: currentDate.toISOString(),
    isLive: isLive,
    matchTime: matchTime,
    matchNumber: matchNumberString,
    location: cricketMatch.sport_event.venue?.city_name ?? undefined,
    winningQualifier: winningQualifier,
    bottomBarFirstLine: firstLine,
    bottomBarSecondLine: getSecondLine(cricketMatch, matchNumber, totalMatches),
    homeDisplayOvers: `(${homeDisplayOvers})`,
    awayDisplayOvers: `(${awayDisplayOvers})`,
  };
}

export function getSortedBattingResults(
  cricketMatch: CricketMatch,
  homeTeam: TeamInfo
): BattingResult[] {
  if (
    !hasMatchStarted(cricketMatch) ||
    !notEmpty(cricketMatch.statistics) ||
    !notEmpty(cricketMatch.statistics.innings)
  ) {
    return [];
  }

  return cricketMatch.statistics.innings
    .map((inning) => {
      const battingTeams = inning.teams.filter((team) => {
        return team.id === inning.batting_team;
      });
      if (battingTeams.length === 0) {
        return null;
      }

      const battingTeam = battingTeams[0];

      const qualifierType =
        inning.batting_team === homeTeam.id ? CricketQualifierType.Home : CricketQualifierType.Away;
      const runs = battingTeam.statistics.batting.runs;
      const wicketsLost = battingTeam.statistics.batting.wickets_lost;

      return {
        battingTeamId: inning.batting_team,
        inningNumber: inning.number,
        oversRemaning: battingTeam.statistics.batting.overs_remaining,
        oversCompleted: inning.overs_completed,
        ballsRemaning: battingTeam.statistics.batting.balls_remaining,
        wicketsLost: wicketsLost,
        runs: runs,
        qualifierType: qualifierType,
        displayScore: `${runs}/${wicketsLost}`,
      };
    })
    .filter(notEmpty)
    .sort((a, b) => b.runs - a.runs);
}

export function getTeam(
  competitors: CricketCompetitor[],
  type: CricketQualifierType
): CricketCompetitor | undefined {
  return competitors.filter((competitor) => competitor.qualifier === type).find(Boolean);
}

export function eventState(status: CricketEventStatusType): EventState {
  switch (status) {
    case CricketEventStatusType.CREATED:
      return EventState.PRE;
    case CricketEventStatusType.NOT_STARTED:
      return EventState.PRE;
    case CricketEventStatusType.INPROGRESS:
      return EventState.LIVE;
    case CricketEventStatusType.LIVE:
      return EventState.LIVE;
    case CricketEventStatusType.CLOSED:
      return EventState.FINAL;
    case CricketEventStatusType.COMPLETE:
      return EventState.FINAL;
  }
  return EventState.UNKNOWN;
}

export function cricketCompetitorToTeamInfo(
  league: string,
  competitor: CricketCompetitor
): TeamInfo {
  return {
    id: competitor.id,
    name: competitor.name,
    abbreviation: competitor.abbreviation,
    fullName: competitor.name,
    location: competitor.country ?? '',
    logo: `${league}-${competitor.abbreviation.toLowerCase()}.png`,
  };
}

function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
  return value !== null && value !== undefined;
}

export function getWinningQualifier(
  cricketMatch: CricketMatch,
  homeTeam: CricketCompetitor | undefined,
  awayTeam: CricketCompetitor | undefined,
  sortedBattingResults: BattingResult[]
): CricketQualifierType | undefined {
  if (!hasMatchStarted(cricketMatch)) {
    return undefined;
  }

  if (cricketMatch.sport_event_status.winner_id === homeTeam?.id) {
    return CricketQualifierType.Home;
  } else if (cricketMatch.sport_event_status.winner_id === awayTeam?.id) {
    return CricketQualifierType.Away;
  }

  if (sortedBattingResults.length === 0) {
    return undefined;
  }

  return sortedBattingResults[0].qualifierType;
}

function isMatchDateToday(matchDate: Date, todaysDate: Date, timezone?: string): boolean {
  const matchDateLocalized = matchDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: timezone,
  });
  const todayDateLocalized = todaysDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: timezone,
  });
  return matchDateLocalized === todayDateLocalized;
}

export function getMatchTimeString(
  scheduledTimeString: string,
  todaysDate: Date,
  timezone?: string
): string {
  const matchDate = new Date(scheduledTimeString);

  if (todaysDate > matchDate) {
    return matchDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: timezone,
    });
  }

  const matchHour = matchDate.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: timezone,
  });

  if (isMatchDateToday(matchDate, todaysDate, timezone)) {
    return matchHour;
  } else {
    const diff = matchDate.getTime() - todaysDate.getTime();
    const diffDays = Math.round(diff / (1000 * 3600 * 24));

    if (diffDays === -1) {
      return 'Yesterday';
    } else if (diffDays === 1) {
      return 'Tomorrow';
    }
  }
  return matchDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: timezone,
  });
}

export function hasMatchStarted(cricketMatch: CricketMatch): boolean {
  return (
    cricketMatch.sport_event_status.status !== CricketEventStatusType.NOT_STARTED &&
    cricketMatch.sport_event_status.status !== CricketEventStatusType.CREATED &&
    cricketMatch.sport_event_status.status !== CricketEventStatusType.POSTPONED
  );
}

export function getFirstLine(
  cricketMatch: CricketMatch,
  winningQualifier: CricketQualifierType | undefined,
  homeTeam: CricketCompetitor,
  awayTeam: CricketCompetitor,
  battingResults: BattingResult[],
  todaysDate: Date,
  timezone?: string
): string {
  /// game hasn't started
  if (!hasMatchStarted(cricketMatch)) {
    const matchDate = new Date(cricketMatch.sport_event.scheduled);

    if (isMatchDateToday(matchDate, todaysDate, timezone)) {
      return 'Match Starting Soon';
    } else {
      const diff = matchDate.getTime() - todaysDate.getTime();
      const diffDays = Math.round(diff / (1000 * 3600 * 24));

      if (diffDays === 1) {
        return 'Match starts in 1 day';
      } else {
        return 'Match starts in ' + diffDays + ' days';
      }
    }
  }

  if (battingResults.length === 0) {
    return '';
  }

  if (
    (cricketMatch.sport_event_status.status === CricketEventStatusType.COMPLETE ||
      cricketMatch.sport_event_status.status === CricketEventStatusType.CLOSED) &&
    battingResults.length === 2 &&
    battingResults[0].runs === battingResults[1].runs
  ) {
    return 'Match tied';
  }

  if (winningQualifier === undefined) {
    return '';
  }

  const winnerTeamName =
    winningQualifier === CricketQualifierType.Away ? awayTeam.abbreviation : homeTeam.abbreviation;

  /// game started or ended
  let stringWon = ' won by ';
  if (
    cricketMatch.sport_event_status.status === CricketEventStatusType.INPROGRESS ||
    cricketMatch.sport_event_status.status === CricketEventStatusType.LIVE
  ) {
    stringWon = ' winning by ';
  }

  // the batting result is sorted already by higher amount of runs
  const winnerResult = battingResults[0];

  // after saving the winner result, then sort batting results by last inning to first
  battingResults.sort((a, b) => b.inningNumber - a.inningNumber);

  // https://www.lords.org/mcc/the-laws-of-cricket/the-result#:~:text=If%20the%20side%20batting%20last,wickets%20still%20then%20to%20fall.
  // If one team hasn't batted yet, so score is for the batting team
  // If the side fielding last wins the match, the result shall be stated as a win by runs.
  if (battingResults.length === 1 || battingResults[0] !== winnerResult) {
    let deltaScore = 0;
    if (battingResults.length === 1) {
      deltaScore = battingResults[0].runs;
    } else {
      deltaScore = battingResults[1].runs - battingResults[0].runs;
    }

    let runs = ' runs';
    if (deltaScore === 1) {
      runs = ' run';
    }
    return winnerTeamName + stringWon + deltaScore + runs;
  }

  // If the side batting last wins the match without losing all its wickets,
  // the result shall be stated as a win by the number of wickets still then to fall.
  if (battingResults[0] === winnerResult && winnerResult.wicketsLost !== 10) {
    const remainingWickets = 10 - winnerResult.wicketsLost;
    let wicketString = `${remainingWickets} wickets `;
    if (remainingWickets === 1) {
      wicketString = `${remainingWickets} wicket `;
    }
    const ballsLeft = winnerResult.ballsRemaning;
    let ballsString = `(${ballsLeft} balls left)`;
    if (ballsLeft === 1) {
      ballsString = `(${ballsLeft} ball left)`;
    }
    return winnerTeamName + stringWon + wicketString + ballsString;
  }

  return '';
}

export function getSecondLine(
  cricketMatch: CricketMatch,
  matchNumber: string | undefined,
  totalMatches: string | undefined
): string | undefined {
  let suffix = '';
  if (matchNumber !== undefined && totalMatches !== undefined) {
    suffix = ' ' + matchNumber + ' of ' + totalMatches;
  }
  return cricketMatch.sport_event.tournament.type.toUpperCase() + suffix;
}

export function ordinalSuffixOf(i: number): string {
  const j = i % 10,
    k = i % 100;
  if (j === 1 && k !== 11) {
    return i + 'st';
  }
  if (j === 2 && k !== 12) {
    return i + 'nd';
  }
  if (j === 3 && k !== 13) {
    return i + 'rd';
  }
  return i + 'th';
}
