# Class: CalendarWidget

[models](../modules/models.md).CalendarWidget

## Hierarchy

- [`Widget`](models.Widget.md)

  ↳ **`CalendarWidget`**

## Table of contents

### Constructors

- [constructor](models.CalendarWidget.md#constructor)

### Accessors

- [configuration](models.CalendarWidget.md#configuration)
- [googleCalendarId](models.CalendarWidget.md#googlecalendarid)
- [id](models.CalendarWidget.md#id)
- [name](models.CalendarWidget.md#name)
- [styles](models.CalendarWidget.md#styles)
- [subredditName](models.CalendarWidget.md#subredditname)

### Methods

- [delete](models.CalendarWidget.md#delete)
- [toJSON](models.CalendarWidget.md#tojson)

## Constructors

### <a id="constructor" name="constructor"></a> constructor

• **new CalendarWidget**(`widgetData`, `subredditName`, `metadata`): [`CalendarWidget`](models.CalendarWidget.md)

#### Parameters

| Name            | Type                            |
| :-------------- | :------------------------------ |
| `widgetData`    | `GetWidgetsResponse_WidgetItem` |
| `subredditName` | `string`                        |
| `metadata`      | `undefined` \| `Metadata`       |

#### Returns

[`CalendarWidget`](models.CalendarWidget.md)

#### Overrides

[Widget](models.Widget.md).[constructor](models.Widget.md#constructor)

## Accessors

### <a id="configuration" name="configuration"></a> configuration

• `get` **configuration**(): `CalendarWidgetConfiguration`

#### Returns

`CalendarWidgetConfiguration`

---

### <a id="googlecalendarid" name="googlecalendarid"></a> googleCalendarId

• `get` **googleCalendarId**(): `string`

#### Returns

`string`

---

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

### <a id="styles" name="styles"></a> styles

• `get` **styles**(): `WidgetStyles`

#### Returns

`WidgetStyles`

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

▸ **toJSON**(): `Pick`\<[`Widget`](models.Widget.md), `"subredditName"` \| `"id"` \| `"name"`\> & `Pick`\<[`CalendarWidget`](models.CalendarWidget.md), `"googleCalendarId"` \| `"configuration"` \| `"styles"`\>

#### Returns

`Pick`\<[`Widget`](models.Widget.md), `"subredditName"` \| `"id"` \| `"name"`\> & `Pick`\<[`CalendarWidget`](models.CalendarWidget.md), `"googleCalendarId"` \| `"configuration"` \| `"styles"`\>

#### Overrides

[Widget](models.Widget.md).[toJSON](models.Widget.md#tojson)
