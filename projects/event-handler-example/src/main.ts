import { Devvit } from '@devvit/public-api';

Devvit.addTrigger({
  events: ['PostSubmit', 'PostCreate'],
  onEvent(event, _context) {
    if (event.type === 'PostSubmit') {
      console.log('Received OnPostSubmit event');
    } else if (event.type === 'PostCreate') {
      console.log('Received OnPostCreate event');
    }
  },
});

Devvit.addTrigger({
  events: ['PostUpdate', 'PostReport'],
  onEvent(event, _context) {
    if (event.type === 'PostUpdate') {
      console.log('Received OnPostUpdate event');
    } else if (event.type === 'PostReport') {
      console.log('Received OnPostReport event');
    }
  },
});

Devvit.addTrigger({
  event: 'PostDelete',
  onEvent(_event, _context) {
    console.log('Received OnPostDelete event');
  },
});

Devvit.addTrigger({
  events: ['CommentSubmit', 'CommentCreate'],
  onEvent(event, context) {
    if (event.type === 'CommentSubmit') {
      console.log('Received OnCommentSubmit event');
      if (event.author?.id === context.appAccountId) {
        console.log('hey! I created this comment; not going to respond');
      }
    } else if (event.type === 'CommentCreate') {
      console.log('Received OnCommentCreate event');
    }
  },
});

Devvit.addTrigger({
  event: 'CommentUpdate',
  onEvent(_event, _context) {
    console.log('Received OnCommentUpdate event');
  },
});

Devvit.addTrigger({
  event: 'CommentReport',
  onEvent(_event, _context) {
    console.log('Received OnCommentReport event');
  },
});

Devvit.addTrigger({
  event: 'CommentDelete',
  onEvent(_event, _context) {
    console.log('Received OnCommentDelete event');
  },
});

Devvit.addTrigger({
  event: 'SubredditSubscribe',
  onEvent(_event, _context) {
    console.log('Received OnSubredditSubscribe event');
  },
});

Devvit.addTrigger({
  event: 'AppInstall',
  onEvent(_event, _context) {
    console.log('Received OnAppInstall event');
  },
});

Devvit.addTrigger({
  event: 'AppUpgrade',
  onEvent(_event, _context) {
    console.log('Received OnAppUpgrade event');
  },
});

export default Devvit;
