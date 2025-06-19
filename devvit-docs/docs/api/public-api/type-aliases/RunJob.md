[**@devvit/public-api v0.11.18-dev**](../README.md)

---

# Type Alias: RunJob()\<Data\>

> **RunJob**\<`Data`\> = (`job`) => `Promise`\<`string`\>

Schedule a new job to run at a specific time or on a cron schedule

## Type Parameters

### Data

`Data` _extends_ [`JSONObject`](JSONObject.md) \| `undefined`

## Parameters

### job

The job to schedule

[`ScheduledJobOptions`](ScheduledJobOptions.md)\<`Data`\> | [`ScheduledCronJobOptions`](ScheduledCronJobOptions.md)\<`Data`\>

## Returns

`Promise`\<`string`\>

The id of the scheduled job
