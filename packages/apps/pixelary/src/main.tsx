import { Devvit } from '@devvit/public-api';

import { LoadingState } from './components/LoadingState.js';
import Words from './data/words.json';
import { Router } from './posts/Router.js';
import { Service } from './service/Service.js';
import Settings from './settings.json';
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

/*
 * Install action
 */

Devvit.addMenuItem({
  label: '[Pixelary] Install Game',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    const { ui, reddit, scheduler } = context;
    const service = new Service(context);
    const community = await reddit.getCurrentSubreddit();

    // Check if post flairs are enabled in the community
    if (!community.postFlairsEnabled) {
      ui.showToast('Enable post flairs first!');
      return;
    }

    // Create the pinned post
    const post = await reddit.submitPost({
      title: Settings.pinnedPost.title,
      subredditName: community.name,
      preview: <LoadingState />,
    });

    const [_sticky, _storeData, activeFlair, endedFlair] = await Promise.all([
      // Pin the post
      await post.sticky(),
      // Store the post data
      await service.storePinnedPostData(post.id),
      // Create the game "Active" flair for drawings
      await reddit.createPostFlairTemplate({
        subredditName: community.name,
        text: 'Active',
        textColor: 'dark',
        backgroundColor: '#46D160',
      }),
      // Create the "Ended" flair for drawings
      await reddit.createPostFlairTemplate({
        subredditName: community.name,
        text: 'Ended',
        textColor: 'light',
        backgroundColor: '#EA0027',
      }),
    ]);

    await Promise.all([
      // Store the game settings
      await service.storeGameSettings({
        activeFlairId: activeFlair.id,
        endedFlairId: endedFlair.id,
      }),
      // Schedule minutly updates of the score board
      await scheduler.runJob({ cron: '* * * * *', name: 'UpdateScoreBoard' }),
    ]);

    ui.navigateTo(post);
    ui.showToast('Installed Pixelary!');
  },
});

/*
 * Dictionary
 */

Devvit.addMenuItem({
  label: '[Pixelary] Save dictionary to Redis',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    const service = new Service(context);
    await service.upsertDictionary('main', Words);
    context.ui.showToast('Dictionary saved to Redis');
  },
});

const logDictionaryForm = Devvit.createForm(
  {
    fields: [
      {
        type: 'string',
        name: 'dictionary',
        label: 'Which dictionary do you want to log?',
        defaultValue: 'main',
      },
    ],
  },
  async (event, context) => {
    const service = new Service(context);

    await service.getDictionaries(event.values.dictionary, true);
    context.ui.showToast('Dictionary retrieved. Run `devvit logs` to view');
  }
);

Devvit.addMenuItem({
  label: '[Pixelary] Log dictionary',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    context.ui.showForm(logDictionaryForm);
  },
});

const addWordsToDictionaryForm = Devvit.createForm(
  {
    fields: [
      {
        type: 'string',
        name: 'dictionary',
        label: 'What dictionary do you want to add a word to?',
        defaultValue: 'main',
      },
      {
        type: 'string',
        name: 'words',
        label:
          'What words do you want to add to the dictionary? (Separate multiple words with commas)',
        required: true,
      },
    ],
  },
  async (event, context) => {
    const service = new Service(context);

    if (!event.values.words) {
      context.ui.showToast('Please enter a word');
      return;
    }
    const words = event.values.words
      .split(',')
      .map((word) => service.getCapitalizedWord(word.trim()));
    const wordsAdded = await service.upsertDictionary(event.values.dictionary, words);

    const addedWordsStr = wordsAdded.uniqueNewWords.join(', ');
    const notAddedWordsStr = wordsAdded.duplicatesNotAdded.join(', ');

    if (wordsAdded.uniqueNewWords.length === 1 && wordsAdded.duplicatesNotAdded.length === 0) {
      context.ui.showToast(`One word was added: ${addedWordsStr}`);
    } else if (
      wordsAdded.uniqueNewWords.length === 1 &&
      wordsAdded.duplicatesNotAdded.length === 1
    ) {
      context.ui.showToast(`One word was added: ${addedWordsStr}`);
      context.ui.showToast(`One word was already in the collection: ${notAddedWordsStr}`);
    } else if (wordsAdded.uniqueNewWords.length === 1 && wordsAdded.duplicatesNotAdded.length > 1) {
      context.ui.showToast(`One word was added: ${addedWordsStr}`);
      context.ui.showToast(
        `${wordsAdded.duplicatesNotAdded.length} words were already in the collection: ${notAddedWordsStr}`
      );
    } else if (wordsAdded.uniqueNewWords.length > 1 && wordsAdded.duplicatesNotAdded.length === 0) {
      context.ui.showToast(
        `${wordsAdded.uniqueNewWords.length} words were added: ${addedWordsStr}`
      );
    } else if (
      wordsAdded.uniqueNewWords.length === 0 &&
      wordsAdded.duplicatesNotAdded.length === 1
    ) {
      context.ui.showToast(`One word was already in the collection: ${notAddedWordsStr}`);
    } else if (wordsAdded.uniqueNewWords.length === 0 && wordsAdded.duplicatesNotAdded.length > 1) {
      context.ui.showToast(
        `${wordsAdded.duplicatesNotAdded.length} words were already in the collection: ${notAddedWordsStr}`
      );
    } else if (wordsAdded.uniqueNewWords.length > 0 && wordsAdded.duplicatesNotAdded.length === 1) {
      context.ui.showToast(
        `${wordsAdded.uniqueNewWords.length} words were added: ${addedWordsStr}`
      );
      context.ui.showToast(`One word was already in the collection: ${notAddedWordsStr}`);
    } else if (wordsAdded.uniqueNewWords.length > 0 && wordsAdded.duplicatesNotAdded.length > 1) {
      context.ui.showToast(
        `${wordsAdded.uniqueNewWords.length} words were added: ${addedWordsStr}`
      );
      context.ui.showToast(
        `${wordsAdded.duplicatesNotAdded.length} words were already in the collection: ${notAddedWordsStr}`
      );
    }
  }
);

Devvit.addMenuItem({
  label: '[Pixelary] Add words to dictionary',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: (_event, context) => {
    context.ui.showForm(addWordsToDictionaryForm);
  },
});

const selectDictionaryForm = Devvit.createForm(
  (data) => {
    //TODO: get dictionary names from redis (need to implement this in Service)
    return {
      fields: [
        {
          name: 'dictionary',
          label: 'Which dictionary do you want to use?',
          type: 'select',
          options: [
            { label: 'main', value: 'main' },
            { label: 'r/piercing', value: 'r/piercing' }, //hardcoding for r/piercing dictionary takeover 9/26/24
            { label: 'r/NintendoSwitch', value: 'r/NintendoSwitch' }, //hardcoding for r/NintendoSwitch dictionary takeover 10/10/24
          ],
          defaultValue: ['main'],
        },
      ],
      title: 'Select a dictionary',
      acceptLabel: 'Select',
    };
  },
  async (event, context) => {
    if (!Array.isArray(event.values.dictionary)) {
      return context.ui.showToast('Please select a dictionary');
    }
    const value = event.values.dictionary[0];
    if (typeof value !== 'string') {
      return context.ui.showToast('Selected value must be a string!');
    }

    const service = new Service(context);
    await service.setSelectedDictionaryName(value);
    return context.ui.showToast(`Dictionary selected: ${event.values.dictionary[0]}`);
  }
);

Devvit.addMenuItem({
  label: '[Pixelary] Select dictionary',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    context.ui.showForm(selectDictionaryForm);
  },
});

Devvit.addMenuItem({
  label: '[Pixelary] Log selected dictionary name',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    const service = new Service(context);
    const selectedDictionary = await service.getSelectedDictionaryName();
    context.ui.showToast(`Current dictionary: ${selectedDictionary}`);
  },
});

const removeWordsFromDictionaryForm = Devvit.createForm(
  {
    fields: [
      {
        type: 'string',
        name: 'dictionary',
        label: 'What dictionary do you want to remove a word from?',
        defaultValue: 'main',
      },
      {
        type: 'string',
        name: 'words',
        label:
          'What words do you want to remove from the dictionary? (Separate multiple words with commas)',
        required: true,
      },
    ],
  },
  async (event, context) => {
    const service = new Service(context);

    if (!event.values.words) {
      context.ui.showToast('Please enter a word');
      return;
    }
    const wordsToRemove = event.values.words
      .split(',')
      .map((word) => service.getCapitalizedWord(word.trim()));
    const wordsRemoved = await service.removeWordFromDictionary(
      event.values.dictionary,
      wordsToRemove
    );

    const removedWordsStr = wordsRemoved.removedWords.join(', ');
    const notFoundWordsStr = wordsRemoved.notFoundWords.join(', ');

    if (wordsRemoved.removedCount === 1 && wordsRemoved.notFoundWords.length === 0) {
      context.ui.showToast(`One word was removed: ${removedWordsStr}`);
    } else if (wordsRemoved.removedCount === 1 && wordsRemoved.notFoundWords.length === 1) {
      context.ui.showToast(`One word was removed: ${removedWordsStr}`);
      context.ui.showToast(`One word was not found: ${notFoundWordsStr}`);
    } else if (wordsRemoved.removedCount === 1 && wordsRemoved.notFoundWords.length > 1) {
      context.ui.showToast(`One word was removed: ${removedWordsStr}`);
      context.ui.showToast(
        `${wordsRemoved.notFoundWords.length} words were not found: ${notFoundWordsStr}`
      );
    } else if (wordsRemoved.removedCount > 1 && wordsRemoved.notFoundWords.length === 0) {
      context.ui.showToast(`${wordsRemoved.removedCount} words were removed: ${removedWordsStr}`);
    } else if (wordsRemoved.removedCount === 0 && wordsRemoved.notFoundWords.length === 1) {
      context.ui.showToast(`One word was not found: ${notFoundWordsStr}`);
    } else if (wordsRemoved.removedCount === 0 && wordsRemoved.notFoundWords.length > 1) {
      context.ui.showToast(
        `${wordsRemoved.notFoundWords.length} words were not found: ${notFoundWordsStr}`
      );
    } else if (wordsRemoved.removedCount > 0 && wordsRemoved.notFoundWords.length === 1) {
      context.ui.showToast(`${wordsRemoved.removedCount} words were removed: ${removedWordsStr}`);
      context.ui.showToast(`One word was not found: ${notFoundWordsStr}`);
    } else if (wordsRemoved.removedCount > 0 && wordsRemoved.notFoundWords.length > 1) {
      context.ui.showToast(`${wordsRemoved.removedCount} words were removed: ${removedWordsStr}`);
      context.ui.showToast(
        `${wordsRemoved.notFoundWords.length} words were not found: ${notFoundWordsStr}`
      );
    }
  }
);

Devvit.addMenuItem({
  label: '[Pixelary] Remove words from dictionary',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: (_event, context) => {
    context.ui.showForm(removeWordsFromDictionaryForm);
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

/*
 * Pinned post
 */

Devvit.addMenuItem({
  label: '[Pixelary] New Pinned Post',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    const { ui, reddit } = context;
    const service = new Service(context);

    try {
      const community = await reddit.getCurrentSubreddit();
      const post = await reddit.submitPost({
        title: Settings.pinnedPost.title,
        subredditName: community.name,
        preview: <LoadingState />,
      });
      await Promise.all([await post.sticky(), await service.storePinnedPostData(post.id)]);
      ui.navigateTo(post);
    } catch (error) {
      console.error('Failed to create pinned post:', error);
      ui.showToast('Failed to create post');
    }
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
        await context.reddit.submitComment({
          id: event.data.postId,
          text: `u/${event.data.username} is the first to solve this drawing!`,
        });
      } catch (error) {
        console.error('Failed to submit comment:', error);
      }
    }
  },
});

/*
 * Add and pin a TLDR comment to new drawing posts
 */

Devvit.addSchedulerJob({
  name: 'DRAWING_PINNED_TLDR_COMMENT',
  onRun: async (
    event: {
      data: {
        postId: string;
      };
    },
    context
  ) => {
    if (event.data) {
      try {
        const comment = await context.reddit.submitComment({
          id: event.data.postId,
          text: `Pixelary is a new pixel-based drawing and guessing game built on [Reddit's developer platform](https://developers.reddit.com). To play, press the "Guess" button to submit a guess or "Draw" button to create your own drawing. [Submit feedback](https://www.reddit.com/r/Pixelary/comments/1f578ps/hello_pixelary_community/).`,
        });
        await comment.distinguish(true);
      } catch (error) {
        console.error('Failed to submit TLDR comment:', error);
      }
    }
  },
});

// ADMIN ONLY
Devvit.addMenuItem({
  label: '[Pixelary] Create Top Weekly Drawings Post',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    const service = new Service(context);

    const subreddit = await context.reddit.getCurrentSubreddit();

    // Get subreddit top posts and store the details
    const topPosts = await context.reddit
      .getTopPosts({
        subredditName: subreddit.name,
        timeframe: 'week',
        limit: 20,
        pageSize: 20,
      })
      .all();

    const collectionPostData = await service.getPostDataFromSubredditPosts(topPosts, 4);

    if (collectionPostData.length === 0) {
      throw 'No posts found';
    }

    const post = await context.reddit.submitPost({
      title: 'Top drawings from the last week',
      subredditName: subreddit.name,
      preview: <LoadingState />,
    });

    const postData = {
      postId: post.id,
      data: collectionPostData,
      timeframe: 'week',
      postType: 'collection',
    };

    await service.storeCollectionPostData(postData);

    // Create comment with the featured artists
    let commentText = `Featured artwork by:`;
    collectionPostData.forEach((drawing) => {
      commentText = `${commentText}\n* u/${drawing.authorUsername}`;
    });
    const comment = await context.reddit.submitComment({
      id: post.id,
      text: commentText,
    });
    await comment.distinguish(true);

    context.ui.showToast('Top Weekly Drawings Post Created');
    context.ui.navigateTo(post);
  },
});

/*
 * Mod Action to check if a comment is a guess
 */
Devvit.addMenuItem({
  label: '[Pixelary] Is this a guess?',
  location: 'comment',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    if (!context.commentId) {
      return context.ui.showToast('No comment ID found');
    }

    const comment = await context.reddit.getCommentById(context.commentId);
    const postId = comment.postId;

    const service = new Service(context);
    const data = await service.getPostData(postId);
    if (!data) {
      return context.ui.showToast('No post data found');
    }

    const commentWasAutomated = Object.keys(data ?? {})
      .filter((key) => key.startsWith('guess-comment:'))
      .map((key) => {
        const commentId = data[key];
        return commentId === context.commentId;
      })
      .includes(true);

    if (commentWasAutomated) {
      return context.ui.showToast('Yes. Automated comment');
    }

    context.ui.showToast('No. Manual comment');
  },
});

export default Devvit;
