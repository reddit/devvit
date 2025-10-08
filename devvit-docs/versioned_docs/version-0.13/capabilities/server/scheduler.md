# Scheduler

The scheduler allows your app to perform actions at specific times, such as sending private messages, tracking upvotes, or scheduling timeouts for user actions. You can schedule both recurring and one-off jobs using the scheduler.

---

## Scheduling recurring jobs

To create a regularly occurring event in your app, declare a task in your `devvit.json` and handle the event in your server logic.

### 1. Add a recurring task to `devvit.json`

Ensure the endpoint follows the format `/internal/.+` and specify a `cron` schedule:

```json title="devvit.json"
"scheduler": {
  "tasks": {
    "regular-interval-example-task": {
      "endpoint": "/internal/scheduler/regular-interval-task-example",
      "cron": "*/1 * * * *"
    }
  }
},
```

- The `cron` parameter uses the standard [UNIX cron format](https://en.wikipedia.org/wiki/Cron):
  ```
  # * * * * *
  # | | | | |
  # | | | | day of the week (0–6, Sunday to Saturday; 7 is also Sunday on some systems)
  # | | | month (1–12)
  # | | day of the month (1–31)
  # | hour (0–23)
  # minute (0–59)
  ```
- We recommend using [Cronitor](https://crontab.guru/) to build cron strings.

### 2. Handle the event in your server

```ts title=/server/index.ts
router.post('/internal/scheduler/regular-interval-task-example', async (req, res) => {
  console.log(`Handle event for cron example at ${new Date().toISOString()}!`);
  // Handle the event here
  res.status(200).json({ status: 'ok' });
});
```

---

## Scheduling one-off jobs at runtime

One-off tasks must also be declared in `devvit.json`.

### 1. Add the tasks to `devvit.json`

```json title='devvit.json'
"scheduler": {
  "tasks": {
    "regular-interval-task-example": {
      "endpoint": "/internal/scheduler/regular-interval-task-example",
      "cron": "*/1 * * * *"
    },
    "one-off-task-example": {
      "endpoint": "/internal/scheduler/one-off-task-example"
    }
  }
}
```

### 2. Schedule a job at runtime

Example usage:

```ts
import { scheduler } from '@devvit/web/server';

// Handle the occurrence of the event
router.post('/internal/scheduler/one-off-task-example', async (req, res) => {
  const oneMinuteFromNow = new Date(Date.now() + 1000 * 60);

  let scheduledJob: ScheduledJob = {
    id: `job-one-off-for-post${postId}`,
    name: 'one-off-task-example',
    data: { postId },
    runAt: oneMinuteFromNow,
  };

  let jobId = await scheduler.runJob(scheduledJob);
  console.log(`Scheduled job ${jobId} for post ${postId}`);
  console.log(`Handle event for one-off event at ${new Date().toISOString()}!`);
  // Handle the event here
  res.status(200).json({ status: 'ok' });
});
```

---

## Limitations

_Limits are per installation of an app:_

1. An installation can have up to **10 live recurring actions**.
2. The `runJob()` method enforces two rate limits when creating actions:
   - **Creation rate:** Up to 60 calls to `runJob()` per minute
   - **Delivery rate:** Up to 60 deliveries per minute
