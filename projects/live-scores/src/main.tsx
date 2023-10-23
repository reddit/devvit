import { Devvit, Post } from '@devvit/public-api';
import { GenericScoreBoard } from './components/Scoreboard.js';
import { BaseballScoreBoard } from './components/baseball.js';
import { CommentData, debugComment, getLastComment } from './components/comments.js';
import { nextMLBDemoPage } from './mock-scores/mlb/mock-mlb.js';
import { BaseballGameScoreInfo } from './sports/espn/espn.js';
import { APIService, GameSubscription, getLeagueFromString } from './sports/Sports.js';
import { getSubscriptions, removeSubscription } from './subscriptions.js';
import {
  espnScoreboardCreationForm,
  srManualSoccerScoreboardCreateForm,
  srNflScoreboardCreationForm,
  srSoccerScoreboardCreationForm,
} from './forms/ScoreboardCreateForm.js';
import { EventState } from './sports/GameEvent.js';
import {
  fetchDebugGameInfo,
  fetchCachedGameInfo,
  makeKeyForPostId,
  fetchSubscriptions,
} from './sports/GameFetch.js';

const UPDATE_FREQUENCY_MINUTES: number = 1;

// Devvit.debug.emitSnapshots = true;

Devvit.configure({
  redditAPI: true, // context.reddit will now be available
  http: true,
  kvStore: true,
});

Devvit.addSettings([
  {
    type: 'string',
    name: 'nfl-api-key',
    label: 'Enter your NFL Sportsradar API key',
  },
  {
    type: 'string',
    name: 'soccer-api-key',
    label: 'Enter your Soccer Sportsradar API key',
  },
]);

Devvit.addMenuItem({
  label: 'LiveScores: Create ESPN scoreboard',
  location: 'subreddit',
  forUserType: `moderator`,
  onPress: async (_event, { ui }) => {
    return ui.showForm(espnScoreboardCreationForm);
  },
});

Devvit.addMenuItem({
  label: 'LiveScores: Create NFL scoreboard',
  location: 'subreddit',
  forUserType: `moderator`,
  onPress: async (_event, { ui }) => {
    return ui.showForm(srNflScoreboardCreationForm);
  },
});

Devvit.addMenuItem({
  label: 'LiveScores: Create manual football scoreboard',
  location: 'subreddit',
  forUserType: `moderator`,
  onPress: async (_event, { ui }) => {
    return ui.showForm(srManualSoccerScoreboardCreateForm);
  },
});

Devvit.addMenuItem({
  label: 'LiveScores: Create football scoreboard',
  location: 'subreddit',
  forUserType: `moderator`,
  onPress: async (_event, { ui }) => {
    return ui.showForm(srSoccerScoreboardCreationForm);
  },
});

Devvit.addMenuItem({
  label: 'LiveScores: Remove all subscriptions',
  location: 'subreddit',
  forUserType: `moderator`,
  onPress: async (_, context) => {
    const subscriptions = await getSubscriptions(context);
    await Promise.all(
      subscriptions.map(async (sub) => {
        await removeSubscription(context, sub);
      })
    );
    context.ui.showToast({
      text: 'Removed all subscriptions',
      appearance: 'success',
    });
  },
});

Devvit.addMenuItem({
  label: 'Livescores: Reset KV Store',
  location: 'subreddit',
  forUserType: `moderator`,
  onPress: async (_, { kvStore, ui }) => {
    const store = await kvStore.list();
    await Promise.all(
      store.map(async (key) => {
        await kvStore.delete(key);
      })
    );
    ui.showToast({
      text: 'Wiped KV Store',
      appearance: 'success',
    });
  },
});

Devvit.addMenuItem({
  label: 'LiveScores: Create MLB Demo',
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
      title: `Scoreboard: Demo`,
      subredditName: currentSubreddit.name,
    });
    const gameSub: GameSubscription = {
      league: getLeagueFromString('mlb'),
      eventId: 'demo-mlb-01',
      service: APIService.ESPN,
    };
    await context.kvStore.put(makeKeyForPostId(post.id), JSON.stringify(gameSub));
    return context.ui.showToast({
      text: 'Scoreboard Demo Post Created!',
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
        return await fetchCachedGameInfo(kvStore, postId);
      }
    });

    const updateInterval = context.useInterval(async () => {
      const data = await fetchCachedGameInfo(kvStore, postId);
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
    //   if (newLastComment == null) {
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
      if (pageId?.startsWith('demo')) {
        const nextPage = nextMLBDemoPage(pageId);
        const gameSub: GameSubscription = {
          league: getLeagueFromString('mlb'),
          eventId: nextPage,
          service: APIService.ESPN,
        };
        await context.kvStore.put(makeKeyForPostId(postId), JSON.stringify(gameSub));
        const update = await fetchCachedGameInfo(kvStore, postId);
        setScoreInfo(update);
      }
    };

    if (scoreInfo) {
      if (scoreInfo.event.gameType === 'baseball') {
        const baseBallScoreInfo = scoreInfo as BaseballGameScoreInfo;
        if (scoreInfo.event.state === EventState.FINAL) updateInterval.stop();
        return BaseballScoreBoard(baseBallScoreInfo, lastComment, demoNext);
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

export default Devvit;
