import type { MenuItem } from '@devvit/public-api';

import { migrateDrawingPostEssentials } from '../utils/migration.js';

export const migrateDrawingPost: MenuItem = {
  label: 'Migrate Drawing Post',
  location: 'post',
  forUserType: 'moderator',
  postFilter: 'currentApp',
  onPress: async (event, context) => {
    await migrateDrawingPostEssentials(event.targetId, context);
    context.ui.showToast('Migrated drawing essentials!');
  },
};
