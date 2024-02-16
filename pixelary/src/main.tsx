import { Data, Devvit, Form } from '@devvit/public-api';
import { Pixelary } from './components/Pixelary.js';
import { LoadingState } from './components/LoadingState.js';
import { Service } from './service/Service.js';
import { UserSettings } from './types/UserSettings.js';
import { PostData } from './types/PostData.js';

Devvit.configure({
  redditAPI: true,
  redis: true,
  media: true,
});

Devvit.addCustomPostType({
  name: 'Pixelary',
  description: 'A pixel art drawing and guessing game',
  height: 'tall',
  render: Pixelary,
});

// Install script
Devvit.addMenuItem({
  label: '[Pixelary] Install Game',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    const { ui, redis, reddit } = context;
    const community = await reddit.getCurrentSubreddit();
    const postFlairEnabled = await community.postFlairsEnabled;

    if (!postFlairEnabled) {
      ui.showToast('Enable post flairs first!');
      return;
    }

    const heroPostId = await redis.get('#heroPostId');

    if (heroPostId) {
      ui.showToast('Pixelary is already installed!');
      return;
    }

    const post = await reddit.submitPost({
      title: 'Pixelary',
      subredditName: community.name,
      preview: <LoadingState />,
    });
    post.sticky();
    redis.set('#heroPostId', post.id);

    const activeFlair = await reddit.createPostFlairTemplate({
      subredditName: community.name,
      text: 'Active',
      textColor: 'dark',
      backgroundColor: '#46D160',
    });
    redis.set('#activeFlairId', activeFlair.id);

    const endedFlair = await reddit.createPostFlairTemplate({
      subredditName: community.name,
      text: 'Ended',
      textColor: 'light',
      backgroundColor: '#EA0027',
    });
    redis.set('#endedFlairId', endedFlair.id);

    ui.showToast('Pixelary installed!');
  },
});

// Mod action to reveal the word
const WordReveal = Devvit.createForm(
  (data: { word?: string }) => {
    return {
      title: 'Pixelary word hidden in the post',
      description: data.word || 'Something went wrong',
      fields: [],
      acceptLabel: 'Ok',
      cancelLabel: 'Got it',
    };
  },
  () => {}
);

Devvit.addMenuItem({
  label: '[Pixelary] Reveal the word',
  location: 'post',
  forUserType: 'moderator',
  onPress: async (event, context) => {
    const heroPostId = await context.redis.get('#heroPostId');
    if (heroPostId === event.targetId) {
      context.ui.showToast('Nothing to reveal on main game post');
      return;
    }
    const postDataJSON = await context.redis.get(`post-${event.targetId}`);
    if (!postDataJSON) {
      context.ui.showToast('No word is associated with this post');
      return;
    }
    const postData = JSON.parse(postDataJSON) as PostData;
    context.ui.showForm(WordReveal, { word: postData.word });
  },
});

// Change the flair of a Viewer post when it expires
Devvit.addSchedulerJob({
  name: 'PostExpiration',
  onRun: async (event, context) => {
    const { reddit, redis } = context;
    const { postId, answer } = event.data!;
    const currentSubreddit = await reddit.getCurrentSubreddit();
    const endFlairId = await redis.get('#endedFlairId');
    await reddit.setPostFlair({
      subredditName: currentSubreddit.name,
      postId: postId,
      flairTemplateId: endFlairId,
    });
    if (answer) {
      const comment = await reddit.submitComment({
        id: postId,
        text: `The answer was: ${answer}`,
      });
      comment.distinguish(true);
    }
  },
});

// DEBUG ONLY
const resetDailyDrawingsForm = Devvit.createForm(
  {
    fields: [{ name: 'username', label: 'Username?', type: 'string' }],
    title: 'Reset daily drawings for user',
    description:
      'This will reset the daily drawings quota for the user. But will it not affect any of their existing drawings.',
    acceptLabel: 'Reset',
  },
  async (event, context) => {
    const { reddit, redis, ui } = context;
    const username = event.values.username;
    const user = await reddit.getUserByUsername(username);
    const service = new Service(redis);
    const key = service.getDailyDrawingsKey(user.id);
    redis.del(key);
    ui.showToast('Reset daily drawings!');
  }
);

Devvit.addMenuItem({
  label: '[Pixelary] Reset daily drawings',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    const { ui } = context;
    ui.showForm(resetDailyDrawingsForm);
  },
});

//DEBUG ONLY
Devvit.addMenuItem({
  label: '[Pixelary] Reset solved drawings',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    const { redis, ui } = context;
    const service = new Service(redis);
    service.resetSolvedDrawings();
    ui.showToast('Reset solved drawings!');
  },
});

//ADMIN ONLY
Devvit.addMenuItem({
  label: '[Pixelary] Get incorrect guesses',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    const { redis, reddit, ui } = context;
    const service = new Service(redis);
    const guesses = await service.getIncorrectGuesses();
    const currentUser = await reddit.getCurrentUser();
    reddit.sendPrivateMessage({
      to: currentUser.username,
      subject: 'Pixelary: Incorrect guesses',
      text: JSON.stringify(guesses),
    });
    ui.showToast('Sent PM with incorrect guesses!');
  },
});

//ADMIN ONLY
Devvit.addMenuItem({
  label: '[Pixelary] Delete incorrect guesses',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    const { redis, ui } = context;
    const service = new Service(redis);
    service.deleteIncorrectGuesses();
    ui.showToast('Deleted incorrect guesses');
  },
});

//DEBUG ONLY
Devvit.addMenuItem({
  label: '[Pixelary] Expire post',
  location: 'post',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    const { scheduler } = context;
    console.log('Expiring post');
    await scheduler.runJob({
      name: 'PostExpiration',
      data: {
        postId: context.postId,
      },
      runAt: new Date(),
    });
  },
});

// User settings
const notificationSettingsForm = Devvit.createForm(
  (data) => {
    return {
      title: 'Notification settings',
      description: 'Get a notification when ...',
      acceptLabel: 'Save',
      fields: [
        {
          name: 'drawingGuessed',
          label: 'Someone guesses your drawing',
          type: 'boolean',
          defaultValue: data.drawingGuessed,
        },
      ],
    };
  },
  (event, context) => {
    const { redis, ui, userId } = context;
    const service = new Service(redis);
    service.saveUserSettings(userId!, event.values as UserSettings);
    ui.showToast('Saved settings!');
  }
);

Devvit.addMenuItem({
  label: '[Pixelary] User settings',
  location: 'subreddit',
  onPress: async (_event, context) => {
    const { redis, ui, userId } = context;
    const service = new Service(redis);
    const settings = await service.getUserSettings(userId!);
    ui.showForm(notificationSettingsForm, settings);
  },
});

export default Devvit;
