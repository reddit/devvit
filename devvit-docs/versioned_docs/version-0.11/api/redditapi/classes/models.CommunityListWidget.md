# Class: CommunityListWidget

[models](../modules/models.md).CommunityListWidget

## Hierarchy

- [`Widget`](models.Widget.md)

  ↳ **`CommunityListWidget`**

## Table of contents

### Constructors

- [constructor](models.CommunityListWidget.md#constructor)

### Accessors

- [communities](models.CommunityListWidget.md#communities)
- [id](models.CommunityListWidget.md#id)
- [name](models.CommunityListWidget.md#name)
- [styles](models.CommunityListWidget.md#styles)
- [subredditName](models.CommunityListWidget.md#subredditname)

### Methods

- [delete](models.CommunityListWidget.md#delete)
- [toJSON](models.CommunityListWidget.md#tojson)

## Constructors

### <a id="constructor" name="constructor"></a> constructor

• **new CommunityListWidget**(`widgetData`, `subredditName`, `metadata`): [`CommunityListWidget`](models.CommunityListWidget.md)

#### Parameters

| Name            | Type                            |
| :-------------- | :------------------------------ |
| `widgetData`    | `GetWidgetsResponse_WidgetItem` |
| `subredditName` | `string`                        |
| `metadata`      | `undefined` \| `Metadata`       |

#### Returns

[`CommunityListWidget`](models.CommunityListWidget.md)

#### Overrides

[Widget](models.Widget.md).[constructor](models.Widget.md#constructor)

## Accessors

### <a id="communities" name="communities"></a> communities

• `get` **communities**(): `CommunityListWidget_CommunityData`[]

#### Returns

`CommunityListWidget_CommunityData`[]

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

▸ **toJSON**(): `Pick`\<[`Widget`](models.Widget.md), `"subredditName"` \| `"id"` \| `"name"`\> & `Pick`\<[`CommunityListWidget`](models.CommunityListWidget.md), `"communities"` \| `"styles"`\>

#### Returns

`Pick`\<[`Widget`](models.Widget.md), `"subredditName"` \| `"id"` \| `"name"`\> & `Pick`\<[`CommunityListWidget`](models.CommunityListWidget.md), `"communities"` \| `"styles"`\>

#### Overrides

[Widget](models.Widget.md).[toJSON](models.Widget.md#tojson)
