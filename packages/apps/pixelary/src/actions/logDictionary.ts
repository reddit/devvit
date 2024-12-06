import type { FormKey, MenuItem } from '@devvit/public-api';

import { Service } from '../service/Service.js';

export const logDictionary = (form: FormKey): MenuItem => ({
  label: '[Pixelary] Log dictionary',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    const service = new Service(context);
    const dictionaries = await service.getAllDictionaryNames();
    context.ui.showForm(form, { dictionaries });
  },
});
