# Class: ButtonWidget

## Hierarchy

- [`Widget`](Widget.md)

  ↳ **`ButtonWidget`**

## Table of contents

### Constructors

- [constructor](ButtonWidget.md#constructor)

### Accessors

- [buttons](ButtonWidget.md#buttons)
- [description](ButtonWidget.md#description)
- [id](ButtonWidget.md#id)
- [name](ButtonWidget.md#name)
- [styles](ButtonWidget.md#styles)
- [subredditName](ButtonWidget.md#subredditname)

### Methods

- [delete](ButtonWidget.md#delete)
- [toJSON](ButtonWidget.md#tojson)
- [add](ButtonWidget.md#add)
- [create](ButtonWidget.md#create)
- [delete](ButtonWidget.md#delete-1)
- [getWidgets](ButtonWidget.md#getwidgets)
- [reorder](ButtonWidget.md#reorder)
- [update](ButtonWidget.md#update)

## Constructors

### constructor

• **new ButtonWidget**(`widgetData`, `subredditName`, `metadata?`)

#### Parameters

| Name            | Type                            |
| :-------------- | :------------------------------ |
| `widgetData`    | `GetWidgetsResponse_WidgetItem` |
| `subredditName` | `string`                        |
| `metadata?`     | `Metadata`                      |

#### Overrides

[Widget](Widget.md).[constructor](Widget.md#constructor)

## Accessors

### buttons

• `get` **buttons**(): `WidgetButton`[]

#### Returns

`WidgetButton`[]

---

### description

• `get` **description**(): `string`

#### Returns

`string`

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

| Name            | Type             |
| :-------------- | :--------------- |
| `buttons`       | `WidgetButton`[] |
| `description`   | `string`         |
| `id`            | `string`         |
| `name`          | `string`         |
| `styles`        | `WidgetStyles`   |
| `subredditName` | `string`         |

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

▸ `Static` **create**(`options`, `metadata`): `Promise`\< [`ButtonWidget`](ButtonWidget.md)\>

#### Parameters

| Name       | Type                      |
| :--------- | :------------------------ |
| `options`  | `AddButtonWidgetRequest`  |
| `metadata` | `undefined` \| `Metadata` |

#### Returns

`Promise`\< [`ButtonWidget`](ButtonWidget.md)\>

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

▸ `Static` **update**(`options`, `metadata`): `Promise`\< [`ButtonWidget`](ButtonWidget.md)\>

#### Parameters

| Name       | Type                        |
| :--------- | :-------------------------- |
| `options`  | `UpdateButtonWidgetRequest` |
| `metadata` | `undefined` \| `Metadata`   |

#### Returns

`Promise`\< [`ButtonWidget`](ButtonWidget.md)\>
