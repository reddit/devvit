[**@devvit/public-api v0.11.18-dev**](../README.md)

---

# Type Alias: Scheduler

> **Scheduler** = `object`

The Scheduler client lets you schedule new jobs or cancel existing jobs.
You must have the `scheduler` enabled in `Devvit.configure` to use this client.

## Properties

<a id="canceljob"></a>

### cancelJob

> **cancelJob**: [`CancelJob`](CancelJob.md)

Cancel a scheduled job

#### Param

The id of the job to cancel

---

<a id="listjobs"></a>

### listJobs()

> **listJobs**: () => `Promise`\<([`ScheduledJob`](ScheduledJob.md) \| [`ScheduledCronJob`](ScheduledCronJob.md))[]\>

Gets the list of all scheduled jobs.

#### Returns

`Promise`\<([`ScheduledJob`](ScheduledJob.md) \| [`ScheduledCronJob`](ScheduledCronJob.md))[]\>

---

<a id="runjob"></a>

### runJob()

> **runJob**: \<`Data`\>(`job`) => `Promise`\<`string`\>

Schedule a new job to run at a specific time or on a cron schedule

#### Type Parameters

##### Data

`Data` _extends_ [`JSONObject`](JSONObject.md) \| `undefined`

#### Parameters

##### job

The job to schedule

[`ScheduledJobOptions`](ScheduledJobOptions.md)\<`Data`\> | [`ScheduledCronJobOptions`](ScheduledCronJobOptions.md)\<`Data`\>

#### Returns

`Promise`\<`string`\>

The id of the scheduled job
