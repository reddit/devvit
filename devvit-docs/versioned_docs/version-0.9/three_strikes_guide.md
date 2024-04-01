# Three Strikes app

This app allows a moderator to remove rule-breaking content and use a "three strike" system to manage users who violate community rules. The penalties become more severe with each strike:

**Strike 1**: Sends a private warning message the user.  
**Strike 2**: Bans the user from the community for one day.  
**Strike 3**: Bans the user from the community for one year.

| Post menu                                              | Comment menu                                                 |
| ------------------------------------------------------ | ------------------------------------------------------------ |
| ![Post menu](./assets/three_strikes_app_post_menu.png) | ![Comment menu](./assets/three_strikes_app_comment_menu.png) |

## Start a project

To create a Three Strikes app, use the default empty [template](templates.md) to start a new project.

1. From the terminal, navigate to a directory where you'll store your project.
2. Enter the following command to create a project folder on your local machine.

```bash
devvit new <replace-with-your-app-name>
```

3. In your new project, open `main.ts` in your code editor (we recommend VS Code).

```bash
your-app-name
├── devvit.yaml
├── package-lock.json  # If you use yarn, this will be yarn.lock
├── package.json
├── src
│   └── main.ts     # <- the main code is here (ignore the rest for now)
├── tsconfig.json
```

4. Add the following code to the top of the `main.ts' file (you can replace the existing import statement).

```typescript
import {
  Context,
  ContextActionEvent,
  Devvit,
  KeyValueStorage,
  RedditAPIClient,
  UserContext,
} from '@devvit/public-api';
import { Metadata } from '@devvit/protos';
```

Importing this code adds core classes and plugins from the Reddit Developer Platform (`@devvit/public-api`), defines the fields that are available in the `Metadata` class using [Google Proto Buffers](https://developers.google.com/protocol-buffers) (`@devvit/protos`), and imports the interface and types for `ContextAction` requests.

5. Add the [Key-Value Store plugin](./kv_store_plugin.md). This plugin allows you to store data in your app that will be there the next time it’s run.

```typescript
const kv = new KeyValueStorage();
```

Now that you’ve set up your project, you’re ready to add some cool features.

## Import Reddit API features

The Reddit Developer Platform lets you implement features that are available in the [public Reddit API](https://www.reddit.com/dev/api). Add the following features to your `main.ts` file.

6. Use the Reddit API Client to do things like send private messages, get user info, and interact with posts and comments:

```typescript
const reddit = new RedditAPIClient();
```

## Create an author key

A Key-Value Store is basically a Devvit-hosted database that lets you store data in your app (for example, the number of strikes a user has). Each uniquely identified key is paired with an associated value and is available every time the app is run.

7. For the three strikes app, you’ll create a key for the author of the post or comment, where \{author} is a Reddit username and the associated value is the user’s strike value.

```typescript
/**
 * Creates a KVStore key for the author
 */
function getKeyForAuthor(author: string): string {
  return `u_${author}_strikes`;
}
```

## Add mod menu functionality

Strike functionality is added to the mod menu so that the moderator can remove rule-breaking content and manage users who violate the community’s guidelines. Add the following code to your `main.ts` file.

### Check user's strikes

This function determines if the author currently has any strikes.

8. Add the `getAuthorStrikes` function to sync with the Key-Value Store.

```typescript
/**
 * Fetch the current strike count for the author
 */
async function getAuthorStrikes(author: string, metadata?: Metadata): Promise<number> {
  const key = getKeyForAuthor(author);
  return (await kv.get(key, metadata, 0)) as number;
}
```

9. Add the `checkStrikes` function to get data from the post or comment.

```typescript
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
```

When this option is selected from the mod menu, a toast returns the number of strikes at the bottom of the page.

![Author strike count](./assets/three_strikes_app_author_strike_count.png)

### Remove strike from author

This function allows the moderator to change a user’s strike count.

10. Add the `setAuthorStrikes` function to update the strike counter in the Key-Value Store.

```typescript
/**
 * Updates the strike counter in the KVStore
 */
async function setAuthorStrikes(author: string, strikes: number, metadata?: Metadata) {
  const key = getKeyForAuthor(author);
  await kv.put(key, strikes, metadata);
}
```

11. Add the `removeStrike` function to check the metadata in the Key-Value Store and update the strike counter for the author.

```typescript
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
```

If a mod attempts to remove a strike when a user’s strike count is zero, an error toast appears at the bottom of the screen.

![Strike count error toast](./assets/three_strikes_app_no_strikes.png)

### Remove all strikes from author

This function updates metadata in the Key-Value Store and resets the strike counter for the author to zero.

12. Add the `clearStrikes` function.

```typescript
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
```

### Remove and strike

This function shows the mod where the action came from, pulls relevant data from the post or comment (including name, author, and permalink), and adds a strike to the user’s account. Then the content is removed by the [Reddit Remove Post API](https://www.reddit.com/dev/api#POST_api_remove). If this is the third strike for a user, the [Reddit Friend API](https://www.reddit.com/dev/api#POST_api_friend) bans the user from the community.

13. Add the `strike` function.

```typescript
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
```

## Compose a message

When a mod selects the **Remove and strike** menu option, a private message is sent to the user with the appropriate warning based on the user’s number of strikes. There is boilerplate text in the [strike functionality](#Remove-and-strike) you added earlier. If you would like to modify the messages, edit that file under the appropriate strike count.

## Add menu actions

You can use the `Devvit.addActions` method to add menu names to functions you just set up. This is where you determine where the menu actions will show up (for example, setting context.POST means that your menu action will appear in the moderation menu of a post). The `handler` parameter defines the function that is called when the action is invoked.

14. Use `Devvit.addActions` to create a new overflow menu item called "Three Strikes".

```typescript
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
```

## Complete the project

You’ll know your project is complete when you see the following (kinda cryptic) line at the end of your code.

```typescript
export default Devvit;
```

All of the code above this line modified the core Devvit object. This line simply makes the updated Devvit object (which now implements the Three Strikes app) available to the Reddit Developer Platform. When this new instance of Devvit is installed on a subreddit, it will contain the three strikes menu shortcut and the logic you just wrote to make it work.

### Upload your app

Your app is now ready to upload! Move into the top-level directory and use `devvit upload` to upload your app to the Reddit Developer Platform. Make sure to install this in a subreddit you moderate.

```bash
`your-app-name      # <- you should be here
├── devvit.yaml
├── package-lock.json  # If you use yarn, this will be yarn.lock
├── package.json
├── src
│   └── main.ts
├── tsconfig.json
```

### Use your app

When you want to use the Three Strikes app, click on the mod menu (shaped like a shield) and select the appropriate action.

| Post menu                                              | Comment menu                                                 |
| ------------------------------------------------------ | ------------------------------------------------------------ |
| ![Post menu](./assets/three_strikes_app_post_menu.png) | ![Comment menu](./assets/three_strikes_app_comment_menu.png) |

## Next steps

Congratulations on getting your Three Strikes app running! Next up: add [logging](logging.md) to your app to help you debug.
