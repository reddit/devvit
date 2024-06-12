import { splitNameInTwoLines } from '../../../components/cricket.js';
import { validChatURL } from '../../../forms/GameSelectionForm.js';
import type { TeamInfo } from '../../GameEvent.js';
import { EventState } from '../../GameEvent.js';
import {
  cricketCompetitorToTeamInfo,
  eventState,
  getBattingStats,
  getBowlingStats,
  getCurrentBattingQualifier,
  getFirstBattingQualifier,
  getFirstLine,
  getMatchTimeString,
  getSecondLine,
  getSortedBattingResults,
  getTeam,
  getWinningQualifier,
  hasMatchEnded,
  hasMatchStarted,
  isMatchInAbnormalState,
  ordinalSuffixOf,
} from '../CricketMatch.js';
import type {
  BattingResult,
  CricketCompetitor,
  CricketInning,
  CricketMatch,
  CricketSportEvent,
  CricketSportEventStatus,
  CricketTeam,
  CricketTeamStatistics,
  CricketTournament,
  CricketVenue,
} from '../CricketModels.js';
import { CricketEventStatusType, CricketQualifierType } from '../CricketModels.js';

const tournament: CricketTournament = {
  id: 'id',
  name: 'name',
  type: 'type',
};

const venue: CricketVenue = {
  id: 'id',
  name: 'name',
  country_name: 'name',
  country_code: 'code',
};

const sportEvent: CricketSportEvent = {
  id: 'id',
  scheduled: '2024-03-22T14:30:00+00:00',
  start_time_tbd: false,
  tournament: tournament,
  competitors: [],
  venue: venue,
  matchNumber: '1',
};

const sportEventStatus: CricketSportEventStatus = {
  match_status: '',
  status: CricketEventStatusType.CLOSED,
  display_score: '',
  winner_id: '',
  toss_won_by: '',
  toss_decision: '',
  current_inning: 0,
  display_overs: 0,
  run_rate: 0,
  allotted_overs: 0,
  period_scores: [],
};

const cricketMatch: CricketMatch = {
  sport_event: sportEvent,
  sport_event_status: sportEventStatus,
  statistics: {
    innings: [],
  },
};

// to-do: fix me.
test.skip('Get match time string', async () => {
  cricketMatch.sport_event_status.status = CricketEventStatusType.CREATED;
  cricketMatch.sport_event.scheduled = '2024-03-22T14:30:00+00:00';

  let currentDate = new Date('2024-03-21T14:30:00+00:00');
  let matchTime = getMatchTimeString(cricketMatch, currentDate);
  expect(matchTime).toEqual('Tomorrow');

  currentDate = new Date('2024-03-23T14:30:00+00:00');
  matchTime = getMatchTimeString(cricketMatch, currentDate);
  expect(matchTime).toEqual('Yesterday');

  currentDate = new Date('2024-03-22T14:30:00+00:00');
  matchTime = getMatchTimeString(cricketMatch, currentDate);
  expect(matchTime).toEqual('10:30 AM');

  currentDate = new Date('2024-03-20T14:30:00+00:00');
  matchTime = getMatchTimeString(cricketMatch, currentDate);
  expect(matchTime).toEqual('March 22, 2024');

  currentDate = new Date('2024-03-24T14:30:00+00:00');
  matchTime = getMatchTimeString(cricketMatch, currentDate);
  expect(matchTime).toEqual('March 22, 2024');
});

const homeTeam: CricketCompetitor = {
  id: 'home_id',
  abbreviation: 'home_abbreviation',
  name: 'home_name',
  qualifier: CricketQualifierType.Home,
};

const awayTeam: CricketCompetitor = {
  id: 'away_id',
  abbreviation: 'away_abbreviation',
  name: 'away_name',
  qualifier: CricketQualifierType.Away,
};

const battingResults: BattingResult[] = [];

/// tests for getWinningQualifier
test('Get winning qualifier for status NOT_STARTED', async () => {
  cricketMatch.sport_event_status.status = CricketEventStatusType.NOT_STARTED;
  const winningQualifier = getWinningQualifier(cricketMatch, homeTeam, awayTeam, battingResults);
  expect(winningQualifier).toBe(undefined);
});

test('Get winning qualifier for status CREATED', async () => {
  cricketMatch.sport_event_status.status = CricketEventStatusType.CREATED;
  const winningQualifier = getWinningQualifier(cricketMatch, homeTeam, awayTeam, battingResults);
  expect(winningQualifier).toBe(undefined);
});

test('Get winning qualifier for status POSTPONED', async () => {
  cricketMatch.sport_event_status.status = CricketEventStatusType.POSTPONED;
  const winningQualifier = getWinningQualifier(cricketMatch, homeTeam, awayTeam, battingResults);
  expect(winningQualifier).toBe(undefined);
});

test('Get winning qualifier for status live home as winner id', async () => {
  cricketMatch.sport_event_status.status = CricketEventStatusType.LIVE;
  cricketMatch.sport_event_status.winner_id = 'home_id';
  const winningQualifier = getWinningQualifier(cricketMatch, homeTeam, awayTeam, battingResults);
  expect(winningQualifier).toEqual(CricketQualifierType.Home);
});

test('Get winning qualifier for status live away as winner id', async () => {
  cricketMatch.sport_event_status.status = CricketEventStatusType.LIVE;
  cricketMatch.sport_event_status.winner_id = 'away_id';
  const winningQualifier = getWinningQualifier(cricketMatch, homeTeam, awayTeam, battingResults);
  expect(winningQualifier).toEqual(CricketQualifierType.Away);
});

test('Get winning qualifier for status undefined as no winner id and battingResults is empty', async () => {
  cricketMatch.sport_event_status.status = CricketEventStatusType.LIVE;
  cricketMatch.sport_event_status.winner_id = undefined;
  const winningQualifier = getWinningQualifier(cricketMatch, homeTeam, awayTeam, battingResults);
  expect(winningQualifier).toBe(undefined);
});

test('Get winning qualifier for status home as no winner id and battingResults has home as first qualifier', async () => {
  cricketMatch.sport_event_status.status = CricketEventStatusType.LIVE;
  cricketMatch.sport_event_status.winner_id = undefined;
  const battingResults: BattingResult[] = [
    {
      battingTeamId: 'home_id',
      inningNumber: 1,
      oversRemaning: 0,
      oversCompleted: 0,
      ballsRemaning: 0,
      wicketsLost: 0,
      runs: 0,
      qualifierType: CricketQualifierType.Home,
      displayScore: '0',
      bowlingTeamId: '',
    },
  ];
  const winningQualifier = getWinningQualifier(cricketMatch, homeTeam, awayTeam, battingResults);
  expect(winningQualifier).toBe(CricketQualifierType.Home);
});

test('Get winning qualifier for status home as no winner id and battingResults has home as first qualifier', async () => {
  cricketMatch.sport_event_status.status = CricketEventStatusType.LIVE;
  cricketMatch.sport_event_status.winner_id = undefined;
  const battingResults: BattingResult[] = [
    {
      battingTeamId: 'away_id',
      inningNumber: 1,
      oversRemaning: 0,
      oversCompleted: 0,
      ballsRemaning: 0,
      wicketsLost: 0,
      runs: 0,
      qualifierType: CricketQualifierType.Away,
      displayScore: '0',
      bowlingTeamId: '',
    },
    {
      battingTeamId: 'home_id',
      inningNumber: 2,
      oversRemaning: 0,
      oversCompleted: 0,
      ballsRemaning: 0,
      wicketsLost: 0,
      runs: 0,
      qualifierType: CricketQualifierType.Home,
      displayScore: '0',
      bowlingTeamId: '',
    },
  ];
  const winningQualifier = getWinningQualifier(cricketMatch, homeTeam, awayTeam, battingResults);
  expect(winningQualifier).toBe(CricketQualifierType.Away);
});

/// test cricketCompetitorToTeamInfo
test('TeamInfo from cricket competitor ', async () => {
  const cricketCompetitor: CricketCompetitor = {
    id: 'id',
    name: 'name',
    country: 'country',
    country_code: 'CO',
    abbreviation: 'ABV',
    qualifier: CricketQualifierType.Away,
    gender: 'gender',
  };

  const teamInfo = cricketCompetitorToTeamInfo('league', cricketCompetitor);

  const expectedTeamInfo: TeamInfo = {
    id: 'id',
    name: 'name',
    abbreviation: 'ABV',
    fullName: 'name',
    location: 'country',
    logo: 'league-abv.png',
  };
  expect(teamInfo).toEqual(expectedTeamInfo);
});

/// test eventState from CricketEventStatusType
test('EventState from CricketEventStatusType ', async () => {
  expect(eventState(CricketEventStatusType.CREATED)).toBe(EventState.PRE);
  expect(eventState(CricketEventStatusType.NOT_STARTED)).toBe(EventState.PRE);

  expect(eventState(CricketEventStatusType.INPROGRESS)).toBe(EventState.LIVE);
  expect(eventState(CricketEventStatusType.LIVE)).toBe(EventState.LIVE);

  expect(eventState(CricketEventStatusType.CLOSED)).toBe(EventState.FINAL);
  expect(eventState(CricketEventStatusType.COMPLETE)).toBe(EventState.FINAL);
  expect(eventState(CricketEventStatusType.SUSPENDED)).toBe(EventState.FINAL);
  expect(eventState(CricketEventStatusType.ABANDONED)).toBe(EventState.FINAL);
  expect(eventState(CricketEventStatusType.ENDED)).toBe(EventState.FINAL);
  expect(eventState(CricketEventStatusType.CANCELLED)).toBe(EventState.FINAL);

  expect(eventState(CricketEventStatusType.DELAYED)).toBe(EventState.DELAYED);
  expect(eventState(CricketEventStatusType.POSTPONED)).toBe(EventState.DELAYED);
  expect(eventState(CricketEventStatusType.INTERRUPTED)).toBe(EventState.DELAYED);
});

/// test splitNameInTwoLines
test('splitNameInTwoLines Lucknow Super Giants', async () => {
  const [line1, line2] = splitNameInTwoLines('Lucknow Super Giants');
  expect(line1).toBe('Lucknow');
  expect(line2).toBe('Super Giants');
});

test('splitNameInTwoLines Chennai Super Kings', async () => {
  const [line1, line2] = splitNameInTwoLines('Chennai Super Kings');
  expect(line1).toBe('Chennai');
  expect(line2).toBe('Super Kings');
});

test('splitNameInTwoLines Royal Challengers Bengaluru', async () => {
  const [line1, line2] = splitNameInTwoLines('Royal Challengers Bengaluru');
  expect(line1).toBe('Royal Challengers');
  expect(line2).toBe('Bengaluru');
});

test('splitNameInTwoLines Punjab Kings', async () => {
  const [line1, line2] = splitNameInTwoLines('Punjab Kings');
  expect(line1).toBe('Punjab Kings');
  expect(line2).toBe('');
});

test('splitNameInTwoLines Rajasthan Royals', async () => {
  const [line1, line2] = splitNameInTwoLines('Rajasthan Royals');
  expect(line1).toBe('Rajasthan');
  expect(line2).toBe('Royals');
});

/// test getTeam for a specificed qualifier from competitors
test('Get team for a specificed qualifier from competitors', async () => {
  const homeCompetitor = {
    id: 'home_id',
    name: 'home_name',
    abbreviation: 'abv',
    qualifier: CricketQualifierType.Home,
  };
  const awayCompetitor = {
    id: 'away_id',
    name: 'away_name',
    abbreviation: 'abv',
    qualifier: CricketQualifierType.Away,
  };
  const competitors: CricketCompetitor[] = [homeCompetitor, awayCompetitor];
  expect(getTeam(competitors, CricketQualifierType.Home)).toEqual(homeCompetitor);
  expect(getTeam(competitors, CricketQualifierType.Away)).toEqual(awayCompetitor);
});

const homeTeamInfo: TeamInfo = {
  id: 'home_id',
  name: 'home_name',
  abbreviation: 'home_abv',
  fullName: 'home_name',
  location: 'country',
  logo: 'league-home_abv.png',
};

/// tests getBattingResultsByBattingOrder
test('Get batting results for non started event', async () => {
  cricketMatch.sport_event_status.status = CricketEventStatusType.NOT_STARTED;
  let sortedBattingResults = getSortedBattingResults(cricketMatch, homeTeamInfo);
  expect(sortedBattingResults).toEqual([]);

  cricketMatch.sport_event_status.status = CricketEventStatusType.POSTPONED;
  sortedBattingResults = getSortedBattingResults(cricketMatch, homeTeamInfo);
  expect(sortedBattingResults).toEqual([]);

  cricketMatch.sport_event_status.status = CricketEventStatusType.CREATED;
  sortedBattingResults = getSortedBattingResults(cricketMatch, homeTeamInfo);
  expect(sortedBattingResults).toEqual([]);
});

test('Get batting results for no statistics', async () => {
  cricketMatch.sport_event_status.status = CricketEventStatusType.LIVE;
  const sortedBattingResults = getSortedBattingResults(cricketMatch, homeTeamInfo);
  expect(sortedBattingResults).toEqual([]);
});

const homeStatistics: CricketTeamStatistics = {
  batting: {
    partnerships: [],
    runs: 20,
    balls_remaining: 5,
    overs_remaining: 4,
    wickets_lost: 3,
    players: [],
  },
};

const homeCricketTeam: CricketTeam = {
  id: 'home_id',
  name: 'home_name',
  abbreviation: 'home_abv',
  statistics: homeStatistics,
};

const awayStatistics: CricketTeamStatistics = {
  batting: {
    partnerships: [],
    runs: 18,
    balls_remaining: 3,
    overs_remaining: 2,
    wickets_lost: 1,
    players: [],
  },
};

const awayCricketTeam: CricketTeam = {
  id: 'away_id',
  name: 'away_name',
  abbreviation: 'away_abv',
  statistics: awayStatistics,
};

test('Get batting results for no batting teams', async () => {
  cricketMatch.sport_event_status.status = CricketEventStatusType.LIVE;
  const innings: CricketInning[] = [
    {
      number: 1,
      batting_team: 'home_id',
      bowling_team: 'away_id',
      overs_completed: 12,
      teams: [],
    },
  ];
  cricketMatch.statistics.innings = innings;

  const sortedBattingResults = getSortedBattingResults(cricketMatch, homeTeamInfo);
  expect(sortedBattingResults).toEqual([]);
});

test('Get batting results for actual statistics 1 inning', async () => {
  cricketMatch.sport_event_status.status = CricketEventStatusType.LIVE;
  const innings: CricketInning[] = [
    {
      number: 1,
      batting_team: 'home_id',
      bowling_team: 'away_id',
      overs_completed: 12,
      teams: [homeCricketTeam, awayCricketTeam],
    },
  ];
  cricketMatch.statistics.innings = innings;

  const sortedBattingResults = getSortedBattingResults(cricketMatch, homeTeamInfo);
  const expectedBattingResults: BattingResult[] = [
    {
      battingTeamId: 'home_id',
      bowlingTeamId: 'away_id',
      inningNumber: 1,
      oversRemaning: 4,
      oversCompleted: 12,
      ballsRemaning: 5,
      wicketsLost: 3,
      runs: 20,
      qualifierType: CricketQualifierType.Home,
      displayScore: '20/3',
    },
  ];
  expect(sortedBattingResults).toEqual(expectedBattingResults);
});

test('Get batting results for actual statistics 2 innings', async () => {
  cricketMatch.sport_event_status.status = CricketEventStatusType.LIVE;
  const innings: CricketInning[] = [
    {
      number: 1,
      batting_team: 'home_id',
      bowling_team: 'away_id',
      overs_completed: 12,
      teams: [homeCricketTeam, awayCricketTeam],
    },
    {
      number: 2,
      batting_team: 'away_id',
      bowling_team: 'home_id',
      overs_completed: 19,
      teams: [homeCricketTeam, awayCricketTeam],
    },
  ];
  cricketMatch.statistics.innings = innings;

  const expectedBattingResults: BattingResult[] = [
    {
      battingTeamId: 'home_id',
      bowlingTeamId: 'away_id',
      inningNumber: 1,
      oversRemaning: 4,
      oversCompleted: 12,
      ballsRemaning: 5,
      wicketsLost: 3,
      runs: 20,
      qualifierType: CricketQualifierType.Home,
      displayScore: '20/3',
    },
    {
      battingTeamId: 'away_id',
      bowlingTeamId: 'home_id',
      inningNumber: 2,
      oversRemaning: 2,
      oversCompleted: 19,
      ballsRemaning: 3,
      wicketsLost: 1,
      runs: 18,
      qualifierType: CricketQualifierType.Away,
      displayScore: '18/1',
    },
  ];

  const sortedBattingResults = getSortedBattingResults(cricketMatch, homeTeamInfo);
  expect(sortedBattingResults).toEqual(expectedBattingResults);
});

/// test ordinalSuffixOf
test('Get ordinalsuffixof method', async () => {
  expect(ordinalSuffixOf(1)).toEqual('1st');
  expect(ordinalSuffixOf(2)).toEqual('2nd');
  expect(ordinalSuffixOf(3)).toEqual('3rd');
  expect(ordinalSuffixOf(4)).toEqual('4th');
  expect(ordinalSuffixOf(5)).toEqual('5th');
  expect(ordinalSuffixOf(11)).toEqual('11th');
  expect(ordinalSuffixOf(12)).toEqual('12th');
  expect(ordinalSuffixOf(13)).toEqual('13th');
});

/// test getSecondLine
test('Get second line of bottomBar method', async () => {
  cricketMatch.sport_event.tournament.type = 't20';

  expect(getSecondLine(cricketMatch, '2', '20')).toEqual('T20 2 of 20');
  expect(getSecondLine(cricketMatch, undefined, '20')).toEqual('T20');
  expect(getSecondLine(cricketMatch, '20', undefined)).toEqual('T20');
});

/// test hasMatchStarted
test('hasMatchStarted', async () => {
  cricketMatch.sport_event_status.status = CricketEventStatusType.NOT_STARTED;
  expect(hasMatchStarted(cricketMatch)).toBe(false);
  cricketMatch.sport_event_status.status = CricketEventStatusType.CREATED;
  expect(hasMatchStarted(cricketMatch)).toBe(false);
  cricketMatch.sport_event_status.status = CricketEventStatusType.POSTPONED;
  expect(hasMatchStarted(cricketMatch)).toBe(false);
  cricketMatch.sport_event_status.status = CricketEventStatusType.COMPLETE;
  expect(hasMatchStarted(cricketMatch)).toBe(true);
  cricketMatch.sport_event_status.status = CricketEventStatusType.LIVE;
  expect(hasMatchStarted(cricketMatch)).toBe(true);
  cricketMatch.sport_event_status.status = CricketEventStatusType.INPROGRESS;
  expect(hasMatchStarted(cricketMatch)).toBe(true);
  cricketMatch.sport_event_status.status = CricketEventStatusType.CLOSED;
  expect(hasMatchStarted(cricketMatch)).toBe(true);
  cricketMatch.sport_event_status.status = CricketEventStatusType.ENDED;
  expect(hasMatchStarted(cricketMatch)).toBe(true);
  cricketMatch.sport_event_status.status = CricketEventStatusType.SUSPENDED;
  expect(hasMatchStarted(cricketMatch)).toBe(false);
  cricketMatch.sport_event_status.status = CricketEventStatusType.DELAYED;
  expect(hasMatchStarted(cricketMatch)).toBe(false);
  cricketMatch.sport_event_status.status = CricketEventStatusType.CANCELLED;
  expect(hasMatchStarted(cricketMatch)).toBe(false);
  cricketMatch.sport_event_status.status = CricketEventStatusType.ABANDONED;
  expect(hasMatchStarted(cricketMatch)).toBe(false);
  cricketMatch.sport_event_status.status = CricketEventStatusType.INTERRUPTED;
  expect(hasMatchStarted(cricketMatch)).toBe(true);
});

/// test isMatchInAbnormalState
test('isMatchInAbnormalState', async () => {
  cricketMatch.sport_event_status.status = CricketEventStatusType.NOT_STARTED;
  expect(isMatchInAbnormalState(cricketMatch)).toBe(false);
  cricketMatch.sport_event_status.status = CricketEventStatusType.CREATED;
  expect(isMatchInAbnormalState(cricketMatch)).toBe(false);
  cricketMatch.sport_event_status.status = CricketEventStatusType.POSTPONED;
  expect(isMatchInAbnormalState(cricketMatch)).toBe(true);
  cricketMatch.sport_event_status.status = CricketEventStatusType.COMPLETE;
  expect(isMatchInAbnormalState(cricketMatch)).toBe(false);
  cricketMatch.sport_event_status.status = CricketEventStatusType.LIVE;
  expect(isMatchInAbnormalState(cricketMatch)).toBe(false);
  cricketMatch.sport_event_status.status = CricketEventStatusType.INPROGRESS;
  expect(isMatchInAbnormalState(cricketMatch)).toBe(false);
  cricketMatch.sport_event_status.status = CricketEventStatusType.CLOSED;
  expect(isMatchInAbnormalState(cricketMatch)).toBe(false);
  cricketMatch.sport_event_status.status = CricketEventStatusType.ENDED;
  expect(isMatchInAbnormalState(cricketMatch)).toBe(false);
  cricketMatch.sport_event_status.status = CricketEventStatusType.SUSPENDED;
  expect(isMatchInAbnormalState(cricketMatch)).toBe(true);
  cricketMatch.sport_event_status.status = CricketEventStatusType.DELAYED;
  expect(isMatchInAbnormalState(cricketMatch)).toBe(true);
  cricketMatch.sport_event_status.status = CricketEventStatusType.CANCELLED;
  expect(isMatchInAbnormalState(cricketMatch)).toBe(true);
  cricketMatch.sport_event_status.status = CricketEventStatusType.ABANDONED;
  expect(isMatchInAbnormalState(cricketMatch)).toBe(true);
  cricketMatch.sport_event_status.status = CricketEventStatusType.INTERRUPTED;
  expect(isMatchInAbnormalState(cricketMatch)).toBe(true);
});

/// test hasMatchEnded
test('hasMatchEnded', async () => {
  cricketMatch.sport_event_status.status = CricketEventStatusType.NOT_STARTED;
  expect(hasMatchEnded(cricketMatch)).toBe(false);
  cricketMatch.sport_event_status.status = CricketEventStatusType.CREATED;
  expect(hasMatchEnded(cricketMatch)).toBe(false);
  cricketMatch.sport_event_status.status = CricketEventStatusType.POSTPONED;
  expect(hasMatchEnded(cricketMatch)).toBe(false);
  cricketMatch.sport_event_status.status = CricketEventStatusType.LIVE;
  expect(hasMatchEnded(cricketMatch)).toBe(false);
  cricketMatch.sport_event_status.status = CricketEventStatusType.INPROGRESS;
  expect(hasMatchEnded(cricketMatch)).toBe(false);
  cricketMatch.sport_event_status.status = CricketEventStatusType.COMPLETE;
  expect(hasMatchEnded(cricketMatch)).toBe(true);
  cricketMatch.sport_event_status.status = CricketEventStatusType.CLOSED;
  expect(hasMatchEnded(cricketMatch)).toBe(true);
  cricketMatch.sport_event_status.status = CricketEventStatusType.ENDED;
  expect(hasMatchEnded(cricketMatch)).toBe(true);
  cricketMatch.sport_event_status.status = CricketEventStatusType.SUSPENDED;
  expect(hasMatchEnded(cricketMatch)).toBe(false);
  cricketMatch.sport_event_status.status = CricketEventStatusType.DELAYED;
  expect(hasMatchEnded(cricketMatch)).toBe(false);
  cricketMatch.sport_event_status.status = CricketEventStatusType.CANCELLED;
  expect(hasMatchEnded(cricketMatch)).toBe(false);
  cricketMatch.sport_event_status.status = CricketEventStatusType.ABANDONED;
  expect(hasMatchEnded(cricketMatch)).toBe(false);
  cricketMatch.sport_event_status.status = CricketEventStatusType.INTERRUPTED;
  expect(hasMatchEnded(cricketMatch)).toBe(false);
});

/// test getFirstLine
test('Get first line of bottomBar method if match hasnt started', async () => {
  cricketMatch.sport_event_status.status = CricketEventStatusType.NOT_STARTED;
  cricketMatch.sport_event.scheduled = '2024-03-22T14:30:00+00:00';

  let currentDate = new Date('2024-03-21T14:30:00+00:00');
  expect(getFirstLine(cricketMatch, undefined, homeTeam, awayTeam, [], currentDate)).toBe(
    'Match starts in 1 day'
  );
  currentDate = new Date('2024-03-10T14:30:00+00:00');
  expect(getFirstLine(cricketMatch, undefined, homeTeam, awayTeam, [], currentDate)).toBe(
    'Match starts in 12 days'
  );
  currentDate = new Date('2024-03-22T14:30:00+00:00');
  expect(getFirstLine(cricketMatch, undefined, homeTeam, awayTeam, [], currentDate)).toBe(
    'Match Starting Soon'
  );
});

test('Get first line of bottomBar method if match is live but theres no winning Qualifier', async () => {
  cricketMatch.sport_event_status.status = CricketEventStatusType.LIVE;
  cricketMatch.sport_event.scheduled = '2024-03-22T14:30:00+00:00';

  const currentDate = new Date('2024-03-21T14:30:00+00:00');
  expect(getFirstLine(cricketMatch, undefined, homeTeam, awayTeam, [], currentDate)).toBe('');
});

test('Get first line of bottomBar method if match is live but theres no battingResults', async () => {
  cricketMatch.sport_event_status.status = CricketEventStatusType.LIVE;
  cricketMatch.sport_event.scheduled = '2024-03-22T14:30:00+00:00';
  const currentDate = new Date('2024-03-21T14:30:00+00:00');

  expect(
    getFirstLine(cricketMatch, CricketQualifierType.Home, homeTeam, awayTeam, [], currentDate)
  ).toBe('');
});

test('Get first line of bottomBar method if match is live and it has 1 result', async () => {
  cricketMatch.sport_event_status.status = CricketEventStatusType.LIVE;
  cricketMatch.sport_event.scheduled = '2024-03-22T14:30:00+00:00';
  cricketMatch.sport_event_status.toss_decision = 'bowl';
  cricketMatch.sport_event_status.toss_won_by = 'home_id';
  const currentDate = new Date('2024-03-21T14:30:00+00:00');

  let battingResults: BattingResult[] = [
    {
      battingTeamId: 'home_id',
      bowlingTeamId: 'away_id',
      inningNumber: 1,
      oversRemaning: 4,
      oversCompleted: 12,
      ballsRemaning: 5,
      wicketsLost: 3,
      runs: 1,
      qualifierType: CricketQualifierType.Home,
      displayScore: '20/3',
    },
  ];
  expect(
    getFirstLine(
      cricketMatch,
      CricketQualifierType.Home,
      homeTeam,
      awayTeam,
      battingResults,
      currentDate
    )
  ).toBe('home_abbreviation chose to bowl');

  battingResults = [
    {
      battingTeamId: 'home_id',
      bowlingTeamId: 'away_id',
      inningNumber: 1,
      oversRemaning: 4,
      oversCompleted: 12,
      ballsRemaning: 5,
      wicketsLost: 3,
      runs: 90,
      qualifierType: CricketQualifierType.Home,
      displayScore: '20/3',
    },
  ];

  cricketMatch.sport_event_status.toss_decision = 'bat';
  cricketMatch.sport_event_status.toss_won_by = 'away_id';

  expect(
    getFirstLine(
      cricketMatch,
      CricketQualifierType.Home,
      homeTeam,
      awayTeam,
      battingResults,
      currentDate
    )
  ).toBe('away_abbreviation chose to bat');
});

test('Get first line of bottomBar method if match is ended and it has 1 result', async () => {
  cricketMatch.sport_event_status.status = CricketEventStatusType.COMPLETE;
  cricketMatch.sport_event.scheduled = '2024-03-22T14:30:00+00:00';
  const currentDate = new Date('2024-03-21T14:30:00+00:00');

  let battingResults: BattingResult[] = [
    {
      battingTeamId: 'home_id',
      bowlingTeamId: 'away_id',
      inningNumber: 1,
      oversRemaning: 4,
      oversCompleted: 12,
      ballsRemaning: 5,
      wicketsLost: 3,
      runs: 1,
      qualifierType: CricketQualifierType.Home,
      displayScore: '20/3',
    },
  ];
  expect(
    getFirstLine(
      cricketMatch,
      CricketQualifierType.Home,
      homeTeam,
      awayTeam,
      battingResults,
      currentDate
    )
  ).toBe('home_abbreviation won by 1 run');

  battingResults = [
    {
      battingTeamId: 'home_id',
      bowlingTeamId: 'away_id',
      inningNumber: 1,
      oversRemaning: 4,
      oversCompleted: 12,
      ballsRemaning: 5,
      wicketsLost: 3,
      runs: 90,
      qualifierType: CricketQualifierType.Home,
      displayScore: '20/3',
    },
  ];
  expect(
    getFirstLine(
      cricketMatch,
      CricketQualifierType.Home,
      homeTeam,
      awayTeam,
      battingResults,
      currentDate
    )
  ).toBe('home_abbreviation won by 90 runs');
});

test('Get first line of bottomBar method if match is postponed', async () => {
  cricketMatch.sport_event_status.status = CricketEventStatusType.POSTPONED;
  cricketMatch.sport_event.scheduled = '2024-03-22T14:30:00+00:00';
  const currentDate = new Date('2024-03-21T14:30:00+00:00');

  const battingResults: BattingResult[] = [
    {
      battingTeamId: 'home_id',
      bowlingTeamId: 'away_id',
      inningNumber: 1,
      oversRemaning: 0,
      oversCompleted: 20,
      ballsRemaning: 0,
      wicketsLost: 8,
      runs: 199,
      qualifierType: CricketQualifierType.Home,
      displayScore: '199/8',
    },
    {
      battingTeamId: 'away_id',
      bowlingTeamId: 'home_id',
      inningNumber: 2,
      oversRemaning: 0,
      oversCompleted: 20,
      ballsRemaning: 0,
      wicketsLost: 5,
      runs: 178,
      qualifierType: CricketQualifierType.Away,
      displayScore: '178/5',
    },
  ];
  expect(
    getFirstLine(
      cricketMatch,
      CricketQualifierType.Home,
      homeTeam,
      awayTeam,
      battingResults,
      currentDate
    )
  ).toBe('Postponed');
});

test('Get first line of bottomBar method if match is delayed', async () => {
  cricketMatch.sport_event_status.status = CricketEventStatusType.DELAYED;
  cricketMatch.sport_event.scheduled = '2024-03-22T14:30:00+00:00';
  const currentDate = new Date('2024-03-21T14:30:00+00:00');

  const battingResults: BattingResult[] = [
    {
      battingTeamId: 'home_id',
      bowlingTeamId: 'away_id',
      inningNumber: 1,
      oversRemaning: 0,
      oversCompleted: 20,
      ballsRemaning: 0,
      wicketsLost: 8,
      runs: 199,
      qualifierType: CricketQualifierType.Home,
      displayScore: '199/8',
    },
    {
      battingTeamId: 'away_id',
      bowlingTeamId: 'home_id',
      inningNumber: 2,
      oversRemaning: 0,
      oversCompleted: 20,
      ballsRemaning: 0,
      wicketsLost: 5,
      runs: 178,
      qualifierType: CricketQualifierType.Away,
      displayScore: '178/5',
    },
  ];
  expect(
    getFirstLine(
      cricketMatch,
      CricketQualifierType.Home,
      homeTeam,
      awayTeam,
      battingResults,
      currentDate
    )
  ).toBe('Delayed');
});

test('Get first line of bottomBar method if match is suspended', async () => {
  cricketMatch.sport_event_status.status = CricketEventStatusType.SUSPENDED;
  cricketMatch.sport_event.scheduled = '2024-03-22T14:30:00+00:00';
  const currentDate = new Date('2024-03-21T14:30:00+00:00');

  const battingResults: BattingResult[] = [
    {
      battingTeamId: 'home_id',
      bowlingTeamId: 'away_id',
      inningNumber: 1,
      oversRemaning: 0,
      oversCompleted: 20,
      ballsRemaning: 0,
      wicketsLost: 8,
      runs: 199,
      qualifierType: CricketQualifierType.Home,
      displayScore: '199/8',
    },
    {
      battingTeamId: 'away_id',
      bowlingTeamId: 'home_id',
      inningNumber: 2,
      oversRemaning: 0,
      oversCompleted: 20,
      ballsRemaning: 0,
      wicketsLost: 5,
      runs: 178,
      qualifierType: CricketQualifierType.Away,
      displayScore: '178/5',
    },
  ];
  expect(
    getFirstLine(
      cricketMatch,
      CricketQualifierType.Home,
      homeTeam,
      awayTeam,
      battingResults,
      currentDate
    )
  ).toBe('Suspended');
});

test('Get first line of bottomBar method if match is Interrupted', async () => {
  cricketMatch.sport_event_status.status = CricketEventStatusType.INTERRUPTED;
  cricketMatch.sport_event.scheduled = '2024-03-22T14:30:00+00:00';
  const currentDate = new Date('2024-03-21T14:30:00+00:00');

  const battingResults: BattingResult[] = [
    {
      battingTeamId: 'home_id',
      bowlingTeamId: 'away_id',
      inningNumber: 1,
      oversRemaning: 0,
      oversCompleted: 20,
      ballsRemaning: 0,
      wicketsLost: 8,
      runs: 199,
      qualifierType: CricketQualifierType.Home,
      displayScore: '199/8',
    },
    {
      battingTeamId: 'away_id',
      bowlingTeamId: 'home_id',
      inningNumber: 2,
      oversRemaning: 0,
      oversCompleted: 20,
      ballsRemaning: 0,
      wicketsLost: 5,
      runs: 178,
      qualifierType: CricketQualifierType.Away,
      displayScore: '178/5',
    },
  ];
  expect(
    getFirstLine(
      cricketMatch,
      CricketQualifierType.Home,
      homeTeam,
      awayTeam,
      battingResults,
      currentDate
    )
  ).toBe('Interrupted');
});

test('Get first line of bottomBar method if match is Abandoned', async () => {
  cricketMatch.sport_event_status.status = CricketEventStatusType.ABANDONED;
  cricketMatch.sport_event.scheduled = '2024-03-22T14:30:00+00:00';
  const currentDate = new Date('2024-03-21T14:30:00+00:00');

  const battingResults: BattingResult[] = [
    {
      battingTeamId: 'home_id',
      bowlingTeamId: 'away_id',
      inningNumber: 1,
      oversRemaning: 0,
      oversCompleted: 20,
      ballsRemaning: 0,
      wicketsLost: 8,
      runs: 199,
      qualifierType: CricketQualifierType.Home,
      displayScore: '199/8',
    },
    {
      battingTeamId: 'away_id',
      bowlingTeamId: 'home_id',
      inningNumber: 2,
      oversRemaning: 0,
      oversCompleted: 20,
      ballsRemaning: 0,
      wicketsLost: 5,
      runs: 178,
      qualifierType: CricketQualifierType.Away,
      displayScore: '178/5',
    },
  ];
  expect(
    getFirstLine(
      cricketMatch,
      CricketQualifierType.Home,
      homeTeam,
      awayTeam,
      battingResults,
      currentDate
    )
  ).toBe('Abandoned');
});

test('Get first line of bottomBar method if match is Cancelled', async () => {
  cricketMatch.sport_event_status.status = CricketEventStatusType.CANCELLED;
  cricketMatch.sport_event.scheduled = '2024-03-22T14:30:00+00:00';
  const currentDate = new Date('2024-03-21T14:30:00+00:00');

  const battingResults: BattingResult[] = [
    {
      battingTeamId: 'home_id',
      bowlingTeamId: 'away_id',
      inningNumber: 1,
      oversRemaning: 0,
      oversCompleted: 20,
      ballsRemaning: 0,
      wicketsLost: 8,
      runs: 199,
      qualifierType: CricketQualifierType.Home,
      displayScore: '199/8',
    },
    {
      battingTeamId: 'away_id',
      bowlingTeamId: 'home_id',
      inningNumber: 2,
      oversRemaning: 0,
      oversCompleted: 20,
      ballsRemaning: 0,
      wicketsLost: 5,
      runs: 178,
      qualifierType: CricketQualifierType.Away,
      displayScore: '178/5',
    },
  ];
  expect(
    getFirstLine(
      cricketMatch,
      CricketQualifierType.Home,
      homeTeam,
      awayTeam,
      battingResults,
      currentDate
    )
  ).toBe('Cancelled');
});

test('Get first line of bottomBar method if match is live and it has 2 results home winning', async () => {
  cricketMatch.sport_event_status.status = CricketEventStatusType.LIVE;
  cricketMatch.sport_event.scheduled = '2024-03-22T14:30:00+00:00';
  const currentDate = new Date('2024-03-21T14:30:00+00:00');

  const battingResults: BattingResult[] = [
    {
      battingTeamId: 'home_id',
      bowlingTeamId: 'away_id',
      inningNumber: 1,
      oversRemaning: 0,
      oversCompleted: 20,
      ballsRemaning: 0,
      wicketsLost: 8,
      runs: 199,
      qualifierType: CricketQualifierType.Home,
      displayScore: '199/8',
    },
    {
      battingTeamId: 'away_id',
      bowlingTeamId: 'home_id',
      inningNumber: 2,
      oversRemaning: 0,
      oversCompleted: 20,
      ballsRemaning: 0,
      wicketsLost: 5,
      runs: 178,
      qualifierType: CricketQualifierType.Away,
      displayScore: '178/5',
    },
  ];
  expect(
    getFirstLine(
      cricketMatch,
      CricketQualifierType.Home,
      homeTeam,
      awayTeam,
      battingResults,
      currentDate
    )
  ).toBe('away_abbreviation need 22 runs to win');
});

test('Get first line of bottomBar method if match is live and it has 2 results same runs', async () => {
  cricketMatch.sport_event_status.status = CricketEventStatusType.LIVE;
  cricketMatch.sport_event.scheduled = '2024-03-22T14:30:00+00:00';
  const currentDate = new Date('2024-03-21T14:30:00+00:00');

  const battingResults: BattingResult[] = [
    {
      battingTeamId: 'home_id',
      bowlingTeamId: 'away_id',
      inningNumber: 1,
      oversRemaning: 4,
      oversCompleted: 12,
      ballsRemaning: 5,
      wicketsLost: 3,
      runs: 90,
      qualifierType: CricketQualifierType.Home,
      displayScore: '20/3',
    },
    {
      battingTeamId: 'away_id',
      bowlingTeamId: 'home_id',
      inningNumber: 2,
      oversRemaning: 2,
      oversCompleted: 19,
      ballsRemaning: 3,
      wicketsLost: 1,
      runs: 90,
      qualifierType: CricketQualifierType.Away,
      displayScore: '18/1',
    },
  ];
  expect(
    getFirstLine(
      cricketMatch,
      CricketQualifierType.Home,
      homeTeam,
      awayTeam,
      battingResults,
      currentDate
    )
  ).toBe('away_abbreviation need 1 run to win');
});

test('Get first line of bottomBar method if match is live and it has 2 results away bigger winning', async () => {
  cricketMatch.sport_event_status.status = CricketEventStatusType.LIVE;
  cricketMatch.sport_event.scheduled = '2024-03-22T14:30:00+00:00';
  const currentDate = new Date('2024-03-21T14:30:00+00:00');

  const battingResults: BattingResult[] = [
    {
      battingTeamId: 'away_id',
      bowlingTeamId: 'home_id',
      inningNumber: 2,
      oversRemaning: 2,
      oversCompleted: 19,
      ballsRemaning: 3,
      wicketsLost: 1,
      runs: 100,
      qualifierType: CricketQualifierType.Away,
      displayScore: '18/1',
    },
    {
      battingTeamId: 'home_id',
      bowlingTeamId: 'away_id',
      inningNumber: 1,
      oversRemaning: 4,
      oversCompleted: 12,
      ballsRemaning: 5,
      wicketsLost: 3,
      runs: 90,
      qualifierType: CricketQualifierType.Home,
      displayScore: '20/3',
    },
  ];
  expect(
    getFirstLine(
      cricketMatch,
      CricketQualifierType.Away,
      homeTeam,
      awayTeam,
      battingResults,
      currentDate
    )
  ).toBe('home_abbreviation need 11 runs to win');
});

test('Get first line of bottomBar method if match is ended and it has 2 results home won', async () => {
  cricketMatch.sport_event_status.status = CricketEventStatusType.COMPLETE;
  cricketMatch.sport_event.scheduled = '2024-03-22T14:30:00+00:00';
  const currentDate = new Date('2024-03-21T14:30:00+00:00');

  const battingResults: BattingResult[] = [
    {
      battingTeamId: 'home_id',
      bowlingTeamId: 'away_id',
      inningNumber: 0,
      oversRemaning: 4,
      oversCompleted: 12,
      ballsRemaning: 5,
      wicketsLost: 3,
      runs: 90,
      qualifierType: CricketQualifierType.Home,
      displayScore: '20/3',
    },
    {
      battingTeamId: 'away_id',
      bowlingTeamId: 'home_id',
      inningNumber: 0,
      oversRemaning: 2,
      oversCompleted: 19,
      ballsRemaning: 3,
      wicketsLost: 1,
      runs: 18,
      qualifierType: CricketQualifierType.Away,
      displayScore: '18/1',
    },
  ];
  expect(
    getFirstLine(
      cricketMatch,
      CricketQualifierType.Home,
      homeTeam,
      awayTeam,
      battingResults,
      currentDate
    )
  ).toBe('home_abbreviation won by 7 wickets (5 balls left)');
});

test('Get first line of bottomBar method if match is ended and it has 2 away won', async () => {
  cricketMatch.sport_event_status.status = CricketEventStatusType.COMPLETE;
  cricketMatch.sport_event.scheduled = '2024-03-22T14:30:00+00:00';
  const currentDate = new Date('2024-03-21T14:30:00+00:00');

  const battingResults: BattingResult[] = [
    {
      battingTeamId: 'home_id',
      bowlingTeamId: 'away_id',
      inningNumber: 1,
      oversRemaning: 4,
      oversCompleted: 12,
      ballsRemaning: 5,
      wicketsLost: 3,
      runs: 272,
      qualifierType: CricketQualifierType.Home,
      displayScore: '272/7',
    },
    {
      battingTeamId: 'away_id',
      bowlingTeamId: 'home_id',
      inningNumber: 2,
      oversRemaning: 2,
      oversCompleted: 19,
      ballsRemaning: 3,
      wicketsLost: 1,
      runs: 166,
      qualifierType: CricketQualifierType.Away,
      displayScore: '166/10',
    },
  ];
  expect(
    getFirstLine(
      cricketMatch,
      CricketQualifierType.Home,
      homeTeam,
      awayTeam,
      battingResults,
      currentDate
    )
  ).toBe('home_abbreviation won by 106 runs');
});

test('Get first line of bottomBar method if match is ended and it has 2 results with same amount of runs', async () => {
  cricketMatch.sport_event_status.status = CricketEventStatusType.COMPLETE;
  cricketMatch.sport_event.scheduled = '2024-03-22T14:30:00+00:00';
  const currentDate = new Date('2024-03-21T14:30:00+00:00');

  const battingResults: BattingResult[] = [
    {
      battingTeamId: 'away_id',
      bowlingTeamId: 'home_id',
      inningNumber: 1,
      oversRemaning: 2,
      oversCompleted: 19,
      ballsRemaning: 3,
      wicketsLost: 1,
      runs: 90,
      qualifierType: CricketQualifierType.Away,
      displayScore: '18/1',
    },
    {
      battingTeamId: 'home_id',
      bowlingTeamId: 'away_id',
      inningNumber: 2,
      oversRemaning: 4,
      oversCompleted: 12,
      ballsRemaning: 5,
      wicketsLost: 3,
      runs: 90,
      qualifierType: CricketQualifierType.Home,
      displayScore: '20/3',
    },
  ];
  expect(
    getFirstLine(
      cricketMatch,
      CricketQualifierType.Home,
      homeTeam,
      awayTeam,
      battingResults,
      currentDate
    )
  ).toBe('Match tied');
});

const statsInnings: CricketInning[] = [
  {
    number: 0,
    batting_team: 'home_id',
    bowling_team: 'away_id',
    overs_completed: 12,
    teams: [
      {
        id: 'home_id',
        name: 'home_name',
        abbreviation: 'home_abbreviation',
        statistics: {
          batting: {
            partnerships: [],
            runs: 0,
            balls_remaining: 0,
            overs_remaining: 0,
            wickets_lost: 0,
            players: [
              {
                id: 'player_1_id',
                name: 'player_1_name',
                statistics: {
                  balls_faced: 5,
                  runs: 10,
                },
              },
              {
                id: 'player_2_id',
                name: 'player_2_name',
                statistics: {
                  balls_faced: 1,
                  runs: 8,
                },
              },
              {
                id: 'player_3_id',
                name: 'player_3_name',
                statistics: {
                  balls_faced: 1,
                  runs: 10,
                },
              },
              {
                id: 'player_4_id',
                name: 'player_4_name',
                statistics: {
                  balls_faced: 10,
                  runs: 7,
                },
              },
              {
                id: 'player_5_id',
                name: 'player_5_name',
                statistics: {
                  balls_faced: 3,
                  runs: 10,
                },
              },
            ],
          },
        },
      },
      {
        id: 'away_id',
        name: 'away_name',
        abbreviation: 'away_abbreviation',
        statistics: {
          batting: {
            partnerships: [],
            runs: 0,
            balls_remaining: 0,
            overs_remaining: 0,
            wickets_lost: 0,
            players: [
              {
                id: 'player_6_id',
                name: 'player_6_name',
                statistics: {
                  balls_faced: 5,
                  runs: 10,
                },
              },
              {
                id: 'player_7_id',
                name: 'player_7_name',
                statistics: {
                  balls_faced: 1,
                  runs: 8,
                },
              },
              {
                id: 'player_8_id',
                name: 'player_8_name',
                statistics: {
                  balls_faced: 1,
                  runs: 10,
                },
              },
              {
                id: 'player_9_id',
                name: 'player_9_name',
                statistics: {
                  balls_faced: 10,
                  runs: 7,
                },
              },
              {
                id: 'player_10_id',
                name: 'player_10_name',
                statistics: {
                  balls_faced: 3,
                  runs: 10,
                },
              },
            ],
          },
        },
      },
      {
        id: 'away_id',
        name: 'away_name',
        abbreviation: 'away_abbreviation',
        statistics: {
          bowling: {
            players: [
              {
                id: 'player_6_id',
                name: 'player_6_name',
                statistics: {
                  conceded_runs: 20,
                  wickets: 3,
                },
              },
              {
                id: 'player_7_id',
                name: 'player_7_name',
                statistics: {
                  conceded_runs: 10,
                  wickets: 0,
                },
              },
              {
                id: 'player_8_id',
                name: 'player_8_name',
                statistics: {
                  conceded_runs: 19,
                  wickets: 3,
                },
              },
              {
                id: 'player_9_id',
                name: 'player_9_name',
                statistics: {
                  conceded_runs: 20,
                  wickets: 0,
                },
              },
              {
                id: 'player_10_id',
                name: 'player_10_name',
                statistics: {
                  conceded_runs: 40,
                  wickets: 2,
                },
              },
            ],
          },
        },
      },
    ],
  },
];

/// test validChatURL
test('Get validChatURL', async () => {
  let string = 'any string';
  expect(validChatURL(string)).toBe(false);
  string = 'https://www.google.com';
  expect(validChatURL(string)).toBe(false);
  string = 'https://www.reddit.com';
  expect(validChatURL(string)).toBe(false);
  string = 'https://www.reddit.com/r/MumbaiIndians/s/Wt1o53KDXV';
  expect(validChatURL(string)).toBe(true);
});

/// test getBattingStats
test('Get getBattingStats', async () => {
  cricketMatch.sport_event_status.status = CricketEventStatusType.COMPLETE;
  cricketMatch.statistics.innings = statsInnings;
  expect(getBattingStats(cricketMatch, 'home_id')).toBe('player_3_name: 10');
});

/// test getBowlingStats
test('Get getBowlingStats', async () => {
  cricketMatch.sport_event_status.status = CricketEventStatusType.COMPLETE;
  cricketMatch.statistics.innings = statsInnings;
  expect(getBowlingStats(cricketMatch, 'away_id')).toBe('player_8_name: 3/19');
});

test('Get getBowlingStats for a live match', async () => {
  cricketMatch.sport_event_status.status = CricketEventStatusType.LIVE;
  cricketMatch.statistics.innings = statsInnings;
  expect(getBowlingStats(cricketMatch, 'away_id')).toBe(undefined);
});

test('Get getBowlingStats for empty innings', async () => {
  cricketMatch.sport_event_status.status = CricketEventStatusType.COMPLETE;
  cricketMatch.statistics.innings = [];
  expect(getBowlingStats(cricketMatch, 'away_id')).toBe(undefined);
});

test('Get getFirstBattingQualifier away team first inning', async () => {
  const battingResults: BattingResult[] = [
    {
      battingTeamId: 'away_id',
      bowlingTeamId: 'home_id',
      inningNumber: 1,
      oversRemaning: 2,
      oversCompleted: 19,
      ballsRemaning: 3,
      wicketsLost: 1,
      runs: 90,
      qualifierType: CricketQualifierType.Away,
      displayScore: '18/1',
    },
    {
      battingTeamId: 'home_id',
      bowlingTeamId: 'away_id',
      inningNumber: 2,
      oversRemaning: 4,
      oversCompleted: 12,
      ballsRemaning: 5,
      wicketsLost: 3,
      runs: 90,
      qualifierType: CricketQualifierType.Home,
      displayScore: '20/3',
    },
  ];
  expect(getFirstBattingQualifier(battingResults)).toBe(CricketQualifierType.Away);
});

test('Get getFirstBattingQualifier home team first inning', async () => {
  const battingResults: BattingResult[] = [
    {
      battingTeamId: 'away_id',
      bowlingTeamId: 'home_id',
      inningNumber: 1,
      oversRemaning: 2,
      oversCompleted: 19,
      ballsRemaning: 3,
      wicketsLost: 1,
      runs: 90,
      qualifierType: CricketQualifierType.Away,
      displayScore: '18/1',
    },
    {
      battingTeamId: 'home_id',
      bowlingTeamId: 'away_id',
      inningNumber: 0,
      oversRemaning: 4,
      oversCompleted: 12,
      ballsRemaning: 5,
      wicketsLost: 3,
      runs: 90,
      qualifierType: CricketQualifierType.Home,
      displayScore: '20/3',
    },
  ];
  expect(getFirstBattingQualifier(battingResults)).toBe(CricketQualifierType.Home);
});

test('Get currentBattingQualifier game is not live', async () => {
  const battingResults: BattingResult[] = [
    {
      battingTeamId: 'away_id',
      bowlingTeamId: 'home_id',
      inningNumber: 1,
      oversRemaning: 2,
      oversCompleted: 19,
      ballsRemaning: 3,
      wicketsLost: 1,
      runs: 90,
      qualifierType: CricketQualifierType.Away,
      displayScore: '18/1',
    },
    {
      battingTeamId: 'home_id',
      bowlingTeamId: 'away_id',
      inningNumber: 0,
      oversRemaning: 4,
      oversCompleted: 12,
      ballsRemaning: 5,
      wicketsLost: 3,
      runs: 90,
      qualifierType: CricketQualifierType.Home,
      displayScore: '20/3',
    },
  ];
  expect(getCurrentBattingQualifier(false, 0, battingResults)).toBe(undefined);
});

test('Get currentBattingQualifier home team is batting in current inning', async () => {
  const battingResults: BattingResult[] = [
    {
      battingTeamId: 'away_id',
      bowlingTeamId: 'home_id',
      inningNumber: 1,
      oversRemaning: 2,
      oversCompleted: 19,
      ballsRemaning: 3,
      wicketsLost: 1,
      runs: 90,
      qualifierType: CricketQualifierType.Away,
      displayScore: '18/1',
    },
    {
      battingTeamId: 'home_id',
      bowlingTeamId: 'away_id',
      inningNumber: 0,
      oversRemaning: 4,
      oversCompleted: 12,
      ballsRemaning: 5,
      wicketsLost: 3,
      runs: 90,
      qualifierType: CricketQualifierType.Home,
      displayScore: '20/3',
    },
  ];
  expect(getCurrentBattingQualifier(true, 0, battingResults)).toBe(CricketQualifierType.Home);
});

test('Get currentBattingQualifier away team is batting in current inning', async () => {
  const battingResults: BattingResult[] = [
    {
      battingTeamId: 'away_id',
      bowlingTeamId: 'home_id',
      inningNumber: 1,
      oversRemaning: 2,
      oversCompleted: 19,
      ballsRemaning: 3,
      wicketsLost: 1,
      runs: 90,
      qualifierType: CricketQualifierType.Away,
      displayScore: '18/1',
    },
    {
      battingTeamId: 'home_id',
      bowlingTeamId: 'away_id',
      inningNumber: 0,
      oversRemaning: 4,
      oversCompleted: 12,
      ballsRemaning: 5,
      wicketsLost: 3,
      runs: 90,
      qualifierType: CricketQualifierType.Home,
      displayScore: '20/3',
    },
  ];
  expect(getCurrentBattingQualifier(true, 1, battingResults)).toBe(CricketQualifierType.Away);
});
