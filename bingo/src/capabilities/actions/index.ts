import { Devvit } from '@devvit/public-api';
import { BingoForm } from '../forms/index.js';

// Add a menu item to the subreddit menu
Devvit.addMenuItem({
  label: 'Create Bingo Board',
  location: 'subreddit',
  onPress: async (_event, context) => {
    const { ui } = context;
    ui.showForm(BingoForm);
  },
});
