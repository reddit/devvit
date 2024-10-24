# Class: ImageWidget

[models](../modules/models.md).ImageWidget

## Hierarchy

- [`Widget`](models.Widget.md)

  ↳ **`ImageWidget`**

## Table of contents

### Constructors

- [constructor](models.ImageWidget.md#constructor)

### Accessors

- [id](models.ImageWidget.md#id)
- [images](models.ImageWidget.md#images)
- [name](models.ImageWidget.md#name)
- [subredditName](models.ImageWidget.md#subredditname)

### Methods

- [delete](models.ImageWidget.md#delete)
- [toJSON](models.ImageWidget.md#tojson)

## Constructors

### <a id="constructor" name="constructor"></a> constructor

• **new ImageWidget**(`widgetData`, `subredditName`, `metadata`): [`ImageWidget`](models.ImageWidget.md)

#### Parameters

| Name            | Type                            |
| :-------------- | :------------------------------ |
| `widgetData`    | `GetWidgetsResponse_WidgetItem` |
| `subredditName` | `string`                        |
| `metadata`      | `undefined` \| `Metadata`       |

#### Returns

[`ImageWidget`](models.ImageWidget.md)

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

▸ **toJSON**(): `Pick`\<[`Widget`](models.Widget.md), `"subredditName"` \| `"id"` \| `"name"`\> & `Pick`\<[`ImageWidget`](models.ImageWidget.md), `"images"`\>

#### Returns

`Pick`\<[`Widget`](models.Widget.md), `"subredditName"` \| `"id"` \| `"name"`\> & `Pick`\<[`ImageWidget`](models.ImageWidget.md), `"images"`\>

#### Overrides

[Widget](models.Widget.md).[toJSON](models.Widget.md#tojson)
