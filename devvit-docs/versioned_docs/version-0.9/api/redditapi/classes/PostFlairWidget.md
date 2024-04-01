# Class: PostFlairWidget

## Hierarchy

- [`Widget`](Widget.md)

  ↳ **`PostFlairWidget`**

## Table of contents

### Constructors

- [constructor](PostFlairWidget.md#constructor)

### Accessors

- [display](PostFlairWidget.md#display)
- [id](PostFlairWidget.md#id)
- [name](PostFlairWidget.md#name)
- [styles](PostFlairWidget.md#styles)
- [subredditName](PostFlairWidget.md#subredditname)
- [templates](PostFlairWidget.md#templates)

### Methods

- [delete](PostFlairWidget.md#delete)
- [toJSON](PostFlairWidget.md#tojson)
- [add](PostFlairWidget.md#add)
- [create](PostFlairWidget.md#create)
- [delete](PostFlairWidget.md#delete-1)
- [getWidgets](PostFlairWidget.md#getwidgets)
- [reorder](PostFlairWidget.md#reorder)
- [update](PostFlairWidget.md#update)

## Constructors

### constructor

• **new PostFlairWidget**(`widgetData`, `subredditName`, `metadata?`)

#### Parameters

| Name            | Type                            |
| :-------------- | :------------------------------ |
| `widgetData`    | `GetWidgetsResponse_WidgetItem` |
| `subredditName` | `string`                        |
| `metadata?`     | `Metadata`                      |

#### Overrides

[Widget](Widget.md).[constructor](Widget.md#constructor)

## Accessors

### display

• `get` **display**(): `"list"` \| `"cloud"`

#### Returns

`"list"` \| `"cloud"`

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

---

### templates

• `get` **templates**(): `GetWidgetsResponse_WidgetItem_PostFlairTemplate`[]

#### Returns

`GetWidgetsResponse_WidgetItem_PostFlairTemplate`[]

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

| Name            | Type                                                |
| :-------------- | :-------------------------------------------------- |
| `display`       | `"list"` \| `"cloud"`                               |
| `id`            | `string`                                            |
| `name`          | `string`                                            |
| `styles`        | `WidgetStyles`                                      |
| `subredditName` | `string`                                            |
| `templates`     | `GetWidgetsResponse_WidgetItem_PostFlairTemplate`[] |

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

▸ `Static` **create**(`options`, `metadata`): `Promise`\< [`PostFlairWidget`](PostFlairWidget.md)\>

#### Parameters

| Name       | Type                        |
| :--------- | :-------------------------- |
| `options`  | `AddPostFlairWidgetRequest` |
| `metadata` | `undefined` \| `Metadata`   |

#### Returns

`Promise`\< [`PostFlairWidget`](PostFlairWidget.md)\>

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

▸ `Static` **update**(`options`, `metadata`): `Promise`\< [`PostFlairWidget`](PostFlairWidget.md)\>

#### Parameters

| Name       | Type                           |
| :--------- | :----------------------------- |
| `options`  | `UpdatePostFlairWidgetRequest` |
| `metadata` | `undefined` \| `Metadata`      |

#### Returns

`Promise`\< [`PostFlairWidget`](PostFlairWidget.md)\>
