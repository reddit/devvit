[**@devvit/public-api v0.11.18-dev**](../README.md)

---

# Type Alias: ScheduledCronJob

> **ScheduledCronJob** = `object`

## Properties

<a id="cron"></a>

### cron

> **cron**: `string`

The cron string of when this job should run

---

<a id="data"></a>

### data?

> `optional` **data**: [`JSONObject`](JSONObject.md)

Additional data passed in by the scheduler client

---

<a id="id"></a>

### id

> **id**: `string`

ID of the scheduled job. Use this with scheduler.cancelJob to cancel the job.

---

<a id="name"></a>

### name

> **name**: `string`

The name of the scheduled job type
