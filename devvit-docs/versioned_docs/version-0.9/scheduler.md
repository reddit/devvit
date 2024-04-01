# Scheduler

The scheduler can store and execute future actions to your app, like sending a private message at a specified time, tracking upvotes, or scheduling time-outs for user actions. You can:

- Schedule an action
- Schedule a recurring action
- Cancel an action

## Prerequisites

To use the scheduler, add the following plugins to the `main.ts` file of your app.

Add the [Reddit API client](https://www.reddit.com/dev/api):

```bash
const reddit = new RedditAPIClient();
```

Add the scheduler plugin:

```bash
const scheduler = Devvit.use(Devvit.Types.Scheduler);
```

## Limitations

Limits are per installation of an app.

An installation can have up to 10 live cron actions.

There are two rate limits enforced by the Schedule() method when actions are created:

- Creation rate: up to 60 calls to Schedule() per minute
- Delivery rate: up to 60 deliveries per minute

## Schedule an action

You can schedule an action to run once at a specific time, like sending a private message in the [Remind Me](https://developers.reddit.com/docs/remind_me_guide) tutorial.

```typescript
const REMIND_ME_ACTION_ID = 'remindme';

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

// within a capability (e.g. a menu action handler or trigger handler)
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
```

## Cancel an action

Use the action ID to cancel a scheduled action and remove it from your app. This sample code creates a menu action that allows you to cancel all scheduled actions for an installation.

```typescript
Devvit.addAction({
  name: 'clear',
  description: 'clear all scheduled actions in this installation',
  context: Context.POST,
  userContext: UserContext.MODERATOR,
  async handler(_: PostContextActionEvent, metadata?: Metadata) {
    try {
      console.log('clearing schedule');
      let n = 0;
      let jobs = await scheduler.List(
        {
          after: new Date(0),
          before: new Date(Date.now() + 10 * 365 * 86400 * 1000),
        },
        metadata
      );
      for (const job of await jobs.actions) {
        try {
          console.log('cancelling job:', job.id);
          await scheduler.Cancel({ id: job.id });
          console.log('cancelled');
          n += 1;
        } catch (e) {
          console.log('exc:', e);
        }
      }
      console.log('done cancelling jobs');
      return { success: true, message: `cancelled ${n} jobs`, effects: [] };
    } catch (e) {
      console.log('exception:', e);
      throw e;
    }
  },
});

export default Devvit;
```
