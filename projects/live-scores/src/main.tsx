import { Devvit, Post } from '@devvit/public-api';
import { GenericScoreBoard, ScoreboardPage } from './components/Scoreboard.js';
import { BaseballScoreBoard } from './components/baseball.js';
import { CommentData, debugComment, getLastComment } from './components/comments.js';
import { nextMLBDemoPage, nextNFLDemoPage } from './mock-scores/MockHelper.js';
import { BaseballGameScoreInfo } from './sports/espn/espn.js';
import { APIService, GameSubscription, League, getLeagueFromString } from './sports/Sports.js';
import {
  srNflScoreboardCreationForm,
  srSoccerScoreboardCreationForm,
} from './forms/ScoreboardCreateForm.js';
import { EventState } from './sports/GameEvent.js';
import {
  fetchDebugGameInfo,
  fetchCachedGameInfoForPostId,
  makeKeyForPostId,
  fetchSubscriptions,
  unsubscribePost,
} from './sports/GameFetch.js';
import { SoccerGameScoreInfo } from './sports/sportradar/SoccerEvent.js';
import { SoccerScoreboard } from './components/soccer.js';
import { APIKey } from './sports/sportradar/APIKeys.js';
import { fetchAllSubsAndGames, subscriptionsForm } from './forms/SubscriptionsForm.js';
import { NFLGameScoreInfo } from './sports/sportradar/NFLBoxscore.js';
import { FootballScoreboard } from './components/football/FootballScoreboard.js';

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
]);

// Devvit.addMenuItem({
//   label: 'Create ESPN scoreboard',
//   location: 'subreddit',
//   forUserType: `moderator`,
//   onPress: async (_event, { ui }) => {
//     return ui.showForm(espnScoreboardCreationForm);
//   },
// });

Devvit.addMenuItem({
  label: 'Create NFL Scoreboard (Internal)',
  location: 'subreddit',
  forUserType: `moderator`,
  onPress: async (_event, { ui }) => {
    return ui.showForm(srNflScoreboardCreationForm);
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
//       preview: (
//         <vstack padding="medium" cornerRadius="medium">
//           <text style="heading" size="medium">
//             Loading scoreboard for game...
//           </text>
//         </vstack>
//       ),
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
      preview: (
        <vstack padding="medium" cornerRadius="medium">
          <text style="heading" size="medium">
            Loading scoreboard for game...
          </text>
        </vstack>
      ),
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
      preview: (
        <vstack padding="medium" cornerRadius="medium">
          <text style="heading" size="medium">
            Loading scoreboard for game...
          </text>
        </vstack>
      ),
      title: `Scoreboard: Football Demo`,
      subredditName: currentSubreddit.name,
    });
    const gameSub: GameSubscription = {
      league: League.NFL,
      eventId: 'demo-nfl-game-01',
      service: APIService.SRNFL,
    };
    await context.kvStore.put(makeKeyForPostId(post.id), JSON.stringify(gameSub));
    return context.ui.showToast({
      text: 'NFL Demo Post Created!',
      appearance: 'success',
    });
  },
});

Devvit.addCustomPostType({
  name: 'Scoreboard',
  render: (context) => {
    const { useState, postId, kvStore } = context;
    const [scoreInfo, setScoreInfo] = useState(async () => {
      const debugId = context.debug.metadata?.['debug-id']?.values?.[0];
      if (debugId) {
        return fetchDebugGameInfo(debugId);
      } else {
        return await fetchCachedGameInfoForPostId(kvStore, postId);
      }
    });

    const updateInterval = context.useInterval(async () => {
      const data = await fetchCachedGameInfoForPostId(kvStore, postId);
      data && setScoreInfo(data);
    }, 10000);

    updateInterval.start();

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

    const demoNext = async () => {
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
        const update = await fetchCachedGameInfoForPostId(kvStore, postId);
        setScoreInfo(update);
      }
    };

    const [page, setPage] = useState(ScoreboardPage.SCORE);

    if (scoreInfo) {
      if (scoreInfo.event.gameType === 'baseball') {
        const baseBallScoreInfo = scoreInfo as BaseballGameScoreInfo;
        if (scoreInfo.event.state === EventState.FINAL) updateInterval.stop();
        return BaseballScoreBoard(baseBallScoreInfo, lastComment, demoNext);
      } else if (scoreInfo.event.gameType === 'soccer') {
        const soccerGameScoreInfo = scoreInfo as SoccerGameScoreInfo;
        if (scoreInfo.event.state === EventState.FINAL) updateInterval.stop();
        return SoccerScoreboard({ scoreInfo: soccerGameScoreInfo, page, setPage });
      } else if (scoreInfo.event.gameType === 'football') {
        const footballGameScoreInfo = scoreInfo as NFLGameScoreInfo;
        if (scoreInfo.event.state === EventState.FINAL) updateInterval.stop();
        return FootballScoreboard({ scoreInfo: footballGameScoreInfo }, demoNext);
      } else {
        if (scoreInfo.event.state === EventState.FINAL) updateInterval.stop();
        return GenericScoreBoard(scoreInfo, lastComment);
      }
    } else {
      return (
        <blocks>
          <text>No data</text>
        </blocks>
      );
    }
  },
});

// Add scheduler job for updating game subscriptions
Devvit.addSchedulerJob({
  name: 'game_subscription_thread',
  onRun: async (_, context) => {
    await fetchSubscriptions(context);
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
    await unsubscribePost(event.postId, context.kvStore);
  },
});

Devvit.addTrigger({
  event: 'ModAction',
  onEvent: async (event, context) => {
    if (event.action === `removelink` && event.targetPost) {
      await unsubscribePost(event.targetPost.id, context.kvStore);
    }
  },
});

export default Devvit;
