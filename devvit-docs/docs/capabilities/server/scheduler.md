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

## Cancel a scheduled job

Use the job ID to cancel a scheduled action and remove it from your app. This example shows how to set up a moderator menu action to cancel a job.

### 1. Add menu item to `devvit.json`

```json title="devvit.json"
{
  "menu": {
    "items": [
      {
        "label": "Cancel Job",
        "description": "Cancel a scheduled job",
        "forUserType": "moderator",
        "location": "post",
        "endpoint": "/internal/menu/cancel-job"
      }
    ]
  },
  "permissions": {
    "redis": true
  }
}
```

### 2. Handle the menu action in your server

```ts title="server/index.ts"
import { redis } from '@devvit/redis';
import { scheduler } from '@devvit/web/server';

router.post('/internal/menu/cancel-job', async (req, res) => {
  try {
    // Get the post ID from the menu action request
    const postId = req.body.targetId;

    // Retrieve the job ID from Redis (stored when the job was created)
    const jobId = await redis.get(`job:${postId}`);

    if (!jobId) {
      return res.json({
        showToast: {
          text: 'No scheduled job found for this post',
          appearance: 'neutral',
        },
      });
    }

    // Cancel the scheduled job
    await scheduler.cancelJob(jobId);

    // Clean up the stored job ID
    await redis.del(`job:${postId}`);

    res.json({
      showToast: {
        text: 'Successfully cancelled the scheduled job',
        appearance: 'success',
      },
    });
  } catch (error) {
    console.error('Error cancelling job:', error);
    res.json({
      showToast: {
        text: 'Failed to cancel job',
        appearance: 'neutral',
      },
    });
  }
});
```

### Example: Storing a job ID when creating a job

When you create a scheduled job, store its ID in Redis so you can reference it later

```ts title="server/index.ts"
router.post('/api/schedule-action', async (req, res) => {
  const { postId, delayMinutes } = req.body;
  const runAt = new Date(Date.now() + delayMinutes * 60 * 1000);

  const scheduledJob: ScheduledJob = {
    id: `job-${postId}-${Date.now()}`,
    name: 'one-off-task-example',
    data: { postId },
    runAt,
  };

  const jobId = await scheduler.runJob(scheduledJob);

  // Store the job ID in Redis for later cancellation
  await redis.set(`job:${postId}`, jobId);

  res.json({
    jobId,
    message: 'Job scheduled successfully',
  });
});
```

## List jobs

This example shows how to handle a request within your server/index.ts to list your scheduled jobs and return them to the client.

```ts title="server/index.ts"
router.get("/api/list-jobs", async (_req, res): Promise<void> => {
  try {
    const jobs: (ScheduledJob | ScheduledCronJob)[] = await scheduler.listJobs();

    console.log(`[LIST] Found ${jobs.length} scheduled jobs`);

    res.json({
      status: "success",
      jobs: jobs,
      count: jobs.length
    });
  } catch (error) {
    console.error(`[LIST] Error listing jobs:`, error);
    res.status(500).json({
      status: "error",
      message: error instanceof Error ? error.message : "Failed to list jobs"
    });
  }
```

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

---

## Limitations

_Limits are per installation of an app:_

1. An installation can have up to **10 live recurring actions**.
2. The `runJob()` method enforces two rate limits when creating actions:
   - **Creation rate:** Up to 60 calls to `runJob()` per minute
   - **Delivery rate:** Up to 60 deliveries per minute
