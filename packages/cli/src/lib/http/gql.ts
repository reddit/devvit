import type { JSONObject } from '@devvit/shared-types/json.js';

import { GQL_QUERY_URL } from '../../util/config.js';
import type { StoredToken } from '../auth/StoredToken.js';
import { MY_PORTAL_ENABLED } from '../config.js';

// TODO: figure out how to get proper types from graphql.ts in portal
const IDENTITY_QUERY_HASH = '1936294e5fc812fe34e30c5527b69400a8c44becf417c0c44acffebd3f1632d6';
const GET_SUBREDDIT_INFO_BY_NAME_QUERY_HASH =
  'f1d2d2ac1ef6e39f9c4a103960d5b07d83665073a376c7852655fae2f1ad5159';
const GET_REDDITOR_INFO_BY_NAME_QUERY_HASH =
  '19b0be6bef17faf58939802d3858fec2622ba5ec28d6b8a2982998749ceca30b';

export type GQLQueryConfig<T extends JSONObject> = {
  accessToken?: string;
  hash: string;
  /** GraphQL query name. Used for logging. */
  name: string;
  variables?: T;
};

export async function gqlQuery<T, V extends JSONObject>(
  config: GQLQueryConfig<V>
): Promise<{ data: T }> {
  const resp = await fetch(`${GQL_QUERY_URL}`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${config.accessToken}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      operationName: config.name,
      variables: config.variables,
      extensions: {
        persistedQuery: {
          // This is the version of APQ, not of the query (see fed migration guide on the wiki)
          version: 1,
          sha256Hash: config.hash,
        },
      },
    }),
  });

  if (resp.ok) return (await resp.json()) as { data: T };

  throw Error(`${config.name} HTTP error ${resp.status}: ${resp.statusText}`);
}

export async function isCurrentUserEmployee(token: StoredToken): Promise<boolean> {
  // Hack: GQL is failing below on snoodev.
  if (MY_PORTAL_ENABLED) return false;

  const identity = await gqlQuery<{ identity: { isEmployee: boolean } }, never>({
    accessToken: token.accessToken,
    hash: IDENTITY_QUERY_HASH,
    name: 'Identity',
  });
  return identity.data.identity.isEmployee;
}

export async function fetchSubredditSubscriberCount(
  subreddit: string,
  token: StoredToken
): Promise<number> {
  // Hack: GQL is failing below on snoodev.
  if (MY_PORTAL_ENABLED) return 0;

  const subredditInfo = await gqlQuery<
    { subredditInfoByName: { subscribersCount: number } | null },
    { name: string }
  >({
    accessToken: token.accessToken,
    hash: GET_SUBREDDIT_INFO_BY_NAME_QUERY_HASH,
    name: 'GetSubredditInfoByName',
    variables: { name: subreddit },
  });
  if (!subredditInfo.data.subredditInfoByName) {
    throw new Error(`Community '${subreddit}' not found.`);
  }
  return subredditInfo.data.subredditInfoByName.subscribersCount;
}

export async function getUserId(username: string, token: StoredToken): Promise<string> {
  // Hack: GQL is failing below on snoodev.
  if (MY_PORTAL_ENABLED) return '';

  const identity = await gqlQuery<{ redditorInfoByName: { id: string } }, { name: string }>({
    accessToken: token.accessToken,
    hash: GET_REDDITOR_INFO_BY_NAME_QUERY_HASH,
    name: 'GetRedditorInfoByName',
    variables: { name: username },
  });
  return identity.data.redditorInfoByName.id;
}
