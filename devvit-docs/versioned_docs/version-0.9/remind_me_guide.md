# Remind Me app

This app lets you create a reminder message and schedule when that message will be sent.

In this tutorial, you'll learn:

- How to use the `Scheduler` and `Reddit API` plugins to build a Remind Me app.
- How to use `ConfigFormBuilder` to get user input.
- How to use a third-party node library (`chrono-node`) in your code.

The **Remind Me Later** option is located in the overflow menu of a post (look for the three dots). When selected, the user is prompted to enter a future time for the reminder. The [chrono-node](https://www.npmjs.com/package/chrono-node) library interprets the input as a regular sentence (for example, "in two weeks") to generate a timestamp. At the specified time, the Remind Me app sends the user a private message containing a link to the original post.

| Post menu                                           | User input                                           |
| --------------------------------------------------- | ---------------------------------------------------- |
| ![Post menu](./assets/remind_me_bot_menu_entry.png) | ![User input](./assets/remind_me_bot_input_form.png) |

## Start a project

To create a Remind Me app, use the default `empty` [template](templates.md) to start a new project.

1. From the terminal, navigate to a directory where you'll store your project.
2. Enter the following command to create a project folder on your local machine.

```bash
devvit new <replace-with-your-app-name>
```

:::info

The fully-functioning code in this tutorial is also available in the `remind-me` template. Simply type `devvit new --template remind-me <replace-with-your-app-name>` to start a project with the code below already written.

:::

3. In your new project, open `main.ts` your editor (we recommend VS Code).

```bash
your-app-name
├── devvit.yaml
├── package.json
├── src
│   └── main.ts        # <- the main code is here (ignore the rest for now)
├── tsconfig.json
├── yarn.lock

```

4. Add the following code to the top of your file (you can replace the existing import statement).

```typescript
import {
  ConfigFormBuilder,
  Context,
  Devvit,
  PostContextActionEvent,
  RedditAPIClient,
} from '@devvit/public-api';
import { Metadata } from '@devvit/protos';
import * as chrono from 'chrono-node';
```

Importing this code adds core classes and plugins from the Reddit Developer Platform (`@devvit/public-api`), defines the fields that are available in the `Metadata` class using [Google Proto Buffers](https://developers.google.com/protocol-buffers), and imports `chrono-node`, which is a third-party Node.js library.

## Install dependencies

This app uses `chrono-node`, which you'll need to install manually.

5. Open a command line and navigate to your app's root directory.

```bash
your-app-name      # <- you should be here
├── devvit.yaml
├── package.json
├── src
│   └── main.ts
├── tsconfig.json
├── yarn.lock

```

6. Run the install code.

```bash
npm install --save chrono-node
```

7. Make sure your project registered the update by checking the `package.json` file in your app's root directory.

```bash
your-app-name
├── devvit.yaml
├── package.json        # <- check this file
├── src
│   └── main.ts
├── tsconfig.json
├── yarn.lock

```

The `package.json` file should have a `dependencies` entry with `chrono-node`.

```bash
{
  "name": "mrt-0-8-remind-me",
  "version": "0.0.0",
  "type": "module",
  "private": true,
  "license": "BSD-3-Clause",
  "main": "index.js",
  "workspaces": [
    "actors/my-actor"
  ],
  "devDependencies": {
    "@devvit/tsconfig": "0.7.1",
    "typescript": "4.9.3"
  },
  "dependencies": {
    "chrono-node": "^2.4.2"            // <- chrono node has been registered in this project!
  }
}
```

:::note

Your `package.json` file may not match exactly--that's OK! Just check that the chrono-node entry is there.

:::

If you are having trouble installing `chrono-node`, check out our [quickstart](quickstart) to make sure your environment is set up properly.

## Add plugins

Add the following plugins to the `maint.ts` file.

8. Add the [Reddit API client](https://www.reddit.com/dev/api) to do things like send private messages, get user info, and interact with posts and comments.

```typescript
const reddit = new RedditAPIClient();
```

9. Add the `Scheduler` plugin to run your code at the requested time.

```typescript
const scheduler = Devvit.use(Devvit.Types.Scheduler);
```

## Add a menu action

10. To create a menu action with a user input field, use `Devvit.addActions` to create a **Remind me later** menu item and `ConfigFormBuilder` to get user input.

In this case, `ConfigFormBuilder` adds a `textField` that allows the user to enter a text description of when the user wants to set the reminder, which is parsed later by the `chrono-node` library.

```typescript
Devvit.addAction({
  name: 'Remind me later',
  description: 'Remind me about this in the future',
  context: Context.POST,
  userInput: new ConfigFormBuilder()
    // Add a text field
    // Other options:
    //  - textarea:     multiline text input
    //  - numberField:  limit input to a number
    //  - booleanField: present a toggle switch or checkbox for a true/false value
    //  (more to come!)
    .textField('when', 'When should I remind you?')
    .build(),

  // We will define the remindMeHandler function next
  handler: remindMeHandler,
});
```

## Define the action handler

When the 'Remind me later' action is invoked, it calls the `remindMeHandler` function. This function uses the `chrono-node` library to determine if the user provided valid input, and either extracts the value from 'when' or returns an error. Once the `remindMeHandler` function extracts a value, it uses `scheduler.Schedule` to deliver the message at some point in the future.

11. Define a unique string for the `scheduler.Schedule`. This is used to determine what function to call when the scheduler wakes up.

```typescript
const REMIND_ME_ACTION_ID = 'remindme';
```

12. Implement the `remindMeHandler` function.

```typescript
// action handlers take two arguments: "event" and "metadata"
async function remindMeHandler(event: PostContextActionEvent, metadata?: Metadata) {
  let success = true;
  let message: string;

  /**
   * First let's make sure the user filled out the form and gave us a valid answer
   */
  // find and extract the value from 'when':
  const whenStr = event.userInput?.fields.find((f) => f.key === 'when')?.response || '';
  if (!whenStr) {
    // if empty or null, don't do anything
    success = false;
    message = `I don't know when to remind you!`;
    return { success, message };
  }

  // for now all form data is returned as a serialized JSON object, so parse it first
  const parsedTime = chrono.parseDate(JSON.parse(whenStr));
  const now = new Date();

  if (parsedTime < now) {
    // another input check
    success = false;
    message = `I can't remind you in the past!`;
  } else {
    /**
     * Each method has an optional second parameter called `metadata` which contains
     * environment variables such as the logged in user's ID.
     * The Reddit API client can use this to get the current user like so:
     */
    const currentUser = await reddit.getCurrentUser(metadata);

    /**
     * Schedule an action to run at the specified date.
     * The `action` parameter is an object that expects a `type` which is an
     * arbitrary string you provide and behaves the same way as `actionId` so
     * you can determine what to do when the Scheduler runs your action.
     * The `data` parameter is an object you have complete control over to fill
     * with any data you'll need to run the scheduled action later.  In this case
     * we need to remember who the user was and what Post they interacted with to
     * send them a private message in the future.
     * (See `onHandleScheduledAction()` below for more info)
     */
    await scheduler.Schedule(
      {
        action: {
          type: REMIND_ME_ACTION_ID,
          data: {
            userId: currentUser.id,
            postId: `t3_${event.post.id}`,
            fromWhen: now,
          },
        },
        when: parsedTime,
        cron: undefined,
      },
      metadata
    );
    message = `Gotcha! I'll send you a message about this post at ${parsedTime}!`;
  }

  /**
   * Finally, return the status from calling OnAction to provide feedback to the user
   */
  return { success, message };
}
```

:::note

You might be a little scared by the `async`, `await` and `Promise` keywords--don't be! These core Javascript concepts just mean this function has to wait for an asynchronous response like the return value of an HTTP request. In this example, the `await` means "don't go to the next line until we get a response from `UserDataByAccountIds`". Check out [this overview](https://javascript.info/promise-basics) to learn more.

:::

## Schedule the message

Copy the code block below to add the following functionality:

13. Implement `Devvit.addSchedulerHandler` to schedule an action. This is called at the time specified in the `scheduler.Schedule` call above.
14. Use `privateMessages.Compose` to send a private message to a user at the specified time.

The `Compose` method takes an object containing information used to construct and send the user a private message:

- The `to` field requires a username. The metadata only provides a userID (aka thing ID), so here you'll call the function `getUserName`.
- The `text` field of the Compose object is used to define our reminder message. This supports the same markdown features as text posts on Reddit.

:::note

A few things to note:

- This function defines the handler function inline. You can also reference a function defined elsewhere by providing a "handler" parameter after type, just like you did in the `scheduler.Schedule` call above.
- You can provide different handlers for different `action.type` values by using multiple `Devvit.addSchedulerHandler` calls. Here, you just define a handler for `REMIND_ME_ACTION_ID`.
- The `event` parameter in the internal handler function comes from the ScheduledActionRequest that we created when you called `scheduler.Schedule` above.

:::

```typescript
Devvit.addSchedulerHandler({
  type: REMIND_ME_ACTION_ID,
  async handler(event, metadata) {
    const { userId, postId, fromWhen } = event.data!;

    const user = await reddit.getUserById(userId, metadata);
    const post = await reddit.getPostById(postId, metadata);

    /**
     * Send a private message to the user:
     */
    await reddit.sendPrivateMessage(
      {
        to: user.username,
        subject: 'RemindMe',
        text: `Beep boop! You asked me to remind you about [${post.title}](${post.permalink}) at ${fromWhen}!`,
      },
      metadata
    );
  },
});
```

:::note

Apps are executed as the moderator that installed this app into a subreddit, which means the reminder message will be sent from the moderator's account.

:::

## Complete the project

You’ll know your project is complete when you see the following (kinda cryptic) line at the end of your code.

```typescript
export default Devvit;
```

All of the code above this line modified the core Devvit object. This line simply makes the updated Devvit object (which now implements the Remind Me app) available to the Reddit Developer Platform. When this new instance of Devvit is installed on a subreddit, it will contain the Remind Me menu shortcut and the logic you just wrote to make it work.

### Upload your app

Your app is now ready to upload! Move into the top-level directory of your app and use `devvit upload` to upload it to the Reddit Developer Platform. Make sure to install this in a subreddit you moderate.

```bash
your-app-name      # <- you should be here
├── devvit.yaml
├── package.json
├── src
│   └── main.ts
├── tsconfig.json
├── yarn.lock

```

### Use your app

**Refresh your subreddit page.** When you want to use the Remind Me app, click on the overflow menu (look for the three dots) and select "Remind Me Later" menu item.

![Remind Me](./assets/remind_me_bot_menu_entry.png)

You'll be prompted to enter a time you want to receive the reminder. When this is done, a toast pops up at the bottom of the page to either confirm the message reminder or highlight any input errors.

![Successful reminder](./assets/remind_me_bot_success_toast.png)

If the input was invalid or left blank, you'll see the corresponding error toast.

| Invalid                                                        | Blank                                                              |
| -------------------------------------------------------------- | ------------------------------------------------------------------ |
| ![Failed - past](./assets/remind_me_bot_failed_toast_past.png) | ![Failed - blank](./assets/remind_me_bot_failed_toast_unknown.png) |

## Next steps

Congratulations on getting your Remind Me app running! Next up:

- Learn how to use our Key Value Store plugin in our [Three Strikes tutorial](three_strikes_guide.md).
- Add [logging](logging.md) to your bot to help you debug.
