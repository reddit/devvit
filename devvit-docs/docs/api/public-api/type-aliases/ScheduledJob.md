[**@devvit/public-api v0.11.18-dev**](../README.md)

---

# Type Alias: ScheduledJob

> **ScheduledJob** = `object`

## Properties

<a id="data"></a>

### data

> **data**: [`JSONObject`](JSONObject.md) \| `undefined`

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

---

<a id="runat"></a>

### runAt

> **runAt**: `Date`

The Date of when this job should run
