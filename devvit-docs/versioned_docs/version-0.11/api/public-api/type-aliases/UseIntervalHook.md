[**@devvit/public-api v0.11.18-dev**](../README.md)

---

# Type Alias: UseIntervalHook()

> **UseIntervalHook** = (`callback`, `delay`) => [`UseIntervalResult`](UseIntervalResult.md)

A hook that can used to run a callback on an interval between Block renders. Only one useInterval hook may be running at a time.

## Parameters

### callback

() => `void` \| `Promise`\<`void`\>

### delay

`number`

## Returns

[`UseIntervalResult`](UseIntervalResult.md)
