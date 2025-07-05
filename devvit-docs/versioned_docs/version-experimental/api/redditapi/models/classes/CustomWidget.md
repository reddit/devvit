[**@devvit/public-api v0.11.18-dev**](../../README.md)

---

# Class: CustomWidget

## Extends

- [`Widget`](Widget.md)

## Constructors

<a id="constructor"></a>

### new CustomWidget()

> **new CustomWidget**(`widgetData`, `subredditName`, `metadata`): `CustomWidget`

#### Parameters

##### widgetData

`GetWidgetsResponse_WidgetItem`

##### subredditName

`string`

##### metadata

`undefined` | `Metadata`

#### Returns

`CustomWidget`

#### Overrides

[`Widget`](Widget.md).[`constructor`](Widget.md#constructor)

## Accessors

<a id="css"></a>

### css

#### Get Signature

> **get** **css**(): `string`

##### Returns

`string`

---

<a id="height"></a>

### height

#### Get Signature

> **get** **height**(): `number`

##### Returns

`number`

---

<a id="id"></a>

### id

#### Get Signature

> **get** **id**(): `string`

##### Returns

`string`

#### Inherited from

[`Widget`](Widget.md).[`id`](Widget.md#id)

---

<a id="images"></a>

### images

#### Get Signature

> **get** **images**(): `WidgetImage`[]

##### Returns

`WidgetImage`[]

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

<a id="stylesheeturl"></a>

### stylesheetUrl

#### Get Signature

> **get** **stylesheetUrl**(): `string`

##### Returns

`string`

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

> **toJSON**(): `Pick`\<[`Widget`](Widget.md), `"subredditName"` \| `"id"` \| `"name"`\> & `Pick`\<`CustomWidget`, `"text"` \| `"height"` \| `"images"` \| `"stylesheetUrl"` \| `"css"`\>

#### Returns

`Pick`\<[`Widget`](Widget.md), `"subredditName"` \| `"id"` \| `"name"`\> & `Pick`\<`CustomWidget`, `"text"` \| `"height"` \| `"images"` \| `"stylesheetUrl"` \| `"css"`\>

#### Overrides

[`Widget`](Widget.md).[`toJSON`](Widget.md#tojson)
