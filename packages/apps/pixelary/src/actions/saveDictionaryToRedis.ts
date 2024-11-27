import type { MenuItem } from '@devvit/public-api';

import Words from '../data/words.json';
import { Service } from '../service/Service.js';

export const saveDictionaryToRedis: MenuItem = {
  label: '[Pixelary] Save dictionary to Redis',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    const service = new Service(context);
    await service.upsertDictionary('main', Words);
    context.ui.showToast('Dictionary saved to Redis');
  },
};
