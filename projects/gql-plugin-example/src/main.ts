import { Devvit } from '@devvit/public-api';

Devvit.configure({
  redditAPI: true,
});

Devvit.addTrigger({
  events: ['PostSubmit'],
  onEvent: async (_, _context) => {
    console.log('============= Start App Execution =============');

    const response = await _context.reddit.getCollectionsForSubreddit('t5_8vgxyu');
    console.log('Response ', JSON.stringify(response));

    console.log('============= End App Execution =============');
  },
});

export default Devvit;
