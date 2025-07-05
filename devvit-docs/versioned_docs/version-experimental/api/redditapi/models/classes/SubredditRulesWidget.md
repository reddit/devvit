[**@devvit/public-api v0.11.18-dev**](../../README.md)

---

# Class: SubredditRulesWidget

## Extends

- [`Widget`](Widget.md)

## Constructors

<a id="constructor"></a>

### new SubredditRulesWidget()

> **new SubredditRulesWidget**(`subredditAboutRulesRsp`, `widgetData`, `subredditName`, `metadata`): `SubredditRulesWidget`

#### Parameters

##### subredditAboutRulesRsp

`SubredditAboutRulesResponse`

##### widgetData

`GetWidgetsResponse_WidgetItem`

##### subredditName

`string`

##### metadata

`undefined` | `Metadata`

#### Returns

`SubredditRulesWidget`

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

<a id="rules"></a>

### rules

#### Get Signature

> **get** **rules**(): `SubredditRule`[]

##### Returns

`SubredditRule`[]

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

> **toJSON**(): `Pick`\<[`Widget`](Widget.md), `"subredditName"` \| `"id"` \| `"name"`\> & `Pick`\<`SubredditRulesWidget`, `"rules"`\>

#### Returns

`Pick`\<[`Widget`](Widget.md), `"subredditName"` \| `"id"` \| `"name"`\> & `Pick`\<`SubredditRulesWidget`, `"rules"`\>

#### Overrides

[`Widget`](Widget.md).[`toJSON`](Widget.md#tojson)
