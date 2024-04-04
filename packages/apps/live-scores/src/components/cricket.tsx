import { Devvit } from '@devvit/public-api';
import { EventState, leagueAssetPath } from '../sports/GameEvent.js';
import type { CricketMatchScoreInfo } from '../sports/sportradar/CricketModels.js';
import { CricketQualifierType } from '../sports/sportradar/CricketModels.js';
import { ScoreboardPage } from './Scoreboard.js';

export type CricketScoreboardProps = {
  scoreInfo: CricketMatchScoreInfo;
  page: ScoreboardPage;
  setPage: (page: ScoreboardPage) => void;
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

  const timeColor = is_live ? 'red' : '';
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
        <text color={`${timeColor}`} style="heading" size="medium" wrap={true} alignment="center">
          {match_time}
        </text>
        <text style="heading" size="medium" wrap={true} alignment="center">
          &nbsp;{text}
        </text>
      </hstack>
    </hstack>
  );
}

function CricketTeamBlock({
  name,
  logo,
  score,
  displayOvers,
  state,
  isWinningTeam,
}: {
  name: string;
  logo: string;
  score?: string;
  displayOvers: string;
  state: EventState;
  isWinningTeam: boolean;
}): JSX.Element {
  return (
    <vstack padding="small" height={`72px`} width={'100%'} alignment={'middle'}>
      <hstack alignment={'middle'} width={`100%`}>
        <spacer size="small" />
        <image url={logo} imageHeight={32} imageWidth={32} />
        <spacer size="xsmall" />
        <hstack alignment={'start middle'} height={`50px`} grow>
          <text size="large" weight="bold" wrap={true} grow>
            {name}
          </text>
        </hstack>
        <spacer grow />
        <hstack alignment={'bottom'}>
          <text size="xlarge" weight="bold">
            {state === EventState.PRE ? '0' : score?.toString()}
          </text>
          <spacer size="xsmall" />
          <text size="medium" weight="bold">
            {displayOvers}
          </text>
        </hstack>
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

  return (
    <zstack height={`148px`} width={'100%'}>
      <vstack width={'100%'} height={'100%'}>
        {CricketTeamBlock({
          name: scoreInfo.event.homeTeam.name,
          logo: leagueAssetPath(scoreInfo.event) + scoreInfo.event.homeTeam.logo,
          score: scoreInfo.homeScore,
          displayOvers: scoreInfo.homeDisplayOvers,
          state: scoreInfo.event.state,
          isWinningTeam: scoreInfo.winningQualifier === CricketQualifierType.Home,
        })}
        <hstack border="thick" lightBorderColor="#EEF1F3" darkBorderColor="#04090A" />
        {CricketTeamBlock({
          name: scoreInfo.event.awayTeam.name,
          logo: leagueAssetPath(scoreInfo.event) + scoreInfo.event.awayTeam.logo,
          score: scoreInfo.awayScore,
          displayOvers: scoreInfo.awayDisplayOvers,
          state: scoreInfo.event.state,
          isWinningTeam: scoreInfo.winningQualifier === CricketQualifierType.Away,
        })}
      </vstack>
    </zstack>
  );
}

function BottomBar(props: CricketScoreboardProps): JSX.Element {
  const scoreInfo = props.scoreInfo;
  return (
    <vstack
      alignment={'middle'}
      width={'100%'}
      height={`120px`}
      lightBackgroundColor="#EEF1F3"
      darkBackgroundColor="#04090A"
    >
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
    </vstack>
  );
}
