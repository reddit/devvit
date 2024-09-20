import type { Devvit } from '@devvit/public-api';

import { getRelativeDate } from '../Timezones.js';
import type { GSAPIAuthentication } from './GSAuthentication.js';
import {
  currentGSAPIEnvironment,
  getAuthentication,
  GSAPIEndpoint,
  GSAPIEnvironment,
} from './GSAuthentication.js';

export async function getGSNFLSchedule(context: Devvit.Context): Promise<GSNFLFixture[]> {
  const schedule = await fetchSchedule(context);
  if (!schedule) {
    return [];
  }

  return schedule;
}

async function fetchSchedule(context: Devvit.Context): Promise<GSNFLFixture[]> {
  const [fixturesAuth, matchStateAuth] = await Promise.all([
    getAuthentication(GSAPIEndpoint.Fixtures, context),
    getAuthentication(GSAPIEndpoint.MatchState, context),
  ]);

  if (!fixturesAuth || !matchStateAuth) {
    return [];
  }

  const matches = await fetchMatchStateSchedule(matchStateAuth);
  const fixtureIds = matches?.map((match) => match.fixtureId) || [];
  if (fixtureIds.length === 0) {
    return [];
  }
  return await fetchFixtures(fixtureIds, fixturesAuth);
}

async function fetchMatchStateSchedule(auth: GSAPIAuthentication): Promise<GSNFLScheduleMatch[]> {
  const startDate = getRelativeDate(-1).toISOString();
  const endDate = getRelativeDate(5).toISOString();
  const envParam = currentGSAPIEnvironment === GSAPIEnvironment.UAT ? 'uat.' : '';
  const url = `https://platform.${envParam}matchstate.api.geniussports.com/api/v2/sources/GeniusPremium/sports/17/schedule?from=${startDate}&to=${endDate}`;
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: auth.bearerToken,
        'x-api-key': auth.apiKey,
      },
    });
    if (!response.ok) throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    return await response.json();
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function fetchFixtures(
  fixtureIds: string[],
  auth: GSAPIAuthentication
): Promise<GSNFLFixture[]> {
  const fixtureIdsString = fixtureIds.join(',');
  const envParam = currentGSAPIEnvironment === GSAPIEnvironment.UAT ? 'uat.' : '';
  const url = `https://${envParam}fixtures.api.geniussports.com/v2/fixtures/?filter=id[in]:${fixtureIdsString}&pageSize=200`;
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-type': 'application/json',
        Authorization: auth.bearerToken,
        'x-api-key': auth.apiKey,
      },
    });
    if (!response.ok) throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    const fixtures = await response.json();
    return fixtures.items;
  } catch (e) {
    console.error(e);
    return [];
  }
}

export type GSNFLScheduleMatch = {
  timeRaisedUtc: string;
  lineups: string;
  startDateUtc: string;
  fixtureId: string;
};

export type GSNFLFixture = {
  startDate: string;
  name: string;
  season: GSInfo;
  eventStatusType: string;
  locality: GSInfo;
  timezone: GSInfo;
  venue: GSInfo;
  sport: GSInfo;
  competition: GSInfo;
  round: GSInfo;
  genderType: string;
  homeCompetitor: GSHomeCompetitor;
  competitors: GSCompetitor[];
  eventType: string;
  isProtected: boolean;
  metadataProperties: GSMetadata[];
  id: string;
  createdOn: string;
  modifiedOn: string;
  updatesCount: number;
  isDeleted: boolean;
};

export type GSInfo = {
  id: string;
  name: string;
  ref: string;
};

export type GSHomeCompetitor = {
  id: string;
  name: string;
  competitorType: string;
  ref: string;
};

export type GSCompetitor = {
  metadataProperties: GSMetadata[];
  id: string;
  name: string;
  competitorType: string;
  ref: string;
};

export type GSMetadata = {
  name: string;
  value: string;
  isDeleted: boolean;
};
