[**@devvit/public-api v0.11.18-dev**](../README.md)

---

# Type Alias: MenuItem

> **MenuItem** = `object`

## Properties

<a id="description"></a>

### description?

> `optional` **description**: `string`

An optional description for the menu item

---

<a id="forusertype"></a>

### forUserType?

> `optional` **forUserType**: [`MenuItemUserType`](MenuItemUserType.md) \| [`MenuItemUserType`](MenuItemUserType.md)[]

The user type(s) that the menu item should be displayed for

---

<a id="label"></a>

### label

> **label**: `string`

The label of the menu item

---

<a id="location"></a>

### location

> **location**: [`MenuItemLocation`](MenuItemLocation.md) \| [`MenuItemLocation`](MenuItemLocation.md)[]

The location(s) where the menu item should be displayed

---

<a id="onpress"></a>

### onPress()

> **onPress**: (`event`, `context`) => `void` \| `Promise`\<`void`\>

A function that is called when the menu item is pressed

#### Parameters

##### event

[`MenuItemOnPressEvent`](MenuItemOnPressEvent.md)

##### context

[`Context`](../@devvit/namespaces/Devvit/type-aliases/Context.md)

#### Returns

`void` \| `Promise`\<`void`\>

---

<a id="postfilter"></a>

### postFilter?

> `optional` **postFilter**: [`MenuItemPostFilter`](MenuItemPostFilter.md)

**`Experimental`**

The filter that applies to post menu items and has no effect on non-post actions
