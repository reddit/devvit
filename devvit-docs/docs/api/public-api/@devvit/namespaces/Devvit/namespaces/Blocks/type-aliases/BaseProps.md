[**@devvit/public-api v0.11.18-dev**](../../../../../../README.md)

---

# Type Alias: BaseProps

> **BaseProps** = `object`

## Properties

<a id="grow"></a>

### grow?

> `optional` **grow**: `boolean`

---

<a id="height"></a>

### height?

> `optional` **height**: [`SizeString`](SizeString.md)

---

<a id="id"></a>

### id?

> `optional` **id**: `string`

This optional field provides a unique identifier for the element. This is useful for ensuring
re-use of elements across renders. See the `key` field for more information. Unlike key, id
is global. You cannot have two elements with the same id in the same tree.

---

<a id="key"></a>

### key?

> `optional` **key**: `string`

This optional field provides some efficiencies around re-ordering elements in a list. Rather
Than re-rendering the entire list, the client can use the key to determine if the element has
changed. In the example below, if a and b were swapped, the client would know to reuse the
existing elements from b, rather than re-creating an expensive tree of elements.

Unlike id, key is local to the parent element. This means that the same key can be used in different
parts of the tree without conflict.

    <hstack>
        <text key="a">hi world</text>
        <hstack key="b">...deeply nested content...</hstack>
    </hstack>

---

<a id="maxheight"></a>

### maxHeight?

> `optional` **maxHeight**: [`SizeString`](SizeString.md)

---

<a id="maxwidth"></a>

### maxWidth?

> `optional` **maxWidth**: [`SizeString`](SizeString.md)

---

<a id="minheight"></a>

### minHeight?

> `optional` **minHeight**: [`SizeString`](SizeString.md)

---

<a id="minwidth"></a>

### minWidth?

> `optional` **minWidth**: [`SizeString`](SizeString.md)

---

<a id="width"></a>

### width?

> `optional` **width**: [`SizeString`](SizeString.md)
