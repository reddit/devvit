import { Devvit } from '@devvit/public-api';
import { Pixelary } from './components/Pixelary.js';
import { LoadingState } from './components/LoadingState.js';
import { Service } from './service/Service.js';

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
    const { ui, redis, reddit, scheduler } = context;
    const service = new Service(redis);
    const community = await reddit.getCurrentSubreddit();

    // Check if post flairs are enabled in the community
    const postFlairEnabled = await community.postFlairsEnabled;
    if (!postFlairEnabled) {
      ui.showToast('Enable post flairs first!');
      return;
    }

    // Check if Pixelary is already installed
    const currentSettings = await service.getGameSettings();
    if (currentSettings && currentSettings.heroPostId) {
      ui.showToast('Pixelary is already installed!');
      return;
    }

    // Create the main game post and pin it to the top
    const post = await reddit.submitPost({
      title: 'Pixelary',
      subredditName: community.name,
      preview: <LoadingState />,
    });

    await post.sticky();

    // Create the game state flairs (active and ended)
    const activeFlair = await reddit.createPostFlairTemplate({
      subredditName: community.name,
      text: 'Active',
      textColor: 'dark',
      backgroundColor: '#46D160',
    });
    const endedFlair = await reddit.createPostFlairTemplate({
      subredditName: community.name,
      text: 'Ended',
      textColor: 'light',
      backgroundColor: '#EA0027',
    });

    // Store the game settings
    await service.storeGameSettings({
      activeFlairId: activeFlair.id,
      endedFlairId: endedFlair.id,
      heroPostId: post.id,
    });

    // Schedule minutly updates of the score board
    await scheduler.runJob({ cron: '* * * * *', name: 'UpdateScoreBoard' });

    ui.showToast('Installed Pixelary!');
  },
});

// Schedule job for updating the score board
Devvit.addSchedulerJob({
  name: 'UpdateScoreBoard',
  onRun: async (_event, context) => {
    const service = new Service(context.redis);
    await service.updateScoreBoard();
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
    const { postId, redis, userId } = context;
    const service = new Service(redis);
    const gameSettings = await service.getGameSettings();

    if (gameSettings.heroPostId === postId) {
      context.ui.showToast('Nothing to reveal on main game post');
      return;
    }

    const postData = await service.getPostData(event.targetId, userId!);
    if (!postData) {
      context.ui.showToast('No word is associated with this post');
      return;
    }

    context.ui.showForm(WordReveal, { word: postData.word });
  },
});

// Moderator action to expire a drawing post
Devvit.addMenuItem({
  label: '[Pixelary] Expire post',
  location: 'post',
  forUserType: 'moderator',
  onPress: async (event, context) => {
    const { scheduler, redis, postId, ui, userId } = context;
    const service = new Service(redis);
    const postData = await service.getPostData(event.targetId, userId!);

    if (!postData) {
      ui.showToast('No post data found');
      return;
    }

    await scheduler.runJob({
      name: 'PostExpiration',
      data: {
        postId: context.postId,
        answer: postData.word,
      },
      runAt: new Date(),
    });

    console.log(`Expiring post: ${postId}`);
    ui.showToast('Post expired');
  },
});

// Do the following when a drawing post expires
Devvit.addSchedulerJob({
  name: 'PostExpiration',
  onRun: async (event, context) => {
    const { reddit, redis } = context;
    const { postId, answer } = event.data!;
    const service = new Service(redis);
    const gameSettings = await service.getGameSettings();
    const currentSubreddit = await reddit.getCurrentSubreddit();

    await service.storePostData({
      postId,
      expired: true,
    });

    await reddit.setPostFlair({
      subredditName: currentSubreddit.name,
      postId: postId,
      flairTemplateId: gameSettings.endedFlairId,
    });
    if (answer) {
      const comment = await reddit.submitComment({
        id: postId,
        text: `The answer was: ${answer}`,
      });
      await comment.distinguish(true);
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
    const { redis, ui } = context;
    const username = event.values.username;
    const service = new Service(redis);
    const key = service.getDailyDrawingsKey(username);
    await redis.del(key);
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
    await reddit.sendPrivateMessage({
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
    await service.deleteIncorrectGuesses();
    ui.showToast('Deleted incorrect guesses');
  },
});

export default Devvit;
