import { Devvit, Post } from '@devvit/public-api';
import { eventStateToString, fetchScoreForGame } from '../sports/espn/espn.js';
import {
  getDisplayNameFromLeague,
  GameSubscription,
  getLeagueFromString,
  APIService,
} from '../sports/Sports.js';
import { addSubscription } from '../subscriptions.js';
import { NFLGame } from '../sports/sportradar/NFLSchedule.js';
import { GameEvent, GeneralGameScoreInfo, compareEvents } from '../sports/GameEvent.js';
import { fetchNFLBoxscore } from '../sports/sportradar/NFLBoxscore.js';
import { fetchSoccerEvent } from '../sports/sportradar/SoccerEvent.js';
import {
  makeKeyForSubscription,
  makeKeyForPostId,
  makeKeyForEventId,
} from '../sports/GameFetch.js';
import { LoadingState, LoadingStateFootball } from '../components/Loading.js';
import { configurePostWithAvailableReactions, defaultReactions } from '../Reactions.js';
import { toggleEventComments } from '../EventComment.js';
import { AppContent } from '../main.js';
import { ScoreboardPage } from '../components/Scoreboard.js';
import { BasketballGame } from '../sports/sportradar/BasketballModels.js';
import { fetchNBAGame } from '../sports/sportradar/BasketballPlayByPlay.js';

export const espnGameSelectForm = Devvit.createForm(
  (data) => {
    data.events.sort(compareEvents);
    const eventOptions: { label: string; value: string }[] = data.events
      .map((event: GameEvent) => ({
        value: `${data.league}-${event.id}`,
        label: `${event.awayTeam.abbreviation} @ ${event.homeTeam.abbreviation} - 
        ${new Date(event.date).toLocaleDateString('en-us', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
          timeZone: data.timezone,
        })} - 
        ${eventStateToString(event.state)}
      `,
      }))
      .sort();

    return {
      fields: [
        {
          name: 'game',
          label: 'Game',
          type: 'select',
          required: true,
          options: eventOptions,
        },
      ],
      title: 'Create Live Scoreboard Post',
      description: `League selected: ${getDisplayNameFromLeague(data['league'])}`,
      acceptLabel: 'Create Game Post!',
      cancelLabel: 'Cancel',
    };
  },
  async ({ values }, ctx) => {
    const league: string = values.game[0].split('-')[0];
    const eventId: string = values.game[0].split('-')[1];
    const gameSub: GameSubscription = {
      league: getLeagueFromString(league),
      eventId: eventId,
      service: APIService.ESPN,
    };

    const gameInfo: GeneralGameScoreInfo | null = await fetchScoreForGame(
      gameSub.eventId,
      getLeagueFromString(league)
    );
    let gameTitle: string = '';
    if (gameInfo !== null) {
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
      preview: LoadingState(),
      title: `Scoreboard: ${gameTitle}`,
      subredditName: currentSubreddit.name,
    });
    await ctx.kvStore.put(makeKeyForPostId(post.id), JSON.stringify(gameSub));
    return ctx.ui.showToast({
      text: 'Scoreboard Post Created!',
      appearance: 'success',
    });
  }
);

export const srNflGameSelectForm = Devvit.createForm(
  (data) => {
    const eventOptions: { label: string; value: string }[] = data.events
      .map((event: NFLGame) => ({
        value: `${data.league}*${event.id}`,
        label: `${event.away?.alias} @ ${event.home?.alias} - 
        ${new Date(event.scheduled).toLocaleDateString('en-us', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
          timeZone: data.timezone,
        })}
      `,
      }))
      .sort();

    return {
      fields: [
        {
          name: 'game',
          label: 'Game',
          type: 'select',
          required: true,
          options: eventOptions,
        },
        {
          name: 'postTitle',
          label: 'Post title',
          type: 'string',
          required: false,
          helpText: `Optional post title. Leave blank for auto-generated title.`,
        },
        {
          name: 'eventComments',
          label: 'Allow Scoreboard to create comments for game events?',
          helpText:
            'Example: Latest Update (04:20) - A person just scored a bunch of points. Wow, go sports!',
          type: 'boolean',
          defaultValue: false,
        },
      ],
      title: 'Create Scoreboard Post',
      description: `League selected: ${getDisplayNameFromLeague(data['league'])}`,
      acceptLabel: 'Create Game Post!',
      cancelLabel: 'Cancel',
    };
  },
  async ({ values }, ctx) => {
    const postTitle: string = values.postTitle;
    const league: string = values.game[0].split('*')[0];
    const eventId: string = values.game[0].split('*')[1];
    const allowComments: boolean = values.eventComments;
    const gameSub: GameSubscription = {
      league: getLeagueFromString(league),
      eventId: eventId,
      service: APIService.SRNFL,
    };

    const gameInfo = await fetchNFLBoxscore(gameSub.eventId, ctx);

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

    await toggleEventComments(allowComments, post.id, ctx.redis);

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
    // We need this so than we can pull the post ID for a
    return ctx.ui.showToast({
      text: 'Scoreboard Post Created!',
      appearance: 'success',
    });
  }
);

export const srSoccerGameSelectionForm = Devvit.createForm(
  (data) => {
    const eventOptions: { label: string; value: string }[] = data.events
      .map((event: GeneralGameScoreInfo) => ({
        value: `${data.league}-${event.event.id}`,
        label: `${event.event.homeTeam.abbreviation} vs ${event.event.awayTeam.abbreviation} - 
        ${new Date(event.event.date).toLocaleDateString('en-us', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
          timeZone: data.timezone,
        })} - ${eventStateToString(event.event.state)}`,
      }))
      .sort();

    return {
      fields: [
        {
          name: 'game',
          label: 'Game',
          type: 'select',
          required: true,
          options: eventOptions,
        },
        {
          name: 'postTitle',
          label: 'Post title',
          type: 'string',
          required: false,
          helpText: `Optional post title. Leave blank for auto-generated title.`,
        },
        {
          name: 'eventComments',
          label: 'Allow Scoreboard to create comments for game events?',
          helpText:
            'Example: Latest Update (04:20) - A person just scored a bunch of points. Wow, go sports!',
          type: 'boolean',
          defaultValue: false,
        },
      ],
      title: 'Create Scoreboard Post',
      description: `League selected: ${getDisplayNameFromLeague(data['league'])}`,
      acceptLabel: 'Create Game Post!',
      cancelLabel: 'Cancel',
    };
  },
  async ({ values }, context) => {
    const postTitle: string = values.postTitle;
    const league: string = values.game[0].split('-')[0];
    const eventId: string = values.game[0].split('-')[1];
    const allowComments: boolean = values.eventComments;
    const gameSub: GameSubscription = {
      league: getLeagueFromString(league),
      eventId: eventId,
      service: APIService.SRSoccer,
    };

    const gameInfo: GeneralGameScoreInfo | null = await fetchSoccerEvent(
      league,
      gameSub.eventId,
      context
    );
    let gameTitle: string = '';
    if (gameInfo !== null) {
      gameTitle = `${gameInfo.event.homeTeam.fullName} vs ${gameInfo.event.awayTeam.fullName}`;
      await context.kvStore.put(makeKeyForSubscription(gameSub), JSON.stringify(gameInfo));
    }
    const success: boolean = await addSubscription(context, JSON.stringify(gameSub));
    if (!success) {
      return context.ui.showToast(`An error occurred. Please try again.`);
    }
    const { reddit } = context;
    const currentSubreddit = await reddit.getCurrentSubreddit();
    const post: Post = await reddit.submitPost({
      preview: LoadingState(),
      title: postTitle && postTitle.length > 0 ? postTitle : `Scoreboard: ${gameTitle}`,
      subredditName: currentSubreddit.name,
    });

    await toggleEventComments(allowComments, post.id, context.redis);

    const eventPostIdInfo = await context.kvStore.get<string>(makeKeyForEventId(gameSub.eventId));
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

    await context.kvStore.put(
      makeKeyForEventId(gameSub.eventId),
      JSON.stringify(newEventPostIdInfo)
    );

    await context.kvStore.put(makeKeyForPostId(post.id), JSON.stringify(gameSub));
    return context.ui.showToast({
      text: 'Scoreboard Post Created!',
      appearance: 'success',
    });
  }
);

export const srNbaGameSelectForm = Devvit.createForm(
  (data) => {
    const eventOptions: { label: string; value: string }[] = data.events
      .map((event: BasketballGame) => ({
        value: `${data.league}*${event.id}`,
        label: `${event.away?.alias} @ ${event.home?.alias} - 
        ${new Date(event.scheduled).toLocaleDateString('en-us', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
          timeZone: data.timezone,
        })}
      `,
      }))
      .sort();

    return {
      fields: [
        {
          name: 'game',
          label: 'Game',
          type: 'select',
          required: true,
          options: eventOptions,
        },
        {
          name: 'postTitle',
          label: 'Post title',
          type: 'string',
          required: false,
          helpText: `Optional post title. Leave blank for auto-generated title.`,
        },
        {
          name: 'eventComments',
          label: 'Allow Scoreboard to create comments for game events?',
          helpText:
            'Example: Latest Update (04:20) - A person just scored a bunch of points. Wow, go sports!',
          type: 'boolean',
          defaultValue: false,
        },
      ],
      title: 'Create Scoreboard Post',
      description: `League selected: ${getDisplayNameFromLeague(data['league'])}`,
      acceptLabel: 'Create Game Post!',
      cancelLabel: 'Cancel',
    };
  },
  async ({ values }, ctx) => {
    const postTitle: string = values.postTitle;
    const league: string = values.game[0].split('*')[0];
    const eventId: string = values.game[0].split('*')[1];
    const allowComments: boolean = values.eventComments;
    const gameSub: GameSubscription = {
      league: getLeagueFromString(league),
      eventId: eventId,
      service: APIService.SRNBA,
    };

    const gameInfo = await fetchNBAGame(gameSub.eventId, ctx);

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
      preview: LoadingState(),
      title: postTitle && postTitle.length > 0 ? postTitle : `Scoreboard: ${gameTitle}`,
      subredditName: currentSubreddit.name,
    });

    await toggleEventComments(allowComments, post.id, ctx.redis);

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
    // We need this so than we can pull the post ID for a
    return ctx.ui.showToast({
      text: 'Scoreboard Post Created!',
      appearance: 'success',
    });
  }
);
