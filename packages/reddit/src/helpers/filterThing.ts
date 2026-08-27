import type { Metadata } from '@devvit/protos/lib/Types.js';
import type { T1, T3 } from '@devvit/shared-types/tid.js';

import { getRedditApiPlugins } from '../plugin.js';

export type FilterOptions = {
  /**
   * The reason shown to moderators in the moderation queue. If {@link keep} is
   * `true`, the reason is also shown on the post or comment.
   *
   * @example "contains sensitive content"
   */
  reason?: string;
  /**
   * Whether the post or comment remains visible while it is in the moderation
   * queue. Defaults to `false`.
   */
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
