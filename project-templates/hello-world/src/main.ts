import { Context, Devvit, UserContext } from '@devvit/public-api';

/**
 * Declare the custom actions we'd like to add to the subreddit
 */
Devvit.addAction({
  context: Context.POST,
  name: 'Custom Post Action', // text to display in the menu (keep it short!)
  description: 'Do something with this post', // short blurb describing what we're going to do
  handler: async (event) => {
    const message = `Post action! Post ID: ${event.post?.id}`;
    console.log(message);
    /**
     * We need to return two things from this call:
     *  - success: whether the Action succeeded
     *  - message: A bit of text to show the user as
     *             feedback (confirmation, warning, error, etc.)
     */
    return { success: true, message };
  },
});

Devvit.addAction({
  context: Context.COMMENT,
  name: 'Custom Comment Action', // text to display in the menu (keep it short!)
  description: 'Do something with this comment', // short blurb describing what we're going to do
  handler: async (event) => {
    const message = `Comment action! Comment ID: ${event.comment?.id}`;
    console.log(message);
    return { success: true, message };
  },
});

Devvit.addAction({
  context: Context.SUBREDDIT,
  name: 'Custom Subreddit Action', // text to display in the menu (keep it short!)
  description: 'Do something with this subreddit', // short blurb describing what we're going to do
  handler: async (event) => {
    const message = `Subreddit action! Subreddit ID: ${event.subreddit?.id}`;
    console.log(message);
    return { success: true, message };
  },
});

Devvit.addAction({
  context: Context.POST,
  userContext: UserContext.MODERATOR,
  name: 'Custom Post Action, only for mods!', // text to display in the menu (keep it short!)
  description: 'Do something with this post', // short blurb describing what we're going to do
  handler: async (event) => {
    const message = `Post action for mods! Post ID: ${event.post?.id}`;
    console.log(message);
    return { success: true, message };
  },
});

Devvit.addAction({
  context: Context.POST,
  userContext: UserContext.MEMBER,
  name: 'Custom Post Action, only for members!', // text to display in the menu (keep it short!)
  description: 'Do something with this post', // short blurb describing what we're going to do
  handler: async (event) => {
    const message = `Post action for members! Post ID: ${event.post?.id}`;
    console.log(message);
    return { success: true, message };
  },
});

export default Devvit;
