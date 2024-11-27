import type { MenuItem } from '@devvit/public-api';

import { migratePinnedPostEssentials } from '../utils/migration.js';

export const migratePinnedPost: MenuItem = {
  label: 'Migrate Pinned Post',
  location: 'post',
  forUserType: 'moderator',
  postFilter: 'currentApp',
  onPress: async (event, context) => {
    await migratePinnedPostEssentials(event.targetId, context);
    context.ui.showToast('Migrated pinned post!');
  },
};
