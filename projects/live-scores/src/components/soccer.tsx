import { Devvit } from '@devvit/public-api';
import { EventState, leagueAssetPath } from '../sports/GameEvent.js';
import {
  SoccerGameScoreInfo,
  SoccerTeamStatistics,
  TimelineEvent,
} from '../sports/sportradar/SoccerEvent.js';
import { Bubble } from './EventBubble.js';
import { ScoreboardPage } from './Scoreboard.js';
import { TeamBlock } from './TeamBlock.js';
import { TopBar } from './TopBar.js';

export type SoccerScoreboardProps = {
  scoreInfo: SoccerGameScoreInfo;
  page: ScoreboardPage;
  setPage: (page: ScoreboardPage) => void;
};

export type TeamBlockSoccer = {
  goals?: TimelineEvent[] | undefined;
  redCards?: TimelineEvent[] | undefined;
  onPressAction?: () => void;
};

enum SoccerStat {
  ShotsOnTarget = 'shots_on_target',
  ShotsTotal = 'shots_total',
  ShotsOffTarget = 'shots_off_target',
  ShotsBlocked = 'shots_blocked',
  ShotsSaved = 'shots_saved',
  Fouls = 'fouls',
  Injuries = 'injuries',
  CornerKicks = 'corner_kicks',
  FreeKicks = 'free_kicks',
  GoalKicks = 'goal_kicks',
  Offsides = 'offsides',
  BallPossession = 'ball_possession',
  YellowCards = 'yellow_cards',
  RedCards = 'red_cards',
  YellowRedCards = 'yellow_red_cards',
  CardsGiven = 'cards_given',
  ThrowIns = 'throw_ins',
  Substitutions = 'substitutions',
}

const SCOREBOARD_HEIGHT = 262;

export function SportSpecificContentSoccer(props: TeamBlockSoccer): JSX.Element {
  const { goals, redCards } = props;

  let goalString: string | undefined;
  if (goals) {
    goalString = generateEventStrings(goals).join(', ');
  }

  let redCardString: string | undefined;
  if (redCards) {
    redCardString = generateEventStrings(redCards).join(', ');
  }

  return (
    <vstack>
      {goalString ? (
        <hstack>
          <spacer size="small" />
          <text wrap>⚽︎ {goalString}</text>
        </hstack>
      ) : null}
      {redCardString ? (
        <hstack>
          <spacer size="small" />
          <text wrap>🟥 {redCardString}</text>
        </hstack>
      ) : null}
    </vstack>
  );
}

function generateEventStrings(events: TimelineEvent[]): string[] {
  const playerClockMap: { [playerName: string]: string[] } = {};
  // Combine events for each player
  events.forEach((event) => {
    if (event.players && event.players.length > 0 && event.match_time) {
      const player = event.players[0];
      if (!playerClockMap[player.name]) {
        playerClockMap[player.name] = [];
      }
      const clock = event.stoppage_time
        ? `${event.match_time}’+${event.stoppage_time}’`
        : `${event.match_time}’`;
      playerClockMap[player.name].push(clock);
    }
  });

  const result: string[] = [];
  for (let playerName in playerClockMap) {
    const clocks = playerClockMap[playerName];
    result.push(`${playerName.split(',')[0]} (${clocks.join(', ')})`);
  }
  return result;
}

export function SoccerScoreboard(props: SoccerScoreboardProps): JSX.Element {
  return (
    <blocks height="regular">
      <vstack cornerRadius="medium" height={'100%'} width={'100%'}>
        {TopBar({
          event: props.scoreInfo.event,
        })}
        {props.page === ScoreboardPage.SCORE && ScoreComponent(props)}
        {(props.page === ScoreboardPage.HOME_LINEUP || props.page === ScoreboardPage.AWAY_LINEUP) &&
          LineupComponent(props)}
        {(props.page === ScoreboardPage.HOME_STATS || props.page === ScoreboardPage.AWAY_STATS) &&
          StatsComponent(props)}
      </vstack>
    </blocks>
  );
}

function ScoreComponent(props: SoccerScoreboardProps): JSX.Element {
  const scoreInfo = props.scoreInfo;
  return (
    <zstack height={`${SCOREBOARD_HEIGHT}px`} width={'100%'}>
      <vstack width={'100%'} height={'100%'}>
        {TeamBlock({
          isHomeTeam: true,
          name: scoreInfo.event.homeTeam.fullName,
          logo: leagueAssetPath(scoreInfo.event) + scoreInfo.event.homeTeam.logo,
          score: scoreInfo.homeScore,
          state: scoreInfo.event.state,
          soccerProps: {
            goals: scoreInfo.summary?.homeGoals,
            redCards: scoreInfo.summary?.homeRedCards,
            onPressAction: () => {
              props.setPage(ScoreboardPage.HOME_LINEUP);
            },
          },
        })}
        <hstack border="thin" />
        {TeamBlock({
          isHomeTeam: false,
          name: scoreInfo.event.awayTeam.fullName,
          logo: leagueAssetPath(scoreInfo.event) + scoreInfo.event.awayTeam.logo,
          score: scoreInfo.awayScore,
          state: scoreInfo.event.state,
          soccerProps: {
            goals: scoreInfo.summary?.awayGoals,
            redCards: scoreInfo.summary?.awayRedCards,
            onPressAction: () => {
              props.setPage(ScoreboardPage.AWAY_LINEUP);
            },
          },
        })}
        {Bubble(scoreInfo)}
      </vstack>
      {scoreInfo.event.state === EventState.LIVE &&
        scoreInfo.summary?.latestEvent?.type === 'score_change' && (
          <vstack width={'100%'} height={'100%'} alignment="bottom">
            <hstack alignment="end">
              <image url="soccer/cheer-animation.gif" imageWidth={400} imageHeight={320} />
            </hstack>
            <spacer size="xsmall" />
          </vstack>
        )}
    </zstack>
  );
}

function TeamNameBarComponent(props: SoccerScoreboardProps): JSX.Element {
  const scoreInfo = props.scoreInfo;
  const isHomeTeam =
    props.page === ScoreboardPage.HOME_LINEUP || props.page === ScoreboardPage.HOME_STATS;
  const isLineup =
    props.page === ScoreboardPage.HOME_LINEUP || props.page === ScoreboardPage.AWAY_LINEUP;
  const isStats =
    props.page === ScoreboardPage.HOME_STATS || props.page === ScoreboardPage.AWAY_STATS;
  const path = leagueAssetPath(scoreInfo.event);
  return (
    <hstack alignment={'start middle'} width={`100%`}>
      <spacer size="small" />
      <image
        url={
          isHomeTeam ? path + scoreInfo.event.homeTeam.logo : path + scoreInfo.event.awayTeam.logo
        }
        imageHeight={32}
        imageWidth={32}
      />
      <spacer size="small" />
      <text size="large" weight="bold">
        {(isHomeTeam ? scoreInfo.event.homeTeam.fullName : scoreInfo.event.awayTeam.fullName) +
          (isLineup ? ' Lineup' : isStats ? ' Stats' : '')}
      </text>
      <spacer grow />
      <button
        icon="close-outline"
        onPress={() => {
          props.setPage(ScoreboardPage.SCORE);
        }}
      />
    </hstack>
  );
}

type SoccerPlayer = {
  name: string;
};

function LineupComponent(props: SoccerScoreboardProps): JSX.Element {
  const scoreInfo = props.scoreInfo;
  const isHomeTeam = props.page === ScoreboardPage.HOME_LINEUP;
  const players: SoccerPlayer[] = [];
  const stats = isHomeTeam ? scoreInfo.homeStats : scoreInfo.awayStats;
  stats?.players?.forEach((p) => {
    const s = p.statistics;
    const starter = p.starter;
    const subbedOut = s?.substituted_out ?? false;
    const subbedIn = s?.substituted_in ?? false;
    const ejected =
      (s?.red_cards && s?.red_cards > 0) || (s?.yellow_red_cards && s?.yellow_red_cards > 0);
    if (!(ejected || subbedOut) && (starter || subbedIn)) {
      players.push({ name: p.name });
    }
  });

  const columnCount = 3;

  return (
    <zstack height={`${SCOREBOARD_HEIGHT}px`} width={'100%'}>
      <vstack padding="small" width={'100%'} height={'100%'}>
        {TeamNameBarComponent(props)}
        <spacer size="small" />
        <vstack padding="medium" width={'100%'} alignment="top center">
          {players.length > 0 && LineupGrid(players, columnCount)}
          {players.length === 0 && (
            <vstack alignment="top center">
              <text>No lineup info available yet.</text>
              <text>Please check back!</text>
            </vstack>
          )}
        </vstack>
        <spacer size="xsmall" grow />
        <hstack alignment="center middle">
          <button
            onPress={() => {
              props.setPage(isHomeTeam ? ScoreboardPage.HOME_STATS : ScoreboardPage.AWAY_STATS);
            }}
          >
            Team Stats
          </button>
        </hstack>
      </vstack>
    </zstack>
  );
}

function LineupGrid(children: SoccerPlayer[], count: number): JSX.Element {
  const rows: JSX.Element[] = [];
  const width = 100 / count;
  for (let i = 0; i < children.length; i += count) {
    const row = children.slice(i, i + count).map((c) => LineupPlayerComponent(c, width));
    const rowHasRoom = (): boolean => row.length < count;
    while (rowHasRoom()) {
      row.push(<text width={width} />);
    }
    rows.push(
      <hstack width={'100%'} gap="small" alignment="start middle">
        {row}
      </hstack>
    );
  }
  return (
    <vstack width={'100%'} gap="small" alignment="start middle">
      {rows}
    </vstack>
  );
}

function LineupPlayerComponent(player: SoccerPlayer, width: number): JSX.Element {
  return (
    <text weight="bold" width={width}>
      {player.name.split(',')[0]}
    </text>
  );
}

type SoccerTeamStat = {
  title: string;
  value: number;
};

function transformStats(
  stats: SoccerTeamStatistics,
  order: (keyof SoccerTeamStatistics)[]
): SoccerTeamStat[] {
  return order.map((key) => {
    const title = key
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    return { title, value: stats[key] };
  });
}

const emptyStats: SoccerTeamStatistics = {
  ball_possession: 0,
  cards_given: 0,
  corner_kicks: 0,
  fouls: 0,
  free_kicks: 0,
  goal_kicks: 0,
  injuries: 0,
  offsides: 0,
  red_cards: 0,
  shots_blocked: 0,
  shots_off_target: 0,
  shots_on_target: 0,
  shots_saved: 0,
  shots_total: 0,
  substitutions: 0,
  throw_ins: 0,
  yellow_cards: 0,
  yellow_red_cards: 0,
};

function StatsComponent(props: SoccerScoreboardProps): JSX.Element {
  const scoreInfo = props.scoreInfo;
  const isHomeTeam = props.page === ScoreboardPage.HOME_STATS;

  const teamStats = isHomeTeam ? scoreInfo.homeStats?.statistics : scoreInfo.awayStats?.statistics;
  const order: (keyof SoccerTeamStatistics)[] = [
    SoccerStat.BallPossession,
    SoccerStat.Fouls,
    SoccerStat.Injuries,
    SoccerStat.GoalKicks,
    SoccerStat.FreeKicks,
    SoccerStat.YellowCards,
    SoccerStat.ShotsTotal,
    SoccerStat.ShotsOnTarget,
    SoccerStat.ShotsOffTarget,
  ];

  const stats = teamStats ? transformStats(teamStats, order) : transformStats(emptyStats, order);
  const columnCount = 3;

  return (
    <zstack height={`${SCOREBOARD_HEIGHT}px`} width={'100%'}>
      <vstack padding="small" width={'100%'} height={'100%'}>
        {TeamNameBarComponent(props)}
        <spacer size="xsmall" />
        <vstack padding="medium" width={'100%'} alignment="top center">
          {StatsGrid(stats, columnCount)}
        </vstack>
        <spacer size="xsmall" grow />
        <hstack alignment="center middle">
          <button
            onPress={() => {
              props.setPage(isHomeTeam ? ScoreboardPage.HOME_LINEUP : ScoreboardPage.AWAY_LINEUP);
            }}
          >
            Team Lineup
          </button>
        </hstack>
      </vstack>
    </zstack>
  );
}

function StatsGrid(children: SoccerTeamStat[], count: number): JSX.Element {
  const rows: JSX.Element[] = [];
  const width = 100 / count;
  for (let i = 0; i < children.length; i += count) {
    const row = children.slice(i, i + count).map((c) => StatComponent(c, width));
    const rowHasRoom = (): boolean => row.length < count;
    while (rowHasRoom()) {
      row.push(<text width={width} />);
    }
    rows.push(
      <hstack width={'100%'} gap="small" alignment="start middle">
        {row}
      </hstack>
    );
  }
  return (
    <vstack width={'100%'} gap="small" alignment="start middle">
      {rows}
    </vstack>
  );
}

function StatComponent(stat: SoccerTeamStat, width: number): JSX.Element {
  return (
    <vstack width={width} alignment="start middle">
      <text style="heading">{stat.value === 0 ? `-` : stat.value}</text>
      <text style="metadata">{stat.title}</text>
    </vstack>
  );
}
