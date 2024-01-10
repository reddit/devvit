import { Devvit } from '@devvit/public-api';
import {
  NFLBoxscoreLastEvent,
  NFLGameScoreInfo,
  NFLGameTeam,
} from '../../sports/sportradar/NFLBoxscore.js';
import { EventState, leagueAssetPath } from '../../sports/GameEvent.js';
import { FootballField } from './FootballField.js';
import { Live, TopBar } from '../TopBar.js';
import { eventPeriodString } from '../../sports/espn/espn.js';

function Header(info: NFLGameScoreInfo): JSX.Element {
  const isHalftime = info.clock === `00:00` && info.quarter === 2;
  const isEndOfQuarter = info.clock === `00:00`;
  return (
    <hstack width={'100%'} height={'23%'} backgroundColor="alienblue-700" alignment="center middle">
      <spacer size="small" />
      <vstack width={'20%'} alignment="start middle">
        <text size="medium" style="heading">
          {!isHalftime ? (!isEndOfQuarter ? info.clock : 'End') : 'Halftime'}
        </text>
        {!isHalftime && info.quarter ? (
          <text size="xsmall">{eventPeriodString(info.quarter, 'football')}</text>
        ) : null}
      </vstack>
      <spacer size="xsmall" grow />
      <hstack width={'50%'} height={'48px'}>
        {FootballField({ info })}
      </hstack>
      <spacer size="xsmall" grow />
      <hstack width="20%" alignment="end middle">
        {info.event.state === EventState.LIVE && Live()}
      </hstack>
      <spacer size="small" />
    </hstack>
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
    <hstack height={'100%'} width={'75px'} alignment="start middle" grow>
      <text>🏈</text>
      <spacer width="4px" />
      <vstack alignment="top start">
        {hasPossession ? <text size="medium">{downString}</text> : null}
        <text size="medium">{yardline}</text>
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
      <text size="xxlarge" style="heading">
        {team.points}
      </text>
      {info.event.state === EventState.LIVE && (
        <text size="xsmall" style="metadata">
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
    <hstack width={'100%'} height={'22%'} alignment="start middle">
      <hstack height={'100%'} alignment="start middle" grow>
        <spacer size="small" />
        <image url={logoUrl} imageHeight={32} imageWidth={32} />
        <spacer size="small" />
        <vstack alignment="top start">
          <text size="small">{team.market}</text>
          <text size="large" style="heading">
            {team.name}
          </text>
        </vstack>
      </hstack>
      <hstack alignment="center middle">
        {PossessionComponent(team, info)}
        {ScoreComponent(team, info)}
      </hstack>
      <spacer size="small" />
    </hstack>
  );
}

function LastEvent(event?: NFLBoxscoreLastEvent): JSX.Element {
  return (
    <hstack width="100%" alignment="middle center" padding="small" grow>
      <vstack
        width="100%"
        height="100%"
        alignment="middle start"
        border="thin"
        cornerRadius="full"
        borderColor="alienblue-600"
      >
        <hstack width="100%" grow>
          <spacer size="medium" />
          <vstack alignment="start middle" grow>
            <text size="medium" weight="bold">
              📣 Latest Update ({event?.clock ?? ''})
            </text>
            <text size="small" wrap={true}>
              {event?.description ?? ''}
            </text>
          </vstack>
          {/* <button appearance="primary">Cheer!</button> */}
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
      <vstack width={'100%'} height={'100%'}>
        {props.scoreInfo.event.state === EventState.LIVE && Header(props.scoreInfo)}
        {props.scoreInfo.event.state !== EventState.LIVE &&
          TopBar({ event: props.scoreInfo.event })}

        {Team(false, props.scoreInfo)}
        <hstack border="thin" />
        {Team(true, props.scoreInfo)}

        {props.scoreInfo.event.state === EventState.LIVE && LastEvent(props.scoreInfo.lastEvent)}
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
