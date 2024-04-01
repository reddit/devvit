# Class: TextAreaWidget

## Hierarchy

- [`Widget`](Widget.md)

  ↳ **`TextAreaWidget`**

## Table of contents

### Constructors

- [constructor](TextAreaWidget.md#constructor)

### Accessors

- [id](TextAreaWidget.md#id)
- [name](TextAreaWidget.md#name)
- [styles](TextAreaWidget.md#styles)
- [subredditName](TextAreaWidget.md#subredditname)
- [text](TextAreaWidget.md#text)

### Methods

- [delete](TextAreaWidget.md#delete)
- [toJSON](TextAreaWidget.md#tojson)
- [add](TextAreaWidget.md#add)
- [create](TextAreaWidget.md#create)
- [delete](TextAreaWidget.md#delete-1)
- [getWidgets](TextAreaWidget.md#getwidgets)
- [reorder](TextAreaWidget.md#reorder)
- [update](TextAreaWidget.md#update)

## Constructors

### constructor

• **new TextAreaWidget**(`widgetData`, `subredditName`, `metadata?`)

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

---

### text

• `get` **text**(): `string`

#### Returns

`string`

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

| Name            | Type           |
| :-------------- | :------------- |
| `id`            | `string`       |
| `name`          | `string`       |
| `styles`        | `WidgetStyles` |
| `subredditName` | `string`       |
| `text`          | `string`       |

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

▸ `Static` **create**(`options`, `metadata`): `Promise`\< [`TextAreaWidget`](TextAreaWidget.md)\>

#### Parameters

| Name       | Type                       |
| :--------- | :------------------------- |
| `options`  | `AddTextAreaWidgetRequest` |
| `metadata` | `undefined` \| `Metadata`  |

#### Returns

`Promise`\< [`TextAreaWidget`](TextAreaWidget.md)\>

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

▸ `Static` **update**(`options`, `metadata`): `Promise`\< [`TextAreaWidget`](TextAreaWidget.md)\>

#### Parameters

| Name       | Type                          |
| :--------- | :---------------------------- |
| `options`  | `UpdateTextAreaWidgetRequest` |
| `metadata` | `undefined` \| `Metadata`     |

#### Returns

`Promise`\< [`TextAreaWidget`](TextAreaWidget.md)\>
