import { Devvit } from '@devvit/public-api';
import { NFLGameScoreInfo, NFLGameTeam } from '../../sports/sportradar/NFLBoxscore.js';
import { EventState, leagueAssetPath } from '../../sports/GameEvent.js';
import { FootballField } from './FootballField.js';
import { TopBar } from '../TopBar.js';
import { eventPeriodString } from '../../sports/espn/espn.js';

enum Color {
  primaryFont = '#F2F4F5',
  secondaryFont = '#B8C5C9',
  liveRed = '#FF4500',
  transparentHeader = '#0B1416b3',
}

function Header(info: NFLGameScoreInfo): JSX.Element {
  const isHalftime = info.clock === `00:00` && info.quarter === 2;
  const isEndOfQuarter = info.clock === `00:00`;
  return (
    <vstack width={'100%'} height={'30%'} backgroundColor="#0B1416b3" alignment="center middle">
      <vstack maxWidth={'296px'} width={'90%'} alignment="center middle">
        <hstack gap="small" width={'100%'} alignment="center middle">
          <text size="small" style="heading" color={Color.primaryFont}>
            {!isHalftime ? (!isEndOfQuarter ? info.clock : 'End') : 'Halftime'}
          </text>
          {!isHalftime && info.quarter ? (
            <>
              <text size="small" style="heading" color={Color.primaryFont}>{` • `}</text>
              <text size="small" style="heading" color={Color.primaryFont}>
                {eventPeriodString(info.quarter, 'football')}
              </text>
            </>
          ) : null}
          {info.event.state === EventState.LIVE ? (
            <>
              <text size="small" style="heading" color={Color.primaryFont}>{` • `}</text>
              <text size="small" style="heading" color={Color.liveRed}>
                Live
              </text>
            </>
          ) : null}
        </hstack>
        <spacer size="xsmall" />
        <hstack width={'100%'} height={'56px'}>
          {FootballField({ info })}
        </hstack>
      </vstack>
    </vstack>
  );
}

function down(num: number): string {
  switch (num) {
    case 1:
      return '1st';
    case 2:
      return '2nd';
    case 3:
      return '3rd';
    case 4:
      return '4th';
    default:
      return '';
  }
}

function PossessionComponent(team: NFLGameTeam, info: NFLGameScoreInfo): JSX.Element {
  if (
    info.event.state !== EventState.LIVE ||
    info.situation === undefined ||
    team.id !== info.situation.possession.id
  ) {
    return <></>;
  }

  const hasPossession = info.situation.down > 0 && info.situation.yfd > 0;
  const downString = `${down(info.situation.down)} & ${info.situation.yfd}`;
  const yardline = info.situation.location.alias + ' ' + info.situation.location.yardline;
  return (
    <hstack height={'100%'} alignment="start middle" grow>
      <text>🏈</text>
      <spacer width="4px" />
      <vstack height={'100%'} alignment="start middle">
        {hasPossession ? (
          <text color="#B8C5C9" size="medium">
            {downString}
          </text>
        ) : null}
        <text color="#B8C5C9" size="medium">
          {yardline}
        </text>
      </vstack>
    </hstack>
  );
}

function timeoutsLeftString(tol: number) {
  return '●'.repeat(tol) + '○'.repeat(3 - tol);
}

function ScoreComponent(team: NFLGameTeam, info: NFLGameScoreInfo): JSX.Element {
  return (
    <vstack height="100%" width={'44px'} alignment="end middle">
      <text color={Color.primaryFont} size="xlarge" style="heading">
        {team.points}
      </text>
      {info.event.state === EventState.LIVE && (
        <text color={Color.secondaryFont} size="xsmall" style="metadata">
          {timeoutsLeftString(team.remaining_timeouts)}
        </text>
      )}
    </vstack>
  );
}

function Team(isHome: Boolean, info: NFLGameScoreInfo): JSX.Element {
  let team = isHome ? info.summary.home : info.summary.away;
  let logo = isHome ? info.event.homeTeam.logo : info.event.awayTeam.logo;
  let logoUrl = leagueAssetPath(info.event) + logo;
  return (
    <hstack width={'100%'} height={'20%'} alignment="start middle">
      <hstack height={'100%'} alignment="start middle" grow>
        <spacer size="small" />
        <image url={logoUrl} height={'32px'} width={'32px'} imageHeight={240} imageWidth={240} />
        <spacer size="small" />
        <vstack alignment="top start">
          <text color={Color.primaryFont} size="small">
            {team.market}
          </text>
          <text color={Color.primaryFont} size="large" style="heading">
            {team.name}
          </text>
        </vstack>
      </hstack>
      <hstack height={'100%'} alignment="center middle">
        {PossessionComponent(team, info)}
        {ScoreComponent(team, info)}
      </hstack>
      <spacer size="small" />
    </hstack>
  );
}

function LastEvent(info: NFLGameScoreInfo): JSX.Element {
  let primaryString: string | undefined;
  let secondaryString: string | undefined;

  if (info.event.state === EventState.FINAL) {
    primaryString = `📣 Game has ended`;
    secondaryString = `Join the discussion in the comments!`;
  } else if (info.lastEvent) {
    primaryString = `📣 Latest Update (${info.lastEvent.clock ?? ''})`;
    secondaryString = info.lastEvent.description ?? '';
  } else {
    primaryString = `🏈 Game has not started yet`;
    secondaryString = `Join the discussion in the comments!`;
  }

  return (
    <hstack width="100%" alignment="middle center" padding="small" grow>
      <vstack
        width="100%"
        height="100%"
        alignment="middle start"
        border="thin"
        cornerRadius="medium"
        borderColor="#485A66"
        backgroundColor="#0B1416b3"
      >
        <hstack width="100%" grow>
          <spacer size="medium" />
          <vstack alignment="start middle" grow>
            <text color={Color.primaryFont} size="medium" weight="bold">
              {primaryString}
            </text>
            <text color={Color.secondaryFont} size="small" wrap={true}>
              {secondaryString}
            </text>
          </vstack>
          <spacer size="small" />
        </hstack>
      </vstack>
    </hstack>
  );
}

export interface FootballScoreboardProps {
  scoreInfo: NFLGameScoreInfo;
}

export function FootballScoreboard(
  props: FootballScoreboardProps,
  demoNext: () => void | Promise<void>
): JSX.Element {
  return (
    <zstack width={'100%'} height={'100%'}>
      <image
        width={'100%'}
        height={'100%'}
        imageWidth={1136}
        imageHeight={648}
        url="football/background.png"
        resizeMode="cover"
      />
      <vstack width={'100%'} height={'100%'}>
        {props.scoreInfo.event.state === EventState.LIVE && Header(props.scoreInfo)}
        {props.scoreInfo.event.state !== EventState.LIVE &&
          TopBar({ event: props.scoreInfo.event, color: Color.transparentHeader, height: '30%' })}
        {Team(false, props.scoreInfo)}
        <hstack border="thin" />
        {Team(true, props.scoreInfo)}
        {LastEvent(props.scoreInfo)}
      </vstack>
      {props.scoreInfo.event.id.startsWith(`demo-nfl-game`) && (
        <hstack width={'100%'} height={'100%'} alignment="end bottom">
          <button maxWidth={100} onPress={() => demoNext()}>
            Next
          </button>
        </hstack>
      )}
    </zstack>
  );
}
