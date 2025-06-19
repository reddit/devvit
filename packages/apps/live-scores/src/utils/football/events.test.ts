import { RedisClient } from '@devvit/public-api';
import { Mock } from 'vitest';

import { fetchDebugGameInfo } from '../../sports/GameFetch.js';
import { NFLGameScoreInfo } from '../../sports/sportradar/NFLBoxscore.js';
import { getNavigationCallbacks, getPositionAndTotalEvents } from './events.js';

describe('football event utils', () => {
  const mockRedis = { get: vi.fn() } as unknown as RedisClient;
  const event1 = { id: '3e4b22d0-ad04-11ee-b18e-11f7316c1a9e' };
  const event2 = { id: 'f84d6ed0-ad05-11ee-b18e-11f7316c1a9e' };
  const event3 = { id: '2b04f480-ad09-11ee-b18e-11f7316c1a9e' };
  const event4 = { id: '7ef52840-ad0d-11ee-b18e-11f7316c1a9e' };
  const event5 = { id: '384d1130-ad14-11ee-b18e-11f7316c1a9e' };
  const mockGameState = fetchDebugGameInfo('demo-nfl-game-05') as NFLGameScoreInfo;
  const setNavigationEventOverride = vi.fn();
  const updatePastReaction = vi.fn();

  afterEach(() => {
    (mockRedis.get as Mock).mockReset();
    setNavigationEventOverride.mockReset();
    updatePastReaction.mockReset();
  });

  describe('getNavigationCallbacks', () => {
    test('it returns null if there are no events stored', () => {
      expect(
        getNavigationCallbacks(
          mockRedis,
          event1,
          [],
          mockGameState,
          setNavigationEventOverride,
          updatePastReaction
        )
      ).toEqual({
        onNavigateNext: null,
        onNavigatePrev: null,
      });
    });

    describe('no navigation override', () => {
      describe('when game ended', () => {
        const gameEndedState = fetchDebugGameInfo('demo-nfl-game-13') as NFLGameScoreInfo;

        it('returns no next navigation callback', () => {
          expect(
            getNavigationCallbacks(
              mockRedis,
              null,
              [event1.id],
              gameEndedState,
              setNavigationEventOverride,
              updatePastReaction
            ).onNavigateNext
          ).toBeNull();
        });

        it('fetches the previous event data on prev callback call', async () => {
          const { onNavigatePrev } = getNavigationCallbacks(
            mockRedis,
            null,
            [event1.id],
            gameEndedState,
            setNavigationEventOverride,
            updatePastReaction
          );
          expect(onNavigatePrev).not.toBeNull();
          (mockRedis.get as Mock).mockResolvedValueOnce(JSON.stringify(event1));
          await onNavigatePrev?.();
          expect(mockRedis.get).toBeCalledWith(`${gameEndedState.event.id}:events:${event1.id}`);
          expect(setNavigationEventOverride).toBeCalledWith(event1);
          expect(updatePastReaction).toBeCalledWith(event1.id);
        });

        describe('when post for ended game was created (there are no previous events stored)', () => {
          const gameEndedState = fetchDebugGameInfo('demo-nfl-game-13') as NFLGameScoreInfo;
          const lastEventNavigation = getNavigationCallbacks(
            mockRedis,
            null,
            [event5.id],
            gameEndedState,
            setNavigationEventOverride,
            updatePastReaction
          );

          it('navigates prev', async () => {
            const onNavigatePrev = lastEventNavigation.onNavigatePrev;
            expect(onNavigatePrev).not.toBeNull();
            (mockRedis.get as Mock).mockResolvedValueOnce(JSON.stringify(event5));
            await onNavigatePrev?.();
            expect(mockRedis.get).toBeCalledWith(`${gameEndedState.event.id}:events:${event5.id}`);
            expect(setNavigationEventOverride).toBeCalledWith(event5);
            expect(updatePastReaction).toBeCalledWith(event5.id);
          });

          it('does not navigate next', async () => {
            const onNavigateNext = lastEventNavigation.onNavigateNext;
            expect(onNavigateNext).toBeNull();
          });
        });
      });

      describe('when game has not started', () => {
        const gameNotStartedState = fetchDebugGameInfo('demo-nfl-game-01') as NFLGameScoreInfo;

        it('returns no navigation', () => {
          const result = getNavigationCallbacks(
            mockRedis,
            null,
            [],
            gameNotStartedState,
            setNavigationEventOverride,
            updatePastReaction
          );
          expect(result).toEqual({
            onNavigateNext: null,
            onNavigatePrev: null,
          });
        });
      });

      describe('game in progress started', () => {
        const gameInProgressState = fetchDebugGameInfo('demo-nfl-game-06') as NFLGameScoreInfo;
        const result = getNavigationCallbacks(
          mockRedis,
          null,
          [event1.id, event2.id],
          gameInProgressState,
          setNavigationEventOverride,
          updatePastReaction
        );

        it('returns no navigation next', () => {
          expect(result.onNavigateNext).toBeNull();
        });

        it('fetches the previous event data on prev callback call', async () => {
          const onNavigatePrev = result.onNavigatePrev;
          expect(onNavigatePrev).not.toBeNull();
          (mockRedis.get as Mock).mockResolvedValueOnce(JSON.stringify(event1));
          await onNavigatePrev?.();
          expect(mockRedis.get).toBeCalledWith(
            `${gameInProgressState.event.id}:events:${event1.id}`
          );
          expect(setNavigationEventOverride).toBeCalledWith(event1);
          expect(updatePastReaction).toBeCalledWith(event1.id);
        });

        it('returns no prev navigation if it is the first event', () => {
          const gameWithOneEvent = fetchDebugGameInfo('demo-nfl-game-06') as NFLGameScoreInfo;
          const { onNavigatePrev } = getNavigationCallbacks(
            mockRedis,
            null,
            [event2.id],
            gameWithOneEvent,
            setNavigationEventOverride,
            updatePastReaction
          );
          expect(onNavigatePrev).toBeNull();
        });
      });
    });

    describe('with navigation override', () => {
      describe('when on first event', () => {
        const gameInProgressState = fetchDebugGameInfo('demo-nfl-game-07') as NFLGameScoreInfo;
        const firstEventNavigation = getNavigationCallbacks(
          mockRedis,
          event1,
          [event1.id, event2.id, event3.id],
          gameInProgressState,
          setNavigationEventOverride,
          updatePastReaction
        );

        it('does not navigate prev', () => {
          expect(firstEventNavigation.onNavigatePrev).toBeNull();
        });

        it('navigates next', async () => {
          const onNavigateNext = firstEventNavigation.onNavigateNext;
          expect(onNavigateNext).not.toBeNull();
          (mockRedis.get as Mock).mockResolvedValueOnce(JSON.stringify(event2));
          await onNavigateNext?.();
          expect(mockRedis.get).toBeCalledWith(
            `${gameInProgressState.event.id}:events:${event2.id}`
          );
          expect(setNavigationEventOverride).toBeCalledWith(event2);
          expect(updatePastReaction).toBeCalledWith(event2.id);
        });
      });

      describe('when in the middle of event list', () => {
        const gameInProgressState = fetchDebugGameInfo('demo-nfl-game-08') as NFLGameScoreInfo;
        const middleEventNavigation = getNavigationCallbacks(
          mockRedis,
          event2,
          [event1.id, event2.id, event3.id, event4.id],
          gameInProgressState,
          setNavigationEventOverride,
          updatePastReaction
        );

        it('navigates prev', async () => {
          const onNavigatePrev = middleEventNavigation.onNavigatePrev;
          expect(onNavigatePrev).not.toBeNull();
          (mockRedis.get as Mock).mockResolvedValueOnce(JSON.stringify(event1));
          await onNavigatePrev?.();
          expect(mockRedis.get).toBeCalledWith(
            `${gameInProgressState.event.id}:events:${event1.id}`
          );
          expect(setNavigationEventOverride).toBeCalledWith(event1);
          expect(updatePastReaction).toBeCalledWith(event1.id);
        });

        it('navigates next', async () => {
          const onNavigateNext = middleEventNavigation.onNavigateNext;
          expect(onNavigateNext).not.toBeNull();
          (mockRedis.get as Mock).mockResolvedValueOnce(JSON.stringify(event3));
          await onNavigateNext?.();
          expect(mockRedis.get).toBeCalledWith(
            `${gameInProgressState.event.id}:events:${event3.id}`
          );
          expect(setNavigationEventOverride).toBeCalledWith(event3);
          expect(updatePastReaction).toBeCalledWith(event3.id);
        });
      });

      describe('when on pre-last event in active game', () => {
        const gameInProgressState = fetchDebugGameInfo('demo-nfl-game-07') as NFLGameScoreInfo;
        const preLastEventNavigation = getNavigationCallbacks(
          mockRedis,
          event2,
          [event1.id, event2.id, event3.id],
          gameInProgressState,
          setNavigationEventOverride,
          updatePastReaction
        );

        it('navigates prev', async () => {
          const onNavigatePrev = preLastEventNavigation.onNavigatePrev;
          expect(onNavigatePrev).not.toBeNull();
          (mockRedis.get as Mock).mockResolvedValueOnce(JSON.stringify(event1));
          await onNavigatePrev?.();
          expect(mockRedis.get).toBeCalledWith(
            `${gameInProgressState.event.id}:events:${event1.id}`
          );
          expect(setNavigationEventOverride).toBeCalledWith(event1);
          expect(updatePastReaction).toBeCalledWith(event1.id);
        });

        it('resets the override on navigate next', async () => {
          const onNavigateNext = preLastEventNavigation.onNavigateNext;
          expect(onNavigateNext).not.toBeNull();
          await onNavigateNext?.();
          expect(mockRedis.get).not.toBeCalled();
          expect(setNavigationEventOverride).toBeCalledWith(null);
          expect(updatePastReaction).toBeCalledWith(null);
        });
      });

      describe('when on last event in finished game', () => {
        const gameEndedState = fetchDebugGameInfo('demo-nfl-game-13') as NFLGameScoreInfo;
        const lastEventNavigation = getNavigationCallbacks(
          mockRedis,
          event3,
          [event1.id, event2.id, event3.id],
          gameEndedState,
          setNavigationEventOverride,
          updatePastReaction
        );

        it('navigates prev', async () => {
          const onNavigatePrev = lastEventNavigation.onNavigatePrev;
          expect(onNavigatePrev).not.toBeNull();
          (mockRedis.get as Mock).mockResolvedValueOnce(JSON.stringify(event2));
          await onNavigatePrev?.();
          expect(mockRedis.get).toBeCalledWith(`${gameEndedState.event.id}:events:${event2.id}`);
          expect(setNavigationEventOverride).toBeCalledWith(event2);
          expect(updatePastReaction).toBeCalledWith(event2.id);
        });

        it('resets the override on navigate next', async () => {
          const onNavigateNext = lastEventNavigation.onNavigateNext;
          expect(onNavigateNext).not.toBeNull();
          await onNavigateNext?.();
          expect(mockRedis.get).not.toBeCalled();
          expect(setNavigationEventOverride).toBeCalledWith(null);
          expect(updatePastReaction).toBeCalledWith(null);
        });
      });

      describe('when on pre-last event in finished game', () => {
        const gameEndedState = fetchDebugGameInfo('demo-nfl-game-13') as NFLGameScoreInfo;
        const lastEventNavigation = getNavigationCallbacks(
          mockRedis,
          event2,
          [event1.id, event2.id, event5.id],
          gameEndedState,
          setNavigationEventOverride,
          updatePastReaction
        );

        it('navigates prev', async () => {
          const onNavigatePrev = lastEventNavigation.onNavigatePrev;
          expect(onNavigatePrev).not.toBeNull();
          (mockRedis.get as Mock).mockResolvedValueOnce(JSON.stringify(event1));
          await onNavigatePrev?.();
          expect(mockRedis.get).toBeCalledWith(`${gameEndedState.event.id}:events:${event1.id}`);
          expect(setNavigationEventOverride).toBeCalledWith(event1);
          expect(updatePastReaction).toBeCalledWith(event1.id);
        });

        it('navigates next', async () => {
          const onNavigateNext = lastEventNavigation.onNavigateNext;
          expect(onNavigateNext).not.toBeNull();
          (mockRedis.get as Mock).mockResolvedValueOnce(JSON.stringify(event5));
          await onNavigateNext?.();
          expect(mockRedis.get).toBeCalledWith(`${gameEndedState.event.id}:events:${event5.id}`);
          expect(setNavigationEventOverride).toBeCalledWith(event5);
          expect(updatePastReaction).toBeCalledWith(event5.id);
        });
      });
    });
  });

  describe('getPositionAndTotalEvents', () => {
    describe('when there is no position override', () => {
      it('has current position equal to total events count', () => {
        const result = getPositionAndTotalEvents(
          [event1.id, event2.id, event3.id, event4.id],
          mockGameState,
          null
        );
        expect(result.currentPosition).toBe(result.totalEventCount);
      });

      it('has total events count equal to gameEventIds length', () => {
        expect(
          getPositionAndTotalEvents([event1.id, event2.id], mockGameState, null).totalEventCount
        ).toBe(2);
      });

      describe('game ended', () => {
        const gameEndedState = fetchDebugGameInfo('demo-nfl-game-13') as NFLGameScoreInfo;

        it('has total events count equal to gameEventIds length + 1', () => {
          expect(
            getPositionAndTotalEvents([event1.id, event2.id], gameEndedState, null).totalEventCount
          ).toBe(3);
        });
      });

      describe('game not started', () => {
        const gameNotStarted = fetchDebugGameInfo('demo-nfl-game-01') as NFLGameScoreInfo;

        it('has both total event count and position equal to 0', () => {
          expect(
            getPositionAndTotalEvents([event1.id, event2.id], gameNotStarted, null).totalEventCount
          ).toBe(0);
        });
      });
    });
    describe('with position override', () => {
      describe('game not started', () => {
        const gameNotStarted = fetchDebugGameInfo('demo-nfl-game-01') as NFLGameScoreInfo;

        it('has both total event count and position equal to 0', () => {
          expect(
            getPositionAndTotalEvents([event1.id, event2.id], gameNotStarted, event1)
              .totalEventCount
          ).toBe(0);
        });
      });
      describe('game in progress', () => {
        it('has position equal to event location in array of events', () => {
          const result = getPositionAndTotalEvents(
            [event1.id, event2.id, event3.id, event4.id],
            mockGameState,
            event2
          );
          expect(result.totalEventCount).toBe(4);
          expect(result.currentPosition).toBe(2);
        });
      });
      describe('game ended', () => {
        const gameEndedState = fetchDebugGameInfo('demo-nfl-game-13') as NFLGameScoreInfo;

        it('has position equal to event location in array of events', () => {
          const result = getPositionAndTotalEvents(
            [event1.id, event2.id, event3.id, event4.id],
            gameEndedState,
            event4
          );
          expect(result.totalEventCount).toBe(5);
          expect(result.currentPosition).toBe(4);
        });
      });
    });
  });
});
