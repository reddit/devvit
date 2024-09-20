import { Devvit } from '@devvit/public-api';

import { LoadingState } from './components/LoadingState.js';
import { Router } from './posts/Router.js';
import { Service } from './service/Service.js';
import type { JobData } from './types/job-data.js';

Devvit.configure({
  redditAPI: true,
  redis: true,
  media: true,
});

Devvit.addCustomPostType({
  name: 'Pixelary',
  description: 'A pixel art drawing and guessing game',
  height: 'tall',
  render: Router,
});

// Install script
Devvit.addMenuItem({
  label: '[Pixelary] Install Game',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    const { ui, reddit, scheduler } = context;
    const service = new Service(context);
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
    const service = new Service(context);
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
    const { postId, userId } = context;
    const service = new Service(context);
    const gameSettings = await service.getGameSettings();

    if (gameSettings.heroPostId === postId) {
      context.ui.showToast('Nothing to reveal on main game post');
      return;
    }

    const rawPostData = await service.getPostData(event.targetId);
    const postData = service.parsePostData(rawPostData, userId!);
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
    const { scheduler, postId, ui, userId } = context;
    const service = new Service(context);
    const rawPostData = await service.getPostData(event.targetId);
    const postData = service.parsePostData(rawPostData, userId!);

    await scheduler.runJob<JobData>({
      name: 'PostExpiration',
      data: {
        postId: event.targetId,
        answer: postData.word,
      },
      runAt: new Date(),
    });

    console.log(`Expiring post: ${postId}`);
    ui.showToast('Post expired');
  },
});

Devvit.addMenuItem({
  label: '[Pixelary] Resticky Post',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    const { ui, reddit } = context;
    const service = new Service(context);
    const community = await reddit.getCurrentSubreddit();

    // Check if post flairs are enabled in the community
    const postFlairEnabled = await community.postFlairsEnabled;
    if (!postFlairEnabled) {
      ui.showToast('Enable post flairs first!');
      return;
    }

    // Check if Pixelary is already installed
    const currentSettings = await service.getGameSettings();

    if (
      !currentSettings.activeFlairId ||
      !currentSettings.endedFlairId ||
      !currentSettings.heroPostId
    ) {
      ui.showToast('Pixelary is not installed!');
      return;
    }

    const oldPost = await reddit.getPostById(currentSettings.heroPostId);
    await oldPost.unsticky();

    // Create the main game post and pin it to the top
    const post = await reddit.submitPost({
      title: 'Pixelary',
      subredditName: community.name,
      preview: <LoadingState />,
    });

    await post.sticky();

    // Store the game settings
    await service.storeGameSettings({
      ...currentSettings,
      heroPostId: post.id,
    });

    ui.showToast('Restickied Pixelary post!');
  },
});

// Do the following when a drawing post expires
Devvit.addSchedulerJob<JobData>({
  name: 'PostExpiration',
  onRun: async (event, context) => {
    const { reddit } = context;
    const { postId, answer } = event.data!;
    const service = new Service(context);
    const gameSettings = await service.getGameSettings();
    const currentSubreddit = await reddit.getCurrentSubreddit();
    await service.expirePost(postId);
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

Devvit.addMenuItem({
  label: '[Pixelary] Clear my history',
  location: 'subreddit',
  onPress: async (_event, context) => {
    const user = await context.reddit.getCurrentUser();
    if (!user) {
      context.ui.showToast('Username not found');
      return;
    }
    const service = new Service(context);
    const key = service.getMyDrawingsKey(user.username);
    await context.redis.del(key);
    context.ui.showToast('Cleared');
  },
});

//ADMIN ONLY
Devvit.addMenuItem({
  label: '[Pixelary] Get incorrect guesses',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    const { reddit, ui } = context;
    const service = new Service(context);
    const guesses = await service.getIncorrectGuesses();
    const currentUser = await reddit.getCurrentUser();

    if (!currentUser) {
      throw new Error(`Cannot get incorrect guesses because could not find currentUser`);
    }

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
    const { ui } = context;
    const service = new Service(context);
    await service.deleteIncorrectGuesses();
    ui.showToast('Deleted incorrect guesses');
  },
});

// ADMIN ONLY
Devvit.addMenuItem({
  label: '[Pixelary] Clear leaderboard',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    const { ui } = context;
    const service = new Service(context);
    await service.clearScoreBoard();
    ui.showToast('Cleared the leaderboard');
  },
});

// ADMIN ONLY
Devvit.addMenuItem({
  label: '[Pixelary] Update leaderboard',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    const { ui, scheduler } = context;
    const service = new Service(context);
    await service.updateScoreBoard();
    console.log(await scheduler.listJobs());
    ui.showToast('Updated the leaderboard');
  },
});

// ADMIN ONLY
Devvit.addMenuItem({
  label: '[Pixelary] Start update job',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    const { ui, scheduler } = context;
    await scheduler.runJob({ cron: '* * * * *', name: 'UpdateScoreBoard' });
    ui.showToast('Started cron job!');
  },
});

/*
 * Comment Delete Trigger
 *
 * If a comment representing a guess has been deleted,
 * we need to remove it from Redis so that it no longer
 * appears up in the results tab.
 */

Devvit.addTrigger({
  event: 'CommentDelete',
  onEvent: async (event, context) => {
    const service = new Service(context);
    const data = await service.getPostData(event.postId);
    if (!data || !data.word) return;

    // Find any guesses associated with the comment
    const matches: string[] = Object.keys(data ?? {})
      .filter((key) => key.startsWith('guess-comment:'))
      .filter((key) => {
        const commentId = data[key];
        return commentId === event.commentId;
      });
    if (matches.length === 0) return;

    // Remove the comment references from Redis
    await Promise.all(
      matches.map(async (match) => {
        const [_, word] = match.split(':');
        await service.removeGuessComment(event.postId, word, event.commentId);
        console.log(`Deleted guess comment: ${event.postId} → ${word} → ${event.commentId}`);
      })
    );
  },
});

/*
 * Comment when a user solves the drawing
 */

Devvit.addSchedulerJob({
  name: 'FIRST_SOLVER_COMMENT',
  onRun: async (
    event: {
      data: {
        postId: string;
        username: string;
      };
    },
    context
  ) => {
    if (event.data) {
      try {
        const comment = await context.reddit.submitComment({
          id: event.data.postId,
          text: `u/${event.data.username} is the first to solve this drawing!`,
        });
        await comment.distinguish(true);
      } catch (error) {
        console.error('Failed to submit comment:', error);
      }
    }
  },
});

export default Devvit;
