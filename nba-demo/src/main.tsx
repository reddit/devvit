import { Devvit } from '@devvit/public-api';
import { App } from './components/App.js';
import './capabilities/actions';

Devvit.configure({
  redditAPI: true,
  redis: true,
});

Devvit.addCustomPostType({
  name: 'NBA Scoreboard',
  description: 'Demo Game',
  render: App,
});

export default Devvit;
