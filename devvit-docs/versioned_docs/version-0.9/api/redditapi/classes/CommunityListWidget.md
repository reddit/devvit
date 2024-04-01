# Class: CommunityListWidget

## Hierarchy

- [`Widget`](Widget.md)

  ↳ **`CommunityListWidget`**

## Table of contents

### Constructors

- [constructor](CommunityListWidget.md#constructor)

### Accessors

- [communities](CommunityListWidget.md#communities)
- [id](CommunityListWidget.md#id)
- [name](CommunityListWidget.md#name)
- [styles](CommunityListWidget.md#styles)
- [subredditName](CommunityListWidget.md#subredditname)

### Methods

- [delete](CommunityListWidget.md#delete)
- [toJSON](CommunityListWidget.md#tojson)
- [add](CommunityListWidget.md#add)
- [create](CommunityListWidget.md#create)
- [delete](CommunityListWidget.md#delete-1)
- [getWidgets](CommunityListWidget.md#getwidgets)
- [reorder](CommunityListWidget.md#reorder)
- [update](CommunityListWidget.md#update)

## Constructors

### constructor

• **new CommunityListWidget**(`widgetData`, `subredditName`, `metadata?`)

#### Parameters

| Name            | Type                            |
| :-------------- | :------------------------------ |
| `widgetData`    | `GetWidgetsResponse_WidgetItem` |
| `subredditName` | `string`                        |
| `metadata?`     | `Metadata`                      |

#### Overrides

[Widget](Widget.md).[constructor](Widget.md#constructor)

## Accessors

### communities

• `get` **communities**(): `CommunityListWidget_CommunityData`[]

#### Returns

`CommunityListWidget_CommunityData`[]

---

### id

• `get` **id**(): `string`

#### Returns

`string`

#### Inherited from

Widget.id

---

### name

• `get` **name**(): `string`

#### Returns

`string`

#### Inherited from

Widget.name

---

### styles

• `get` **styles**(): `WidgetStyles`

#### Returns

`WidgetStyles`

---

### subredditName

• `get` **subredditName**(): `string`

#### Returns

`string`

#### Inherited from

Widget.subredditName

## Methods

### delete

▸ **delete**(): `Promise`\< `void`\>

#### Returns

`Promise`\< `void`\>

#### Inherited from

[Widget](Widget.md).[delete](Widget.md#delete)

---

### toJSON

▸ **toJSON**(): `Object`

#### Returns

`Object`

| Name            | Type                                  |
| :-------------- | :------------------------------------ |
| `communities`   | `CommunityListWidget_CommunityData`[] |
| `id`            | `string`                              |
| `name`          | `string`                              |
| `styles`        | `WidgetStyles`                        |
| `subredditName` | `string`                              |

#### Overrides

[Widget](Widget.md).[toJSON](Widget.md#tojson)

---

### add

▸ `Static` **add**(`widgetData`, `metadata`): `Promise`\< [`ImageWidget`](ImageWidget.md) \| [`CalendarWidget`](CalendarWidget.md) \| [`TextAreaWidget`](TextAreaWidget.md) \| [`ButtonWidget`](ButtonWidget.md) \| [`CommunityListWidget`](CommunityListWidget.md) \| [`PostFlairWidget`](PostFlairWidget.md) \| [`CustomWidget`](CustomWidget.md)\>

#### Parameters

| Name         | Type                                          |
| :----------- | :-------------------------------------------- |
| `widgetData` | [`AddWidgetData`](../README.md#addwidgetdata) |
| `metadata`   | `undefined` \| `Metadata`                     |

#### Returns

`Promise`\< [`ImageWidget`](ImageWidget.md) \| [`CalendarWidget`](CalendarWidget.md) \| [`TextAreaWidget`](TextAreaWidget.md) \| [`ButtonWidget`](ButtonWidget.md) \| [`CommunityListWidget`](CommunityListWidget.md) \| [`PostFlairWidget`](PostFlairWidget.md) \| [`CustomWidget`](CustomWidget.md)\>

#### Inherited from

[Widget](Widget.md).[add](Widget.md#add)

---

### create

▸ `Static` **create**(`options`, `metadata`): `Promise`\< [`CommunityListWidget`](CommunityListWidget.md)\>

#### Parameters

| Name       | Type                            |
| :--------- | :------------------------------ |
| `options`  | `AddCommunityListWidgetRequest` |
| `metadata` | `undefined` \| `Metadata`       |

#### Returns

`Promise`\< [`CommunityListWidget`](CommunityListWidget.md)\>

---

### delete

▸ `Static` **delete**(`subredditName`, `id`, `metadata?`): `Promise`\< `void`\>

#### Parameters

| Name            | Type       |
| :-------------- | :--------- |
| `subredditName` | `string`   |
| `id`            | `string`   |
| `metadata?`     | `Metadata` |

#### Returns

`Promise`\< `void`\>

#### Inherited from

[Widget](Widget.md).[delete](Widget.md#delete-1)

---

### getWidgets

▸ `Static` **getWidgets**(`subredditName`, `metadata?`): `Promise`\< ([`ImageWidget`](ImageWidget.md) \| [`CalendarWidget`](CalendarWidget.md) \| [`TextAreaWidget`](TextAreaWidget.md) \| [`ButtonWidget`](ButtonWidget.md) \| [`CommunityListWidget`](CommunityListWidget.md) \| [`PostFlairWidget`](PostFlairWidget.md) \| [`CustomWidget`](CustomWidget.md))[]\>

#### Parameters

| Name            | Type       |
| :-------------- | :--------- |
| `subredditName` | `string`   |
| `metadata?`     | `Metadata` |

#### Returns

`Promise`\< ([`ImageWidget`](ImageWidget.md) \| [`CalendarWidget`](CalendarWidget.md) \| [`TextAreaWidget`](TextAreaWidget.md) \| [`ButtonWidget`](ButtonWidget.md) \| [`CommunityListWidget`](CommunityListWidget.md) \| [`PostFlairWidget`](PostFlairWidget.md) \| [`CustomWidget`](CustomWidget.md))[]\>

#### Inherited from

[Widget](Widget.md).[getWidgets](Widget.md#getwidgets)

---

### reorder

▸ `Static` **reorder**(`subredditName`, `orderByIds`, `metadata?`): `Promise`\< `void`\>

#### Parameters

| Name            | Type       |
| :-------------- | :--------- |
| `subredditName` | `string`   |
| `orderByIds`    | `string`[] |
| `metadata?`     | `Metadata` |

#### Returns

`Promise`\< `void`\>

#### Inherited from

[Widget](Widget.md).[reorder](Widget.md#reorder)

---

### update

▸ `Static` **update**(`options`, `metadata`): `Promise`\< [`CommunityListWidget`](CommunityListWidget.md)\>

#### Parameters

| Name       | Type                               |
| :--------- | :--------------------------------- |
| `options`  | `UpdateCommunityListWidgetRequest` |
| `metadata` | `undefined` \| `Metadata`          |

#### Returns

`Promise`\< [`CommunityListWidget`](CommunityListWidget.md)\>
