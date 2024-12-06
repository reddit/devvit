import type { FormKey, MenuItem } from '@devvit/public-api';

import { Service } from '../service/Service.js';

export const selectDictionary = (form: FormKey): MenuItem => ({
  label: '[Pixelary] Select dictionary',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    const service = new Service(context);

    const [dictionaries, gameSettings] = await Promise.all([
      service.getAllDictionaryNames(),
      service.getGameSettings(),
    ]);

    context.ui.showForm(form, {
      dictionaries,
      selectedDictionary: gameSettings.selectedDictionary,
    });
  },
});
