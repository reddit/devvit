import type { JsonObject } from '@devvit/shared-types/json.js';
import { isT2, T2 } from '@devvit/shared-types/tid.js';

import type { StoredToken } from '../../lib/auth/StoredToken.js';
import { authHeaders } from '../auth.js';
import { REDDIT_OAUTH_API } from '../config.js';
import { Result } from './result.js';

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

export async function fetchUserT2Id(token: StoredToken): Promise<Result<T2>> {
  const fetchUserRes = await fetchUserInfo(token);
  if (!fetchUserRes.ok) {
    return Result.Err(fetchUserRes.error);
  }

  const userId = fetchUserRes.value.id;
  if (typeof userId !== 'string') {
    return Result.Err(`Failed to fetch user id as string. Got: ${fetchUserRes.value}`);
  }
  if (userId === '') {
    return Result.Err(`Failed to fetch user id - got an empty string somehow.`);
  }

  let t2: T2;
  try {
    t2 = T2(isT2(userId) ? userId : `t2_${userId}`);
  } catch {
    return Result.Err(`Failed to convert user id to T2. Got: ${userId}`);
  }

  return Result.Ok(t2);
}

async function fetchUserInfo(token: StoredToken): Promise<Result<JsonObject>> {
  const headers = authHeaders(token);

  const response = await fetch(`${REDDIT_OAUTH_API}/api/v1/me.json`, {
    headers,
    redirect: 'follow',
  });

  if (!response.ok) {
    return Result.Err(`Failed to fetch user info: ${response.status} ${response.statusText}`);
  }

  return Result.Ok(await response.json());
}
