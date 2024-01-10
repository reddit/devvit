import { Devvit } from '@devvit/public-api';
import { BaseballGameScoreInfo, fetchActiveGames, fetchAllTeams } from '../sports/espn/espn.js';
import { timezoneOptions } from '../sports/Timezones.js';
import { APIService, League, getLeagueFromString, leaguesSupported } from '../sports/Sports.js';
import {
  espnGameSelectForm,
  srSoccerGameSelectionForm,
  srNflGameSelectForm,
} from './GameSelectionForm.js';
import { espnSingleTeamSelectForm } from './SingleTeamSelectionForm.js';
import { fetchNflSchedule, filteredGamesFromSeason } from '../sports/sportradar/NFLSchedule.js';
import { GeneralGameScoreInfo } from '../sports/GameEvent.js';
import { fetchSoccerEvent } from '../sports/sportradar/SoccerEvent.js';
import { fetchSoccerGames } from '../sports/sportradar/SoccerSchedule.js';
import { infoForLeague } from '../sports/sportradar/SoccerLeagues.js';

export const espnScoreboardCreationForm = Devvit.createForm(
  () => {
    return {
      fields: [
        {
          name: 'league',
          label: 'League',
          helpText: 'Select a league',
          type: 'select',
          required: true,
          options: leaguesSupported(APIService.ESPN),
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
      title: 'Create Scoreboard Post',
      acceptLabel: 'Next',
      cancelLabel: 'Back',
    };
  },
  async ({ values }, ctx) => {
    const league = values['league'][0];
    const filterBy = values['filterby'][0];
    const timezone = values['timezone'][0];

    if (filterBy === 'all' && league === 'mlb') {
      const scores: BaseballGameScoreInfo[] = await fetchActiveGames<BaseballGameScoreInfo>(league);
      return ctx.ui.showForm(espnGameSelectForm, {
        league: league,
        timezone: timezone,
        events: scores.map((score: BaseballGameScoreInfo) => score.event),
      });
    } else if (filterBy === 'all') {
      const scores: GeneralGameScoreInfo[] = await fetchActiveGames<GeneralGameScoreInfo>(league);
      return ctx.ui.showForm(espnGameSelectForm, {
        league: league,
        timezone: timezone,
        events: scores.map((score: GeneralGameScoreInfo) => score.event),
      });
    } else if (filterBy === 'team') {
      const teams = await fetchAllTeams(league);
      return ctx.ui.showForm(espnSingleTeamSelectForm, {
        league: league,
        teams: teams,
        timezone: timezone,
      });
    }
  }
);

export const srNflScoreboardCreationForm = Devvit.createForm(
  () => {
    return {
      fields: [
        {
          name: 'seasonType',
          label: 'Reagular/Post Season',
          helpText: 'Show regular season or post season games',
          type: 'select',
          required: true,
          options: [
            { label: 'Pre Season', value: 'PRE' },
            { label: 'Regular Season', value: 'REG' },
            { label: 'Post Season', value: 'PST' },
          ],
          defaultValue: ['PST'],
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
      title: 'Create NFL Scoreboard Post',
      acceptLabel: 'Next',
      cancelLabel: 'Back',
    };
  },
  async ({ values }, ctx) => {
    const league = League.NFL;
    const seasonType = values['seasonType'][0];
    const timezone = values['timezone'][0];
    const schedule = await fetchNflSchedule(seasonType, ctx);
    const games = await filteredGamesFromSeason(schedule);
    return ctx.ui.showForm(srNflGameSelectForm, {
      league: league,
      timezone: timezone,
      events: games,
    });
  }
);

export const srManualSoccerScoreboardCreateForm = Devvit.createForm(
  () => {
    return {
      fields: [
        {
          name: 'gameId',
          label: 'Sportradar Soccer Game ID',
          type: `string`,
          required: true,
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
      title: 'Create Football Scoreboard Post',
      acceptLabel: 'Next',
      cancelLabel: 'Back',
    };
  },
  async ({ values }, ctx) => {
    const league = `epl`;
    const timezone = values['timezone'][0];
    const game = await fetchSoccerEvent(league, values.gameId, ctx);
    const games = [game];
    return ctx.ui.showForm(srSoccerGameSelectionForm, {
      league: league,
      timezone: timezone,
      events: games,
    });
  }
);

export const srSoccerScoreboardCreationForm = Devvit.createForm(
  () => {
    return {
      fields: [
        {
          name: 'league',
          label: 'League',
          helpText: 'Select a league or competition',
          type: 'select',
          required: true,
          options: leaguesSupported(APIService.SRSoccer),
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
      title: 'Create Football Scoreboard Post',
      acceptLabel: 'Next',
      cancelLabel: 'Back',
    };
  },
  async ({ values }, context) => {
    const league = values['league'][0];
    const timezone = values['timezone'][0];

    const soccerLeague = infoForLeague(getLeagueFromString(league));
    const games = await fetchSoccerGames(soccerLeague, context);
    return context.ui.showForm(srSoccerGameSelectionForm, {
      league: league,
      timezone: timezone,
      events: games,
    });
  }
);
