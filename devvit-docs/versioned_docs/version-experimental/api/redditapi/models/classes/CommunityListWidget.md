[**@devvit/public-api v0.11.18-dev**](../../README.md)

---

# Class: CommunityListWidget

## Extends

- [`Widget`](Widget.md)

## Constructors

<a id="constructor"></a>

### new CommunityListWidget()

> **new CommunityListWidget**(`widgetData`, `subredditName`, `metadata`): `CommunityListWidget`

#### Parameters

##### widgetData

`GetWidgetsResponse_WidgetItem`

##### subredditName

`string`

##### metadata

`undefined` | `Metadata`

#### Returns

`CommunityListWidget`

#### Overrides

[`Widget`](Widget.md).[`constructor`](Widget.md#constructor)

## Accessors

<a id="communities"></a>

### communities

#### Get Signature

> **get** **communities**(): `CommunityListWidget_CommunityData`[]

##### Returns

`CommunityListWidget_CommunityData`[]

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

> **toJSON**(): `Pick`\<[`Widget`](Widget.md), `"subredditName"` \| `"id"` \| `"name"`\> & `Pick`\<`CommunityListWidget`, `"communities"` \| `"styles"`\>

#### Returns

`Pick`\<[`Widget`](Widget.md), `"subredditName"` \| `"id"` \| `"name"`\> & `Pick`\<`CommunityListWidget`, `"communities"` \| `"styles"`\>

#### Overrides

[`Widget`](Widget.md).[`toJSON`](Widget.md#tojson)
