import type { Post } from '@devvit/public-api';
import { Devvit } from '@devvit/public-api';
import { configurePostWithAvailableReactions, defaultReactions } from '../Reactions.js';
import { LoadingStateFootball } from '../components/Loading.js';
import {
  makeKeyForSubscription,
  makeKeyForEventId,
  makeKeyForPostId,
} from '../sports/GameFetch.js';
import type { GameSubscription } from '../sports/Sports.js';
import { getLeagueFromString, APIService, League } from '../sports/Sports.js';
import { fetchNFLSimulationBoxscore } from '../sports/sportradar/NFLBoxscore.js';
import { addSubscription } from '../subscriptions.js';

export const srManualNFLScoreboardCreateForm = Devvit.createForm(
  () => {
    return {
      fields: [
        {
          name: 'gameId',
          label: 'Sportradar NFL Game ID',
          type: `string`,
          required: true,
        },
        {
          name: 'sessionId',
          label: 'Sportradar Simulated NFL Game Session ID',
          type: `string`,
          required: true,
        },
        {
          name: 'postTitle',
          label: 'Post Title',
          type: 'string',
          required: false,
        },
      ],
      title: 'Create Football Scoreboard Post',
      acceptLabel: 'Next',
      cancelLabel: 'Back',
    };
  },
  async ({ values }, ctx) => {
    const postTitle: string = values.postTitle;
    const league = League.NFL;
    const recordingId = values['gameId'];
    const sessionId = values['sessionId'];

    const gameInfo = await fetchNFLSimulationBoxscore(recordingId, sessionId);
    if (gameInfo === null) {
      return ctx.ui.showToast({
        text: 'Failed to fetch game info.',
      });
    }

    const gameSub: GameSubscription = {
      league: getLeagueFromString(league),
      eventId: gameInfo.event.id,
      service: APIService.SRNFLSim,
      simulationId: sessionId,
      recordingId: recordingId,
    };

    let gameTitle: string = '';
    if (gameInfo !== null && gameInfo !== undefined) {
      gameTitle = `${gameInfo.event.awayTeam.fullName} @ ${gameInfo.event.homeTeam.fullName}`;
      await ctx.kvStore.put(makeKeyForSubscription(gameSub), JSON.stringify(gameInfo));
    }
    const success: boolean = await addSubscription(ctx, JSON.stringify(gameSub));
    if (!success) {
      return ctx.ui.showToast(`An error occurred. Please try again.`);
    }
    const { reddit } = ctx;
    const currentSubreddit = await reddit.getCurrentSubreddit();
    const post: Post = await reddit.submitPost({
      preview: <LoadingStateFootball />,
      title: postTitle && postTitle.length > 0 ? postTitle : `Scoreboard: ${gameTitle}`,
      subredditName: currentSubreddit.name,
    });

    const eventPostIdInfo = await ctx.kvStore.get<string>(makeKeyForEventId(gameSub.eventId));
    let newEventPostIdInfo: { postIds: string[] } | undefined = undefined;
    if (eventPostIdInfo) {
      const info = JSON.parse(eventPostIdInfo);

      newEventPostIdInfo = {
        ...info,
        postIds: [...info.postIds, post.id],
      };
    } else {
      newEventPostIdInfo = {
        postIds: [post.id],
      };
    }

    await Promise.all([
      configurePostWithAvailableReactions(post.id, ctx.redis, defaultReactions),
      /**
       * We need this so that inside of the task scheduler we can find postIDs for given events.
       * This is used to create a cached loading screen as a fallback for errors in case something
       * breaks. It also makes the loading experience look very similar to the live version.
       */
      ctx.kvStore.put(makeKeyForEventId(gameSub.eventId), JSON.stringify(newEventPostIdInfo)),
      ctx.kvStore.put(makeKeyForPostId(post.id), JSON.stringify(gameSub)),
    ]);
    return ctx.ui.showToast({
      text: 'Scoreboard Post Created!',
      appearance: 'success',
    });
  }
);
