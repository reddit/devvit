[**@devvit/public-api v0.11.18-dev**](../README.md)

---

# Type Alias: ScheduledCronJobOptions\<T\>

> **ScheduledCronJobOptions**\<`T`\> = `object`

## Type Parameters

### T

`T` _extends_ [`JSONObject`](JSONObject.md) \| `undefined` = [`JSONObject`](JSONObject.md) \| `undefined`

## Properties

<a id="cron"></a>

### cron

> **cron**: `string`

The cron string of when this job should run

---

<a id="data"></a>

### data?

> `optional` **data**: `T`

Additional data passed in by the scheduler client

---

<a id="name"></a>

### name

> **name**: `string`

The name of the scheduled job type
