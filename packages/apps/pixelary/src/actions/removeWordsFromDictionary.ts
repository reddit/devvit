import type { FormKey, MenuItem } from '@devvit/public-api';

export const removeWordsFromDictionary = (form: FormKey): MenuItem => ({
  label: '[Pixelary] Remove words from dictionary',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: (_event, context) => {
    context.ui.showForm(form);
  },
});
