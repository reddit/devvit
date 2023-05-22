import {
  Context,
  ContextActionEvent,
  Devvit,
  KeyValueStorage,
  RedditAPIClient,
  UserContext,
} from '@devvit/public-api';
import { Metadata } from '@devvit/protos';

/**
 * Three-strikes mod tool
 *
 * Adds an action to Posts and Comments to remove the content and strike
 * the author with increasingly severe penalties.
 *
 * Strike 1: Send a private message warning the user of the action taken
 *           for the content
 * Strike 2: Ban for 1 day, warn again and add that an additional strike
 *           will result in banning for 1 year
 * Strike 3+: Ban the user for 1 year
 */

/**
 * Provides access to the Key Value storage
 */
const kv = new KeyValueStorage();

/**
 * The Reddit API client lets us make calls to the Reddit API.
 * To use it, we must instantiate it at the top of our main.ts file.
 */
const reddit = new RedditAPIClient();

/**
 * Declare our custom mod-only actions and add it to Posts and Comments
 */
Devvit.addActions([
  {
    name: 'Remove and Strike',
    description: 'Remove this and add a strike to the author',
    context: [Context.POST, Context.COMMENT],
    userContext: UserContext.MODERATOR,
    handler: strike,
  },
  {
    name: `Check User's Strikes`,
    description: 'Tells you how many strikes the author has',
    context: [Context.POST, Context.COMMENT],
    userContext: UserContext.MODERATOR,
    handler: checkStrikes,
  },
  {
    name: 'Remove Strike from Author',
    description: 'Remove a strike from the author of this content',
    context: [Context.POST, Context.COMMENT],
    userContext: UserContext.MODERATOR,
    handler: removeStrike,
  },
  {
    name: 'Remove All Strikes from Author',
    description: `Reset the author's strike count to zero`,
    context: [Context.POST, Context.COMMENT],
    userContext: UserContext.MODERATOR,
    handler: clearStrikes,
  },
]);

/**
 * Handles the 'strike' action
 */
async function strike(event: ContextActionEvent, metadata?: Metadata) {
  // Use the correct term in our message based on what was acted upon
  const contextType = event.context === Context.POST ? 'post' : 'comment';

  // Get some relevant data from the post or comment
  let id: string | undefined, author: string | undefined, permalink: string | undefined;

  if (event.context === Context.POST) {
    id = `t3_${event.post.id}`;
    author = event.post.author;
    permalink = event.post.permalink;
  } else if (event.context === Context.COMMENT) {
    id = `t1_${event.comment.id}`;
    author = event.comment.author;
    permalink = event.comment.permalink;
  }

  if (!id || !author || !permalink) {
    return {
      success: false,
      message: `Metadata is missing for ${contextType}!`,
    };
  }

  /**
   * Remove the content
   * See: https://www.reddit.com/dev/api#POST_api_remove
   *
   * NOTE: Apps are executed as the moderator that installed this app and
   *       must have permission to remove content for this to work!
   */
  await reddit.remove(id, false, metadata);

  // Add a strike to the user and persist it to the KVStore
  let strikes = await getAuthorStrikes(author!, metadata);
  await setAuthorStrikes(author, ++strikes, metadata);

  // What we'll send the user in a private message
  let pmMessage = '';
  // Used to tell the moderator what punishment the user received
  let punishment = '';
  // Ban if they're on their 2nd or 3rd strike
  let ban = true;
  // We'll determine how long the ban lasts based on how many strikes they have
  let days = 0;

  // Get the current subreddit from the metadata
  const subreddit = await reddit.getCurrentSubreddit(metadata);

  switch (strikes) {
    case 1:
      // first strike, send a warning
      pmMessage = `You have received a strike and your ${contextType} has been removed from ${subreddit.name} for breaking the rules. Another strike will result in a 1-day ban.\n\n${permalink}`;
      punishment = `sent a warning`;
      ban = false;
      break;
    case 2:
      // second strike, temp ban, warn again
      days = 1;
      pmMessage = `You have received your second strike and your ${contextType} has been removed from ${subreddit.name} and you have been banned for 1 day for breaking the rules.\n\nONE MORE STRIKE WILL RESULT IN A 1-YEAR BAN FROM THIS SUBREDDIT.\n\n${permalink}`;
      punishment = `banned for 1 day`;
      break;
    case 3:
    default:
      // third (and any subsequent strikes), ban for 1 year from now
      days = 365;
      pmMessage = `You have been banned from ${subreddit.name} for one year for receiving ${strikes} strikes for your ${contextType}.\n\n${permalink}`;
      punishment = `banned for 1 year`;
      break;
  }

  /**
   * Send a private message to the user
   * See: https://www.reddit.com/dev/api#POST_api_compose
   *
   * NOTE: Apps are executed as the moderator that installed this app into a
   *       subreddit and will be used as the user that sends this message!
   */
  await reddit.sendPrivateMessage(
    {
      to: author,
      subject: `Received a strike on ${subreddit.name}`,
      text: pmMessage,
    },
    metadata
  );

  const result = `u/${author} has ${strikes} strike${
    strikes !== 1 ? 's' : ''
  } and has been ${punishment}.`;

  if (ban) {
    // Get the current user from the metadata
    const currentUser = await reddit.getCurrentUser(metadata);

    /**
     * We ban a user by creating a "banned" relationship between the user
     * and the subreddit.
     * See: https://www.reddit.com/dev/api#POST_api_friend
     *
     * NOTE: Apps are executed as the moderator that installed this app and
     *       must have permission to ban users for this to work!
     */

    await reddit.banUser(
      {
        subredditName: subreddit.name,
        username: author,
        duration: days,
        context: id,
        reason: `Received ${strikes} strike${
          strikes !== 1 ? 's' : ''
        } for breaking subreddit rules`,
        note: `Strike added by ${currentUser.username}`,
      },
      metadata
    );
  }

  return {
    success: true,
    message: result,
  };
}

/**
 * Handles the 'checkstrikes' action
 */
async function checkStrikes(event: ContextActionEvent, metadata?: Metadata) {
  // Get some relevant data from the post or comment
  let author: string | undefined;
  if (event.context === Context.POST) {
    author = event.post.author;
  } else if (event.context === Context.COMMENT) {
    author = event.comment.author;
  }

  const strikes = await getAuthorStrikes(author!, metadata);

  return {
    success: true,
    message: `Author u/${author} has ${strikes} strike${strikes !== 1 ? 's' : ''}.`,
  };
}

/**
 * Handles the 'removestrike' action
 */
async function removeStrike(event: ContextActionEvent, metadata?: Metadata) {
  // Get some relevant data from the post or comment
  let author: string | undefined;
  if (event.context === Context.POST) {
    author = event.post.author;
  } else if (event.context === Context.COMMENT) {
    author = event.comment.author;
  }

  let strikes = await getAuthorStrikes(author!, metadata);
  if (strikes > 0) {
    await setAuthorStrikes(author!, --strikes, metadata);
    return {
      success: true,
      message: `Removed a strike from u/${author}. Remaining strikes: ${strikes}.`,
    };
  }

  return {
    success: false,
    message: `u/${author} does not have any strikes!`,
  };
}

/**
 * Handles the 'clearstrikes' action
 */
async function clearStrikes(event: ContextActionEvent, metadata?: Metadata) {
  // Get some relevant data from the post or comment
  let author: string | undefined;
  if (event.context === Context.POST) {
    author = event.post.author;
  } else if (event.context === Context.COMMENT) {
    author = event.comment.author;
  }

  const hadStrikes = await getAuthorStrikes(author!, metadata);
  if (hadStrikes > 0) {
    await setAuthorStrikes(author!, 0, metadata);

    return {
      success: true,
      message: `Cleared ${hadStrikes} strike${hadStrikes !== 1 ? 's' : ''} from u/${author}!`,
    };
  }

  return {
    success: false,
    message: `u/${author} does not have any strikes!`,
  };
}

/**
 * Creates a KVStore key for the author
 */
function getKeyForAuthor(author: string): string {
  return `u_${author}_strikes`;
}

/**
 * Fetch the current strike count for the author
 */
async function getAuthorStrikes(author: string, metadata?: Metadata): Promise<number> {
  const key = getKeyForAuthor(author);
  return (await kv.get(key, metadata, 0)) as number;
}

/**
 * Updates the strike counter in the KVStore
 */
async function setAuthorStrikes(author: string, strikes: number, metadata?: Metadata) {
  const key = getKeyForAuthor(author);
  await kv.put(key, strikes, metadata);
}

export default Devvit;
