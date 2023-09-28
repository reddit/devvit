import { Devvit, Post } from '@devvit/public-api';
import { GameEvent, eventStateToString, GeneralGameScoreInfo, fetchScoreForGame } from '../espn.js';
import { compareEvents, makeKeyForSubscription, makeKeyForPostId } from '../helpers.js';
import { getDisplayNameFromLeague, GameSubscription, getLeagueFromString } from '../sports.js';
import { addSubscription } from '../subscriptions.js';

export const gameSelectForm = Devvit.createForm(
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
