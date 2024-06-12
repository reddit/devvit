import { Devvit } from '@devvit/public-api';
import './capabilities/actions/index.js';
import { App } from './components/App.js';

// Define what packages you want to use
Devvit.configure({
  redditAPI: true,
});

Devvit.addCustomPostType({
  name: 'Hello World',
  height: 'regular',
  render: App,
});

export default Devvit;
