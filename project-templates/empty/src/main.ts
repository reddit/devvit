// Visit developers.reddit.com/docs to learn Devvit!

import { Devvit } from '@devvit/public-api';

Devvit.addMenuItem({
  location: 'post',
  label: 'Hello World',
  onPress: (event, context) => {
    console.log(`Pressed ${event.targetId}`);
    context.ui.showToast('Hello world!');
  },
});

export default Devvit;
