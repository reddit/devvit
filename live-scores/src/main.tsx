import { Devvit, Post, StateSetter } from '@devvit/public-api';
import { GenericScoreBoard, ScoreboardPage } from './components/Scoreboard.js';
import { BaseballScoreBoard } from './components/baseball.js';
import { CommentData, debugComment, getLastComment } from './components/comments.js';
import { nextMLBDemoPage, nextNFLDemoPage } from './mock-scores/MockHelper.js';
import { BaseballGameScoreInfo } from './sports/espn/espn.js';
import { APIService, GameSubscription, League, getLeagueFromString } from './sports/Sports.js';
import {
  srNbaScoreboardCreationForm,
  srNflScoreboardCreationForm,
  srSoccerScoreboardCreationForm,
} from './forms/ScoreboardCreateForm.js';
import { EventState, GeneralGameScoreInfo } from './sports/GameEvent.js';
import {
  fetchDebugGameInfo,
  fetchCachedGameInfoForPostId,
  makeKeyForPostId,
  fetchSubscriptions,
  handlePostRemoval,
  makeKeyForEventId,
} from './sports/GameFetch.js';
import { SoccerGameScoreInfo } from './sports/sportradar/SoccerEvent.js';
import { SoccerScoreboard } from './components/soccer.js';
import { APIKey, AppSettings } from './sports/sportradar/APIKeys.js';
import { fetchAllSubsAndGames, subscriptionsForm } from './forms/SubscriptionsForm.js';
import { NFLBoxscoreLastEvent, NFLGameScoreInfo } from './sports/sportradar/NFLBoxscore.js';
import { FootballScoreboard } from './components/football/FootballScoreboard.js';
import { LoadingState, LoadingStateFootball } from './components/Loading.js';
import {
  Reaction,
  ReactionScore,
  combineReactionScores,
  configurePostWithAvailableReactions,
  debugLocalReactions,
  debugReactions,
  defaultReactions,
  getAllReactionScores,
  getAvailableReactions,
  incrementReaction,
} from './Reactions.js';
import { updateCustomPost } from './utils/updateRedditPost.js';
import { getAllEventIds } from './sports/sportradar/LastEvents.js';
import { CurrentEventData, DevvitState, noop, Nullable } from './utils/types.js';
import { getNavigationCallbacks } from './utils/football/events.js';
import { srManualNFLScoreboardCreateForm } from './forms/ManualGameCreateForm.js';

const UPDATE_FREQUENCY_MINUTES: number = 1;

// Devvit.debug.emitSnapshots = true;

Devvit.configure({
  redditAPI: true, // context.reddit will now be available
  http: true,
  redis: true,
  kvStore: true,
});

Devvit.addSettings([
  {
    name: APIKey.soccer,
    label: 'Sportradar Soccer API Key',
    type: 'string',
    isSecret: true,
    scope: 'app',
  },
  {
    name: APIKey.nfl,
    label: 'Sportradar NFL API Key',
    type: 'string',
    isSecret: true,
    scope: 'app',
  },
  {
    name: APIKey.nba,
    label: 'Sportradar NBA API Key',
    type: 'string',
    isSecret: true,
    scope: 'app',
  },
  {
    name: AppSettings.enableDynamicCachedLoader,
    label: 'Use a dynamic cached loader for posts',
    type: 'string',
    isSecret: false,
    scope: 'app',
    defaultValue: 'DISABLED',
  },
]);

export const AppContent: Devvit.BlockComponent<{
  scoreInfo: GeneralGameScoreInfo;
  lastComment: CommentData;
  page: ScoreboardPage;
  demoNext: () => Promise<void>;
  setPage: StateSetter<ScoreboardPage>;
  isOnline: boolean;
  reactions: ReactionScore[] | undefined;
  pastReactions: ReactionScore[] | undefined;
  onReactionPress: (reaction: Reaction) => Promise<void>;
  lastEventOverlayState: DevvitState<CurrentEventData | null>;
  navigationEventOverride: NFLBoxscoreLastEvent | null;
  gameEventIds: string[];
  onNavigateNext: Nullable<() => void>;
  onNavigatePrev: Nullable<() => void>;
  onResetNavigation: () => void;
}> = ({
  scoreInfo,
  lastComment,
  demoNext,
  page,
  setPage,
  reactions,
  pastReactions,
  onReactionPress,
  isOnline,
  lastEventOverlayState,
  gameEventIds,
  navigationEventOverride,
  onNavigateNext,
  onNavigatePrev,
  onResetNavigation,
}) => {
  if (scoreInfo.event.gameType === 'baseball') {
    const baseBallScoreInfo = scoreInfo as BaseballGameScoreInfo;
    return BaseballScoreBoard(baseBallScoreInfo, lastComment, demoNext);
  } else if (scoreInfo.event.gameType === 'soccer') {
    const soccerGameScoreInfo = scoreInfo as SoccerGameScoreInfo;
    return SoccerScoreboard({ scoreInfo: soccerGameScoreInfo, page, setPage });
  } else if (scoreInfo.event.gameType === 'football') {
    const footballGameScoreInfo = scoreInfo as NFLGameScoreInfo;
    return FootballScoreboard(
      {
        scoreInfo: footballGameScoreInfo,
        onReactionPress: onReactionPress,
        reactions,
        pastReactions,
        isOnline,
        lastEventOverlayState,
        gameEventIds,
        navigationEventOverride,
        onNavigateNext,
        onNavigatePrev,
        onResetNavigation,
      },
      demoNext
    );
  } else {
    return GenericScoreBoard(scoreInfo);
  }
};

// Devvit.addMenuItem({
//   label: 'Create ESPN scoreboard',
//   location: 'subreddit',
//   forUserType: `moderator`,
//   onPress: async (_event, { ui }) => {
//     return ui.showForm(espnScoreboardCreationForm);
//   },
// });

Devvit.addMenuItem({
  label: 'Create simulated NFL scoreboard (Internal)',
  location: 'subreddit',
  forUserType: `moderator`,
  onPress: async (_event, { ui }) => {
    return ui.showForm(srManualNFLScoreboardCreateForm);
  },
});

Devvit.addMenuItem({
  label: 'Create NFL Scoreboard (Internal)',
  location: 'subreddit',
  forUserType: `moderator`,
  onPress: async (_event, { ui }) => {
    return ui.showForm(srNflScoreboardCreationForm);
  },
});

Devvit.addMenuItem({
  label: 'Create NBA Scoreboard (Internal)',
  location: 'subreddit',
  forUserType: `moderator`,
  onPress: async (_event, { ui }) => {
    return ui.showForm(srNbaScoreboardCreationForm);
  },
});

// Devvit.addMenuItem({
//   label: 'Create manual football scoreboard',
//   location: 'subreddit',
//   forUserType: `moderator`,
//   onPress: async (_event, { ui }) => {
//     return ui.showForm(srManualSoccerScoreboardCreateForm);
//   },
// });

Devvit.addMenuItem({
  label: 'Create Soccer Scoreboard (Internal)',
  location: 'subreddit',
  forUserType: `moderator`,
  onPress: async (_event, { ui }) => {
    return ui.showForm(srSoccerScoreboardCreationForm);
  },
});

// Devvit.addMenuItem({
//   label: 'Scoreboards: Remove all subscriptions',
//   location: 'subreddit',
//   forUserType: `moderator`,
//   onPress: async (_, context) => {
//     const subscriptions = await getSubscriptions(context.kvStore);
//     await Promise.all(
//       subscriptions.map(async (sub) => {
//         await removeSubscription(context.kvStore, sub);
//       })
//     );
//     context.ui.showToast({
//       text: 'Removed all subscriptions',
//       appearance: 'success',
//     });
//   },
// });

// Devvit.addMenuItem({
//   label: 'Scoreboards: Reset KV Store',
//   location: 'subreddit',
//   forUserType: `moderator`,
//   onPress: async (_, { kvStore, ui }) => {
//     const store = await kvStore.list();
//     await Promise.all(
//       store.map(async (key) => {
//         await kvStore.delete(key);
//       })
//     );
//     ui.showToast({
//       text: 'Wiped KV Store',
//       appearance: 'success',
//     });
//   },
// });

Devvit.addMenuItem({
  label: 'Scoreboard: Manage Subscriptions',
  location: `subreddit`,
  forUserType: `moderator`,
  onPress: async (_event, context) => {
    const games = await fetchAllSubsAndGames(context);
    return context.ui.showForm(subscriptionsForm, {
      subscriptions: games,
    });
  },
});

// Devvit.addMenuItem({
//   label: 'Create Baseball Scoreboard (Demo)',
//   location: 'subreddit',
//   forUserType: `moderator`,
//   onPress: async (_event, context) => {
//     const currentSubreddit = await context.reddit.getCurrentSubreddit();
//     const post: Post = await context.reddit.submitPost({
//       preview: LoadingState(),
//       title: `Scoreboard: Demo`,
//       subredditName: currentSubreddit.name,
//     });
//     const gameSub: GameSubscription = {
//       league: getLeagueFromString('mlb'),
//       eventId: 'demo-mlb-01',
//       service: APIService.ESPN,
//     };
//     await context.kvStore.put(makeKeyForPostId(post.id), JSON.stringify(gameSub));
//     return context.ui.showToast({
//       text: 'Scoreboard Demo Post Created!',
//       appearance: 'success',
//     });
//   },
// });

Devvit.addMenuItem({
  label: 'Create Soccer Scoreboard (Demo)',
  location: 'subreddit',
  forUserType: `moderator`,
  onPress: async (_event, context) => {
    const currentSubreddit = await context.reddit.getCurrentSubreddit();
    const post: Post = await context.reddit.submitPost({
      preview: LoadingState(),
      title: `Scoreboard: Soccer Demo`,
      subredditName: currentSubreddit.name,
    });
    const gameSub: GameSubscription = {
      league: League.EPL,
      eventId: 'demo-epl-01',
      service: APIService.SRSoccer,
    };
    await context.kvStore.put(makeKeyForPostId(post.id), JSON.stringify(gameSub));
    return context.ui.showToast({
      text: 'Scoreboard Demo Post Created!',
      appearance: 'success',
    });
  },
});

Devvit.addMenuItem({
  label: 'Create NFL Scoreboard (Demo)',
  location: 'subreddit',
  forUserType: `moderator`,
  onPress: async (_event, context) => {
    const currentSubreddit = await context.reddit.getCurrentSubreddit();
    const post: Post = await context.reddit.submitPost({
      preview: <LoadingStateFootball />,
      title: `Scoreboard: Football Demo`,
      subredditName: currentSubreddit.name,
    });
    const gameSub: GameSubscription = {
      league: League.NFL,
      eventId: 'demo-nfl-game-01',
      service: APIService.SRNFL,
    };
    await context.kvStore.put(makeKeyForPostId(post.id), JSON.stringify(gameSub));
    await configurePostWithAvailableReactions(post.id, context.redis, defaultReactions);
    return context.ui.showToast({
      text: 'NFL Demo Post Created!',
      appearance: 'success',
    });
  },
});

Devvit.addCustomPostType({
  name: 'Scoreboard',
  render: (context) => {
    const { useState, postId, kvStore, redis } = context;
    const debugId = context.debug.metadata?.['debug-id']?.values?.[0];

    const [scoreInfo, setScoreInfo] = useState(async () => {
      if (debugId) {
        return fetchDebugGameInfo(debugId);
      } else {
        return await fetchCachedGameInfoForPostId(kvStore, postId);
      }
    });

    // history of game events
    const [gameEventIds, setGameEventIds] = useState<string[]>(async () => {
      if (debugId || scoreInfo?.event.gameType !== 'football') {
        return [];
      }
      return await getAllEventIds(redis, scoreInfo.event.id);
    });

    // this state works as an override. When event is null, default logic applies, otherwise the selected event is displayed
    const [navigationEventOverride, setNavigationEventOverride] =
      useState<NFLBoxscoreLastEvent | null>(null);

    const [reactionScores, setReactionScores] = useState(async () => {
      if (scoreInfo?.event.gameType === 'football') {
        if (debugId) {
          return debugReactions();
        } else {
          const info = scoreInfo as NFLGameScoreInfo;
          return await getAllReactionScores(context.redis, postId, info.lastEvent?.id);
        }
      }
      return [];
    });

    const [localReactions, setLocalReactions] = useState(async () => {
      if (scoreInfo?.event.gameType === 'football') {
        if (debugId) {
          return debugLocalReactions();
        } else {
          // Local reaction scores for batch updating
          const reactions = await getAvailableReactions(context.redis, postId);
          const scores: ReactionScore[] = reactions.map((reaction) => {
            return {
              reaction,
              count: 0,
            };
          });
          return scores;
        }
      }
      return [];
    });

    const [pastReactions, setPastReactions] = useState<ReactionScore[] | undefined>(undefined);

    const lastEventOverlayState = useState<{
      primaryString: string;
      secondaryString: string;
    } | null>(null);

    const updateInterval = context.useInterval(async () => {
      const previousScoreInfo = scoreInfo;
      const data = await fetchCachedGameInfoForPostId(kvStore, postId);
      data && setScoreInfo(data);
      const newEvents = await getAllEventIds(redis, data?.event.id);
      setGameEventIds(newEvents);
      if (previousScoreInfo && data) {
        await reactionUpdate(previousScoreInfo, data);
      }
    }, 10000);

    if (scoreInfo?.event.state === EventState.FINAL) {
      updateInterval.stop();
    } else {
      updateInterval.start();
    }

    const [lastComment, _setLastComment] = context.useState<CommentData>(async () => {
      if (context.debug.metadata?.['debug-id']?.values?.[0]) {
        return debugComment;
      }
      return await getLastComment(context, context.postId);
    });

    // Disable comments for now, revisit in near future (2023-10-19)

    // const interval = context.useInterval(async () => {
    //   const newLastComment: any = await getLastComment(context, context.postId);
    //   if (newLastComment === null) {
    //     return;
    //   }
    //   if (lastComment.id != newLastComment.id) {
    //     console.log({ newLastComment });
    //     setLastComment(newLastComment);
    //   }
    // }, 3000);
    // interval.start();

    const demoNext = async (): Promise<void> => {
      const pageId = scoreInfo?.event.id;
      if (pageId?.startsWith('demo-mlb')) {
        const nextPage = nextMLBDemoPage(pageId);
        const gameSub: GameSubscription = {
          league: getLeagueFromString('mlb'),
          eventId: nextPage,
          service: APIService.ESPN,
        };
        await context.kvStore.put(makeKeyForPostId(postId), JSON.stringify(gameSub));
        const update = await fetchCachedGameInfoForPostId(kvStore, postId);
        setScoreInfo(update);
      }
      if (pageId?.startsWith('demo-nfl-game')) {
        const nextPage = nextNFLDemoPage(pageId);
        const gameSub: GameSubscription = {
          league: getLeagueFromString('nfl'),
          eventId: nextPage,
          service: APIService.SRNFL,
        };
        await context.kvStore.put(makeKeyForPostId(postId), JSON.stringify(gameSub));
        const oldInfo = scoreInfo;
        const update = await fetchCachedGameInfoForPostId(kvStore, postId);
        setScoreInfo(update);
        if (oldInfo && update) {
          if (debugId) {
            return;
          }
          await reactionUpdate(oldInfo, update);
        }
      }
    };

    const [page, setPage] = useState(ScoreboardPage.SCORE);

    // Increment the batch of current user reactions to the previous event, reset user reactions, and get updated scores for current event
    async function reactionUpdate(
      oldInfo?: GeneralGameScoreInfo,
      newInfo?: GeneralGameScoreInfo
    ): Promise<void> {
      if (oldInfo?.event.gameType === 'football') {
        const updated = newInfo as NFLGameScoreInfo;
        const old = oldInfo as NFLGameScoreInfo;
        await Promise.all(
          localReactions.map(async (r) => {
            if (r.count > 0) {
              return incrementReaction(
                r.reaction,
                r.count,
                context.redis,
                postId,
                old.lastEvent?.id
              );
            }
          })
        );
        resetUserReactions();
        if (debugId) {
          setReactionScores(debugReactions());
        } else {
          const reactions = await getAllReactionScores(
            context.redis,
            postId,
            updated.lastEvent?.id
          );
          setReactionScores(reactions);
        }
      }
    }

    function resetUserReactions(): void {
      const scores: ReactionScore[] = localReactions.map((r) => {
        return {
          reaction: r.reaction,
          count: 0,
        };
      });
      setLocalReactions(scores);
    }

    const onReactionPress = async (reaction: Reaction): Promise<void> => {
      const scores = localReactions.map((r) => {
        if (r.reaction.id === reaction.id) {
          return {
            reaction: r.reaction,
            count: r.count + 1,
          };
        } else {
          return r;
        }
      });
      setLocalReactions(scores);
    };

    if (!scoreInfo) {
      return (
        <blocks>
          <text>No data</text>
        </blocks>
      );
    }

    const reactions =
      scoreInfo.event.state === EventState.FINAL
        ? undefined
        : combineReactionScores(reactionScores, localReactions);

    const nflScoreInfo = scoreInfo as NFLGameScoreInfo;

    const updatePastReactions = async (eventId: string | null): Promise<void> => {
      if (!eventId) {
        setPastReactions(undefined);
        return;
      }
      const reactionsForEvent = await getAllReactionScores(context.redis, postId, eventId);
      setPastReactions(reactionsForEvent);
    };

    const { onNavigatePrev, onNavigateNext } = getNavigationCallbacks(
      context.redis,
      navigationEventOverride,
      gameEventIds,
      nflScoreInfo,
      setNavigationEventOverride,
      updatePastReactions
    );

    const onResetNavigation = () => {
      setNavigationEventOverride(null);
    };

    return (
      <AppContent
        isOnline={true}
        demoNext={demoNext}
        lastComment={lastComment}
        page={page}
        reactions={reactions}
        pastReactions={pastReactions}
        scoreInfo={scoreInfo}
        setPage={setPage}
        onReactionPress={onReactionPress}
        lastEventOverlayState={lastEventOverlayState}
        gameEventIds={gameEventIds}
        navigationEventOverride={navigationEventOverride}
        onNavigatePrev={onNavigatePrev}
        onNavigateNext={onNavigateNext}
        onResetNavigation={onResetNavigation}
      />
    );
  },
});

// Add scheduler job for updating game subscriptions
Devvit.addSchedulerJob({
  name: 'game_subscription_thread',
  onRun: async (_, context) => {
    const { activeGameScoreInfos, canceledGameScoreInfos } = await fetchSubscriptions(context);

    /**
     * Background tasks are at the subreddit installation level, not the post level. What this code does is
     * takes all subscriptions that have been altered for a given sub (currently active with new information or
     * canceled due to the event being over) and creates a new loading screen.
     *
     * This loading screen is located on the Reddit post so we much update the RTJSON that lives inside of R2 to do so.
     *
     * The magic is that we have abstracted the guts of scoreboard into AppContent. This is then serialized and encoded
     * as a base64 blob. We do this every minute.
     *
     * That way, if something explodes we can at least show a cached representation of live scores!
     */
    const allScoreInfos = [...activeGameScoreInfos, ...canceledGameScoreInfos];
    if (allScoreInfos.length === 0) {
      console.log(`No changed score infos found, not updating posts.`);
      return;
    }

    // 1/30/2024 - Removing autocomments for now
    // await postLatestEvents(context, allScoreInfos);

    const dynamicCacheLoaderFlag = await context.settings.get(
      AppSettings.enableDynamicCachedLoader
    );
    if (dynamicCacheLoaderFlag !== 'ENABLED') {
      console.log(
        `Dynamic cache loader flag is not enabled. No new loading screens are going to be made for posts. To enable, set ${AppSettings.enableDynamicCachedLoader} to 'ENABLED'.`
      );
      return;
    }

    console.log(
      `Attempting to update the loading screen for posts associated to events: `,
      allScoreInfos.map((x) => x.event.id).join(', ')
    );

    /**
     * You can try to make these Promise.all, but be aware if there's an open
     * handle our API will close and you'll get red-herring error messages!
     */
    for (const scoreInfo of allScoreInfos) {
      const rawEventId = await context.kvStore.get<string>(makeKeyForEventId(scoreInfo.event.id));
      if (!rawEventId) {
        console.error(
          `Cannot set new loading for posts associated to eventID ${scoreInfo.event.id} because nothing exists in KVStore!`
        );
        return;
      }

      const postIdsForEventId: { postIds: string[] } = JSON.parse(rawEventId);

      console.log(`Updating the following postIds:`, postIdsForEventId.postIds.join(', '));

      for (const postId of postIdsForEventId.postIds) {
        try {
          const [reactions, lastComment] = await Promise.all([
            // TODO: We need last event here but to do we need to be verrrry cautious
            getAllReactionScores(context.redis, postId),
            getLastComment(context, context.postId),
          ]);

          const result = await updateCustomPost(context, postId, () => (
            <AppContent
              demoNext={async () => {}}
              isOnline={false}
              onReactionPress={async () => {}}
              page={ScoreboardPage.SCORE}
              setPage={() => {}}
              scoreInfo={scoreInfo}
              reactions={reactions}
              pastReactions={undefined}
              lastComment={lastComment}
              lastEventOverlayState={[null, noop]}
              navigationEventOverride={null}
              gameEventIds={[]}
              onNavigatePrev={null}
              onNavigateNext={null}
              onResetNavigation={noop}
            />
          ));

          if (result) {
            console.log(
              `Successfully set a new loading screen for postId (${postId}) showing ${scoreInfo.event.id}!`
            );
          } else {
            console.error(
              `Failed to set a new loading screen for postId (${postId}) showing ${scoreInfo.event.id}!`
            );
          }
        } catch (error) {
          console.error(
            `Failed to set a new loading screen for postId (${postId}) showing ${scoreInfo.event.id}!`
          );
          console.error(error);
        }
      }
    }
  },
});

Devvit.addTrigger({
  event: 'AppInstall',
  onEvent: async (_, context) => {
    try {
      await context.scheduler.runJob({
        cron: `*/${UPDATE_FREQUENCY_MINUTES} * * * *`,
        name: 'game_subscription_thread',
        data: {},
      });
    } catch (e) {
      console.log('error was not able to schedule:', e);
      throw e;
    }
  },
});

Devvit.addTrigger({
  event: 'PostDelete',
  onEvent: async (event, context) => {
    await handlePostRemoval(event.postId, context.kvStore);
  },
});

Devvit.addTrigger({
  event: 'ModAction',
  onEvent: async (event, context) => {
    if (event.action === `removelink` && event.targetPost) {
      await handlePostRemoval(event.targetPost.id, context.kvStore);
    }
  },
});

export default Devvit;
