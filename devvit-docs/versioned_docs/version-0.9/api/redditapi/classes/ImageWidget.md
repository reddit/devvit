# Class: ImageWidget

## Hierarchy

- [`Widget`](Widget.md)

  ↳ **`ImageWidget`**

## Table of contents

### Constructors

- [constructor](ImageWidget.md#constructor)

### Accessors

- [id](ImageWidget.md#id)
- [images](ImageWidget.md#images)
- [name](ImageWidget.md#name)
- [subredditName](ImageWidget.md#subredditname)

### Methods

- [delete](ImageWidget.md#delete)
- [toJSON](ImageWidget.md#tojson)
- [add](ImageWidget.md#add)
- [create](ImageWidget.md#create)
- [delete](ImageWidget.md#delete-1)
- [getWidgets](ImageWidget.md#getwidgets)
- [reorder](ImageWidget.md#reorder)
- [update](ImageWidget.md#update)

## Constructors

### constructor

• **new ImageWidget**(`widgetData`, `subredditName`, `metadata?`)

#### Parameters

| Name            | Type                            |
| :-------------- | :------------------------------ |
| `widgetData`    | `GetWidgetsResponse_WidgetItem` |
| `subredditName` | `string`                        |
| `metadata?`     | `Metadata`                      |

#### Overrides

[Widget](Widget.md).[constructor](Widget.md#constructor)

## Accessors

### id

• `get` **id**(): `string`

#### Returns

`string`

#### Inherited from

Widget.id

---

### images

• `get` **images**(): `WidgetImage`[]

#### Returns

`WidgetImage`[]

---

### name

• `get` **name**(): `string`

#### Returns

`string`

#### Inherited from

Widget.name

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

| Name            | Type            |
| :-------------- | :-------------- |
| `id`            | `string`        |
| `images`        | `WidgetImage`[] |
| `name`          | `string`        |
| `subredditName` | `string`        |

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

▸ `Static` **create**(`options`, `metadata`): `Promise`\< [`ImageWidget`](ImageWidget.md)\>

#### Parameters

| Name       | Type                      |
| :--------- | :------------------------ |
| `options`  | `AddImageWidgetRequest`   |
| `metadata` | `undefined` \| `Metadata` |

#### Returns

`Promise`\< [`ImageWidget`](ImageWidget.md)\>

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

▸ `Static` **update**(`options`, `metadata`): `Promise`\< [`ImageWidget`](ImageWidget.md)\>

#### Parameters

| Name       | Type                       |
| :--------- | :------------------------- |
| `options`  | `UpdateImageWidgetRequest` |
| `metadata` | `undefined` \| `Metadata`  |

#### Returns

`Promise`\< [`ImageWidget`](ImageWidget.md)\>
