[**@devvit/public-api v0.11.18-dev**](../README.md)

---

# Type Alias: SettingsClient

> **SettingsClient** = `object`

The Settings API Client lets you retrieve the settings values for your app set by the installer.
Use this in conjunction with `Devvit.addSettings`.

## Methods

<a id="get"></a>

### get()

> **get**\<`T`\>(`name`): `Promise`\<`undefined` \| `T`\>

Get a single setting value by name.

#### Type Parameters

##### T

`T` = `string` \| `number` \| `boolean` \| `string`[]

#### Parameters

##### name

`string`

The name of the setting to retrieve.

#### Returns

`Promise`\<`undefined` \| `T`\>

A promise that resolves to the setting value, or undefined if the setting doesn't exist.

---

<a id="getall"></a>

### getAll()

> **getAll**\<`T`\>(): `Promise`\<`T`\>

Get all settings values.

#### Type Parameters

##### T

`T` _extends_ `object` = [`SettingsValues`](SettingsValues.md)

#### Returns

`Promise`\<`T`\>

A promise that resolves to an object containing all settings values.
