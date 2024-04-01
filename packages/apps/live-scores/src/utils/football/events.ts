import { NFLBoxscoreLastEvent, NFLGameScoreInfo } from '../../sports/sportradar/NFLBoxscore.js';
import { EventState } from '../../sports/GameEvent.js';
import type { RedisClient } from '@devvit/public-api';
import { CurrentEventData, Nullable } from '../types.js';
import { getEventById } from '../../sports/sportradar/LastEvents.js';

function getIsGameEnded(scoreInfo: NFLGameScoreInfo): boolean {
  return scoreInfo.event.state === EventState.FINAL;
}

export const getNavigationCallbacks = (
  redis: RedisClient,
  navigationEventOverride: Pick<NFLBoxscoreLastEvent, 'id'> | null,
  gameEventIds: string[],
  scoreInfo: NFLGameScoreInfo,
  setNavigationEventOverride: (newValue: NFLBoxscoreLastEvent | null) => void,
  updatePastReactions: (eventId: string | null) => Promise<void>
): {
  onNavigateNext: Nullable<() => Promise<void>>;
  onNavigatePrev: Nullable<() => Promise<void>>;
} => {
  const isGameEnded = getIsGameEnded(scoreInfo);
  const currentEventId = navigationEventOverride?.id || scoreInfo.lastEvent?.id;
  const isNavPrevPossible = Boolean(
    gameEventIds.length &&
      ((currentEventId && gameEventIds.indexOf(currentEventId) !== 0) ||
        (!navigationEventOverride && isGameEnded))
  );
  const isNavNextPossible = Boolean(gameEventIds.length && navigationEventOverride);

  return {
    onNavigatePrev: !isNavPrevPossible
      ? null
      : async () => {
          const currentPosition = navigationEventOverride
            ? gameEventIds.indexOf(navigationEventOverride.id)
            : isGameEnded
            ? gameEventIds.length
            : gameEventIds.length - 1;
          const newEventId = gameEventIds[currentPosition - 1];
          const newData = await getEventById(newEventId, redis, scoreInfo.event.id);
          setNavigationEventOverride(newData || null);
          await updatePastReactions(newData?.id || null);
        },
    onNavigateNext: !isNavNextPossible
      ? null
      : async () => {
          if (!navigationEventOverride) {
            // should not be possible, just a type check
            throw new Error('no navigation override when expected');
          }
          const currentPosition = gameEventIds.indexOf(navigationEventOverride.id);
          const newEventId = gameEventIds[currentPosition + 1];
          if (!newEventId) {
            setNavigationEventOverride(null);
            await updatePastReactions(null);
            return;
          }
          if (!isGameEnded && newEventId === scoreInfo.lastEvent?.id) {
            setNavigationEventOverride(null);
            await updatePastReactions(null);
            return;
          }
          const newData = await getEventById(newEventId, redis, scoreInfo.event.id);
          setNavigationEventOverride(newData || null);
          await updatePastReactions(newData?.id || null);
        },
  };
};

export function getCurrentEventData(
  info: NFLGameScoreInfo,
  navigationEventOverride: NFLBoxscoreLastEvent | null
): CurrentEventData {
  let primaryString: string | null = null;
  let secondaryString: string | null = null;

  if (navigationEventOverride) {
    primaryString = `Game Update (${navigationEventOverride.clock ?? ''})`;
    secondaryString = navigationEventOverride.description ?? '';
  } else if (info.event.state === EventState.FINAL) {
    primaryString = `Game has ended`;
    secondaryString = `Join the discussion in the comments, or expand this section to see the play-by-play`;
  } else if (info.lastEvent) {
    primaryString = `Latest Update (${info.lastEvent.clock ?? ''})`;
    secondaryString = info.lastEvent.description ?? '';
  } else {
    primaryString = `✨ New! Play history is here`;
    secondaryString = `Once the game starts, expand this section to see the current and past plays`;
  }
  return { primaryString, secondaryString };
}

export const getPositionAndTotalEvents = (
  gameEventIds: string[],
  scoreInfo: NFLGameScoreInfo,
  navigationEventOverride: Pick<NFLBoxscoreLastEvent, 'id'> | null
): {
  currentPosition: number;
  totalEventCount: number;
} => {
  const isGameNotStarted = !scoreInfo.lastEvent;
  if (isGameNotStarted) {
    return {
      currentPosition: 0,
      totalEventCount: 0,
    };
  }
  const isGameEnded = getIsGameEnded(scoreInfo);
  const totalEventCount = isGameEnded ? gameEventIds.length + 1 : gameEventIds.length;
  const currentPosition = navigationEventOverride
    ? gameEventIds.indexOf(navigationEventOverride.id) + 1
    : totalEventCount;
  return {
    currentPosition,
    totalEventCount,
  };
};
