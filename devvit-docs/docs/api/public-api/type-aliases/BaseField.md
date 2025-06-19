[**@devvit/public-api v0.11.18-dev**](../README.md)

---

# Type Alias: BaseField\<ValueType\>

> **BaseField**\<`ValueType`\> = `object`

## Type Parameters

### ValueType

`ValueType`

## Properties

<a id="defaultvalue"></a>

### defaultValue?

> `optional` **defaultValue**: `ValueType`

The default value of the field

---

<a id="disabled"></a>

### disabled?

> `optional` **disabled**: `boolean`

If true the field will be disabled

---

<a id="helptext"></a>

### helpText?

> `optional` **helpText**: `string`

An optional help text that will be displayed below the field

---

<a id="label"></a>

### label

> **label**: `string`

The label of the field. This will be displayed to the user

---

<a id="name"></a>

### name

> **name**: `string`

The name of the field. This will be used as the key in the `values` object
when the form is submitted.

---

<a id="required"></a>

### required?

> `optional` **required**: `boolean`

If true the field will be required and the user will not be able to submit
the form without filling it in.

---

<a id="scope"></a>

### scope?

> `optional` **scope**: [`SettingScopeType`](SettingScopeType.md)

This indicates whether the field (setting) is an app level or install level
setting. App setting values can be used by any installation.
