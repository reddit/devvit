import { Devvit } from '@devvit/public-api';

import { LoadingStateFootball } from '../components/Loading.js';
import { makeKeyForSubscription } from '../sports/GameFetch.js';
import { fetchGSNFLGame } from '../sports/geniussports/GSNFLMatchState.js';
import type { GSNFLFixture } from '../sports/geniussports/GSNFLSchedule.js';
import { getGSNFLSchedule } from '../sports/geniussports/GSNFLSchedule.js';
import type { GameSubscription } from '../sports/Sports.js';
import {
  APIService,
  getDisplayNameFromLeague,
  getLeagueFromString,
  League,
} from '../sports/Sports.js';
import { timezoneOptions } from '../sports/Timezones.js';
import { createGamePost } from './GameSelectionForm.js';

export const gsNflScoreboardCreationForm = Devvit.createForm(
  () => {
    return {
      fields: [
        {
          name: 'timezone',
          label: 'Timezone',
          helpText: 'Timezone to display game times in',
          type: 'select',
          required: false,
          options: timezoneOptions,
          defaultValue: ['America/Los_Angeles'],
        },
      ],
      title: 'Create NFL Scoreboard Post',
      acceptLabel: 'Next',
      cancelLabel: 'Back',
    };
  },
  async ({ values }, context) => {
    const league = League.NFL;
    const timezone = values['timezone'][0];
    const schedule = await getGSNFLSchedule(context);
    // sort schedule by date
    schedule.sort((a, b) => {
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    });
    // console.log(schedule);
    return context.ui.showForm(gsNflGameSelectForm, {
      league: league,
      timezone: timezone,
      events: schedule,
    });
  }
);

export const gsNflGameSelectForm = Devvit.createForm(
  (data) => {
    const eventOptions: { label: string; value: string }[] = data.events
      .map((event: GSNFLFixture) => ({
        value: `${data.league}*${event.id}`,
        label: `${event.name} - 
        ${dateStringFromEvent(event.startDate, data.timezone)}`,
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
    const league: string = values.game[0].split('*')[0];
    const eventId: string = values.game[0].split('*')[1];
    const gameSub: GameSubscription = {
      league: getLeagueFromString(league),
      eventId: eventId,
      service: APIService.GSNFL,
    };

    const gameInfo = await fetchGSNFLGame(eventId, context);
    let gameTitle: string = '';
    if (gameInfo !== null && gameInfo !== undefined) {
      gameTitle = `${gameInfo.event.name}`;
      await context.kvStore.put(makeKeyForSubscription(gameSub), JSON.stringify(gameInfo));
    }

    await createGamePost(context, gameSub, gameTitle, postTitle, <LoadingStateFootball />);
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
