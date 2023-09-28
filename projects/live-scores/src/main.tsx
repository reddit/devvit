import { Devvit } from '@devvit/public-api';
import { GenericScoreBoard } from './components/Scoreboard.js';
import { BaseballScoreBoard } from './components/baseball.js';
import { CommentData, getLastComment } from './components/comments.js';
import {
  BaseballGameScoreInfo,
  EventState,
  fetchScoreForGame,
  GeneralGameScoreInfo,
} from './espn.js';
import { fetchCachedGameInfoForPostId, makeKeyForSubscription } from './helpers.js';
import { GameSubscription } from './sports.js';
import { getSubscriptions, removeSubscription } from './subscriptions.js';
import { scoreboardCreationForm } from './forms/ScoreboardCreateForm.js';

const UPDATE_FREQUENCY_MINUTES: number = 1;

Devvit.debug.emitSnapshots = true;

Devvit.configure({
  redditAPI: true, // context.reddit will now be available
  http: true,
  kvStore: true,
});

Devvit.addMenuItem({
  label: 'LiveScores: Create a new scoreboard post',
  location: 'subreddit',
  forUserType: `moderator`,
  onPress: async (_event, { ui }) => {
    return ui.showForm(scoreboardCreationForm);
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

Devvit.addCustomPostType({
  name: 'Scoreboard',
  render: async (context) => {
    const { useState, postId, kvStore } = context;
    const [scoreInfo, setScoreInfo] = useState(async () => {
      return await fetchCachedGameInfoForPostId(kvStore, postId);
    });

    const updateInterval = context.useInterval(async () => {
      const data = await fetchCachedGameInfoForPostId(kvStore, postId);
      data && setScoreInfo(data);
    }, 10000);

    updateInterval.start();

    const loading: CommentData = {
      id: `none`,
      username: `none`,
      text: `nope`,
      postId: `none`,
    };
    const [lastComment, setLastComment] = context.useState<CommentData>(async () => {
      const storedLastComment = await getLastComment(context, context.postId);
      if (storedLastComment != undefined) {
        return storedLastComment;
      } else {
        return loading;
      }
    });

    const interval = context.useInterval(async () => {
      const newLastComment: any = await getLastComment(context, context.postId);
      if (newLastComment == undefined) {
        return;
      }
      if (lastComment.id != newLastComment.id) {
        console.log({ newLastComment });
        setLastComment(newLastComment);
      } else {
        console.log(`ignoring comment, same as last`);
      }
    }, 3000);
    interval.start();

    if (scoreInfo) {
      if (scoreInfo.event.gameType == 'baseball') {
        const baseBallScoreInfo = scoreInfo as BaseballGameScoreInfo;
        if (scoreInfo.event.state === EventState.FINAL) updateInterval.stop();
        return BaseballScoreBoard(baseBallScoreInfo, lastComment);
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
    console.log('Running game_subscription_thread...');
    const subscriptions: string[] = await getSubscriptions(context);
    console.log('Found ' + subscriptions.length + ' active subscription(s)');
    const gameSubscriptions: GameSubscription[] = subscriptions.map((sub: string) => ({
      league: JSON.parse(sub)['league'],
      eventId: JSON.parse(sub)['eventId'],
    }));
    const eventFetches: Promise<GeneralGameScoreInfo | null>[] = [];
    gameSubscriptions.forEach((gameSub: GameSubscription) => {
      eventFetches.push(fetchScoreForGame(gameSub.eventId, gameSub.league));
    });
    const results: GeneralGameScoreInfo[] = (await Promise.all(eventFetches)).flatMap((result) =>
      result ? [result] : []
    );
    for (let i = 0; i < gameSubscriptions.length; i++) {
      await context.kvStore.put(
        makeKeyForSubscription(gameSubscriptions[i]),
        JSON.stringify(results[i])
      );
      if (results[i].event.state == EventState.FINAL) {
        console.log(`Game ID ${results[i].event.id} (${results[i].event.awayTeam.abbreviation} @ \
${results[i].event.homeTeam.abbreviation}) has ended. Cancelling subscription ${subscriptions[i]}.`);
        await removeSubscription(context, subscriptions[i]);
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

export default Devvit;
