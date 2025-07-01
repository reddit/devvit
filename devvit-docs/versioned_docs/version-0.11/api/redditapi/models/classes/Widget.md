[**@devvit/public-api v0.11.18-dev**](../../README.md)

---

# Class: Widget

## Extended by

- [`ImageWidget`](ImageWidget.md)
- [`CalendarWidget`](CalendarWidget.md)
- [`TextAreaWidget`](TextAreaWidget.md)
- [`ButtonWidget`](ButtonWidget.md)
- [`CommunityListWidget`](CommunityListWidget.md)
- [`PostFlairWidget`](PostFlairWidget.md)
- [`CustomWidget`](CustomWidget.md)
- [`SubredditRulesWidget`](SubredditRulesWidget.md)

## Constructors

<a id="constructor"></a>

### new Widget()

> **new Widget**(`widgetData`, `subredditName`, `metadata`): `Widget`

#### Parameters

##### widgetData

`GetWidgetsResponse_WidgetItem`

##### subredditName

`string`

##### metadata

`undefined` | `Metadata`

#### Returns

`Widget`

## Accessors

<a id="id"></a>

### id

#### Get Signature

> **get** **id**(): `string`

##### Returns

`string`

---

<a id="name"></a>

### name

#### Get Signature

> **get** **name**(): `string`

##### Returns

`string`

---

<a id="subredditname"></a>

### subredditName

#### Get Signature

> **get** **subredditName**(): `string`

##### Returns

`string`

## Methods

<a id="delete"></a>

### delete()

> **delete**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

---

<a id="tojson"></a>

### toJSON()

> **toJSON**(): `Pick`\<`Widget`, `"subredditName"` \| `"id"` \| `"name"`\>

#### Returns

`Pick`\<`Widget`, `"subredditName"` \| `"id"` \| `"name"`\>
