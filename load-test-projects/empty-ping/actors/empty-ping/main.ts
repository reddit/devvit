import { Devvit } from '@devvit/public-api';
import { InternalDevvit } from '@devvit/public-api/abstractions/InternalDevvit.js';

InternalDevvit.Hello.onPing(async (_msg, _metadata) => {
  return { message: 'pong' };
});

export default Devvit;
