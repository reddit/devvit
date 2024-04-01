# Class: ConfigFormBuilder

Helper class that provides a Builder-style interface for generating a UserConfigurable ConfigForm

## Table of contents

### Constructors

- [constructor](ConfigFormBuilder.md#constructor)

### Methods

- [booleanField](ConfigFormBuilder.md#booleanfield)
- [build](ConfigFormBuilder.md#build)
- [numberField](ConfigFormBuilder.md#numberfield)
- [textField](ConfigFormBuilder.md#textfield)
- [textarea](ConfigFormBuilder.md#textarea)

## Constructors

### constructor

• **new ConfigFormBuilder**()

## Methods

### booleanField

▸ **booleanField**(`key`, `label`, `currentValue?`): [`ConfigFormBuilder`](ConfigFormBuilder.md)

Add a BOOLEAN parameter to the configuration

#### Parameters

| Name           | Type      | Default value |
| :------------- | :-------- | :------------ |
| `key`          | `string`  | `undefined`   |
| `label`        | `string`  | `undefined`   |
| `currentValue` | `boolean` | `false`       |

#### Returns

[`ConfigFormBuilder`](ConfigFormBuilder.md)

---

### build

▸ **build**(): `ConfigForm`

Returns the constructed ConfigForm

#### Returns

`ConfigForm`

---

### numberField

▸ **numberField**(`key`, `label`, `currentValue?`): [`ConfigFormBuilder`](ConfigFormBuilder.md)

Add a NUMBER parameter to the configuration

#### Parameters

| Name           | Type     | Default value |
| :------------- | :------- | :------------ |
| `key`          | `string` | `undefined`   |
| `label`        | `string` | `undefined`   |
| `currentValue` | `number` | `0`           |

#### Returns

[`ConfigFormBuilder`](ConfigFormBuilder.md)

---

### textField

▸ **textField**(`key`, `label`, `currentValue?`): [`ConfigFormBuilder`](ConfigFormBuilder.md)

Add a STRING parameter to the configuration (single-line string)

#### Parameters

| Name           | Type     | Default value |
| :------------- | :------- | :------------ |
| `key`          | `string` | `undefined`   |
| `label`        | `string` | `undefined`   |
| `currentValue` | `string` | `''`          |

#### Returns

[`ConfigFormBuilder`](ConfigFormBuilder.md)

---

### textarea

▸ **textarea**(`key`, `label`, `currentValue?`): [`ConfigFormBuilder`](ConfigFormBuilder.md)

Add a PARAGRAPH parameter to the configuration (multi-line string)

#### Parameters

| Name           | Type     | Default value |
| :------------- | :------- | :------------ |
| `key`          | `string` | `undefined`   |
| `label`        | `string` | `undefined`   |
| `currentValue` | `string` | `''`          |

#### Returns

[`ConfigFormBuilder`](ConfigFormBuilder.md)
