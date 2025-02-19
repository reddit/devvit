import type { Devvit } from '@devvit/public-api';

import type { TeamInfo } from '../GameEvent.js';
import { EventState } from '../GameEvent.js';
import { APIService, League } from '../Sports.js';
import { APIKey } from './APIKeys.js';
import type {
  BasicCricketMatchInfo,
  BattingResult,
  CricketCompetitor,
  CricketInning,
  CricketMatch,
  CricketMatchScoreInfo,
  CricketPlayer,
  CricketScoreInfoStats,
  CricketTeam,
} from './CricketModels.js';
import { CricketEventStatusType, CricketQualifierType } from './CricketModels.js';

export async function fetchCricketMatch(
  league: string,
  matchId: string,
  context: Devvit.Context,
  postId?: string,
  basicCricketMatchInfo?: BasicCricketMatchInfo
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

    if (postId && basicCricketMatchInfo === undefined) {
      const stringJSON = await context.redis.get(
        makeKeyForCricketMatchInfo(postId, match.sport_event.id)
      );
      if (stringJSON) {
        basicCricketMatchInfo = JSON.parse(stringJSON);
      }
    }

    return cricketMatchInfo(league, match, basicCricketMatchInfo);
  } catch (e) {
    console.error(e);
    return null;
  }
}

export function makeKeyForCricketMatchInfo(postId: string, eventId: string | undefined): string {
  if (eventId === undefined) {
    throw new Error('Undefined eventId in makeKeyForCricketMatchInfo');
  }
  return `cricketInfo:${eventId}:${postId}`;
}

export function parseCricketMatch(jsonData: unknown): CricketMatch {
  return jsonData as CricketMatch;
}

export function cricketMatchInfo(
  league: string,
  cricketMatch: CricketMatch,
  basicCricketMatchInfo: BasicCricketMatchInfo | undefined
): CricketMatchScoreInfo | null {
  const event = cricketMatch.sport_event;
  const status = cricketMatch.sport_event_status;
  const currentDate = new Date();

  const homeTeam = getTeam(cricketMatch.sport_event.competitors, CricketQualifierType.Home);
  const awayTeam = getTeam(cricketMatch.sport_event.competitors, CricketQualifierType.Away);

  if (
    homeTeam === undefined ||
    awayTeam === undefined ||
    event.scheduled === undefined ||
    cricketMatch.sport_event.scheduled === undefined
  ) {
    return null;
  }

  const isLive =
    cricketMatch.sport_event_status.status === CricketEventStatusType.LIVE ||
    cricketMatch.sport_event_status.status === CricketEventStatusType.INPROGRESS;

  const matchTime = isLive
    ? 'LIVE'
    : getMatchTimeString(
        cricketMatch.sport_event.scheduled,
        cricketMatch,
        new Date(),
        basicCricketMatchInfo?.timezone
      );

  let matchNumberString: string | undefined = undefined;
  if (basicCricketMatchInfo?.matchNumber !== undefined) {
    const suffix = ordinalSuffixOf(Number(basicCricketMatchInfo.matchNumber));
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
    basicCricketMatchInfo?.timezone
  );

  const homeStats = getInfoStats(cricketMatch, homeResults);
  const awayStats = getInfoStats(cricketMatch, awayResults);

  const leagueName = getAbbreviatedLeagueName(league);

  const currentBattingQualifier = getCurrentBattingQualifier(
    isLive,
    cricketMatch.sport_event_status.current_inning,
    sortedBattingResults
  );

  let isSuperOver = false;
  if (notEmpty(cricketMatch.statistics) && notEmpty(cricketMatch.statistics.innings)) {
    isSuperOver = cricketMatch.statistics?.innings.length > 2;
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
    leagueName: leagueName,
    homeScore: homeResults?.displayScore ?? '0',
    awayScore: awayResults?.displayScore ?? '0',
    service: APIService.SRCricket,
    generatedDate: currentDate.toISOString(),
    isLive: isLive,
    matchTime: matchTime,
    matchNumber: matchNumberString,
    location: cricketMatch.sport_event.venue?.city_name ?? undefined,
    firstBattingQualifier: getFirstBattingQualifier(sortedBattingResults),
    currentBattingQualifier: currentBattingQualifier,
    winnerQualifier: winningQualifier,
    bottomBarFirstLine: firstLine,
    bottomBarSecondLine: getSecondLine(
      cricketMatch,
      basicCricketMatchInfo?.matchNumber,
      basicCricketMatchInfo?.totalMatches
    ),
    homeInfoStats: homeStats,
    awayInfoStats: awayStats,
    chatUrl: basicCricketMatchInfo?.chatUrl,
    isSuperOver: isSuperOver,
  };
}

export function getCurrentBattingQualifier(
  isLive: boolean,
  currentInning: number | undefined,
  battingResults: BattingResult[]
): CricketQualifierType | undefined {
  if (!isLive || currentInning === undefined) {
    return undefined;
  }
  const battingQualifiers = battingResults.filter((result) => {
    return result.inningNumber === currentInning;
  });
  return battingQualifiers[0].qualifierType;
}

export function getAbbreviatedLeagueName(leagueString: string): string {
  if (leagueString === League.ICCT20) {
    return 'T20 WC';
  }
  if (leagueString === League.IPL) {
    return 'IPL';
  }
  if (leagueString === League.ICCCT) {
    return 'CT2025';
  }
  return '';
}

export function getInfoStats(
  cricketMatch: CricketMatch,
  battingResult: BattingResult | undefined
): CricketScoreInfoStats {
  let displayOvers = 0;

  if (
    battingResult !== undefined &&
    notEmpty(cricketMatch.statistics) &&
    notEmpty(cricketMatch.statistics.innings)
  ) {
    let currentInning: CricketInning | undefined = undefined;
    if (cricketMatch.sport_event_status.current_inning === 1) {
      currentInning = cricketMatch.statistics.innings[0];
    } else if (cricketMatch.sport_event_status.current_inning === 2) {
      currentInning = cricketMatch.statistics.innings[1];
    }

    if (
      currentInning !== undefined &&
      currentInning.batting_team === battingResult?.battingTeamId &&
      cricketMatch.sport_event_status.display_overs !== undefined
    ) {
      displayOvers = cricketMatch.sport_event_status.display_overs;
    } else {
      const battingInning = cricketMatch.statistics.innings
        .filter((inning) => {
          return inning.batting_team === battingResult.battingTeamId;
        })
        .find(Boolean);
      if (battingInning && battingInning.teams !== undefined) {
        const teamResults = battingInning.teams
          .filter((team) => {
            return team.id === battingResult?.battingTeamId;
          })
          .find(Boolean);
        const partnerships = teamResults?.statistics?.batting?.partnerships;
        if (
          partnerships !== undefined &&
          partnerships.length > 0 &&
          partnerships[partnerships.length - 1].wicket_number === 10 &&
          partnerships[partnerships.length - 1].end !== undefined
        ) {
          displayOvers = partnerships[partnerships.length - 1].end!;
        } else if (cricketMatch.sport_event_status.allotted_overs !== undefined) {
          displayOvers = cricketMatch.sport_event_status.allotted_overs;
        }
      } else if (cricketMatch.sport_event_status.allotted_overs !== undefined) {
        displayOvers = cricketMatch.sport_event_status.allotted_overs;
      }
    }
  }
  return {
    displayOvers: displayOvers,
    battingStats: getBattingStats(cricketMatch, battingResult?.battingTeamId),
    bowlingStats: getBowlingStats(cricketMatch, battingResult?.bowlingTeamId),
  };
}

function getTeamStatistics(cricketMatch: CricketMatch, teamId: string | undefined): CricketTeam[] {
  if (!notEmpty(cricketMatch.statistics) || !notEmpty(cricketMatch.statistics.innings)) {
    return [];
  }
  return cricketMatch.statistics.innings.flatMap((inning) => {
    if (inning.teams) {
      return inning.teams.filter((team) => {
        return team.id === teamId;
      });
    }
    return [];
  });
}

/// returns the best batman for a given team id
/// best batman: player with more runs, if there are two or more players with the same of runs, less balls
export function getBattingStats(
  cricketMatch: CricketMatch,
  teamId: string | undefined
): string | undefined {
  if (!hasMatchEnded(cricketMatch) || teamId === undefined) {
    return undefined;
  }

  const teamStatistics = getTeamStatistics(cricketMatch, teamId);

  if (teamStatistics === undefined) {
    return undefined;
  }

  const battingPlayers = teamStatistics
    .flatMap((stat) => {
      return stat.statistics?.batting?.players;
    })
    .filter(notEmpty);

  const sortedRunners = battingPlayers
    .map((item, index) => ({ index, item }))
    .sort((a, b) => {
      const aRuns = a.item.statistics?.runs !== undefined ? a.item.statistics.runs : Infinity;
      const bRuns = b.item.statistics?.runs !== undefined ? b.item.statistics.runs : Infinity;
      return bRuns - aRuns || b.index - a.index;
    });

  if (sortedRunners.length === 0 || sortedRunners[0].item.statistics?.runs === undefined) {
    return undefined;
  }

  const topRunnerRuns = sortedRunners[0].item.statistics.runs;
  const equalRunPlayers: CricketPlayer[] = [];

  equalRunPlayers.push(sortedRunners[0].item);

  sortedRunners.forEach((item) => {
    if (item.index !== 0 && item.item.statistics?.runs === topRunnerRuns) {
      equalRunPlayers.push(item.item);
    }
  });

  const sortedEqualRunnersByLessBalls = equalRunPlayers
    .map((item, index) => ({ index, item }))
    .sort((a, b) => {
      const aRuns =
        a.item.statistics?.balls_faced !== undefined ? a.item.statistics.balls_faced : Infinity;
      const bRuns =
        b.item.statistics?.balls_faced !== undefined ? b.item.statistics.balls_faced : Infinity;
      return aRuns - bRuns || a.index - b.index;
    });

  if (
    sortedEqualRunnersByLessBalls.length === 0 ||
    sortedEqualRunnersByLessBalls[0].item === undefined ||
    sortedEqualRunnersByLessBalls[0].item.name === undefined ||
    sortedEqualRunnersByLessBalls[0].item.statistics?.runs === undefined
  ) {
    return undefined;
  }

  return (
    getPlayerName(sortedEqualRunnersByLessBalls[0].item.name) +
    ': ' +
    sortedEqualRunnersByLessBalls[0].item.statistics.runs
  );
}

/// returns the best bowler for a given team id
/// best bowler: player with more wickets, if there are two or more players with the same wickets, less runs indicates the best
export function getBowlingStats(
  cricketMatch: CricketMatch,
  teamId: string | undefined
): string | undefined {
  if (!hasMatchEnded(cricketMatch) || teamId === undefined) {
    return undefined;
  }

  const teamStatistics = getTeamStatistics(cricketMatch, teamId);

  if (teamStatistics === undefined) {
    return undefined;
  }

  const bowlingPlayers = teamStatistics
    .flatMap((stat) => {
      return stat.statistics?.bowling?.players;
    })
    .filter(notEmpty);

  const sortedTopBowlerByWickets = bowlingPlayers.sort((a, b) => {
    const aWickets = a.statistics?.wickets !== undefined ? a.statistics.wickets : Infinity;
    const bWickets = b.statistics?.wickets !== undefined ? b.statistics.wickets : Infinity;
    return bWickets - aWickets;
  });

  if (
    sortedTopBowlerByWickets.length === 0 ||
    sortedTopBowlerByWickets[0].statistics?.wickets === undefined ||
    sortedTopBowlerByWickets[0].statistics.wickets === 0
  ) {
    return undefined;
  }

  const topBowlerWickets = sortedTopBowlerByWickets[0].statistics.wickets;
  const equalWicketPlayers: CricketPlayer[] = [];

  equalWicketPlayers.push(sortedTopBowlerByWickets[0]);

  sortedTopBowlerByWickets.forEach((item, index) => {
    if (index !== 0 && item.statistics?.wickets === topBowlerWickets) {
      equalWicketPlayers.push(item);
    }
  });
  const sortedEqualWicketPlayersByLessRuns = equalWicketPlayers.sort((a, b) => {
    const aRuns = a.statistics?.conceded_runs !== undefined ? a.statistics.conceded_runs : Infinity;
    const bRuns = b.statistics?.conceded_runs !== undefined ? b.statistics.conceded_runs : Infinity;
    return aRuns - bRuns;
  });

  if (
    sortedEqualWicketPlayersByLessRuns[0] === undefined ||
    sortedEqualWicketPlayersByLessRuns[0].name === undefined ||
    sortedEqualWicketPlayersByLessRuns[0].statistics === undefined
  ) {
    return undefined;
  }

  const stat = sortedEqualWicketPlayersByLessRuns[0].statistics;
  return (
    getPlayerName(sortedEqualWicketPlayersByLessRuns[0].name) +
    ': ' +
    (stat.wickets ?? 0) +
    '/' +
    (stat.conceded_runs ?? 0)
  );
}

function getPlayerName(fullname: string): string {
  let name = '';
  fullname
    .split(',')
    .reverse()
    .forEach((item) => {
      name += item.trim() + ' ';
    });
  return name.trim();
}

/// returns the batting results sorted by number of runs
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
      if (
        inning.batting_team === undefined ||
        inning.bowling_team === undefined ||
        inning.number === undefined
      ) {
        return null;
      }
      const battingTeams = inning.teams?.filter((team) => {
        return team.id === inning.batting_team;
      });
      if (battingTeams === undefined || battingTeams?.length === 0) {
        return null;
      }

      const battingTeam = battingTeams[0];

      const qualifierType =
        inning.batting_team === homeTeam.id ? CricketQualifierType.Home : CricketQualifierType.Away;
      const runs = battingTeam.statistics?.batting?.runs ?? 0;
      const wicketsLost = battingTeam.statistics?.batting?.wickets_lost ?? 0;

      return {
        battingTeamId: inning.batting_team,
        bowlingTeamId: inning.bowling_team,
        inningNumber: inning.number,
        oversRemaning: battingTeam.statistics?.batting?.overs_remaining,
        oversCompleted: inning.overs_completed ?? 0,
        ballsRemaning: battingTeam.statistics?.batting?.balls_remaining,
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
  competitors: CricketCompetitor[] | undefined,
  type: CricketQualifierType
): CricketCompetitor | undefined {
  if (competitors === undefined) {
    return undefined;
  }
  return competitors.filter((competitor) => competitor.qualifier === type).find(Boolean);
}

export function eventState(status: CricketEventStatusType | undefined): EventState {
  if (status === undefined) {
    return EventState.UNKNOWN;
  }
  switch (status) {
    case CricketEventStatusType.NOT_STARTED:
    case CricketEventStatusType.CREATED:
      return EventState.PRE;
    case CricketEventStatusType.INPROGRESS:
    case CricketEventStatusType.LIVE:
      return EventState.LIVE;
    case CricketEventStatusType.CLOSED:
    case CricketEventStatusType.COMPLETE:
    case CricketEventStatusType.SUSPENDED:
    case CricketEventStatusType.ABANDONED:
    case CricketEventStatusType.CANCELLED:
    case CricketEventStatusType.ENDED:
      return EventState.FINAL;
    case CricketEventStatusType.DELAYED:
    case CricketEventStatusType.POSTPONED:
    case CricketEventStatusType.INTERRUPTED:
      return EventState.DELAYED;
  }
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

export function getMatchTimeString(
  scheduledDate: string,
  cricketMatch: CricketMatch,
  todaysDate: Date,
  timezone?: string
): string {
  const matchDate = new Date(scheduledDate);

  if (
    cricketMatch.sport_event_status.status === CricketEventStatusType.CLOSED ||
    cricketMatch.sport_event_status.status === CricketEventStatusType.COMPLETE
  ) {
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

export function getFirstLine(
  cricketMatch: CricketMatch,
  winningQualifier: CricketQualifierType | undefined,
  homeTeam: CricketCompetitor,
  awayTeam: CricketCompetitor,
  battingResults: BattingResult[],
  todaysDate: Date,
  timezone?: string
): string {
  if (
    cricketMatch.sport_event_status.status === undefined ||
    cricketMatch.sport_event.scheduled === undefined ||
    cricketMatch.sport_event.competitors === undefined ||
    cricketMatch.sport_event.competitors.length < 2
  ) {
    return '';
  }

  if (isMatchInAbnormalState(cricketMatch)) {
    const status = cricketMatch.sport_event_status.status;
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

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

  /// No results yet
  if (battingResults.length === 0) {
    return '';
  }

  /// Match tied
  if (
    hasMatchEnded(cricketMatch) &&
    battingResults.length === 2 &&
    battingResults[0].runs === battingResults[1].runs
  ) {
    return 'Match tied';
  }

  /// No winner yet
  if (winningQualifier === undefined) {
    return '';
  }

  const winnerTeamName =
    winningQualifier === CricketQualifierType.Away ? awayTeam.abbreviation : homeTeam.abbreviation;

  // the battingResults result is already sorted already by higher amount of runs
  const winnerResult = battingResults[0];

  // if match is live then:
  // if the second team hasnt batted, then show who toss and toss decision
  // if second team batted, show the number of runs the losing team needs to win
  if (isMatchLive(cricketMatch)) {
    if (battingResults.length === 1) {
      const tossDecisionAbbreviation =
        cricketMatch.sport_event_status.toss_won_by === homeTeam.id
          ? homeTeam.abbreviation
          : awayTeam.abbreviation;
      return (
        tossDecisionAbbreviation + ' chose to ' + cricketMatch.sport_event_status.toss_decision
      );
    }

    const deltaScore = battingResults[0].runs - battingResults[1].runs + 1;

    if (deltaScore > 0) {
      let runsString = ' runs';
      if (deltaScore === 1) {
        runsString = ' run';
      }

      const losingTeamName =
        winningQualifier === CricketQualifierType.Away
          ? homeTeam.abbreviation
          : awayTeam.abbreviation;
      return losingTeamName + ' need ' + deltaScore + runsString + ' to win';
    }

    // SuperOver handling for match live
    return 'Match tied';
  }

  // Match Ended Scenarios

  // SuperOver handling for match ended case
  // "Match tied (TEAM INITIAL won the super over)"
  if (battingResults.length > 2) {
    let winnerTeamName = undefined;
    const winner_id = cricketMatch.sport_event_status.winner_id;

    if (cricketMatch.sport_event.competitors[0].id === winner_id) {
      winnerTeamName = cricketMatch.sport_event.competitors[0].abbreviation;
    } else if (cricketMatch.sport_event.competitors[1].id === winner_id) {
      winnerTeamName = cricketMatch.sport_event.competitors[1].abbreviation;
    }

    if (winnerTeamName !== undefined) {
      return 'Match tied (' + winnerTeamName + ' won the super over)';
    } else {
      return 'Match tied';
    }
  }

  // after saving the winner result, then sort batting results by last inning to first
  battingResults.sort((a, b) => b.inningNumber - a.inningNumber);

  const stringWon = ' won by ';

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
  if (cricketMatch.sport_event.tournament?.type === undefined) {
    return undefined;
  }
  let suffix = '';
  if (matchNumber !== undefined && totalMatches !== undefined) {
    suffix = ' ' + matchNumber + ' of ' + totalMatches;
  }
  return cricketMatch.sport_event.tournament.type.toUpperCase() + suffix;
}

export function hasMatchEnded(cricketMatch: CricketMatch): boolean {
  return (
    cricketMatch.sport_event_status.status === CricketEventStatusType.CLOSED ||
    cricketMatch.sport_event_status.status === CricketEventStatusType.COMPLETE ||
    cricketMatch.sport_event_status.status === CricketEventStatusType.ENDED
  );
}

export function hasMatchStarted(cricketMatch: CricketMatch): boolean {
  return (
    cricketMatch.sport_event_status.status !== CricketEventStatusType.NOT_STARTED &&
    cricketMatch.sport_event_status.status !== CricketEventStatusType.CREATED &&
    cricketMatch.sport_event_status.status !== CricketEventStatusType.POSTPONED &&
    cricketMatch.sport_event_status.status !== CricketEventStatusType.ABANDONED &&
    cricketMatch.sport_event_status.status !== CricketEventStatusType.CANCELLED &&
    cricketMatch.sport_event_status.status !== CricketEventStatusType.DELAYED &&
    cricketMatch.sport_event_status.status !== CricketEventStatusType.SUSPENDED
  );
}

export function isMatchInAbnormalState(cricketMatch: CricketMatch): boolean {
  return (
    cricketMatch.sport_event_status.status === CricketEventStatusType.ABANDONED ||
    cricketMatch.sport_event_status.status === CricketEventStatusType.CANCELLED ||
    cricketMatch.sport_event_status.status === CricketEventStatusType.DELAYED ||
    cricketMatch.sport_event_status.status === CricketEventStatusType.POSTPONED ||
    cricketMatch.sport_event_status.status === CricketEventStatusType.SUSPENDED ||
    cricketMatch.sport_event_status.status === CricketEventStatusType.INTERRUPTED
  );
}

export function isMatchLive(cricketMatch: CricketMatch): boolean {
  return (
    cricketMatch.sport_event_status.status === CricketEventStatusType.INPROGRESS ||
    cricketMatch.sport_event_status.status === CricketEventStatusType.LIVE ||
    cricketMatch.sport_event_status.status === CricketEventStatusType.INTERRUPTED
  );
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

function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
  return value !== null && value !== undefined;
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

export function getFirstBattingQualifier(battingResults: BattingResult[]): CricketQualifierType {
  return (
    battingResults.sort((a, b) => a.inningNumber - b.inningNumber).find(Boolean)?.qualifierType ??
    CricketQualifierType.Home
  );
}
