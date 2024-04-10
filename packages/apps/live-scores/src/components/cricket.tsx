import { Devvit } from '@devvit/public-api';
import { EventState, leagueAssetPath } from '../sports/GameEvent.js';
import type {
  CricketMatchScoreInfo,
  CricketScoreInfoStats,
} from '../sports/sportradar/CricketModels.js';
import { CricketQualifierType } from '../sports/sportradar/CricketModels.js';
import { ScoreboardPage } from './Scoreboard.js';
import type { ScoreboardProps } from './Scoreboard.js';

export type CricketScoreboardProps = ScoreboardProps & {
  scoreInfo: CricketMatchScoreInfo;
};

export function CricketScoreboard(props: CricketScoreboardProps): JSX.Element {
  return (
    <blocks height="regular">
      <vstack cornerRadius="medium" height={'100%'} width={'100%'}>
        {topBarCricketComponent({
          is_live: props.scoreInfo.isLive,
          match_time: props.scoreInfo.matchTime,
          match_number: props.scoreInfo.matchNumber,
          league: props.scoreInfo.event.league.toUpperCase(),
          location: props.scoreInfo.location,
        })}
        {props.page === ScoreboardPage.SCORE && ScoreComponent(props)}
        {BottomBar(props)}
      </vstack>
    </blocks>
  );
}

export type TopBarCricket = {
  is_live: boolean;
  match_time: string;
  match_number?: string;
  league: string;
  location?: string;
};

export function topBarCricketComponent(cricketProps: TopBarCricket): JSX.Element {
  const { is_live, match_time, league, location } = cricketProps;

  const timeColor = is_live ? '#FF4500' : '';
  // let text = '';

  // if (match_number !== undefined && match_number !== null) {
  //   text += `${match_number} • `;
  // }

  let text = `• ${league} `;

  if (location !== undefined) {
    text += ` • ${location}`;
  }

  return (
    <hstack height="58px" padding="medium" alignment="center middle">
      <hstack alignment="center" grow>
        {is_live === true ? (
          <text color={`${timeColor}`} style="heading" size="medium" wrap={true} alignment="center">
            {match_time}
          </text>
        ) : (
          <text
            style="heading"
            size="medium"
            wrap={true}
            alignment="center"
            lightColor="#181C1F"
            darkColor="#82959B"
          >
            {match_time}
          </text>
        )}
        <text
          style="heading"
          size="medium"
          wrap={true}
          alignment="center"
          lightColor="#181C1F"
          darkColor="#82959B"
        >
          &nbsp;{text}
        </text>
      </hstack>
    </hstack>
  );
}

export function splitNameInTwoLines(name: string): [string, string] {
  let firstLine: string = name;
  let secondLine: string = '';

  const totalChars = name.length;

  if (totalChars <= 15) {
    return [firstLine, secondLine];
  }
  const namesArray = name.split(' ');

  if (namesArray.length === 2) {
    firstLine = namesArray[0].trim();
    secondLine = namesArray[1].trim();
    return [firstLine, secondLine];
  }

  let remainingIndexes = namesArray.length - 1;
  for (let i = remainingIndexes; i >= 0; i--) {
    secondLine = namesArray[i] + ' ' + secondLine;
    // I was trying to find a balance were it would break in a nice way.
    // The idea is that the second line has more text than the first one.
    if (secondLine.length >= totalChars / 2.7) {
      remainingIndexes = i;
      break;
    }
  }
  firstLine = '';
  for (let i = 0; i < remainingIndexes; i++) {
    firstLine += namesArray[i] + ' ';
  }

  return [firstLine.trim(), secondLine.trim()];
}

function CricketTeamBlock({
  name,
  logo,
  score,
  state,
  isWinningTeam,
  stats,
}: {
  name: string;
  logo: string;
  score?: string;
  state: EventState;
  isWinningTeam: boolean;
  stats: CricketScoreInfoStats;
}): JSX.Element {
  const [firstLine, secondLine] = splitNameInTwoLines(name);

  return (
    <vstack padding="small" height={`72px`} width={'100%'} alignment={'middle'}>
      <hstack alignment={'middle'} width={`100%`}>
        <spacer size="small" />
        <image url={logo} imageHeight={32} imageWidth={32} />
        <spacer size="medium" />
        <vstack alignment={'start middle'}>
          <text size="large" weight="bold" wrap={true}>
            {firstLine}
          </text>
          {secondLine !== '' ? (
            <text size="large" weight="bold" wrap={true}>
              {secondLine}
            </text>
          ) : null}
        </vstack>
        <spacer grow />
        <vstack>
          <hstack alignment={'bottom end'}>
            <text size="xlarge" weight="bold">
              {state === EventState.PRE ? '0' : (score ?? 0).toString()}
            </text>
            <spacer size="xsmall" />
            <text size="medium" weight="bold">
              ({stats.displayOvers})
            </text>
          </hstack>
          {stats.battingStats !== null ? (
            <text
              size="xsmall"
              weight="bold"
              alignment="end"
              lightColor="#576F76"
              darkColor="#82959B"
            >
              {stats.battingStats}
            </text>
          ) : null}
          {stats.bowlingStats !== null ? (
            <text
              size="xsmall"
              weight="bold"
              alignment="end"
              lightColor="#576F76"
              darkColor="#82959B"
            >
              {stats.bowlingStats}
            </text>
          ) : null}
        </vstack>
        <spacer size="xsmall" />
        {isWinningTeam ? (
          <icon
            width={'20px'}
            height={'20px'}
            name="caret-left-fill"
            lightColor="#0F1A1C"
            darkColor="#F2F4F5"
          />
        ) : (
          <spacer width={'20px'} height={'20px'} />
        )}
      </hstack>
    </vstack>
  );
}

function ScoreComponent(props: CricketScoreboardProps): JSX.Element {
  const scoreInfo = props.scoreInfo;

  const homeTeamBlock = CricketTeamBlock({
    name: scoreInfo.event.homeTeam.name,
    logo: leagueAssetPath(scoreInfo.event) + scoreInfo.event.homeTeam.logo,
    score: scoreInfo.homeScore,
    state: scoreInfo.event.state,
    isWinningTeam: scoreInfo.winningQualifier === CricketQualifierType.Home,
    stats: scoreInfo.homeInfoStats,
  });

  const awayTeamBlock = CricketTeamBlock({
    name: scoreInfo.event.awayTeam.name,
    logo: leagueAssetPath(scoreInfo.event) + scoreInfo.event.awayTeam.logo,
    score: scoreInfo.awayScore,
    state: scoreInfo.event.state,
    isWinningTeam: scoreInfo.winningQualifier === CricketQualifierType.Away,
    stats: scoreInfo.awayInfoStats,
  });

  return (
    <zstack height={`148px`} width={'100%'}>
      <vstack width={'100%'} height={'100%'}>
        {props.scoreInfo.firstBattingQualifier === CricketQualifierType.Home
          ? homeTeamBlock
          : awayTeamBlock}
        <hstack border="thick" lightBorderColor="#EEF1F3" darkBorderColor="#04090A" />
        {props.scoreInfo.firstBattingQualifier === CricketQualifierType.Home
          ? awayTeamBlock
          : homeTeamBlock}
      </vstack>
    </zstack>
  );
}

function BottomBar(props: CricketScoreboardProps): JSX.Element {
  const scoreInfo = props.scoreInfo;
  return (
    <vstack
      alignment={'middle'}
      height={`120px`}
      lightBackgroundColor="#EEF1F3"
      darkBackgroundColor="#04090A"
    >
      <spacer grow />
      <text style="heading" size="medium" weight="bold" alignment="center">
        {scoreInfo.bottomBarFirstLine}
      </text>
      {scoreInfo.bottomBarSecondLine !== undefined ? (
        <text
          style="heading"
          size="medium"
          weight="bold"
          alignment="center"
          lightColor="#576F76"
          darkColor="#82959B"
        >
          {scoreInfo.bottomBarSecondLine}
        </text>
      ) : null}
      {scoreInfo.chatUrl !== undefined && scoreInfo.chatUrl !== '' ? (
        <spacer size="medium" />
      ) : null}
      {scoreInfo.chatUrl !== undefined && scoreInfo.chatUrl !== '' ? (
        <hstack alignment={'middle center'}>
          <spacer grow />
          <button
            size="small"
            appearance="primary"
            onPress={() => {
              if (scoreInfo.chatUrl !== undefined) {
                props.onNavigateTo(scoreInfo.chatUrl).catch((err) => console.log(err));
              }
            }}
          >
            Join the Chat
          </button>
          <spacer grow />
        </hstack>
      ) : null}
      <spacer grow />
    </vstack>
  );
}
