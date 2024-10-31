# Class: SubredditRulesWidget

[models](../modules/models.md).SubredditRulesWidget

## Hierarchy

- [`Widget`](models.Widget.md)

  ↳ **`SubredditRulesWidget`**

## Table of contents

### Constructors

- [constructor](models.SubredditRulesWidget.md#constructor)

### Accessors

- [id](models.SubredditRulesWidget.md#id)
- [name](models.SubredditRulesWidget.md#name)
- [rules](models.SubredditRulesWidget.md#rules)
- [subredditName](models.SubredditRulesWidget.md#subredditname)

### Methods

- [delete](models.SubredditRulesWidget.md#delete)
- [toJSON](models.SubredditRulesWidget.md#tojson)

## Constructors

### <a id="constructor" name="constructor"></a> constructor

• **new SubredditRulesWidget**(`subredditAboutRulesRsp`, `widgetData`, `subredditName`, `metadata`): [`SubredditRulesWidget`](models.SubredditRulesWidget.md)

#### Parameters

| Name                     | Type                            |
| :----------------------- | :------------------------------ |
| `subredditAboutRulesRsp` | `SubredditAboutRulesResponse`   |
| `widgetData`             | `GetWidgetsResponse_WidgetItem` |
| `subredditName`          | `string`                        |
| `metadata`               | `undefined` \| `Metadata`       |

#### Returns

[`SubredditRulesWidget`](models.SubredditRulesWidget.md)

#### Overrides

[Widget](models.Widget.md).[constructor](models.Widget.md#constructor)

## Accessors

### <a id="id" name="id"></a> id

• `get` **id**(): `string`

#### Returns

`string`

#### Inherited from

Widget.id

---

### <a id="name" name="name"></a> name

• `get` **name**(): `string`

#### Returns

`string`

#### Inherited from

Widget.name

---

### <a id="rules" name="rules"></a> rules

• `get` **rules**(): `SubredditRule`[]

#### Returns

`SubredditRule`[]

---

### <a id="subredditname" name="subredditname"></a> subredditName

• `get` **subredditName**(): `string`

#### Returns

`string`

#### Inherited from

Widget.subredditName

## Methods

### <a id="delete" name="delete"></a> delete

▸ **delete**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Inherited from

[Widget](models.Widget.md).[delete](models.Widget.md#delete)

---

### <a id="tojson" name="tojson"></a> toJSON

▸ **toJSON**(): `Pick`\<[`Widget`](models.Widget.md), `"subredditName"` \| `"id"` \| `"name"`\> & `Pick`\<[`SubredditRulesWidget`](models.SubredditRulesWidget.md), `"rules"`\>

#### Returns

`Pick`\<[`Widget`](models.Widget.md), `"subredditName"` \| `"id"` \| `"name"`\> & `Pick`\<[`SubredditRulesWidget`](models.SubredditRulesWidget.md), `"rules"`\>

#### Overrides

[Widget](models.Widget.md).[toJSON](models.Widget.md#tojson)
