# Class: WikiPageSettings

[models](../modules/models.md).WikiPageSettings

## Table of contents

### Constructors

- [constructor](models.WikiPageSettings.md#constructor)

### Accessors

- [editors](models.WikiPageSettings.md#editors)
- [listed](models.WikiPageSettings.md#listed)
- [permLevel](models.WikiPageSettings.md#permlevel)

### Methods

- [toJSON](models.WikiPageSettings.md#tojson)

## Constructors

### <a id="constructor" name="constructor"></a> constructor

• **new WikiPageSettings**(`data`, `metadata`): [`WikiPageSettings`](models.WikiPageSettings.md)

#### Parameters

| Name       | Type                      |
| :--------- | :------------------------ |
| `data`     | `WikiPageSettings_Data`   |
| `metadata` | `undefined` \| `Metadata` |

#### Returns

[`WikiPageSettings`](models.WikiPageSettings.md)

## Accessors

### <a id="editors" name="editors"></a> editors

• `get` **editors**(): [`User`](models.User.md)[]

#### Returns

[`User`](models.User.md)[]

---

### <a id="listed" name="listed"></a> listed

• `get` **listed**(): `boolean`

#### Returns

`boolean`

---

### <a id="permlevel" name="permlevel"></a> permLevel

• `get` **permLevel**(): [`WikiPagePermissionLevel`](../enums/models.WikiPagePermissionLevel.md)

#### Returns

[`WikiPagePermissionLevel`](../enums/models.WikiPagePermissionLevel.md)

## Methods

### <a id="tojson" name="tojson"></a> toJSON

▸ **toJSON**(): `Pick`\<[`WikiPageSettings`](models.WikiPageSettings.md), `"listed"` \| `"permLevel"`\> & \{ `editors`: `Pick`\<[`User`](models.User.md), `"username"` \| `"id"` \| `"nsfw"` \| `"createdAt"` \| `"linkKarma"` \| `"commentKarma"`\> & \{ `modPermissionsBySubreddit`: `Record`\<`string`, [`ModeratorPermission`](../modules/models.md#moderatorpermission)[]\> }[] }

#### Returns

`Pick`\<[`WikiPageSettings`](models.WikiPageSettings.md), `"listed"` \| `"permLevel"`\> & \{ `editors`: `Pick`\<[`User`](models.User.md), `"username"` \| `"id"` \| `"nsfw"` \| `"createdAt"` \| `"linkKarma"` \| `"commentKarma"`\> & \{ `modPermissionsBySubreddit`: `Record`\<`string`, [`ModeratorPermission`](../modules/models.md#moderatorpermission)[]\> }[] }
