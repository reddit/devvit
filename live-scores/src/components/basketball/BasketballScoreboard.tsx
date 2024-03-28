import { Devvit } from '@devvit/public-api';
import {
  type BasketballGameScoreInfo,
  type BasketballGameScoreInfoPeriod,
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
import type { Reaction, ReactionScore } from '../../Reactions.js';
import { Reactions } from '../ReactionsButtons.js';
import type { NavigateToPage, ScoreboardProps } from '../Scoreboard.js';
import { ScoreboardColor, ScoreboardPage } from '../Scoreboard.js';
import type { BasketballSummary } from '../../sports/sportradar/BasketballSummary.js';
import { BasketballBoxscore } from './BasketballBoxscore.js';
import { SettingsPage } from '../Settings.js';

const headerHeight = 106;
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
          backgroundColor={ScoreboardColor.transparentHeader}
          cornerRadius="full"
          alignment="middle center"
          gap="medium"
          borderColor={ScoreboardColor.transparentBorder}
        >
          <text size="small" style="metadata" color={ScoreboardColor.secondaryFont}>
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
          backgroundColor={ScoreboardColor.transparentHeader}
          cornerRadius="full"
          alignment="middle center"
          gap="medium"
          borderColor={ScoreboardColor.transparentBorder}
        >
          <text size="small" style="metadata" color={ScoreboardColor.secondaryFont}>
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
        backgroundColor={ScoreboardColor.transparentHeader}
        cornerRadius="full"
        alignment="middle center"
        gap="medium"
        borderColor={ScoreboardColor.transparentBorder}
      >
        <hstack width={'100%'} height={'100%'} alignment="start middle">
          <spacer size="small" />
          <text size="small" style="heading" color={ScoreboardColor.primaryFont}>
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
        <text size="small" style="heading" color={ScoreboardColor.primaryFont}>
          {info.event.timingInfo.displayClock}
        </text>
      </zstack>
    </hstack>
  );
}

function Team(props: BasketballScoreboardProps, isHome: Boolean): JSX.Element {
  const info = props.scoreInfo;
  const team = isHome ? info.event.homeTeam : info.event.awayTeam;
  const score = isHome ? info.homeScore : info.awayScore;
  const logoUrl = leagueAssetPath(info.event) + team.logo;
  const outerAlignment = isHome ? 'end bottom' : 'start bottom';
  const innerAlignment = isHome ? 'end middle' : 'start middle';
  const teamColor = NBA_TEAM_COLOR_MAP[team.abbreviation.toLowerCase()];
  const teamName = info.event.league === 'ncaamb' ? team.abbreviation : team.name;

  return (
    <vstack width={'50%'} height={'100%'} alignment={outerAlignment}>
      <hstack
        width={'100%'}
        alignment={outerAlignment}
        onPress={() => {
          props.setPage(isHome ? ScoreboardPage.HOME_STATS : ScoreboardPage.AWAY_STATS);
        }}
      >
        <spacer size="small" />
        {isHome ? null : (
          <>
            <image imageWidth="48px" imageHeight="48px" url={logoUrl} />
            <spacer size="xsmall" />
          </>
        )}
        <vstack height={'48px'} alignment={innerAlignment}>
          <text size="xxlarge" style="heading" color={ScoreboardColor.primaryFont}>
            {props.spoilerFree ? '?' : score}
          </text>
          <hstack alignment="middle">
            <text size="medium" style="metadata" color={ScoreboardColor.primaryFont}>
              {teamName.toLocaleUpperCase()}
            </text>
            <spacer size="xsmall" />
            <icon name="right-fill" size="xsmall" color={ScoreboardColor.primaryFont} />
          </hstack>
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

function Teams(props: BasketballScoreboardProps): JSX.Element {
  return (
    <hstack width={'100%'} height={'100%'} alignment="bottom center">
      {Team(props, false)}
      {Team(props, true)}
    </hstack>
  );
}

function SettingsButton(setPage: NavigateToPage): JSX.Element {
  return (
    <vstack width={'100%'} height={'100%'} alignment="end top" padding="small">
      <hstack
        height="24px"
        width="24px"
        alignment="center middle"
        onPress={() => setPage(ScoreboardPage.SETTINGS)}
      >
        <icon name="settings-outline" size="medium" color={ScoreboardColor.primaryFont} />
      </hstack>
    </vstack>
  );
}

function Header(props: BasketballScoreboardProps): JSX.Element {
  return (
    <zstack
      width={'100%'}
      height={`${headerHeight}px`}
      alignment="center top"
      backgroundColor={ScoreboardColor.transparentHeader}
    >
      {Teams(props)}
      {Clock(props.scoreInfo)}
      {SettingsButton(props.setPage)}
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
  const info = props.scoreInfo;

  if (!info.periods || info.periods.length === 0 || info.event.state === EventState.PRE) {
    return (
      <vstack gap="medium" width={'100%'} height={`${320 - headerHeight}px`} alignment="top center">
        <spacer size="small" />
        <text width={'90%'} style="heading" size="large" color={ScoreboardColor.primaryFont}>
          ✨ While you wait, see what's new!
        </text>
        <text width={'90%'} color={ScoreboardColor.secondaryFont}>
          Box scores are now available. Click a team name to see a list of players and stats.
        </text>
        <text width={'90%'} color={ScoreboardColor.secondaryFont} wrap>
          We've also added settings to customize your scoreboard experience.
        </text>
      </vstack>
    );
  }

  const currentPeriod: BasketballGameScoreInfoPeriod = info.periods[info.periods.length - 1];
  const latestEvent = currentPeriod.events[currentPeriod.events.length - 1];

  if (!latestEvent) {
    if (info.event.state === EventState.FINAL) {
      const scoreString = props.spoilerFree
        ? `(Hidden)`
        : `${Math.max(info.homeScore, info.awayScore)} - ${Math.min(
            info.homeScore,
            info.awayScore
          )}`;
      return (
        <vstack
          gap="small"
          width={'100%'}
          height={`${320 - headerHeight}px`}
          alignment="top center"
        >
          <spacer size="small" />
          <text width={'90%'} style="heading" size="large" color={ScoreboardColor.primaryFont}>
            Game has ended
          </text>
          <text width={'90%'} size="medium" color={ScoreboardColor.secondaryFont}>
            Final Score {scoreString}.
          </text>
        </vstack>
      );
    }
    return (
      <vstack gap="medium" width={'100%'} height={`${320 - headerHeight}px`} alignment="top center">
        <spacer size="small" />
        <text width={'90%'} style="heading" size="medium" color={ScoreboardColor.primaryFont} wrap>
          Sorry, this game does not have play by play statistics
        </text>
        <text width={'90%'} size="medium" color={ScoreboardColor.secondaryFont} wrap>
          You can view players and limited stats by clicking on a team
        </text>
      </vstack>
    );
  }

  if (info.event.state === EventState.FINAL) {
    const scoreString = props.spoilerFree
      ? `(Hidden)`
      : `${Math.max(info.homeScore, info.awayScore)} - ${Math.min(info.homeScore, info.awayScore)}`;
    latestEvent.event_type = BasketballEventType.endofgame;
    latestEvent.description = `Final Score ${scoreString}.`;
  }

  const totalEvents = totalEventsCount(info);
  const eventNumber = props.eventIndexOverride === -1 ? totalEvents : props.eventIndexOverride + 1;

  const displayEvent =
    props.eventIndexOverride >= 0
      ? getEventAtIndex(props.eventIndexOverride, info) ?? latestEvent
      : latestEvent;

  const hideClockTime =
    (info.event.state === EventState.FINAL ||
      displayEvent.event_type === BasketballEventType.unknown) &&
    props.eventIndexOverride === -1;

  const reactions = props.eventIndexOverride === -1 ? props.reactions : props.pastReactions;

  return (
    <vstack width={'100%'} height={`${appWindowHeight - headerHeight}px`}>
      <spacer size="medium" />

      <hstack width={'100%'} height={`${eventHeaderHeight}px`} alignment="middle">
        <spacer size="medium" />
        <hstack grow height={'100%'} alignment="start middle">
          <text style="heading" size="large" color={ScoreboardColor.primaryFont}>
            {titleForEventType(displayEvent.event_type)}{' '}
            {hideClockTime ? null : `(${displayEvent.clock})`}
          </text>
        </hstack>
        <hstack grow height={'100%'} alignment="end middle">
          <text style="metadata" color={ScoreboardColor.secondaryFont}>
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
          color={ScoreboardColor.secondaryFont}
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
        {reactions ? (
          <hstack width={100}>
            <vstack width="12px" height={100} />
            {Reactions(reactions, props.onReactionPress, true)}
            <vstack grow height={100} />
          </hstack>
        ) : null}
        <spacer size="medium" />
      </hstack>

      <hstack width={'100%'} height={'1px'} backgroundColor={ScoreboardColor.transparentBorder} />

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
            color={
              props.eventIndexOverride === 0
                ? ScoreboardColor.offlineFont
                : ScoreboardColor.primaryFont
            }
          />
          <spacer size="xsmall" />
          <text
            weight="bold"
            color={
              props.eventIndexOverride === 0
                ? ScoreboardColor.offlineFont
                : ScoreboardColor.primaryFont
            }
            selectable={false}
          >
            Prev
          </text>
        </hstack>
        <hstack
          grow
          height={'100%'}
          alignment="center middle"
          onPress={props.onResetNavigation ?? undefined}
        >
          <text
            weight="bold"
            color={
              props.eventIndexOverride === -1
                ? ScoreboardColor.offlineFont
                : ScoreboardColor.primaryFont
            }
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
            color={
              props.eventIndexOverride === -1
                ? ScoreboardColor.offlineFont
                : ScoreboardColor.primaryFont
            }
            selectable={false}
          >
            Next
          </text>
          <spacer size="xsmall" />
          <icon
            name="caret-right"
            color={
              props.eventIndexOverride === -1
                ? ScoreboardColor.offlineFont
                : ScoreboardColor.primaryFont
            }
          />
          <spacer size="small" />
        </hstack>
      </hstack>
    </vstack>
  );
}

type OnReactionPress = (reaction: Reaction, eventId?: string) => Promise<void>;

export type BasketballScoreboardProps = ScoreboardProps & {
  scoreInfo: BasketballGameScoreInfo;
  eventIndexOverride: number;
  reactions: ReactionScore[] | undefined;
  pastReactions: ReactionScore[] | undefined;
  onReactionPress: OnReactionPress;
  onNavigateNext: Nullable<() => void>;
  onNavigatePrev: Nullable<() => void>;
  onResetNavigation: Nullable<() => void>;
  onToggleSpoilerFree: () => Promise<void>;
  summary: BasketballSummary | null;
  spoilerFree: boolean;
};

export function BasketballScoreboard(props: BasketballScoreboardProps): JSX.Element {
  return (
    <vstack width={'100%'} height={'100%'} backgroundColor={ScoreboardColor.greyBackground}>
      {props.page === ScoreboardPage.SCORE ? Header(props) : null}
      {props.page === ScoreboardPage.SCORE ? EventBubble(props) : null}
      {props.page === ScoreboardPage.HOME_STATS || props.page === ScoreboardPage.HOME_STATS_MORE
        ? BasketballBoxscore(props, true)
        : null}
      {props.page === ScoreboardPage.AWAY_STATS || props.page === ScoreboardPage.AWAY_STATS_MORE
        ? BasketballBoxscore(props, false)
        : null}
      {props.page === ScoreboardPage.SETTINGS
        ? SettingsPage({
            navigateToPage: props.setPage,
            spoilerFreeSetting: props.spoilerFree,
            onSpoilerFreeToggle: props.onToggleSpoilerFree,
          })
        : null}
    </vstack>
  );
}
