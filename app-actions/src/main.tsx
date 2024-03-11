import { Devvit } from '@devvit/public-api';
import './capabilities/actions/index.js';
import './capabilities/scheduler/schedulers.js';
import { App } from './components/App.js';

// Define what packages you want to use
Devvit.configure({
  redditAPI: true,
  redis: true,
});

Devvit.addCustomPostType({
  name: 'Hello Blocks',
  height: 'regular',
  render: App,
});

export default Devvit;
