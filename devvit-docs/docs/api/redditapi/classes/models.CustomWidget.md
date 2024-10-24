# Class: CustomWidget

[models](../modules/models.md).CustomWidget

## Hierarchy

- [`Widget`](models.Widget.md)

  ↳ **`CustomWidget`**

## Table of contents

### Constructors

- [constructor](models.CustomWidget.md#constructor)

### Accessors

- [css](models.CustomWidget.md#css)
- [height](models.CustomWidget.md#height)
- [id](models.CustomWidget.md#id)
- [images](models.CustomWidget.md#images)
- [name](models.CustomWidget.md#name)
- [stylesheetUrl](models.CustomWidget.md#stylesheeturl)
- [subredditName](models.CustomWidget.md#subredditname)
- [text](models.CustomWidget.md#text)

### Methods

- [delete](models.CustomWidget.md#delete)
- [toJSON](models.CustomWidget.md#tojson)

## Constructors

### <a id="constructor" name="constructor"></a> constructor

• **new CustomWidget**(`widgetData`, `subredditName`, `metadata`): [`CustomWidget`](models.CustomWidget.md)

#### Parameters

| Name            | Type                            |
| :-------------- | :------------------------------ |
| `widgetData`    | `GetWidgetsResponse_WidgetItem` |
| `subredditName` | `string`                        |
| `metadata`      | `undefined` \| `Metadata`       |

#### Returns

[`CustomWidget`](models.CustomWidget.md)

#### Overrides

[Widget](models.Widget.md).[constructor](models.Widget.md#constructor)

## Accessors

### <a id="css" name="css"></a> css

• `get` **css**(): `string`

#### Returns

`string`

---

### <a id="height" name="height"></a> height

• `get` **height**(): `number`

#### Returns

`number`

---

### <a id="id" name="id"></a> id

• `get` **id**(): `string`

#### Returns

`string`

#### Inherited from

Widget.id

---

### <a id="images" name="images"></a> images

• `get` **images**(): `WidgetImage`[]

#### Returns

`WidgetImage`[]

---

### <a id="name" name="name"></a> name

• `get` **name**(): `string`

#### Returns

`string`

#### Inherited from

Widget.name

---

### <a id="stylesheeturl" name="stylesheeturl"></a> stylesheetUrl

• `get` **stylesheetUrl**(): `string`

#### Returns

`string`

---

### <a id="subredditname" name="subredditname"></a> subredditName

• `get` **subredditName**(): `string`

#### Returns

`string`

#### Inherited from

Widget.subredditName

---

### <a id="text" name="text"></a> text

• `get` **text**(): `string`

#### Returns

`string`

## Methods

### <a id="delete" name="delete"></a> delete

▸ **delete**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Inherited from

[Widget](models.Widget.md).[delete](models.Widget.md#delete)

---

### <a id="tojson" name="tojson"></a> toJSON

▸ **toJSON**(): `Pick`\<[`Widget`](models.Widget.md), `"subredditName"` \| `"id"` \| `"name"`\> & `Pick`\<[`CustomWidget`](models.CustomWidget.md), `"text"` \| `"height"` \| `"images"` \| `"stylesheetUrl"` \| `"css"`\>

#### Returns

`Pick`\<[`Widget`](models.Widget.md), `"subredditName"` \| `"id"` \| `"name"`\> & `Pick`\<[`CustomWidget`](models.CustomWidget.md), `"text"` \| `"height"` \| `"images"` \| `"stylesheetUrl"` \| `"css"`\>

#### Overrides

[Widget](models.Widget.md).[toJSON](models.Widget.md#tojson)
