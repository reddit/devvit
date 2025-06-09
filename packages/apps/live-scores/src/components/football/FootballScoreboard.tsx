import { Devvit } from '@devvit/public-api';

import type { Reaction, ReactionScore } from '../../Reactions.js';
import { eventPeriodString } from '../../sports/espn/espn.js';
import { EventState, leagueAssetPath } from '../../sports/GameEvent.js';
import type {
  NFLBoxscoreLastEvent,
  NFLGameScoreInfo,
} from '../../sports/sportradar/NFLBoxscore.js';
import { getCurrentEventData, getPositionAndTotalEvents } from '../../utils/football/events.js';
import type { CurrentEventData, DevvitState, Nullable } from '../../utils/types.js';
import type { OnReactionPress } from '../ReactionsButtons.js';
import { Reactions } from '../ReactionsButtons.js';
import { TopBar } from '../TopBar.js';
import { FootballField } from './FootballField.js';

enum Color {
  primaryFont = '#F2F4F5',
  secondaryFont = '#B8C5C9',
  offlineFont = '#FFFFFF40',
  liveRed = '#FF4500',
  offline = '#82959B',
  transparentHeader = '#0B1416b3',
  border = '#485A66',
  reactionBorder = '#8A8D86',
}

function Header(info: NFLGameScoreInfo, isOnline: boolean): JSX.Element {
  const isHalftime = info.clock === `00:00` && info.quarter === 2;
  const isEndOfQuarter = info.clock === `00:00`;
  return (
    <vstack width={'100%'} height={'84px'} backgroundColor="#0B1416b3" alignment="center middle">
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
              {isOnline ? (
                <text size="small" style="heading" color={Color.liveRed}>
                  Live
                </text>
              ) : (
                <text size="small" style="heading" color={Color.offline}>
                  Offline
                </text>
              )}
            </>
          ) : null}
        </hstack>
        <spacer size="xsmall" />
        <hstack width={'100%'} height={'48px'}>
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

function PossessionComponent(teamId: string, info: NFLGameScoreInfo): JSX.Element {
  if (
    info.event.state !== EventState.LIVE ||
    info.situation === undefined ||
    teamId !== info.situation.possession.id
  ) {
    return <></>;
  }

  const hasPossession = info.situation.down > 0 && info.situation.yfd > 0;
  const downString = `${down(info.situation.down)} & ${info.situation.yfd}`;
  const yardline = info.situation.location.alias + ' ' + info.situation.location.yardline;
  return (
    <hstack height={'100%'} alignment="start middle" grow>
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

function timeoutsLeftString(tol: number): string {
  return '●'.repeat(tol) + '○'.repeat(3 - tol);
}

function ScoreComponent(timeouts: number, score: string, info: NFLGameScoreInfo): JSX.Element {
  return (
    <vstack height="100%" width={'52px'} alignment="end middle">
      <text color={Color.primaryFont} size="xlarge" style="heading">
        {score}
      </text>
      {info.event.state === EventState.LIVE && (
        <text color={Color.secondaryFont} size="xsmall" style="metadata">
          {timeoutsLeftString(timeouts)}
        </text>
      )}
    </vstack>
  );
}

function Team(isHome: boolean, info: NFLGameScoreInfo): JSX.Element {
  if (!info.summary) {
    const logo = isHome ? info.event.homeTeam.logo : info.event.awayTeam.logo;
    const team = isHome ? info.event.homeTeam : info.event.awayTeam;
    const score = isHome ? info.homeScore : info.awayScore;
    const logoUrl = leagueAssetPath(info.event) + logo;
    const timeoutsRemaining = isHome ? info.timeouts?.home : info.timeouts?.away;
    return (
      <hstack width={'100%'} height={'58px'} alignment="start middle">
        <hstack height={'100%'} alignment="start middle" grow>
          <spacer size="small" />
          <image url={logoUrl} height={'32px'} width={'32px'} imageHeight={240} imageWidth={240} />
          <spacer size="small" />
          <vstack alignment="top start">
            <text color={Color.primaryFont} size="small">
              {team.location}
            </text>
            <text color={Color.primaryFont} size="large" style="heading">
              {team.name}
            </text>
          </vstack>
        </hstack>
        <hstack height={'100%'} alignment="center middle">
          {PossessionComponent(team.id, info)}
          {ScoreComponent(timeoutsRemaining ?? 3, score, info)}
        </hstack>
        <spacer size="small" />
      </hstack>
    );
  }

  const team = isHome ? info.summary.home : info.summary.away;
  const logo = isHome ? info.event.homeTeam.logo : info.event.awayTeam.logo;
  const logoUrl = leagueAssetPath(info.event) + logo;
  return (
    <hstack width={'100%'} height={'58px'} alignment="start middle">
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
        {PossessionComponent(team.id, info)}
        {ScoreComponent(team.remaining_timeouts, String(team.points), info)}
      </hstack>
      <spacer size="small" />
    </hstack>
  );
}

function LastEvent(
  lastEventData: CurrentEventData,
  onReactionPress: (reaction: Reaction, eventId?: string) => Promise<void>,
  onClick: () => void,
  reactions: ReactionScore[] | undefined,
  isOnline: boolean
): JSX.Element {
  return (
    <vstack width="100%" height={'128px'} alignment="bottom center" padding="small">
      <spacer size="small" grow />
      <vstack
        width="100%"
        maxHeight={'112px'}
        alignment="start bottom"
        border="thin"
        cornerRadius="medium"
        borderColor={Color.border}
        backgroundColor="#0B1416b3"
        grow
      >
        <hstack height="8px" width={100} onPress={onClick} />
        <hstack width="100%" grow onPress={onClick}>
          <spacer size="medium" />
          <vstack alignment="start top" grow>
            <text color={Color.primaryFont} size="medium" weight="bold">
              {lastEventData.primaryString}
            </text>
            <text
              color={Color.secondaryFont}
              size="small"
              wrap={true}
              grow
              maxHeight={reactions ? '36px' : '48px'}
              overflow="ellipsis"
            >
              {lastEventData.secondaryString}
            </text>
          </vstack>
          <spacer grow />
          <icon name="expand-right-outline" size="small" color="#82959B" />
          <spacer size="small" />
        </hstack>
        <hstack height="4px" width={100} onPress={onClick} />
        {reactions ? (
          <hstack width={100}>
            <vstack width="12px" height={100} onPress={onClick} />
            {Reactions(reactions, onReactionPress, isOnline)}
            <vstack grow height={100} onPress={onClick} />
          </hstack>
        ) : null}
        <hstack height="4px" width={100} onPress={onClick} />
      </vstack>
      <spacer size="small" />
    </vstack>
  );
}

function EventOverlay(
  eventData: CurrentEventData,
  onClose: () => void,
  onReactionPress: Nullable<(reaction: Reaction) => Promise<void>>,
  reactions: ReactionScore[] | undefined,
  isOnline: boolean,
  totalEventCount: number,
  currentPosition: number,
  onNavigatePrev: Nullable<() => void>,
  onNavigateNext: Nullable<() => void>,
  onResetNavigation: Nullable<() => void>
): JSX.Element {
  const activeNavigationColor = '#F2F4F5';
  const inactiveNavigationColor = '#FFFFFF40';
  const prevColor = onNavigatePrev ? activeNavigationColor : inactiveNavigationColor;
  const nextColor = onNavigateNext ? activeNavigationColor : inactiveNavigationColor;
  const resetNavigationColor = onNavigateNext ? activeNavigationColor : inactiveNavigationColor;
  return (
    <vstack width={100} height={100} backgroundColor="black" padding="medium">
      <hstack alignment="center middle" width={100}>
        <vstack grow>
          <text wrap maxWidth="80%" style="heading" color="white">
            {eventData.primaryString}
          </text>
          {totalEventCount ? (
            <text color="#82959B" style="metadata">
              {currentPosition} of {totalEventCount}
            </text>
          ) : null}
        </vstack>
        <spacer size="small" grow />
        <hstack
          alignment="center middle"
          width="32px"
          height="32px"
          cornerRadius="full"
          backgroundColor="#1A282D"
          onPress={onClose}
        >
          <icon name="close-outline" color="#F2F4F5" size="small" />
        </hstack>
      </hstack>
      <spacer size="medium" />
      <text style="metadata" color="#B8C5C9" wrap size="medium">
        {eventData.secondaryString}
      </text>
      <spacer grow />
      {reactions ? (
        <hstack alignment="start middle">{Reactions(reactions, onReactionPress, isOnline)}</hstack>
      ) : null}
      {totalEventCount ? (
        <>
          <spacer size="small" />
          <vstack width={100}>
            <hstack width={100} height="1px" backgroundColor="#FFFFFF33" />
            <spacer size="small" />
            <hstack alignment="center middle" width={100}>
              <hstack alignment="center middle" onPress={onNavigatePrev || undefined}>
                <icon name="left-fill" color={prevColor} size="small" />
                <text color={prevColor} size="small" weight="bold">
                  Prev
                </text>
              </hstack>
              <spacer grow></spacer>
              <hstack onPress={onResetNavigation || undefined}>
                <text color={resetNavigationColor} size="small" weight="bold">
                  Jump to latest
                </text>
              </hstack>
              <spacer grow></spacer>
              <hstack alignment="center middle" onPress={onNavigateNext || undefined}>
                <text color={nextColor} size="small" weight="bold">
                  Next
                </text>
                <icon name="right-fill" color={nextColor} size="small" />
              </hstack>
            </hstack>
          </vstack>
        </>
      ) : null}
    </vstack>
  );
}

export interface FootballScoreboardProps {
  scoreInfo: NFLGameScoreInfo;
  reactions: ReactionScore[] | undefined;
  pastReactions: ReactionScore[] | undefined;
  onReactionPress: OnReactionPress;
  isOnline: boolean;
  lastEventOverlayState: DevvitState<CurrentEventData | null>;
  navigationEventOverride: NFLBoxscoreLastEvent | null;
  gameEventIds: string[];
  onNavigateNext: Nullable<() => void>;
  onNavigatePrev: Nullable<() => void>;
  onResetNavigation: Nullable<() => void>;
}

export function FootballScoreboard(
  props: FootballScoreboardProps,
  demoNext: () => void | Promise<void>
): JSX.Element {
  const [lastEventOverlay, setLastEventOverlay] = props.lastEventOverlayState;
  const { onNavigateNext, onNavigatePrev, onResetNavigation } = props;

  const { currentPosition, totalEventCount } = getPositionAndTotalEvents(
    props.gameEventIds,
    props.scoreInfo,
    props.navigationEventOverride
  );
  const overlayEventData = getCurrentEventData(props.scoreInfo, props.navigationEventOverride);
  const lastEventData = getCurrentEventData(props.scoreInfo, null);
  const openEventOverlay = (): void => {
    setLastEventOverlay(overlayEventData);
  };

  const closeLastEventOverlay = (): void => {
    setLastEventOverlay(null);
    if (onResetNavigation) {
      onResetNavigation();
    }
  };

  const onOverlayReactionPress = props.navigationEventOverride ? null : props.onReactionPress;
  return (
    <zstack width={'100%'} height={'100%'}>
      <image
        width={'100%'}
        height={'100%'}
        imageWidth={560}
        imageHeight={320}
        url="football/background.png"
        resizeMode="cover"
      />
      <vstack width={'100%'} height={'100%'}>
        {props.scoreInfo.event.state === EventState.LIVE && Header(props.scoreInfo, props.isOnline)}
        {props.scoreInfo.event.state !== EventState.LIVE &&
          TopBar({
            event: props.scoreInfo.event,
            color: Color.transparentHeader,
            height: '84px',
            isOnline: props.isOnline,
          })}
        {Team(false, props.scoreInfo)}
        <hstack border="thin" />
        {Team(true, props.scoreInfo)}
        <hstack width={100}>
          {LastEvent(
            lastEventData,
            props.onReactionPress,
            openEventOverlay,
            props.reactions,
            props.isOnline
          )}
        </hstack>
      </vstack>
      {lastEventOverlay
        ? EventOverlay(
            overlayEventData,
            closeLastEventOverlay,
            onOverlayReactionPress,
            props.navigationEventOverride ? props.pastReactions : props.reactions,
            props.isOnline,
            totalEventCount,
            currentPosition,
            onNavigatePrev,
            onNavigateNext,
            onResetNavigation
          )
        : null}
      {props.scoreInfo.event.id.startsWith(`demo-nfl-game`) ||
        (props.scoreInfo.event.id.startsWith(`demo-gs-nfl`) && (
          <hstack width={'100%'} height={'100%'} alignment="end bottom">
            <button maxWidth={100} onPress={() => demoNext()}>
              Next
            </button>
          </hstack>
        ))}
    </zstack>
  );
}
