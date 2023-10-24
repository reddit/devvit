import { Devvit } from '@devvit/public-api';

type KEY_NAMES = 'nfl-api-key' | 'soccer-api-key';

export async function getAPIKey(keyName: KEY_NAMES, context: Devvit.Context) {
  const { redis } = context;
  const cachedKey = await redis.get(keyName);
  if (cachedKey) {
    return cachedKey;
  }

  const wikiKeys = await fetchAPIKeys(context);
  const wikiKey = wikiKeys[keyName];

  if (!wikiKey) {
    throw new Error(`${keyName} not configured in srconfig`);
  }

  await redis.set(keyName, wikiKey);
  return wikiKey;
}

export async function fetchAPIKeys({ reddit }: Devvit.Context) {
  const wikiPage = await reddit.getWikiPage('srconfig', 'index');
  const keyData = JSON.parse(wikiPage.content);
  const keys = Object.keys(keyData);

  if (!keyData || !keys.includes('nfl-api-key') || !keys.includes('soccer-api-key')) {
    throw new Error('Invalid keys configured in srconfig');
  }

  return keyData;
}

export async function resetAPIKeys(context: Devvit.Context) {
  const { redis } = context;
  const keys = await fetchAPIKeys(context);
  await redis.set('nfl-api-key', keys['nfl-api-key']);
  await redis.set('soccer-api-key', keys['soccer-api-key']);
}
