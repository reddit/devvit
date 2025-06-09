import './capabilities/actions/index.js';
import './capabilities/settings/index.js';

import { Devvit } from '@devvit/public-api';

import { App } from './components/App.js';

Devvit.configure({
  redditAPI: true,
  redis: true,
});

Devvit.addCustomPostType({
  name: 'Name',
  render: App,
});

export default Devvit;
