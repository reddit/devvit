[**@devvit/public-api v0.11.18-dev**](../README.md)

---

# Type Alias: ScheduledJobHandler()\<Data\>

> **ScheduledJobHandler**\<`Data`\> = (`event`, `context`) => `void` \| `Promise`\<`void`\>

## Type Parameters

### Data

`Data` _extends_ [`JSONObject`](JSONObject.md) \| `undefined` = [`JSONObject`](JSONObject.md) \| `undefined`

## Parameters

### event

[`ScheduledJobEvent`](ScheduledJobEvent.md)\<`Data`\>

### context

[`JobContext`](JobContext.md)

## Returns

`void` \| `Promise`\<`void`\>
