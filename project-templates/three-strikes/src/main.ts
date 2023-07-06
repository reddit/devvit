import { Devvit, MenuItemOnPressEvent, User } from '@devvit/public-api';

Devvit.configure({
  kvStore: true, // Enable access to kvStore
  redditAPI: true,
});

Devvit.addMenuItem({
  label: 'Remove and Strike',
  location: ['post', 'comment'],
  forUserType: 'moderator',
  onPress: strike,
});

Devvit.addMenuItem({
  label: `Check User's Strikes`,
  location: ['post', 'comment'],
  forUserType: 'moderator',
  onPress: checkStrikes,
});

Devvit.addMenuItem({
  label: 'Remove Strike from Author',
  location: ['post', 'comment'],
  forUserType: 'moderator',
  onPress: removeStrike,
});

Devvit.addMenuItem({
  label: 'Remove All Strikes from Author',
  location: ['post', 'comment'],
  forUserType: 'moderator',
  onPress: clearStrikes,
});

async function getThing(event: MenuItemOnPressEvent, context: Devvit.Context) {
  const { location, targetId } = event;
  const { reddit } = context;
  if (location === 'post') {
    return await reddit.getPostById(targetId);
  } else if (location === 'comment') {
    return await reddit.getCommentById(targetId);
  }
  throw 'Cannot find a post or comment with that ID';
}

async function getAuthor(event: MenuItemOnPressEvent, context: Devvit.Context) {
  const { reddit } = context;
  const thing = await getThing(event, context);
  return await reddit.getUserById(thing.authorId!);
}

/**
 * Handles the 'strike' action
 */
async function strike(event: MenuItemOnPressEvent, context: Devvit.Context) {
  // Use the correct term in our message based on what was acted upon
  const { location } = event;
  const { reddit, ui } = context;
  const thing = await getThing(event, context);
  const author = await getAuthor(event, context);

  // Remove the content
  await thing!.remove();

  // Add a strike to the user and persist it to the KVStore
  let strikes = await getAuthorStrikes(author, context);
  await setAuthorStrikes(author, ++strikes, context);

  // What we'll send the user in a private message
  let pmMessage = '';
  // Used to tell the moderator what punishment the user received
  let punishment = '';
  // Ban if they're on their 2nd or 3rd strike
  let ban = true;
  // We'll determine how long the ban lasts based on how many strikes they have
  let days = 0;

  // Get the current subreddit from the metadata
  const subreddit = await reddit.getCurrentSubreddit();
  const { permalink } = thing;
  switch (strikes) {
    case 1:
      // first strike, send a warning
      pmMessage = `You have received a strike and your ${location} has been removed from ${subreddit.name} for breaking the rules. Another strike will result in a 1-day ban.\n\n${permalink}`;
      punishment = `sent a warning`;
      ban = false;
      break;
    case 2:
      // second strike, temp ban, warn again
      days = 1;
      pmMessage = `You have received your second strike and your ${location} has been removed from ${subreddit.name} and you have been banned for 1 day for breaking the rules.\n\nONE MORE STRIKE WILL RESULT IN A 1-YEAR BAN FROM THIS SUBREDDIT.\n\n${permalink}`;
      punishment = `banned for 1 day`;
      break;
    case 3:
    default:
      // third (and any subsequent strikes), ban for 1 year from now
      days = 365;
      pmMessage = `You have been banned from ${subreddit.name} for one year for receiving ${strikes} strikes for your ${location}.\n\n${permalink}`;
      punishment = `banned for 1 year`;
      break;
  }

  // Send a private message to the user
  await reddit.sendPrivateMessage({
    to: author.username,
    subject: `Received a strike on ${subreddit.name}`,
    text: pmMessage,
  });

  const result = `u/${author.username} strikes: ${strikes} and has been ${punishment}.`;

  if (ban) {
    const currentUser = await reddit.getCurrentUser();
    await reddit.banUser({
      subredditName: subreddit.name,
      username: author.username,
      duration: days,
      context: thing!.id,
      reason: `Received ${strikes} strike${strikes !== 1 ? 's' : ''} for breaking subreddit rules`,
      note: `Strike added by ${currentUser.username}`,
    });
  }

  ui.showToast(result);
}

async function checkStrikes(event: MenuItemOnPressEvent, context: Devvit.Context) {
  const author = await getAuthor(event, context);
  console.log('checking for ', author.username);
  const { ui } = context;
  const strikes = await getAuthorStrikes(author, context);
  console.log('strikes are ', strikes);
  ui.showToast(`Author u/${author.username} has ${strikes} strike${strikes !== 1 ? 's' : ''}.`);
}

/**
 * Handles the 'removestrike' action
 */
async function removeStrike(event: MenuItemOnPressEvent, context: Devvit.Context) {
  // Get some relevant data from the post or comment
  const author = await getAuthor(event, context);
  const { ui } = context;
  let strikes = await getAuthorStrikes(author, context);

  if (strikes > 0) {
    await setAuthorStrikes(author, --strikes, context);
    ui.showToast(`Removed a strike from u/${author.username}. Remaining strikes: ${strikes}.`);
    return;
  }

  ui.showToast(`u/${author.username} does not have any strikes!`);
}

/**
 * Handles the 'clearstrikes' action
 */
async function clearStrikes(event: MenuItemOnPressEvent, context: Devvit.Context) {
  // Get some relevant data from the post or comment
  const author = await getAuthor(event, context);
  const hadStrikes = await getAuthorStrikes(author, context);
  const { ui } = context;

  if (hadStrikes > 0) {
    await setAuthorStrikes(author!, 0, context);
    ui.showToast(
      `Cleared ${hadStrikes} strike${hadStrikes !== 1 ? 's' : ''} from u/${author.username}!`
    );
    return;
  }

  ui.showToast(`u/${author.username} does not have any strikes!`);
}

/**
 * Creates a KVStore key for the author
 */
function getKeyForAuthor(author: User) {
  return `${author.id}_strikes`;
}

/**
 * Fetch the current strike count for the author
 */
async function getAuthorStrikes(author: User, context: Devvit.Context) {
  const { kvStore } = context;
  const key = getKeyForAuthor(author);
  return ((await kvStore.get(key)) as number) || 0;
}

/**
 * Updates the strike counter in the KVStore
 */
async function setAuthorStrikes(author: User, strikes: number, context: Devvit.Context) {
  const { kvStore } = context;
  const key = getKeyForAuthor(author);
  await kvStore.put(key, strikes);
}

export default Devvit;
