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
import { makeKeyForSubscription, makeKeyForPostId } from '../sports/GameFetch.js';

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
      preview: (
        <vstack padding="medium" cornerRadius="medium">
          <text style="heading" size="medium">
            Loading scoreboard for game...
          </text>
        </vstack>
      ),
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
      ],
      title: 'Create Live Scoreboard Post',
      description: `League selected: ${getDisplayNameFromLeague(data['league'])}`,
      acceptLabel: 'Create Game Post!',
      cancelLabel: 'Cancel',
    };
  },
  async ({ values }, ctx) => {
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
    const success: boolean = await addSubscription(ctx, JSON.stringify(gameSub));
    if (!success) {
      return ctx.ui.showToast(`An error occurred. Please try again.`);
    }
    const { reddit } = ctx;
    const currentSubreddit = await reddit.getCurrentSubreddit();
    const post: Post = await reddit.submitPost({
      preview: (
        <vstack padding="medium" cornerRadius="medium">
          <text style="heading" size="medium">
            Loading scoreboard for game...
          </text>
        </vstack>
      ),
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

export const srSoccerGameSelectionForm = Devvit.createForm(
  (data) => {
    const eventOptions: { label: string; value: string }[] = data.events
      .map((event: GeneralGameScoreInfo) => ({
        value: `${data.league}-${event.event.id}`,
        label: `${event.event.awayTeam.abbreviation} @ ${event.event.homeTeam.abbreviation} - 
        ${new Date(event.event.date).toLocaleDateString('en-us', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
          timeZone: data.timezone,
        })} - 
        ${eventStateToString(event.event.state)}
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
  async ({ values }, context) => {
    const league: string = values.game[0].split('-')[0];
    const eventId: string = values.game[0].split('-')[1];
    const gameSub: GameSubscription = {
      league: getLeagueFromString(league),
      eventId: eventId,
      service: APIService.SRSoccer,
    };

    const gameInfo: GeneralGameScoreInfo | null = await fetchSoccerEvent(gameSub.eventId, context);
    let gameTitle: string = '';
    if (gameInfo !== null) {
      gameTitle = `${gameInfo.event.awayTeam.fullName} @ ${gameInfo.event.homeTeam.fullName}`;
      await context.kvStore.put(makeKeyForSubscription(gameSub), JSON.stringify(gameInfo));
    }
    const success: boolean = await addSubscription(context, JSON.stringify(gameSub));
    if (!success) {
      return context.ui.showToast(`An error occurred. Please try again.`);
    }
    const { reddit } = context;
    const currentSubreddit = await reddit.getCurrentSubreddit();
    const post: Post = await reddit.submitPost({
      preview: (
        <vstack padding="medium" cornerRadius="medium">
          <text style="heading" size="medium">
            Loading scoreboard for game...
          </text>
        </vstack>
      ),
      title: `Scoreboard: ${gameTitle}`,
      subredditName: currentSubreddit.name,
    });
    await context.kvStore.put(makeKeyForPostId(post.id), JSON.stringify(gameSub));
    return context.ui.showToast({
      text: 'Scoreboard Post Created!',
      appearance: 'success',
    });
  }
);
