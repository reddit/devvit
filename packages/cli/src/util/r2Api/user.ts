import type { StoredToken } from '@devvit/protos';
import { Result } from '@devvit/shared-types/Result.js';
import type { T2ID } from '@devvit/shared-types/tid.js';
import { asT2ID } from '@devvit/shared-types/tid.js';
import fetch from 'node-fetch';
import type { JSONObject } from '../../vendor/@reddit/json-config/0.4.2/index.js';
import { authHeaders } from '../auth.js';
import { REDDIT_OAUTH_API } from '../config.js';

// TODO: this should move under http/r2/user.ts of @devvit/dev-server which
// @devvit/cli depends on so we have a common R2 API. The Result object here
// doesn't seem to add much value over throwing an error and letting the caller
// catch and format a message.

export async function fetchUserDisplayName(token: StoredToken): Promise<Result<string>> {
  const fetchUserRes = await fetchUserInfo(token);
  if (!fetchUserRes.ok) {
    return Result.Err(fetchUserRes.error);
  }

  const username = fetchUserRes.value.name;
  if (typeof username !== 'string') {
    return Result.Err(`Failed to fetch user display name as string. Got: ${fetchUserRes.value}`);
  }
  return Result.Ok(username);
}

export async function fetchUserT2Id(token: StoredToken): Promise<Result<T2ID>> {
  const fetchUserRes = await fetchUserInfo(token);
  if (!fetchUserRes.ok) {
    return Result.Err(fetchUserRes.error);
  }

  let userId = fetchUserRes.value.id;
  if (typeof userId !== 'string') {
    return Result.Err(`Failed to fetch user id as string. Got: ${fetchUserRes.value}`);
  }
  if (userId === '') {
    return Result.Err(`Failed to fetch user id - got an empty string somehow...`);
  }
  if (!userId.startsWith('t2_')) {
    userId = 't2_' + userId;
  }

  let t2Id: T2ID;
  try {
    t2Id = asT2ID(userId);
  } catch {
    return Result.Err(`Failed to convert user id to T2ID. Got: ${userId}`);
  }

  return Result.Ok(t2Id);
}

async function fetchUserInfo(token: StoredToken): Promise<Result<JSONObject>> {
  const headers = authHeaders(token);

  const response = await fetch(`${REDDIT_OAUTH_API}/api/v1/me.json`, {
    headers,
    redirect: 'follow',
  });

  if (!response.ok) {
    return Result.Err(`Failed to fetch user info: ${response.status} ${response.statusText}`);
  }

  return Result.Ok((await response.json()) as JSONObject);
}
