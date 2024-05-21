# Remind me tutorial

Use scheduler and the Reddit API client to set up a reminder message.

In this tutorial, you'll learn how to:

- create scheduled jobs using `Devvit.addScheduledJobType`
- create and show custom forms to prompt for user input
- fetch user info using the `reddit` api client

The **Remind Me Later** option is located in the overflow menu of a post (look for the three dots). When selected, the user is prompted to enter a future time for the reminder. The [chrono-node](https://www.npmjs.com/package/chrono-node) library interprets the input as a regular sentence (for example, "in two weeks") to generate a timestamp. At the specified time, the Remind Me app sends the user a private message containing a link to the original post.

| Post menu                                               | User input                                               |
| ------------------------------------------------------- | -------------------------------------------------------- |
| ![Post menu](../../assets/remind_me_bot_menu_entry.png) | ![User input](../../assets/remind_me_bot_input_form.png) |

## Start a project

<!-- :::info -->

<!-- The fully-functioning code in this tutorial is also available in the `remind-me` template. Simply type `devvit new --template remind-me <replace-with-your-app-name>` to start a project with the code below already written. -->

<!-- ::: -->

To create a Remind Me app starting from an empty template:

1. From the terminal, navigate to a directory where you'll store your project (e.g. `cd ~/my/project/directory`).
2. Enter the following command to create a project folder on your local machine.

```bash
devvit new <replace-with-your-app-name>
```

This creates a new directory in your current directory named `<your-app-name>`. You may change into
that directory to see the template folder structure of a devvit app.

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

## Install dependencies

This app uses `chrono-node` and `@devvit/public-api`, which you'll need to manually add as dependencies.

4. Install packages for this app using your favorite package manager.

```bash
npm i @devvit/public-api chrono-node &&\
npm install
```

**or**

```bash
yarn add @devvit/public-api chrono-node &&\
yarn
```

5. Make sure your project registered the update by checking the `package.json` file in your app's root directory.

```bash
your-app-name
├── devvit.yaml
├── package.json        # <- check this file
├── src
│   └── main.ts
├── tsconfig.json
├── yarn.lock

```

The `package.json` file should have a `dependencies` entry with `chrono-node` and `@devvit/public-api`.

```bash
{
  ...
  "dependencies": {
    "chrono-node": "some.version.number"            // <- chrono node has been registered in this project!
    "@devvit/public-api": "some.version.number" // <- @devvit/public-api has been registered in this project!
  }
  ...
}
```

:::note

Your `package.json` file will include other fields, and that's to be expected! Just make sure that
`@devvit/public-api` and `chrono-node` are present.

:::

:::note
If you are having trouble installing `chrono-node`, check out our [quickstart](../../quickstart.mdx) to make sure your environment is set up properly.
:::

## Add code

Copy and paste the following sequence of code snippets into `src/main.ts` file.

6. Add the following imports at the top.

```typescript
import { Devvit, FormOnSubmitEvent } from '@devvit/public-api';
import * as chrono from 'chrono-node';
```

7. Configure your app to use the necessary capabilities.

```typescript
Devvit.configure({
  redditAPI: true, // <-- this allows you to interact with Reddit's data api
});

const REMIND_ME_ACTION_NAME = 'remindme'; // <-- reusable action ID constant that will be useful later
```

8. Define the form that gets popped open when a user clicks on the menu item.

```typescript
const remindMeForm = Devvit.createForm(
  {
    fields: [{ name: 'when', label: 'When?', type: 'string' }],
    title: 'Remind me',
    acceptLabel: 'Schedule',
  },
  remindMeHandler // defined below
);

// this handler function defines the behavior when `remindMeForm` is submitted
async function remindMeHandler(event: FormOnSubmitEvent, context: Devvit.Context) {
  const whenStr = (event.values.when as string) || '';
  if (!whenStr) {
    context.ui.showToast("I don't know when to remind you!");
    return;
  }

  const parsedTime = chrono.parseDate(whenStr);
  const now = new Date();

  if (parsedTime < now) {
    context.ui.showToast("I can't remind you in the past!");
    return;
  }
  const currentUser = await context.reddit.getCurrentUser();

  await context.scheduler.runJob({
    name: REMIND_ME_ACTION_NAME,
    data: {
      userId: currentUser.id,
      postId: context.postId,
      fromWhen: now,
    },
    runAt: parsedTime,
  });

  context.ui.showToast(`Gotcha! I'll send you a message about this post at ${parsedTime}!`);
}
```

9. Add a menu item that pops open a form when clicked by a user.

```typescript
Devvit.addMenuItem({
  label: 'Remind me later',
  location: 'post',
  // here we tell the ui client to show `remindMeForm` defined above when the
  // menu item is pressed
  onPress: (_, context) => {
    context.ui.showForm(remindMeForm);
  },
});
```

10. Define and schedule a job to be run at a given time in the future.

```typescript
Devvit.addSchedulerJob({
  name: REMIND_ME_ACTION_NAME,
  onRun: async (event, context) => {
    const { userId, postId, fromWhen } = event.data!;

    const user = await context.reddit.getUserById(userId);
    const post = await context.reddit.getPostById(postId);

    await context.reddit.sendPrivateMessage({
      to: user.username,
      subject: 'RemindMe',
      text: `Beep boop! You asked me to remind you about [${post.title}](${post.permalink}) at ${fromWhen}!`,
    });
  },
});
```

:::note

You might be a little scared by the `async`, `await` and `Promise` keywords--don't be! These core Javascript concepts just mean this function has to wait for an asynchronous response like the return value of an HTTP request. In this example, the `await` means "don't go to the next line until we get a response from the Reddit API". Once the promise is resolved, the code can continue to execute. Check out [this overview](https://javascript.info/promise-basics) to learn more `async`/`await`.

:::

:::note

Apps are executed as the app account that gets created upon upload (we will see how this is done in
the next section). This means that the reminder messages defined in this app will be sent from the
app's auto-generated account.

:::

11. Make sure to export `Devvit` at the end of the file.

```typescript
export default Devvit;
```

## Complete the project

### Upload your app

Your app is now ready for uploading to [ Reddit Developer Portal ](https://developers.reddit.com).

Run this in your project directory:

```bash
devvit upload
```

This command will run a series of checks and prompts to make sure that your app is in a good state before its uploaded. Once the upload is completed, you'll see a link to your app's detail page on Developer Portal. Click on the link to open it in the browser.

### Install your app on a subreddit

Click on the `Install` button at the top right of the detail page, and select a subreddit(s) where you want to install the app.

![Install](../../assets/install.png)

### Use your app

**Refresh your subreddit page.** When you want to use the Remind Me app, click on the overflow menu (look for the three dots) and select "Remind Me Later" menu item.

![Remind Me](../../assets/remind_me_bot_menu_entry.png)

You'll be prompted to enter a time you want to receive the reminder. When this is done, a toast pops up at the bottom of the page to either confirm the message reminder or highlight any input errors.

![Successful reminder](../../assets/remind_me_bot_success_toast.png)

If the input was invalid or left blank, you'll see the corresponding error toast.

| Invalid                                                            | Blank                                                                  |
| ------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| ![Failed - past](../../assets/remind_me_bot_failed_toast_past.png) | ![Failed - blank](../../assets/remind_me_bot_failed_toast_unknown.png) |

## Next steps

Congratulations on getting your Remind Me app running! Next up:

- Learn how to use Redis in our [Three Strikes tutorial](./three_strikes.md).
- Add [logging](../../get-started/debug.md) to your app to help you debug.
