import type { FormKey, MenuItem } from '@devvit/public-api';

export const addWordsToDictionary = (form: FormKey): MenuItem => ({
  label: '[Pixelary] Add words to dictionary',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: (_event, context) => {
    context.ui.showForm(form);
  },
});
