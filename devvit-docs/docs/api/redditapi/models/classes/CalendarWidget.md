[**@devvit/public-api v0.11.18-dev**](../../README.md)

---

# Class: CalendarWidget

## Extends

- [`Widget`](Widget.md)

## Constructors

<a id="constructor"></a>

### new CalendarWidget()

> **new CalendarWidget**(`widgetData`, `subredditName`, `metadata`): `CalendarWidget`

#### Parameters

##### widgetData

`GetWidgetsResponse_WidgetItem`

##### subredditName

`string`

##### metadata

`undefined` | `Metadata`

#### Returns

`CalendarWidget`

#### Overrides

[`Widget`](Widget.md).[`constructor`](Widget.md#constructor)

## Accessors

<a id="configuration"></a>

### configuration

#### Get Signature

> **get** **configuration**(): `CalendarWidgetConfiguration`

##### Returns

`CalendarWidgetConfiguration`

---

<a id="googlecalendarid"></a>

### googleCalendarId

#### Get Signature

> **get** **googleCalendarId**(): `string`

##### Returns

`string`

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

> **toJSON**(): `Pick`\<[`Widget`](Widget.md), `"subredditName"` \| `"id"` \| `"name"`\> & `Pick`\<`CalendarWidget`, `"googleCalendarId"` \| `"configuration"` \| `"styles"`\>

#### Returns

`Pick`\<[`Widget`](Widget.md), `"subredditName"` \| `"id"` \| `"name"`\> & `Pick`\<`CalendarWidget`, `"googleCalendarId"` \| `"configuration"` \| `"styles"`\>

#### Overrides

[`Widget`](Widget.md).[`toJSON`](Widget.md#tojson)
