import { Devvit } from '@devvit/public-api';

import { fetchNextEventForTeam } from '../sports/espn/espn.js';
import { GameEvent, TeamInfo } from '../sports/GameEvent.js';
import { getDisplayNameFromLeague } from '../sports/Sports.js';
import { espnGameSelectForm } from './GameSelectionForm.js';

export const espnSingleTeamSelectForm = Devvit.createForm(
  (data) => {
    const teamOptions: { label: string; value: string }[] = data.teams
      .map((team: TeamInfo) => ({
        value: `${data.league}-${team.id}-${data.timezone}`,
        label: `${team.location} ${team.name}`,
      }))
      .sort();

    return {
      fields: [
        {
          name: 'team',
          label: 'Team',
          type: 'select',
          required: true,
          options: teamOptions,
        },
      ],
      title: 'Create Live Scoreboard Post',
      description: `League selected: ${getDisplayNameFromLeague(data['league'])}`,
      acceptLabel: 'Next',
      cancelLabel: 'Cancel',
    };
  },
  async ({ values }, ctx) => {
    const league: string = values.team[0].split('-')[0];
    const teamId: string = values.team[0].split('-')[1];
    const timezone: string = values.team[0].split('-')[2];
    const event: GameEvent = await fetchNextEventForTeam(teamId, league);
    return ctx.ui.showForm(espnGameSelectForm, {
      league: league,
      events: [event],
      timezone: timezone,
    });
  }
);
