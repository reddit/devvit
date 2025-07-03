[**@devvit/public-api v0.11.18-dev**](../README.md)

---

# Type Alias: FormDefinition\<T\>

> **FormDefinition**\<`T`\> = `object`

## Type Parameters

### T

`T` _extends_ [`Form`](Form.md) \| [`FormFunction`](FormFunction.md) = [`Form`](Form.md) \| [`FormFunction`](FormFunction.md)

## Properties

<a id="form"></a>

### form

> **form**: `T`

A form or a function that returns a form

---

<a id="onsubmit"></a>

### onSubmit

> **onSubmit**: [`FormOnSubmitEventHandler`](FormOnSubmitEventHandler.md)\<[`FormToFormValues`](FormToFormValues.md)\<`T`\>\>

A callback that will be invoked when the form is submitted
