import type { Data, Post } from '@devvit/public-api';
import { Devvit } from '@devvit/public-api';
import { eventStateToString, fetchScoreForGame } from '../sports/espn/espn.js';
import type { GameSubscription } from '../sports/Sports.js';
import { getDisplayNameFromLeague, getLeagueFromString, APIService } from '../sports/Sports.js';
import { addSubscription } from '../subscriptions.js';
import type { NFLGame } from '../sports/sportradar/NFLSchedule.js';
import type { GameEvent, GeneralGameScoreInfo } from '../sports/GameEvent.js';
import { compareEvents } from '../sports/GameEvent.js';
import { fetchNFLBoxscore } from '../sports/sportradar/NFLBoxscore.js';
import { fetchSoccerEvent } from '../sports/sportradar/SoccerEvent.js';
import type { CricketSportEvent } from '../sports/sportradar/CricketModels.js';
import { fetchCricketMatch } from '../sports/sportradar/CricketMatch.js';
import {
  makeKeyForSubscription,
  makeKeyForPostId,
  makeKeyForEventId,
  makeKeyForEventNumber,
  makeKeyForChatUrl,
} from '../sports/GameFetch.js';
import { LoadingState, LoadingStateFootball } from '../components/Loading.js';
import { configurePostWithAvailableReactions, defaultReactions } from '../Reactions.js';
import type { BasketballGame } from '../sports/sportradar/BasketballModels.js';
import {
  fetchNBAGame,
  fetchNCAAMensBasketballGame,
} from '../sports/sportradar/BasketballPlayByPlay.js';

export const espnGameSelectForm = Devvit.createForm(
  (data) => {
    data.events.sort(compareEvents);
    const eventOptions: { label: string; value: string }[] = data.events
      .map((event: GameEvent) => ({
        value: `${data.league}-${event.id}`,
        label: `${event.awayTeam.abbreviation} @ ${event.homeTeam.abbreviation} - 
        ${dateStringFromEvent(event.date, data.timezone)} - 
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

async function createGamePost(
  ctx: Devvit.Context,
  gameSub: GameSubscription,
  gameTitle: string,
  postTitle: string,
  loadingState: JSX.Element
): Promise<string | undefined> {
  const success: boolean = await addSubscription(ctx, JSON.stringify(gameSub));
  if (!success) {
    ctx.ui.showToast(`An error occurred. Please try again.`);
    return undefined;
  }
  const { reddit } = ctx;
  const currentSubreddit = await reddit.getCurrentSubreddit();
  const post: Post = await reddit.submitPost({
    preview: loadingState,
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
  ctx.ui.showToast({
    text: 'Scoreboard Post Created!',
    appearance: 'success',
  });
  return post.id;
}

export const srNflGameSelectForm = Devvit.createForm(
  (data) => {
    const eventOptions: { label: string; value: string }[] = data.events
      .map((event: NFLGame) => ({
        value: `${data.league}*${event.id}`,
        label: `${event.away?.alias} @ ${event.home?.alias} - 
        ${dateStringFromEvent(event.scheduled, data.timezone)}`,
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

    await createGamePost(ctx, gameSub, gameTitle, postTitle, <LoadingStateFootball />);
  }
);

export const srSoccerGameSelectionForm = Devvit.createForm(
  (data) => {
    const eventOptions: { label: string; value: string }[] = data.events
      .map((event: GeneralGameScoreInfo) => ({
        value: `${data.league}-${event.event.id}`,
        label: `${event.event.homeTeam.abbreviation} vs ${event.event.awayTeam.abbreviation} - 
        ${dateStringFromEvent(event.event.date, data.timezone)} - 
        ${eventStateToString(event.event.state)}`,
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
    if (gameInfo !== null && gameInfo !== undefined) {
      gameTitle = `${gameInfo.event.homeTeam.fullName} vs ${gameInfo.event.awayTeam.fullName}`;
      await context.kvStore.put(makeKeyForSubscription(gameSub), JSON.stringify(gameInfo));
    }

    await createGamePost(context, gameSub, gameTitle, postTitle, LoadingState());
  }
);

function dateStringFromEvent(scheduled: string, timezone: string): string {
  return new Date(scheduled).toLocaleDateString('en-us', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: timezone,
  });
}

function basketballEventOptions(data: Data): { label: string; value: string }[] {
  const eventOptions: { label: string; value: string }[] = data.events
    .map((event: BasketballGame) => ({
      value: `${data.league}*${event.id}`,
      label: `${event.away?.alias} @ ${event.home?.alias} - 
      ${dateStringFromEvent(event.scheduled, data.timezone)}`,
    }))
    .sort();
  return eventOptions;
}

export const srBasketballGameSelectForm = Devvit.createForm(
  (data) => {
    const eventOptions = basketballEventOptions(data);
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
      ],
      title: 'Create Scoreboard Post',
      description: `League selected: ${getDisplayNameFromLeague(data['league'])}`,
      acceptLabel: 'Create Game Post!',
      cancelLabel: 'Cancel',
    };
  },
  async ({ values }, ctx) => {
    const league: string = values.game[0].split('*')[0];
    const service = league === 'ncaamb' ? APIService.SRNCAAMB : APIService.SRNBA;
    await fetchAndCreateBasketballGamePost(values, service, ctx);
  }
);

export const srBasketballSimGameSelectForm = Devvit.createForm(
  (data) => {
    const eventOptions = basketballEventOptions(data);
    return {
      fields: [
        {
          name: 'game',
          label: 'Game (Simulated)',
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
      ],
      title: 'Create Sim Scoreboard Post',
      description: `League selected: ${getDisplayNameFromLeague(data['league'])}`,
      acceptLabel: 'Create Sim Game Post!',
      cancelLabel: 'Cancel',
    };
  },
  async ({ values }, ctx) => {
    const service = APIService.SRNBASim;
    await fetchAndCreateBasketballGamePost(values, service, ctx);
  }
);

async function fetchAndCreateBasketballGamePost(
  values: unknown,
  service: APIService,
  ctx: Devvit.Context
): Promise<void> {
  const postTitle: string = values.postTitle;
  const league: string = values.game[0].split('*')[0];
  const eventId: string = values.game[0].split('*')[1];

  const gameSub: GameSubscription = {
    league: getLeagueFromString(league),
    eventId: eventId,
    service: service,
  };

  const gameInfo =
    service === APIService.SRNCAAMB
      ? await fetchNCAAMensBasketballGame(gameSub.eventId, ctx)
      : await fetchNBAGame(gameSub.eventId, ctx, service);

  let gameTitle: string = '';
  if (gameInfo !== null && gameInfo !== undefined) {
    gameTitle = `${gameInfo.event.awayTeam.fullName} @ ${gameInfo.event.homeTeam.fullName}`;
    await ctx.kvStore.put(makeKeyForSubscription(gameSub), JSON.stringify(gameInfo));
  }

  await createGamePost(ctx, gameSub, gameTitle, postTitle, LoadingState());
}

export const srCricketMatchSelectionForm = Devvit.createForm(
  (data) => {
    const eventOptions: { label: string; value: string }[] = data.events
      .map((event: CricketSportEvent) => ({
        value: `${data.league}-${event.id}-${data.timezone}-${event.matchNumber}`,
        label: `${event.competitors[0].abbreviation} vs ${event.competitors[1].abbreviation} - 
        ${dateStringFromEvent(event.scheduled, data.timezone)}`,
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
          name: 'chatUrl',
          label: 'Chat Room URL',
          type: 'string',
          required: false,
          helpText: `Optional chat URL. Leave black for not showing the 'Join the Chat button' in the post unit.`,
        },
      ],
      title: 'Create Scoreboard Post',
      description: `League selected: ${getDisplayNameFromLeague(data['league'])}`,
      acceptLabel: 'Create Game Post!',
      cancelLabel: 'Cancel',
    };
  },
  async ({ values }, ctx) => {
    const service = APIService.SRCricket;
    if (values.chatUrl) {
      if (!validChatURL(values.chatUrl)) {
        ctx.ui.showToast(
          `Invalid Chat URL. Please copy the chat URL from mobile app / room / share chat. It should follow the format https://www.reddit.com/r/{subreddit}/s/{chat-id}`
        );
        return;
      }
    }
    await fetchAndCreateCricketMatchPost(ctx, service, values);
  }
);

export function validChatURL(str: string): boolean {
  try {
    const url = new URL(str);
    // A chat url follows this shape https://www.reddit.com/r/{subreddit}/s/{chat-id}
    const paths = url.pathname.split('/');
    if (paths.length !== 5) {
      return false;
    }
    return url.hostname === 'www.reddit.com' && paths[1] === 'r' && paths[3] === 's';
  } catch (error) {
    return false;
  }
}

async function fetchAndCreateCricketMatchPost(
  context: Devvit.Context,
  service: APIService,
  values: Data
): Promise<void> {
  const postTitle: string = values.postTitle;
  const chatUrl: string = values.chatUrl;
  const league: string = values.game[0].split('-')[0];
  const eventId: string = values.game[0].split('-')[1];
  const timezone: string = values.game[0].split('-')[2];
  const eventNumber: string = values.game[0].split('-')[3];
  const eventTotal: string = values.game[0].split('-')[4];
  const gameSub: GameSubscription = {
    league: getLeagueFromString(league),
    eventId: eventId,
    service: service,
  };

  const gameInfo: GeneralGameScoreInfo | null = await fetchCricketMatch(
    league,
    gameSub.eventId,
    context,
    chatUrl,
    timezone,
    eventNumber,
    eventTotal
  );

  let gameTitle: string = '';
  if (gameInfo !== null && gameInfo !== undefined) {
    gameTitle = `${gameInfo.event.homeTeam.fullName} vs ${gameInfo.event.awayTeam.fullName}`;
    await context.kvStore.put(makeKeyForSubscription(gameSub), JSON.stringify(gameInfo));
  }

  const postId = await createGamePost(context, gameSub, gameTitle, postTitle, LoadingState());

  if (postId !== undefined) {
    await context.redis.set(
      makeKeyForEventNumber(eventId),
      eventNumber + '-' + eventTotal + '-' + timezone
    );
    if (chatUrl) {
      await context.redis.set(makeKeyForChatUrl(eventId), chatUrl);
    }
  }
}
