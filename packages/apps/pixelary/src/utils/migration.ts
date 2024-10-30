import type { Context } from '@devvit/public-api';

/*
 * Data Migration Utilities
 * Admin utility to help migrate to the new data schema
 *
 * Why are we doing this?
 * The legacy schema was not scaling well. We had hit a point where the amount of data on the `postData` object was getting larger than the return limit (10mb). This was causing issues with the post data not being able to be loaded in the client, creating a hard limit for how much engagement a post could have.
 *
 * The new schema is designed to be more scalable and to allow for more flexibility in the future.
 */

export const migrateDrawingPostEssentials = async (
  postId: string,
  context: Context
): Promise<boolean> => {
  const oldPostKey = `post-${postId}`;
  const postType = (await context.redis.hGet(oldPostKey, 'postType')) ?? 'drawing';
  if (postType !== 'drawing') return false;

  // Get existing data as individual calls
  // since full data might be too large
  const fields = ['data', 'authorUsername', 'date', 'expired', 'word', 'dictionaryName'];
  const postData = Object.fromEntries(
    await Promise.all(
      fields.map(async (field) => [field, (await context.redis.hGet(oldPostKey, field)) ?? ''])
    )
  );
  postData.postType = 'drawing';
  postData.dictionaryName = postData.dictionaryName ? postData.dictionaryName : 'main';

  // Save new data
  const newPostKey = `post:${postId}`;
  await context.redis.hSet(newPostKey, postData);
  return true;
};

export const migratePinnedPostEssentials = async (
  postId: string,
  context: Context
): Promise<boolean> => {
  const oldPostKey = `post-${postId}`;
  const postType = await context.redis.hGet(oldPostKey, 'postType');
  if (postType !== 'pinned') return false;
  const postData = { postType: 'pinned' };
  const newPostKey = `post:${postId}`;
  await context.redis.hSet(newPostKey, postData);
  return true;
};

/*
Devvit.addSchedulerJob({
    name: 'MIGRATE_DATA_SCHEMA',
    onRun: async (_event, context) => {
      console.log('Performing data migration ...');
      const service = new Service(context);
      const subreddit = await context.reddit.getCurrentSubreddit();
  
      // Get all posts from the subreddit
      let posts: `t3_${string}`[];
      try {
        const newPosts = await context.reddit
          .getNewPosts({
            subredditName: subreddit.name,
            //limit: 10,
            //timeframe: 'all',
            pageSize: 100,
          })
          .all();
        posts = newPosts.map((post) => post.id);
        console.log(`Got ${posts.length} posts.`);
      } catch (e) {
        console.log('Got no posts. Aborting. ', e);
        return;
      }
  
      posts.forEach(async (postId, index) => {
        const postKey = `post-${postId}`;
        const post = await context.redis.hGetAll(postKey);
        console.log(`Migrating Post ${postId} ${index + 1}/${posts.length}`);
  
        // Move "guess-comment" from the post to the new format
        const guessComments = Object.keys(post).filter((key) => key.startsWith('guess-comment:'));
        if (guessComments.length > 0) {
          console.log(`Found ${guessComments.length} "guess-comment:" fields`);
          guessComments.forEach(async (key) => {
            const [_prefix, word] = key.split(':');
            const commentId = post[key];
            await service.saveGuessComment(postId, word, commentId);
            await context.redis.hDel(`post-${postId}`, [key]);
            console.log('Migrated + deleted field: ', key);
          });
          console.log('Migrated all guess comments');
        }
  
        // Delete any user points mentioned in post data
        const userPointsFields = Object.keys(post)
          .filter((key) => key.startsWith('user:'))
          .filter((key) => key.endsWith(':points'));
        if (userPointsFields.length > 0) {
          console.log(`Found ${userPointsFields.length} "user:{username}:points" fields`);
          userPointsFields.forEach(async (key) => {
            await context.redis.hDel(`post-${postId}`, [key]);
            console.log('Deleted field: ', key);
          });
          console.log('Deleted all user points fields');
        }
  
        // User Guesses on Posts
        const userGuessesFields = Object.keys(post)
          .filter((key) => key.startsWith('user:'))
          .filter((key) => key.endsWith(':guesses'));
        if (userGuessesFields.length > 0) {
          console.log(`Found ${userGuessesFields.length} "user:{username}:guesses" fields`);
          userGuessesFields.forEach(async (key) => {
            await context.redis.hDel(`post-${postId}`, [key]);
            console.log('Deleted field: ', key);
          });
          console.log('Deleted all user guesses fields');
        }
  
        // Word Guess Counter
        const guesses = Object.keys(post).filter((key) => key.startsWith('guess:'));
        if (guesses.length > 0) {
          console.log(`Found ${guesses.length} 'guess:' fields`);
          guesses.forEach(async (key) => {
            await context.redis.hDel(`post-${postId}`, [key]);
            console.log('Deleted field: ', key);
          });
          console.log('Deleted all guess fields');
        }
  
        // Populate missing postType field
        const missingPostType = !Object.keys(post).includes('postType');
        if (missingPostType) {
          const p = await context.reddit.getPostById(postId);
          if (p.title === 'What is this?') {
            await context.redis.hSet(`post-${postId}`, { postType: 'drawing' });
          }
          console.log('Added postType field');
        }
  
        // User Skipped Field
        const userSkippedFields = Object.keys(post)
          .filter((key) => key.startsWith('user:'))
          .filter((key) => key.endsWith(':skipped'));
        if (userSkippedFields.length > 0) {
          console.log(`Found ${userSkippedFields.length} "user:{username}:skipped" fields`);
          userSkippedFields.forEach(async (key) => {
            const username = key.split(':')[1];
            await service.skipPost(postId, username);
            await context.redis.hDel(`post-${postId}`, [key]);
            console.log('Migrated + Deleted field: ', key);
          });
          console.log('Deleted all user skipped fields');
        }
  
        // Ensure all drawings are part of the user-drawings set
        const authorUsername = post.authorUsername;
        const date = post.date;
        if (authorUsername && date) {
          console.log('Adding drawing to user set');
          await context.redis.zAdd(`user-drawings:${authorUsername}`, {
            member: postId,
            score: parseInt(date),
          });
          console.log('Added drawing to user set');
        }
  
        // Ensure all drawings are part of the word-drawings set
        if (post.word && post.date) {
          console.log('Adding drawing to word set');
          await context.redis.zAdd(`word-drawings:${post.word}`, {
            member: postId,
            score: parseInt(date),
          });
          console.log('Added drawing to user set');
        }
  
        console.log(`Migrated Post ${postId} ${index + 1}/${posts.length}`);
      });
      console.log('Migration complete');
    },
  });

*/
