import { Devvit } from '@devvit/public-api';
import type {
  BasketballGameScoreInfo,
  BasketballGameScoreInfoPeriod,
} from '../../sports/sportradar/BasketballPlayByPlay.js';
import { eventPeriodStringShort } from '../../sports/espn/espn.js';
import { EventState, leagueAssetPath } from '../../sports/GameEvent.js';
import { NBA_TEAM_COLOR_MAP } from '../../sports/ColorMaps.js';
import {
  BasketballEventType,
  getEventAtIndex,
  titleForEventType,
  totalEventsCount,
} from '../../sports/sportradar/BasketballPlayByPlayEvents.js';
import type { Nullable } from '../../utils/types.js';
import { msToHMS } from '../TopBar.js';

enum Color {
  primaryFont = '#F2F4F5',
  secondaryFont = '#B8C5C9',
  offlineFont = '#FFFFFF40',
  liveRed = '#FF4500',
  offline = '#82959B',
  transparentHeader = '#0B1416b3',
  transparentBorder = '#FFFFFF80',
  border = '#485A66',
  reactionBorder = '#8A8D86',
  courtBrown = '#6A3C00',
  greyBackground = '#33464C',
}

const headerHeight = 76;
const appWindowHeight = 320;

function Clock(info: BasketballGameScoreInfo): JSX.Element {
  if (info.event.state === EventState.PRE) {
    const gameTime = new Date(info.event.date).getTime();
    const currentTime = new Date().getTime();
    const timeDifference = gameTime - currentTime;

    return (
      <hstack width={'100%'} height={'100%'} alignment="top center" padding="small">
        <hstack
          height={'24px'}
          width={'144px'}
          backgroundColor={Color.transparentHeader}
          cornerRadius="full"
          alignment="middle center"
          gap="medium"
          borderColor={Color.transparentBorder}
        >
          <text size="small" style="metadata" color={Color.secondaryFont}>
            {timeDifference > 0
              ? `Starting in ${msToHMS(gameTime - currentTime)}`
              : 'Starting soon'}
          </text>
        </hstack>
      </hstack>
    );
  }

  if (info.event.state === EventState.FINAL) {
    return (
      <hstack width={'100%'} height={'100%'} alignment="top center" padding="small">
        <hstack
          height={'24px'}
          width={'144px'}
          backgroundColor={Color.transparentHeader}
          cornerRadius="full"
          alignment="middle center"
          gap="medium"
          borderColor={Color.transparentBorder}
        >
          <text size="small" style="metadata" color={Color.secondaryFont}>
            Game Over
          </text>
        </hstack>
      </hstack>
    );
  }
  return (
    <hstack width={'100%'} height={'100%'} alignment="top center" padding="small">
      <zstack
        height={'24px'}
        width={'144px'}
        backgroundColor={Color.transparentHeader}
        cornerRadius="full"
        alignment="middle center"
        gap="medium"
        borderColor={Color.transparentBorder}
      >
        <hstack width={'100%'} height={'100%'} alignment="start middle">
          <spacer size="small" />
          <text size="small" style="heading" color={Color.primaryFont}>
            {eventPeriodStringShort(info.event.timingInfo.period, 'basketball', info.event.league)}
          </text>
        </hstack>
        <hstack width={'100%'} height={'100%'} alignment="end middle">
          <image
            imageWidth={'57px'}
            imageHeight={'64px'}
            height={'100%'}
            width={'24px'}
            url="pulse.gif"
            resizeMode="cover"
          />
          <spacer size="xsmall" />
        </hstack>
        <text size="small" style="heading" color={Color.primaryFont}>
          {info.event.timingInfo.displayClock}
        </text>
      </zstack>
    </hstack>
  );
}

function Team(info: BasketballGameScoreInfo, isHome: Boolean): JSX.Element {
  const team = isHome ? info.event.homeTeam : info.event.awayTeam;
  const score = isHome ? info.homeScore : info.awayScore;
  const logoUrl = leagueAssetPath(info.event) + team.logo;
  const outerAlignment = isHome ? 'end bottom' : 'start bottom';
  const innerAlignment = isHome ? 'end middle' : 'start middle';
  const teamColor = NBA_TEAM_COLOR_MAP[team.abbreviation.toLowerCase()];
  const teamName = info.event.league === 'ncaamb' ? team.abbreviation : team.name;

  return (
    <vstack width={'50%'} height={'100%'} alignment={outerAlignment}>
      <hstack width={'100%'} alignment={outerAlignment}>
        <spacer size="small" />
        {isHome ? null : (
          <>
            <image imageWidth="48px" imageHeight="48px" url={logoUrl} />
            <spacer size="xsmall" />
          </>
        )}
        <vstack height={'48px'} alignment={innerAlignment}>
          <text size="xxlarge" style="heading" color={Color.primaryFont}>
            {score}
          </text>
          <text size="medium" style="metadata" color={Color.primaryFont}>
            {teamName.toLocaleUpperCase()}
          </text>
        </vstack>
        {isHome ? (
          <>
            <spacer size="xsmall" />
            <image imageWidth="48px" imageHeight="48px" url={logoUrl} />
          </>
        ) : null}
        <spacer size="small" />
      </hstack>
      <spacer size="small" />
      <hstack width={'100%'} height={'4px'} backgroundColor={teamColor} />
    </vstack>
  );
}

function Teams(info: BasketballGameScoreInfo): JSX.Element {
  return (
    <hstack width={'100%'} height={'100%'} alignment="bottom center">
      {Team(info, false)}
      {Team(info, true)}
    </hstack>
  );
}

function Header(info: BasketballGameScoreInfo): JSX.Element {
  return (
    <zstack
      width={'100%'}
      height={`${headerHeight}px`}
      alignment="center top"
      backgroundColor={Color.transparentHeader}
    >
      {Teams(info)}
      {Clock(info)}
    </zstack>
  );
}

const reactionsHeight = 64;
const eventHeaderHeight = 24;
const navigationHeight = 48;
const spacersHeight = 16 + 4 + 1;
const descriptionHeight =
  appWindowHeight -
  headerHeight -
  eventHeaderHeight -
  reactionsHeight -
  navigationHeight -
  spacersHeight;

function EventBubble(props: BasketballScoreboardProps): JSX.Element {
  const info = props.info;

  if (!info.periods || info.periods.length === 0 || info.event.state === EventState.PRE) {
    return (
      <vstack width={'100%'} height={`${320 - headerHeight}px`}>
        <hstack width={'100%'} height={'100%'} alignment="middle center">
          <text style="heading" size="large" color={Color.primaryFont}>
            Game has not started.
          </text>
        </hstack>
      </vstack>
    );
  }

  const currentPeriod: BasketballGameScoreInfoPeriod = info.periods[info.periods.length - 1];
  const latestEvent = currentPeriod.events[currentPeriod.events.length - 1];

  if (info.event.state === EventState.FINAL) {
    latestEvent.event_type = BasketballEventType.endofgame;
    latestEvent.description = `Final Score ${Math.max(info.homeScore, info.awayScore)} - ${Math.min(
      info.homeScore,
      info.awayScore
    )}.`;
  }

  const totalEvents = totalEventsCount(info);
  const eventNumber = props.eventIndexOverride === -1 ? totalEvents : props.eventIndexOverride + 1;

  const displayEvent =
    props.eventIndexOverride >= 0
      ? getEventAtIndex(props.eventIndexOverride, info) ?? latestEvent
      : latestEvent;

  const hideClockTime = info.event.state === EventState.FINAL && props.eventIndexOverride === -1;

  return (
    <vstack width={'100%'} height={`${appWindowHeight - headerHeight}px`}>
      <spacer size="medium" />

      <hstack width={'100%'} height={`${eventHeaderHeight}px`} alignment="middle">
        <spacer size="medium" />
        <hstack grow height={'100%'} alignment="start middle">
          <text style="heading" size="large" color={Color.primaryFont}>
            {titleForEventType(displayEvent.event_type)}{' '}
            {hideClockTime ? null : `(${displayEvent.clock})`}
          </text>
        </hstack>
        <hstack grow height={'100%'} alignment="end middle">
          <text style="metadata" color={Color.secondaryFont}>
            {eventNumber} of {totalEvents}
          </text>
        </hstack>
        <spacer size="medium" />
      </hstack>

      <spacer size="xsmall" />
      <hstack width={'100%'} height={`${descriptionHeight}px`} alignment="start top">
        <spacer size="medium" />
        <text
          size="medium"
          color={Color.secondaryFont}
          maxHeight={`${descriptionHeight}px`}
          grow
          wrap
        >
          {displayEvent.description}
        </text>
        <spacer size="medium" />
      </hstack>

      <hstack width={'100%'} height={`${reactionsHeight}px`} alignment="middle center">
        <spacer size="medium" />
        {/* <text color={Color.primaryFont}>Reactions go here</text> */}
        <spacer size="medium" />
      </hstack>

      <hstack width={'100%'} height={'1px'} backgroundColor={Color.transparentBorder} />

      <hstack width={'100%'} height={`${navigationHeight}px`} alignment="middle">
        <hstack
          width={'64px'}
          height={'100%'}
          alignment="start middle"
          onPress={props.onNavigatePrev ?? undefined}
        >
          <spacer size="xsmall" />
          <icon
            name="caret-left"
            color={props.eventIndexOverride === 0 ? Color.offlineFont : Color.primaryFont}
          />
          <spacer size="xsmall" />
          <text
            weight="bold"
            color={props.eventIndexOverride === 0 ? Color.offlineFont : Color.primaryFont}
            selectable={false}
          >
            Prev
          </text>
        </hstack>
        <hstack grow height={'100%'} alignment="center middle" onPress={props.onResetNavigation}>
          <text
            weight="bold"
            color={props.eventIndexOverride === -1 ? Color.offlineFont : Color.primaryFont}
            selectable={false}
          >
            Jump to Latest
          </text>
        </hstack>
        <hstack
          width={'64px'}
          height={'100%'}
          alignment="end middle"
          onPress={props.onNavigateNext ?? undefined}
        >
          <text
            weight="bold"
            color={props.eventIndexOverride === -1 ? Color.offlineFont : Color.primaryFont}
            selectable={false}
          >
            Next
          </text>
          <spacer size="xsmall" />
          <icon
            name="caret-right"
            color={props.eventIndexOverride === -1 ? Color.offlineFont : Color.primaryFont}
          />
          <spacer size="small" />
        </hstack>
      </hstack>
    </vstack>
  );
}

export interface BasketballScoreboardProps {
  info: BasketballGameScoreInfo;
  eventIndexOverride: number;
  onNavigateNext?: Nullable<() => void>;
  onNavigatePrev?: Nullable<() => void>;
  onResetNavigation?: () => void;
}

export function BasketballScoreboard(props: BasketballScoreboardProps): JSX.Element {
  return (
    <vstack width={'100%'} height={'100%'} backgroundColor={Color.greyBackground}>
      {Header(props.info)}
      {EventBubble(props)}
    </vstack>
  );
}
