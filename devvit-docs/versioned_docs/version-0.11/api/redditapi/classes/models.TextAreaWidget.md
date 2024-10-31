# Class: TextAreaWidget

[models](../modules/models.md).TextAreaWidget

## Hierarchy

- [`Widget`](models.Widget.md)

  ↳ **`TextAreaWidget`**

## Table of contents

### Constructors

- [constructor](models.TextAreaWidget.md#constructor)

### Accessors

- [id](models.TextAreaWidget.md#id)
- [name](models.TextAreaWidget.md#name)
- [styles](models.TextAreaWidget.md#styles)
- [subredditName](models.TextAreaWidget.md#subredditname)
- [text](models.TextAreaWidget.md#text)

### Methods

- [delete](models.TextAreaWidget.md#delete)
- [toJSON](models.TextAreaWidget.md#tojson)

## Constructors

### <a id="constructor" name="constructor"></a> constructor

• **new TextAreaWidget**(`widgetData`, `subredditName`, `metadata`): [`TextAreaWidget`](models.TextAreaWidget.md)

#### Parameters

| Name            | Type                            |
| :-------------- | :------------------------------ |
| `widgetData`    | `GetWidgetsResponse_WidgetItem` |
| `subredditName` | `string`                        |
| `metadata`      | `undefined` \| `Metadata`       |

#### Returns

[`TextAreaWidget`](models.TextAreaWidget.md)

#### Overrides

[Widget](models.Widget.md).[constructor](models.Widget.md#constructor)

## Accessors

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

▸ **toJSON**(): `Pick`\<[`Widget`](models.Widget.md), `"subredditName"` \| `"id"` \| `"name"`\> & `Pick`\<[`TextAreaWidget`](models.TextAreaWidget.md), `"text"` \| `"styles"`\>

#### Returns

`Pick`\<[`Widget`](models.Widget.md), `"subredditName"` \| `"id"` \| `"name"`\> & `Pick`\<[`TextAreaWidget`](models.TextAreaWidget.md), `"text"` \| `"styles"`\>

#### Overrides

[Widget](models.Widget.md).[toJSON](models.Widget.md#tojson)
