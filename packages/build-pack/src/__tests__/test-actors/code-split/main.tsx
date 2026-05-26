// eslint-disable-next-line no-restricted-imports
import { Devvit } from '@devvit/public-api';

import { specialSauce } from './server/hidden.js';
import { secret, theQuestion } from './split.server.js';

Devvit.addMenuItem({
  label: '',
  location: 'subreddit',
  onPress: () => {
    console.log(theQuestion());
    console.log(secret);
    console.log(specialSauce());
  },
});

export default Devvit;
