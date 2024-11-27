import type { FormKey, MenuItem } from '@devvit/public-api';

export const selectDictionary = (form: FormKey): MenuItem => ({
  label: '[Pixelary] Select dictionary',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    context.ui.showForm(form);
  },
});
