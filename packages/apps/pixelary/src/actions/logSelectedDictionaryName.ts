import type { MenuItem } from '@devvit/public-api';

import { Service } from '../service/Service.js';

export const logSelectedDictionaryName: MenuItem = {
  label: '[Pixelary] View selected dictionary',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    const service = new Service(context);
    const gameSettings = await service.getGameSettings();
    context.ui.showToast(`Dictionary: ${gameSettings.selectedDictionary}`);
  },
};
