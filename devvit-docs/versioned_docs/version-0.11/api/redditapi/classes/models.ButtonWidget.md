# Class: ButtonWidget

[models](../modules/models.md).ButtonWidget

## Hierarchy

- [`Widget`](models.Widget.md)

  ↳ **`ButtonWidget`**

## Table of contents

### Constructors

- [constructor](models.ButtonWidget.md#constructor)

### Accessors

- [buttons](models.ButtonWidget.md#buttons)
- [description](models.ButtonWidget.md#description)
- [id](models.ButtonWidget.md#id)
- [name](models.ButtonWidget.md#name)
- [styles](models.ButtonWidget.md#styles)
- [subredditName](models.ButtonWidget.md#subredditname)

### Methods

- [delete](models.ButtonWidget.md#delete)
- [toJSON](models.ButtonWidget.md#tojson)

## Constructors

### <a id="constructor" name="constructor"></a> constructor

• **new ButtonWidget**(`widgetData`, `subredditName`, `metadata`): [`ButtonWidget`](models.ButtonWidget.md)

#### Parameters

| Name            | Type                            |
| :-------------- | :------------------------------ |
| `widgetData`    | `GetWidgetsResponse_WidgetItem` |
| `subredditName` | `string`                        |
| `metadata`      | `undefined` \| `Metadata`       |

#### Returns

[`ButtonWidget`](models.ButtonWidget.md)

#### Overrides

[Widget](models.Widget.md).[constructor](models.Widget.md#constructor)

## Accessors

### <a id="buttons" name="buttons"></a> buttons

• `get` **buttons**(): `WidgetButton`[]

#### Returns

`WidgetButton`[]

---

### <a id="description" name="description"></a> description

• `get` **description**(): `string`

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

▸ **toJSON**(): `Pick`\<[`Widget`](models.Widget.md), `"subredditName"` \| `"id"` \| `"name"`\> & `Pick`\<[`ButtonWidget`](models.ButtonWidget.md), `"description"` \| `"styles"` \| `"buttons"`\>

#### Returns

`Pick`\<[`Widget`](models.Widget.md), `"subredditName"` \| `"id"` \| `"name"`\> & `Pick`\<[`ButtonWidget`](models.ButtonWidget.md), `"description"` \| `"styles"` \| `"buttons"`\>

#### Overrides

[Widget](models.Widget.md).[toJSON](models.Widget.md#tojson)
