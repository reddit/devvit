import type { Devvit } from '@devvit/public-api';

import { APIKey, AuthKey } from '../sportradar/APIKeys.js';

export enum GSAPIEndpoint {
  Fixtures = 'fixtures',
  MatchState = 'matchstate',
}

export enum GSAPIEnvironment {
  UAT = 'uat',
  PROD = 'prod',
}

export const currentGSAPIEnvironment: GSAPIEnvironment = GSAPIEnvironment.PROD;

export type GSAPIAuthentication = {
  bearerToken: string;
  apiKey: string;
};

export async function getAuthentication(
  endpoint: GSAPIEndpoint,
  context: Devvit.Context
): Promise<GSAPIAuthentication | null> {
  const { cache } = context;
  const env = currentGSAPIEnvironment;
  // Auth tokens expire after 900s (15min)(match state) or 86400s (24hr)(fixtures)
  const ttl = endpoint === GSAPIEndpoint.Fixtures ? 60 * 30 * 1000 : 60 * 10 * 1000;
  const keys = await getKeys(endpoint, env, context);

  const authentication = await cache(async () => fetchToken(endpoint, env, keys), {
    key: `gsapi:${endpoint}:${env}:auth`,
    ttl: ttl,
  });

  if (!authentication) {
    return null;
  }

  return {
    // Fixtures endpoint requires string bearer string to start with "Bearer "
    bearerToken:
      endpoint === GSAPIEndpoint.Fixtures
        ? `Bearer ${authentication.access_token}`
        : authentication.access_token,
    apiKey: keys.api_key,
  };
}

type AuthenticationResponse = {
  access_token: string;
  expires_in: number;
  token_type: string;
};

async function fetchToken(
  endpoint: GSAPIEndpoint,
  env: GSAPIEnvironment,
  keys: Keys
): Promise<AuthenticationResponse | null> {
  try {
    const request =
      endpoint === GSAPIEndpoint.Fixtures
        ? fixturesApiRequest(env, keys)
        : matchStateApiRequest(env, keys);
    const response = await fetch(request);
    if (!response.ok) throw Error(`HTTP error ${response.status}: ${response.statusText}`);
    return await response.json();
  } catch (e) {
    console.error(e);
    return null;
  }
}

function fixturesApiRequest(env: GSAPIEnvironment, keys: Keys): Request {
  const url =
    env === GSAPIEnvironment.UAT
      ? 'https://uat.auth.geniussports.com/oauth/token'
      : 'https://auth.geniussports.com/oauth/token';
  return new Request(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: keys.client_id,
      client_secret: keys.client_secret,
      audience: 'https://api.geniussports.com',
    }),
  });
}

function matchStateApiRequest(env: GSAPIEnvironment, keys: Keys): Request {
  const url =
    env === GSAPIEnvironment.UAT
      ? 'https://uat.auth.api.geniussports.com/oauth2/token'
      : 'https://auth.api.geniussports.com/oauth2/token';
  return new Request(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: keys.client_id,
      client_secret: keys.client_secret,
    }).toString(),
  });
}

type Keys = {
  client_id: string;
  client_secret: string;
  api_key: string;
};

async function getKeys(
  endpoint: GSAPIEndpoint,
  env: GSAPIEnvironment,
  context: Devvit.Context
): Promise<Keys> {
  const isProd = env === GSAPIEnvironment.PROD;
  const isFixtures = endpoint === GSAPIEndpoint.Fixtures;

  const apiKeyKey = isFixtures
    ? isProd
      ? APIKey.gsNflFixtureProd
      : APIKey.gsNflFixture
    : isProd
      ? APIKey.gsNflMatchStateProd
      : APIKey.gsNflMatchState;

  const clientIdKey = isFixtures
    ? isProd
      ? AuthKey.gsNflFixtureClientIdProd
      : AuthKey.gsNflFixtureClientId
    : isProd
      ? AuthKey.gsNflMatchStateClientIdProd
      : AuthKey.gsNflMatchStateClientId;

  const clientSecretKey = isFixtures
    ? isProd
      ? AuthKey.gsNflFixtureClientSecretProd
      : AuthKey.gsNflFixtureClientSecret
    : isProd
      ? AuthKey.gsNflMatchStateClientSecretProd
      : AuthKey.gsNflMatchStateClientSecret;

  const apiKey = await context.settings.get(apiKeyKey);
  const clientId = await context.settings.get(clientIdKey);
  const clientSecret = await context.settings.get(clientSecretKey);
  // verify keys are strings
  if (
    typeof apiKey !== 'string' ||
    typeof clientId !== 'string' ||
    typeof clientSecret !== 'string'
  ) {
    throw new Error(`Invalid keys for ${endpoint} ${env}`);
  }
  return {
    client_id: clientId,
    client_secret: clientSecret,
    api_key: apiKey,
  };
}
