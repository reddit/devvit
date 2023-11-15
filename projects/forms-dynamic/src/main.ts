import { Devvit } from '@devvit/public-api';
import './contextAction.js';
import './customPost.js';

Devvit.configure({
  redis: true,
});

export default Devvit;
