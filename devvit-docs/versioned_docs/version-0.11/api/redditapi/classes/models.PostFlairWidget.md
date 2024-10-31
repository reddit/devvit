# Class: PostFlairWidget

[models](../modules/models.md).PostFlairWidget

## Hierarchy

- [`Widget`](models.Widget.md)

  ↳ **`PostFlairWidget`**

## Table of contents

### Constructors

- [constructor](models.PostFlairWidget.md#constructor)

### Accessors

- [display](models.PostFlairWidget.md#display)
- [id](models.PostFlairWidget.md#id)
- [name](models.PostFlairWidget.md#name)
- [styles](models.PostFlairWidget.md#styles)
- [subredditName](models.PostFlairWidget.md#subredditname)
- [templates](models.PostFlairWidget.md#templates)

### Methods

- [delete](models.PostFlairWidget.md#delete)
- [toJSON](models.PostFlairWidget.md#tojson)

## Constructors

### <a id="constructor" name="constructor"></a> constructor

• **new PostFlairWidget**(`widgetData`, `subredditName`, `metadata`): [`PostFlairWidget`](models.PostFlairWidget.md)

#### Parameters

| Name            | Type                            |
| :-------------- | :------------------------------ |
| `widgetData`    | `GetWidgetsResponse_WidgetItem` |
| `subredditName` | `string`                        |
| `metadata`      | `undefined` \| `Metadata`       |

#### Returns

[`PostFlairWidget`](models.PostFlairWidget.md)

#### Overrides

[Widget](models.Widget.md).[constructor](models.Widget.md#constructor)

## Accessors

### <a id="display" name="display"></a> display

• `get` **display**(): `"list"` \| `"cloud"`

#### Returns

`"list"` \| `"cloud"`

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

---

### <a id="templates" name="templates"></a> templates

• `get` **templates**(): `GetWidgetsResponse_WidgetItem_PostFlairTemplate`[]

#### Returns

`GetWidgetsResponse_WidgetItem_PostFlairTemplate`[]

## Methods

### <a id="delete" name="delete"></a> delete

▸ **delete**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Inherited from

[Widget](models.Widget.md).[delete](models.Widget.md#delete)

---

### <a id="tojson" name="tojson"></a> toJSON

▸ **toJSON**(): `Pick`\<[`Widget`](models.Widget.md), `"subredditName"` \| `"id"` \| `"name"`\> & `Pick`\<[`PostFlairWidget`](models.PostFlairWidget.md), `"styles"` \| `"templates"` \| `"display"`\>

#### Returns

`Pick`\<[`Widget`](models.Widget.md), `"subredditName"` \| `"id"` \| `"name"`\> & `Pick`\<[`PostFlairWidget`](models.PostFlairWidget.md), `"styles"` \| `"templates"` \| `"display"`\>

#### Overrides

[Widget](models.Widget.md).[toJSON](models.Widget.md#tojson)
