[**@devvit/public-api v0.11.18-dev**](../../README.md)

---

# Class: TextAreaWidget

## Extends

- [`Widget`](Widget.md)

## Constructors

<a id="constructor"></a>

### new TextAreaWidget()

> **new TextAreaWidget**(`widgetData`, `subredditName`, `metadata`): `TextAreaWidget`

#### Parameters

##### widgetData

`GetWidgetsResponse_WidgetItem`

##### subredditName

`string`

##### metadata

`undefined` | `Metadata`

#### Returns

`TextAreaWidget`

#### Overrides

[`Widget`](Widget.md).[`constructor`](Widget.md#constructor)

## Accessors

<a id="id"></a>

### id

#### Get Signature

> **get** **id**(): `string`

##### Returns

`string`

#### Inherited from

[`Widget`](Widget.md).[`id`](Widget.md#id)

---

<a id="name"></a>

### name

#### Get Signature

> **get** **name**(): `string`

##### Returns

`string`

#### Inherited from

[`Widget`](Widget.md).[`name`](Widget.md#name)

---

<a id="styles"></a>

### styles

#### Get Signature

> **get** **styles**(): `WidgetStyles`

##### Returns

`WidgetStyles`

---

<a id="subredditname"></a>

### subredditName

#### Get Signature

> **get** **subredditName**(): `string`

##### Returns

`string`

#### Inherited from

[`Widget`](Widget.md).[`subredditName`](Widget.md#subredditname)

---

<a id="text"></a>

### text

#### Get Signature

> **get** **text**(): `string`

##### Returns

`string`

## Methods

<a id="delete"></a>

### delete()

> **delete**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`Widget`](Widget.md).[`delete`](Widget.md#delete)

---

<a id="tojson"></a>

### toJSON()

> **toJSON**(): `Pick`\<[`Widget`](Widget.md), `"subredditName"` \| `"id"` \| `"name"`\> & `Pick`\<`TextAreaWidget`, `"text"` \| `"styles"`\>

#### Returns

`Pick`\<[`Widget`](Widget.md), `"subredditName"` \| `"id"` \| `"name"`\> & `Pick`\<`TextAreaWidget`, `"text"` \| `"styles"`\>

#### Overrides

[`Widget`](Widget.md).[`toJSON`](Widget.md#tojson)
