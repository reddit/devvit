import { Devvit } from '@devvit/public-api';

import { str } from './import.js';

console.log(str()); // Use the import so it doesn't treeshake.

export default Devvit;

Devvit.addMenuItem({
  label: 'label',
  location: 'post',
  onPress() {
    console.log('unique string b');
  },
});
