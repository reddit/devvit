import type { FormKey, MenuItem } from '@devvit/public-api';

export const logDictionary = (form: FormKey): MenuItem => ({
  label: '[Pixelary] Log dictionary',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    context.ui.showForm(form);
  },
});
