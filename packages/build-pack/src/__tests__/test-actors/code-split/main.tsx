import { Devvit } from '@devvit/public-api';

import { specialSauce } from './server/hidden.js';
import { secret, theQuestion } from './split.server.js';

Devvit.addCustomPostType({
  name: '',
  render: () => {
    console.log(theQuestion());
    console.log(secret);
    console.log(specialSauce());

    return <text></text>;
  },
});

export default Devvit;
