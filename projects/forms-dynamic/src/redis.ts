import { RedisClient } from '@devvit/public-api';

export async function loadRules(redis: RedisClient): Promise<string[]> {
  const rulesStr = await redis.get('rules');
  let rules: string[];
  if (rulesStr) {
    rules = JSON.parse(rulesStr);
  } else {
    rules = [''];
  }
  return rules;
}

export async function saveRules(redis: RedisClient, rules: string[]): Promise<void> {
  await redis.set('rules', JSON.stringify(rules));
}
