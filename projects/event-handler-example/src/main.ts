import { Devvit } from '@devvit/public-api-next';

Devvit.addTrigger({
  event: 'PostSubmit',
  onEvent(event, _context) {
    console.log(`Received OnPostSubmit event`);
  },
});

Devvit.addTrigger({
  events: ['PostUpdate', 'PostReport'],
  onEvent(event, _context) {
    if (event.type == 'PostUpdate') {
      console.log('Received OnPostUpdate event');
    } else if (event.type === 'PostReport') {
      console.log('Received OnPostReport event');
    }
  },
});

Devvit.addTrigger({
  event: 'PostDelete',
  onEvent(event, _context) {
    console.log('Received OnPostDelete event');
  },
});

Devvit.addTrigger({
  event: 'CommentSubmit',
  onEvent(event, context) {
    console.log('Received OnCommentSubmit event');
    if (event.author?.id === context.appAccountId) {
      console.log('hey! I created this comment; not going to respond');
    }
  },
});

Devvit.addTrigger({
  event: 'CommentUpdate',
  onEvent(event, _context) {
    console.log('Received OnCommentUpdate event');
  },
});

Devvit.addTrigger({
  event: 'CommentReport',
  onEvent(event, _context) {
    console.log('Received OnCommentReport event');
  },
});

Devvit.addTrigger({
  event: 'CommentDelete',
  onEvent(event, _context) {
    console.log('Received OnCommentDelete event');
  },
});

Devvit.addTrigger({
  event: 'SubredditSubscribe',
  onEvent(event, _context) {
    console.log('Received OnSubredditSubscribe event');
  },
});

Devvit.addTrigger({
  event: 'AppInstall',
  onEvent(event, _context) {
    console.log('Received OnAppInstall event');
  },
});

Devvit.addTrigger({
  event: 'AppUpgrade',
  onEvent(event, _context) {
    console.log('Received OnAppUpgrade event');
  },
});

export default Devvit;
