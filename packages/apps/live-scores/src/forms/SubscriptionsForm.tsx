import { Devvit } from '@devvit/public-api';
import { GameSubscription } from '../sports/Sports.js';
import { GeneralGameScoreInfo } from '../sports/GameEvent.js';
import { getSubscriptions, removeSubscription } from '../subscriptions.js';
import { formatDateForForms } from '../sports/Timezones.js';
import { fetchCachedGameInfoForGameSubscription } from '../sports/GameFetch.js';

type GameInfoPair = readonly [GameSubscription, GeneralGameScoreInfo];

export async function fetchAllSubsAndGames(context: Devvit.Context): Promise<GameInfoPair[]> {
  const subscriptions = await getSubscriptions(context.kvStore);
  const gameSubscriptions: GameSubscription[] = subscriptions.map((sub: string) => {
    const parsedSub = JSON.parse(sub);
    return {
      league: parsedSub['league'],
      eventId: parsedSub['eventId'],
      service: parsedSub['service'],
    };
  });

  return (
    await Promise.all(
      gameSubscriptions.map(async (sub) => {
        const info = await fetchCachedGameInfoForGameSubscription(context.kvStore, sub);
        if (info) {
          return [sub, info] as const;
        }
      })
    )
  ).filter((game): game is GameInfoPair => game !== undefined);
}

export const subscriptionsForm = Devvit.createForm(
  (data) => {
    const subscriptions: GameInfoPair[] = data.subscriptions;
    const options: { label: string; value: string }[] = subscriptions.map(([sub, info]) => ({
      label: `${info.event.homeTeam.abbreviation} vs ${
        info.event.awayTeam.abbreviation
      } ${formatDateForForms(info.event.date)}`,
      value: JSON.stringify(sub),
    }));
    return {
      fields: [
        {
          name: 'subscriptions',
          label: 'Subscriptions',
          type: 'select',
          required: true,
          options: options,
        },
      ],
      title: 'Manage Game Subscriptions',
      description: `View and manage upcoming and active game subscriptions.`,
      acceptLabel: `Remove Subscription`,
      cancelLabel: `Back`,
    };
  },
  async ({ values }, ctx) => {
    const subscription: string = values.subscriptions[0];
    const success = await removeSubscription(ctx.kvStore, subscription);
    return ctx.ui.showToast({
      text: success ? 'Subscription removed' : 'Failed to remove subscription, please try again',
      appearance: success ? 'success' : 'neutral',
    });
  }
);
