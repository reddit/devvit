# Scheduler

Store and execute future actions.

Use the scheduler to do things like send a private message at a specified time, track upvotes, or schedule time-outs for user actions. You can:

- Schedule an action
- Schedule a recurring action
- Cancel an action

## Limitations

Limits are per installation of an app.

An installation can have up to 10 live cron actions.

There are two rate limits enforced by the Schedule() method when actions are created:

- Creation rate: up to 60 calls to Schedule() per minute
- Delivery rate: up to 60 deliveries per minute

## Schedule an action

You can schedule an action to run once at a specific time, like sending a private message in the [Remind Me](https://developers.reddit.com/docs/remind_me_tutorial) tutorial.

```typescript
const REMIND_ME_ACTION_NAME = 'remindme';

Devvit.addSchedulerJob({
  name: REMIND_ME_ACTION_NAME,
  onRun: async (event, context) => {
    const { userId, postId, fromWhen } = event.data!;

    const user = await context.reddit.getUserById(userId);
    const post = await context.reddit.getPostById(postId);

    /**
     * Send a private message to the user:
     */
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
        userId: context.userId,
        postId: `t3_${context.postId}`,
      },
      runAt: tomorrow,
    });
  },
});
```

## Schedule a recurring action

You can schedule an action that repeats at a specific time. This sample code creates a recurring action to post a new daily thread every day at 12:00 UTC. In this example, the recurring action is initiated when the app is installed, but you can also schedule a recurring action from a menu action instead.

```typescript
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

## Cancel an action

Use the job ID to cancel a scheduled action and remove it from your app.

```typescript
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
