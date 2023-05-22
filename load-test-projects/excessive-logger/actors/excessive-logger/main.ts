import { Devvit } from '@devvit/public-api';
import { InternalDevvit } from '@devvit/public-api/abstractions/InternalDevvit.js';

InternalDevvit.Hello.onPing(async (_msg, _metadata) => {
  for (let i = 0; i < 1000; i++) {
    console.log(`log number ${i}`);
  }
  return { message: 'pong' };
});

export default Devvit;
