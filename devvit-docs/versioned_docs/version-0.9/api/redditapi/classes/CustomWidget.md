# Class: CustomWidget

## Hierarchy

- [`Widget`](Widget.md)

  ↳ **`CustomWidget`**

## Table of contents

### Constructors

- [constructor](CustomWidget.md#constructor)

### Accessors

- [css](CustomWidget.md#css)
- [height](CustomWidget.md#height)
- [id](CustomWidget.md#id)
- [images](CustomWidget.md#images)
- [name](CustomWidget.md#name)
- [stylesheetUrl](CustomWidget.md#stylesheeturl)
- [subredditName](CustomWidget.md#subredditname)
- [text](CustomWidget.md#text)

### Methods

- [delete](CustomWidget.md#delete)
- [toJSON](CustomWidget.md#tojson)
- [add](CustomWidget.md#add)
- [create](CustomWidget.md#create)
- [delete](CustomWidget.md#delete-1)
- [getWidgets](CustomWidget.md#getwidgets)
- [reorder](CustomWidget.md#reorder)
- [update](CustomWidget.md#update)

## Constructors

### constructor

• **new CustomWidget**(`widgetData`, `subredditName`, `metadata?`)

#### Parameters

| Name            | Type                            |
| :-------------- | :------------------------------ |
| `widgetData`    | `GetWidgetsResponse_WidgetItem` |
| `subredditName` | `string`                        |
| `metadata?`     | `Metadata`                      |

#### Overrides

[Widget](Widget.md).[constructor](Widget.md#constructor)

## Accessors

### css

• `get` **css**(): `string`

#### Returns

`string`

---

### height

• `get` **height**(): `number`

#### Returns

`number`

---

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

### stylesheetUrl

• `get` **stylesheetUrl**(): `string`

#### Returns

`string`

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

| Name            | Type            |
| :-------------- | :-------------- |
| `css`           | `string`        |
| `height`        | `number`        |
| `id`            | `string`        |
| `images`        | `WidgetImage`[] |
| `name`          | `string`        |
| `stylesheetUrl` | `string`        |
| `subredditName` | `string`        |
| `text`          | `string`        |

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

▸ `Static` **create**(`options`, `metadata`): `Promise`\< [`CustomWidget`](CustomWidget.md)\>

#### Parameters

| Name       | Type                      |
| :--------- | :------------------------ |
| `options`  | `AddCustomWidgetRequest`  |
| `metadata` | `undefined` \| `Metadata` |

#### Returns

`Promise`\< [`CustomWidget`](CustomWidget.md)\>

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

▸ `Static` **update**(`options`, `metadata`): `Promise`\< [`CustomWidget`](CustomWidget.md)\>

#### Parameters

| Name       | Type                        |
| :--------- | :-------------------------- |
| `options`  | `UpdateCustomWidgetRequest` |
| `metadata` | `undefined` \| `Metadata`   |

#### Returns

`Promise`\< [`CustomWidget`](CustomWidget.md)\>
