# Class: Widget

## Hierarchy

- **`Widget`**

  ↳ [`ImageWidget`](ImageWidget.md)

  ↳ [`CalendarWidget`](CalendarWidget.md)

  ↳ [`TextAreaWidget`](TextAreaWidget.md)

  ↳ [`ButtonWidget`](ButtonWidget.md)

  ↳ [`CommunityListWidget`](CommunityListWidget.md)

  ↳ [`PostFlairWidget`](PostFlairWidget.md)

  ↳ [`CustomWidget`](CustomWidget.md)

## Table of contents

### Constructors

- [constructor](Widget.md#constructor)

### Accessors

- [id](Widget.md#id)
- [name](Widget.md#name)
- [subredditName](Widget.md#subredditname)

### Methods

- [delete](Widget.md#delete)
- [toJSON](Widget.md#tojson)
- [add](Widget.md#add)
- [delete](Widget.md#delete-1)
- [getWidgets](Widget.md#getwidgets)
- [reorder](Widget.md#reorder)

## Constructors

### constructor

• **new Widget**(`widgetData`, `subredditName`, `metadata?`)

#### Parameters

| Name            | Type                            |
| :-------------- | :------------------------------ |
| `widgetData`    | `GetWidgetsResponse_WidgetItem` |
| `subredditName` | `string`                        |
| `metadata?`     | `Metadata`                      |

## Accessors

### id

• `get` **id**(): `string`

#### Returns

`string`

---

### name

• `get` **name**(): `string`

#### Returns

`string`

---

### subredditName

• `get` **subredditName**(): `string`

#### Returns

`string`

## Methods

### delete

▸ **delete**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

---

### toJSON

▸ **toJSON**(): `Object`

#### Returns

`Object`

| Name            | Type     |
| :-------------- | :------- |
| `id`            | `string` |
| `name`          | `string` |
| `subredditName` | `string` |

---

### add

▸ `Static` **add**(`widgetData`, `metadata`): `Promise`\<[`ImageWidget`](ImageWidget.md) \| [`CalendarWidget`](CalendarWidget.md) \| [`TextAreaWidget`](TextAreaWidget.md) \| [`ButtonWidget`](ButtonWidget.md) \| [`CommunityListWidget`](CommunityListWidget.md) \| [`PostFlairWidget`](PostFlairWidget.md) \| [`CustomWidget`](CustomWidget.md)\>

#### Parameters

| Name         | Type                                          |
| :----------- | :-------------------------------------------- |
| `widgetData` | [`AddWidgetData`](../README.md#addwidgetdata) |
| `metadata`   | `undefined` \| `Metadata`                     |

#### Returns

`Promise`\<[`ImageWidget`](ImageWidget.md) \| [`CalendarWidget`](CalendarWidget.md) \| [`TextAreaWidget`](TextAreaWidget.md) \| [`ButtonWidget`](ButtonWidget.md) \| [`CommunityListWidget`](CommunityListWidget.md) \| [`PostFlairWidget`](PostFlairWidget.md) \| [`CustomWidget`](CustomWidget.md)\>

---

### delete

▸ `Static` **delete**(`subredditName`, `id`, `metadata?`): `Promise`\<`void`\>

#### Parameters

| Name            | Type       |
| :-------------- | :--------- |
| `subredditName` | `string`   |
| `id`            | `string`   |
| `metadata?`     | `Metadata` |

#### Returns

`Promise`\<`void`\>

---

### getWidgets

▸ `Static` **getWidgets**(`subredditName`, `metadata?`): `Promise`\<([`ImageWidget`](ImageWidget.md) \| [`CalendarWidget`](CalendarWidget.md) \| [`TextAreaWidget`](TextAreaWidget.md) \| [`ButtonWidget`](ButtonWidget.md) \| [`CommunityListWidget`](CommunityListWidget.md) \| [`PostFlairWidget`](PostFlairWidget.md) \| [`CustomWidget`](CustomWidget.md))[]\>

#### Parameters

| Name            | Type       |
| :-------------- | :--------- |
| `subredditName` | `string`   |
| `metadata?`     | `Metadata` |

#### Returns

`Promise`\<([`ImageWidget`](ImageWidget.md) \| [`CalendarWidget`](CalendarWidget.md) \| [`TextAreaWidget`](TextAreaWidget.md) \| [`ButtonWidget`](ButtonWidget.md) \| [`CommunityListWidget`](CommunityListWidget.md) \| [`PostFlairWidget`](PostFlairWidget.md) \| [`CustomWidget`](CustomWidget.md))[]\>

---

### reorder

▸ `Static` **reorder**(`subredditName`, `orderByIds`, `metadata?`): `Promise`\<`void`\>

#### Parameters

| Name            | Type       |
| :-------------- | :--------- |
| `subredditName` | `string`   |
| `orderByIds`    | `string`[] |
| `metadata?`     | `Metadata` |

#### Returns

`Promise`\<`void`\>
