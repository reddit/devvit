# Logging

Stream log events from your installed app to your command line to troubleshoot your app. You can see 5,000 logs or up to 7 days of log events.

## Create logs

Any logs sent to `console` will be available via `devvit logs` for installed apps. For example, `console.log()`, `console.info()` and `console.error()` will produce logs with timestamps as expected.

The following example creates a basic app that simply creates a single log.

```typescript title="main.tsx"
import { Context, Devvit } from '@devvit/public-api';

Devvit.addMenuItem({
  location: 'post',
  label: 'Create a log!',
  onPress: (event, context) => {
    console.log('Action called!');
    context.ui.showToast(`Successfully logged!`);
  },
});

export default Devvit;
```

## Stream logs

To stream logs for an installed app, open a terminal and navigate to your project directory and run:

```bash
$ devvit logs <my-subreddit>
```

You can also specify the app name to stream logs for from another folder.

```bash
$ devvit logs <my-subreddit> <app-name>
```

You should now see logs streaming onto your console:

```bash
=============================== streaming logs for my-app on my-subreddit ================================
[DEBUG] Dec 8 15:55:23 Action called!
[DEBUG] Dec 8 15:55:50 Action called!
[DEBUG] Dec 8 15:57:29 Action called!
[DEBUG] Dec 8 15:57:32 Action called!
```

To exit the streaming logger, enter `CTRL + c`.

Currently, `console.log` calls will only stream when they are run from the server (not the client).

:::note

Custom post apps use a client-side runtime to speed up execution, so `console.log` calls won't always show up in Devvit logs or Devvit playtest commands. However, these calls will show up in other dev tools (like Chrome) when viewing the app during a playtest.

:::

## Historical logs

You can view historical logs by using the `--since=XX` flag. You can use the following shorthand:

- `Xs`: show logs in the past X seconds
- `Xm`: show logs in the past X minutes
- `Xh`: show logs in the past X hours
- `Xd`: show logs in the past X days
- `Xw`: show logs in the past X weeks

The following example will show logs from `my-app` on `my-subreddit` in the past day.

```bash
$ devvit logs <my-subreddit> --since=1d
```

You will now see historical logs created by your app on this subreddit:

```bash
=============================== streaming logs for my-app on my-subreddit ================================
[DEBUG] Dec 8 15:55:23 Action called!
[DEBUG] Dec 8 15:55:50 Action called!
[DEBUG] Dec 8 15:57:29 Action called!
[DEBUG] Dec 8 15:57:32 Action called!
```

To exit the streaming logger, enter `CTRL + c`.

## Playtest

While you are running [`playtest`](./playtest.md) in a subreddit, you will also be [streaming logs](#create-logs) from that community in your command line.
