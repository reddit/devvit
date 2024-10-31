# Class: Widget

[models](../modules/models.md).Widget

## Hierarchy

- **`Widget`**

  ↳ [`ImageWidget`](models.ImageWidget.md)

  ↳ [`CalendarWidget`](models.CalendarWidget.md)

  ↳ [`TextAreaWidget`](models.TextAreaWidget.md)

  ↳ [`ButtonWidget`](models.ButtonWidget.md)

  ↳ [`CommunityListWidget`](models.CommunityListWidget.md)

  ↳ [`PostFlairWidget`](models.PostFlairWidget.md)

  ↳ [`CustomWidget`](models.CustomWidget.md)

  ↳ [`SubredditRulesWidget`](models.SubredditRulesWidget.md)

## Table of contents

### Constructors

- [constructor](models.Widget.md#constructor)

### Accessors

- [id](models.Widget.md#id)
- [name](models.Widget.md#name)
- [subredditName](models.Widget.md#subredditname)

### Methods

- [delete](models.Widget.md#delete)
- [toJSON](models.Widget.md#tojson)

## Constructors

### <a id="constructor" name="constructor"></a> constructor

• **new Widget**(`widgetData`, `subredditName`, `metadata`): [`Widget`](models.Widget.md)

#### Parameters

| Name            | Type                            |
| :-------------- | :------------------------------ |
| `widgetData`    | `GetWidgetsResponse_WidgetItem` |
| `subredditName` | `string`                        |
| `metadata`      | `undefined` \| `Metadata`       |

#### Returns

[`Widget`](models.Widget.md)

## Accessors

### <a id="id" name="id"></a> id

• `get` **id**(): `string`

#### Returns

`string`

---

### <a id="name" name="name"></a> name

• `get` **name**(): `string`

#### Returns

`string`

---

### <a id="subredditname" name="subredditname"></a> subredditName

• `get` **subredditName**(): `string`

#### Returns

`string`

## Methods

### <a id="delete" name="delete"></a> delete

▸ **delete**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

---

### <a id="tojson" name="tojson"></a> toJSON

▸ **toJSON**(): `Pick`\<[`Widget`](models.Widget.md), `"subredditName"` \| `"id"` \| `"name"`\>

#### Returns

`Pick`\<[`Widget`](models.Widget.md), `"subredditName"` \| `"id"` \| `"name"`\>
