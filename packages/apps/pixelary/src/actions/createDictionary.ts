import type { FormKey, MenuItem } from '@devvit/public-api';

export const createDictionary = (form: FormKey): MenuItem => ({
  label: '[Pixelary] Create dictionary',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    context.ui.showForm(form);
  },
});
