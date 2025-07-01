[**@devvit/public-api v0.11.18-dev**](../README.md)

---

# Type Alias: ScheduledJobType\<Data\>

> **ScheduledJobType**\<`Data`\> = `object`

## Type Parameters

### Data

`Data` _extends_ [`JSONObject`](JSONObject.md) \| `undefined`

## Properties

<a id="name"></a>

### name

> **name**: `string`

The name of the scheduled job type

---

<a id="onrun"></a>

### onRun

> **onRun**: [`ScheduledJobHandler`](ScheduledJobHandler.md)\<`Data`\>

The function that will be called when the job is scheduled to run
