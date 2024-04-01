# Log

## View logs

Any logs sent to `console` will be available via the `devvit logs` CLI on installed apps. For example, `console.log()`, `console.info()` and `console.error()` will produce logs with timestamps as expected.

The following example creates a basic app that simply creates a single log.

```typescript
import { Context, Devvit } from '@devvit/public-api';

Devvit.addAction({
  context: Context.POST,
  name: 'Create a log!',
  description: 'Creates a log',
  async handler(event, metadata) {
    console.log('Action called!');
    return {
      success: true,
      message: 'Log complete!',
    };
  },
});

export default Devvit;
```

## Stream logs

Once you have installed the app, open a terminal to your app directory on your local machine and run `devvit logs <subreddit name> [optional: app name]`. For example:

```bash

  devvit logs my-subreddit

```

You should now see logs streaming onto your console:

```bash
=============================== streaming logs for my-app on my-subrredit ================================
[DEBUG] Dec 8 15:55:50 Action called!
```

## Historical logs

You can view historical logs by using the `--since=XX` flag. You can use the following shorthand:

- `Xh`: show logs in the past X hours
- `Xd`: show logs in the past X days
- `Xw`: show logs in the past X weeks
- `Xm`: show logs in the past X months

The following example will show logs from `my-app` on `my-subreddit` in the past day.

```bash
devvit logs my-subreddit --since=1d
```

You will now see historical logs created by your app on this subreddit:

```bash

=============================== streaming logs for my-app on my-subrredit ================================
[DEBUG] Dec 8 15:55:23 Action called!
[DEBUG] Dec 8 15:55:50 Action called!
[DEBUG] Dec 8 15:57:29 Action called!
[DEBUG] Dec 8 15:57:32 Action called!

```
