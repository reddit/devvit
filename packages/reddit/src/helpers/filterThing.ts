import type { Metadata } from '@devvit/protos/lib/Types.js';
import type { T1, T3 } from '@devvit/shared-types/tid.js';

import { getRedditApiPlugins } from '../plugin.js';

export type FilterOptions = {
  /** The reason for filtering the post or comment. This is visible to moderators in the ModQueue entry and in the post/comment if it is kept. E.g.: "contains sensitive content" */
  reason?: string;
  /** Whether to keep showing the the post or comment or to remove it. Defaults to false if not specified. */
  keep?: boolean;
};

/** @internal */
export async function filterThing(
  id: T1 | T3,
  options: FilterOptions | undefined,
  metadata: Metadata | undefined
): Promise<void> {
  const { reason, keep } = options ?? {};

  await getRedditApiPlugins().Moderation.Filter(
    {
      id,
      reason,
      keep,
    },
    metadata
  );
}
