import { runWithContext } from '@devvit/server/context.js';
import { RequestContext } from '@devvit/server/request-context.js';
import { Header } from '@devvit/shared-types/Header.js';

export function runWithTestContext<T>(
  callback: () => Promise<T>,
  bonusHeaders: { [header: string]: string } = {}
): Promise<T> {
  const context = RequestContext({
    [Header.AppUser]: 't2_appuser',
    [Header.User]: 't2_1234',
    [Header.Subreddit]: 't5_0',
    ...bonusHeaders,
  });
  return runWithContext(context, callback);
}
