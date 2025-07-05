[**@devvit/public-api v0.11.18-dev**](../README.md)

---

# Type Alias: ScheduledJobOptions\<T\>

> **ScheduledJobOptions**\<`T`\> = `object`

## Type Parameters

### T

`T` _extends_ [`JSONObject`](JSONObject.md) \| `undefined` = [`JSONObject`](JSONObject.md) \| `undefined`

## Properties

<a id="data"></a>

### data?

> `optional` **data**: `T`

Additional data passed in by the scheduler client

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
