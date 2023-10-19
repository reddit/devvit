import { Devvit } from '@devvit/public-api';
import { BaseballGameScoreInfo, fetchActiveGames, fetchAllTeams } from '../sports/espn/espn.js';
import { timezoneOptions } from '../sports/Helpers.js';
import { leaguesSupported } from '../sports/Sports.js';
import { gameSelectForm, srGameSelectForm } from './GameSelectionForm.js';
import { singleTeamSelectForm } from './SingleTeamSelectionForm.js';
import { fetchNflCurrentWeek } from '../sports/sportradar/NFLSchedule.js';
import { GeneralGameScoreInfo } from '../sports/GameModels.js';

export const scoreboardCreationForm = Devvit.createForm(
  () => {
    return {
      fields: [
        {
          name: 'league',
          label: 'League',
          helpText: 'Select a league',
          type: 'select',
          required: true,
          options: leaguesSupported,
        },
        {
          name: 'filterby',
          label: 'Filter By',
          helpText: 'Filter games by',
          type: 'select',
          required: true,
          options: [
            {
              label: 'All games available',
              value: 'all',
            },
            {
              label: 'Specific Team',
              value: 'team',
            },
          ],
        },
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
      title: 'Create Live Scoreboard Post',
      acceptLabel: 'Next',
      cancelLabel: 'Back',
    };
  },
  async ({ values }, ctx) => {
    const league = values['league'][0];
    const filterBy = values['filterby'][0];
    const timezone = values['timezone'][0];

    if (filterBy == 'all' && league == 'mlb') {
      const scores: BaseballGameScoreInfo[] = await fetchActiveGames<BaseballGameScoreInfo>(league);
      return ctx.ui.showForm(gameSelectForm, {
        league: league,
        timezone: timezone,
        events: scores.map((score: BaseballGameScoreInfo) => score.event),
      });
    } else if (filterBy == 'all') {
      const scores: GeneralGameScoreInfo[] = await fetchActiveGames<GeneralGameScoreInfo>(league);
      return ctx.ui.showForm(gameSelectForm, {
        league: league,
        timezone: timezone,
        events: scores.map((score: GeneralGameScoreInfo) => score.event),
      });
    } else if (filterBy == 'team') {
      const teams = await fetchAllTeams(league);
      return ctx.ui.showForm(singleTeamSelectForm, {
        league: league,
        teams: teams,
        timezone: timezone,
      });
    }
  }
);

export const srScoreboardCreationForm = Devvit.createForm(
  () => {
    return {
      fields: [
        {
          name: 'league',
          label: 'League',
          helpText: 'Select a league',
          type: 'select',
          required: true,
          options: [{ label: `NFL`, value: `nfl` }],
        },
        {
          name: 'filterby',
          label: 'Filter By',
          helpText: 'Filter games by',
          type: 'select',
          required: true,
          options: [
            {
              label: 'All games available',
              value: 'all',
            },
          ],
        },
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
      title: 'Create SR Live Scoreboard Post',
      acceptLabel: 'Next',
      cancelLabel: 'Back',
    };
  },
  async ({ values }, ctx) => {
    const league = values['league'][0];
    const filterBy = values['filterby'][0];
    const timezone = values['timezone'][0];

    if (filterBy == 'all' && league == 'nfl') {
      const schedule = await fetchNflCurrentWeek(ctx);
      return ctx.ui.showForm(srGameSelectForm, {
        league: league,
        timezone: timezone,
        events: schedule?.games,
      });
    }
  }
);
