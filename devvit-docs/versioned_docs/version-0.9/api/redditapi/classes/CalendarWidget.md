# Class: CalendarWidget

## Hierarchy

- [`Widget`](Widget.md)

  ↳ **`CalendarWidget`**

## Table of contents

### Constructors

- [constructor](CalendarWidget.md#constructor)

### Accessors

- [configuration](CalendarWidget.md#configuration)
- [googleCalendarId](CalendarWidget.md#googlecalendarid)
- [id](CalendarWidget.md#id)
- [name](CalendarWidget.md#name)
- [styles](CalendarWidget.md#styles)
- [subredditName](CalendarWidget.md#subredditname)

### Methods

- [delete](CalendarWidget.md#delete)
- [toJSON](CalendarWidget.md#tojson)
- [add](CalendarWidget.md#add)
- [create](CalendarWidget.md#create)
- [delete](CalendarWidget.md#delete-1)
- [getWidgets](CalendarWidget.md#getwidgets)
- [reorder](CalendarWidget.md#reorder)
- [update](CalendarWidget.md#update)

## Constructors

### constructor

• **new CalendarWidget**(`widgetData`, `subredditName`, `metadata?`)

#### Parameters

| Name            | Type                            |
| :-------------- | :------------------------------ |
| `widgetData`    | `GetWidgetsResponse_WidgetItem` |
| `subredditName` | `string`                        |
| `metadata?`     | `Metadata`                      |

#### Overrides

[Widget](Widget.md).[constructor](Widget.md#constructor)

## Accessors

### configuration

• `get` **configuration**(): `CalendarWidgetConfiguration`

#### Returns

`CalendarWidgetConfiguration`

---

### googleCalendarId

• `get` **googleCalendarId**(): `string`

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

| Name               | Type                          |
| :----------------- | :---------------------------- |
| `configuration`    | `CalendarWidgetConfiguration` |
| `googleCalendarId` | `string`                      |
| `id`               | `string`                      |
| `name`             | `string`                      |
| `styles`           | `WidgetStyles`                |
| `subredditName`    | `string`                      |

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

▸ `Static` **create**(`options`, `metadata`): `Promise`\< [`CalendarWidget`](CalendarWidget.md)\>

#### Parameters

| Name       | Type                       |
| :--------- | :------------------------- |
| `options`  | `AddCalendarWidgetRequest` |
| `metadata` | `undefined` \| `Metadata`  |

#### Returns

`Promise`\< [`CalendarWidget`](CalendarWidget.md)\>

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

▸ `Static` **update**(`options`, `metadata`): `Promise`\< [`CalendarWidget`](CalendarWidget.md)\>

#### Parameters

| Name       | Type                          |
| :--------- | :---------------------------- |
| `options`  | `UpdateCalendarWidgetRequest` |
| `metadata` | `undefined` \| `Metadata`     |

#### Returns

`Promise`\< [`CalendarWidget`](CalendarWidget.md)\>
