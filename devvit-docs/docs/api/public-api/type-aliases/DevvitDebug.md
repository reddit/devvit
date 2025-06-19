[**@devvit/public-api v0.11.18-dev**](../README.md)

---

# Type Alias: DevvitDebug

> **DevvitDebug** = `object`

Home for debug flags, settings, and other information. Any type removals
may cause type errors but not runtime errors.

**Favor ContextDebugInfo since request-based state is preferred.**

## Properties

<a id="emitsnapshots"></a>

### emitSnapshots?

> `optional` **emitSnapshots**: `boolean`

Should debug block rendering in console.log according to the reified JSX/XML output. Example:

    <hstack><text>hi world</text></hstack>

---

<a id="emitstate"></a>

### emitState?

> `optional` **emitState**: `boolean`

Should console.log the state of the app after every event.
