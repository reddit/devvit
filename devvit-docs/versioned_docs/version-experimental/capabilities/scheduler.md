# Scheduler

Store and execute future actions.

Use the scheduler to do things like send a private message at a specified time, track upvotes, or schedule time-outs for user actions.

## Create a job

Create a job definition using `Devvit.addSchedulerJob` method.

```ts
Devvit.addSchedulerJob({
  name: 'thing-todo', // you can use an arbitrary name here
  onRun: async (event, context) => {
    // do stuff when the job is executed
  },
});
```

## Schedule the job

Use the `context.scheduler.runJob()` method to schedule the job you created. You can schedule the job to run once at at a particular time in the future or schedule it to be called repeatedly at a specific time.

- To schedule the job to run once, use the `runAt` parameter:

```ts
Devvit.addMenuItem({
  label: 'Remind me about this post',
  location: 'post',
  onPress: async (event, context) => {
    const jobId = await context.scheduler.runJob({
      name: 'thing-todo', // the name of the job that we specified in addSchedulerJob() above
      runAt: new Date('2099-01-01'),
    });
  },
});
```

Optionally, you can save the `jobId` in [Redis storage](./redis.md) to be able to [cancel the scheduled action](#cancel-an-action) in the future.

```ts
await context.redis.set('thing-todo:jobId', jobId);
```

- To schedule a recurring action, use a `cron` parameter:

:::note
`scheduler.runJob()` uses the same format that is used in UNIX `cron`, a command-line utility is a job scheduler on Unix-like operating systems https://en.wikipedia.org/wiki/Cron

```
# * * * * *
# | | | | |
# | | | | day of the week (0–6) Sunday to Saturday; 7 is also Sunday on some systems
# | | | month (1–12)
# | | day of the month (1–31)
# | hour (0–23)
# minute (0–59)
```

:::

```ts
Devvit.addMenuItem({
  label: 'Run every day',
  location: 'post',
  onPress: async (event, context) => {
    const jobId = await context.scheduler.runJob({
      name: 'thing-todo',
      cron: '0 12 * * *',
    });
  },
});
```

:::note
We recommend using [Cronitor](https://crontab.guru/) to build out strings.
:::

## Cancel an action

Use the job ID to cancel a scheduled action and remove it from your app.

```ts
Devvit.addMenuItem({
  label: 'clear',
  location: 'post',
  forUserType: 'moderator',
  onPress: async (_, context) => {
    const jobId = (await context.redis.get('jobId')) || '0';
    await context.scheduler.cancelJob(jobId);
  },
});

export default Devvit;
```

## Examples

### Schedule a one-off action

You can schedule an action to run once at a specific time, like sending a private message in the [Remind Me](/docs/showcase/tutorials/remind_me.md) tutorial.

```ts
import { Devvit } from '@devvit/public-api';

const REMIND_ME_ACTION_NAME = 'remindme';

Devvit.addSchedulerJob({
  name: REMIND_ME_ACTION_NAME,
  onRun: async (event, context) => {
    const { userId, postId, fromWhen } = event.data!;

    const user = await context.reddit.getUserById(userId);
    const post = await context.reddit.getPostById(postId);

    // Send a private message to the user
    await context.reddit.sendPrivateMessage({
      to: user.username,
      subject: 'RemindMe',
      text: `Beep boop! You asked me to remind you about [${post.title}](${post.permalink}) at ${fromWhen}!`,
    });
  },
});

Devvit.addMenuItem({
  label: 'Remind me about this post',
  location: 'post',
  onPress: async (event, context) => {
    // Code below could also be run from another capability, like an event trigger or another scheduled job
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    await context.scheduler.runJob({
      name: REMIND_ME_ACTION_NAME,
      data: {
        userId: context.userId!,
        postId: `t3_${context.postId}`,
      },
      runAt: tomorrow,
    });
  },
});

export default Devvit;
```

### Schedule a recurring action

You can schedule an action that repeats at a specific time. This sample code creates a recurring action to post a new daily thread every day at 12:00 UTC. In this example, the recurring action is initiated when the app is installed, but you can also schedule a recurring action from a menu action instead.

```ts
import { Devvit } from '@devvit/public-api';

Devvit.addSchedulerJob({
  name: 'daily_thread',
  onRun: async (_, context) => {
    console.log('daily_thread handler called');
    const subreddit = await context.reddit.getCurrentSubreddit();
    const resp = await context.reddit.submitPost({
      subredditName: subreddit.name,
      title: 'Daily Thread',
      text: 'This is a daily thread, comment here!',
    });
    console.log('posted resp', JSON.stringify(resp));
  },
});

Devvit.addTrigger({
  event: 'AppInstall',
  onEvent: async (_, context) => {
    try {
      const jobId = await context.scheduler.runJob({
        cron: '0 12 * * *',
        name: 'daily_thread',
        data: {},
      });
      await context.redis.set('jobId', jobId);
    } catch (e) {
      console.log('error was not able to schedule:', e);
      throw e;
    }
  },
});

export default Devvit;
```

:::note
We recommend using [Cronitor](https://crontab.guru/) to build out strings.
:::

## Faster scheduler

:::note
This feature is experimental, which means the design is not final but it's still available for you to use.
:::

Scheduled jobs currently perform one scheduled run per minute. To go faster, you can now run jobs every second by adding seconds granularity to your cron expression.

```tsx
await scheduler.runJob({
  name: 'run_every_30_seconds',
  cron: '*/30 * * * * *',
});
```

How frequent a scheduled job runs will depend on how long the job takes to complete and how many jobs are running in parallel. This means a job may take a bit longer than scheduled, but the overall resolution should be better than a minute.

## Limitations

_Limits are per installation of an app_

1. An installation can have up to 10 live recurring actions.

2. There are two rate limits enforced by the `runJob()` method when actions are created:
   - Creation rate: up to 60 calls to `runJob()` per minute
   - Delivery rate: up to 60 deliveries per minute
