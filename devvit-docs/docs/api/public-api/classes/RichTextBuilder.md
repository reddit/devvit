# Class: RichTextBuilder

**`Mixes`**

ParagraphContainer

**`Mixes`**

HeadingContainer

**`Mixes`**

HorizontalRuleContainer

**`Mixes`**

BlockQuoteContainer

**`Mixes`**

CodeBlockContainer

**`Mixes`**

EmbedContainer

**`Mixes`**

ListContainer

**`Mixes`**

TableContainer

**`Mixes`**

ImageContainer

**`Mixes`**

VideoContainer

## Implements

- `ParagraphContainer`\<[`RichTextBuilder`](RichTextBuilder.md)\>
- `HeadingContainer`\<[`RichTextBuilder`](RichTextBuilder.md)\>
- `HorizontalRuleContainer`\<[`RichTextBuilder`](RichTextBuilder.md)\>
- `BlockQuoteContainer`\<[`RichTextBuilder`](RichTextBuilder.md)\>
- `CodeBlockContainer`\<[`RichTextBuilder`](RichTextBuilder.md)\>
- `EmbedContainer`\<[`RichTextBuilder`](RichTextBuilder.md)\>
- `ListContainer`\<[`RichTextBuilder`](RichTextBuilder.md)\>
- `TableContainer`\<[`RichTextBuilder`](RichTextBuilder.md)\>
- `ImageContainer`\<[`RichTextBuilder`](RichTextBuilder.md)\>
- `VideoContainer`\<[`RichTextBuilder`](RichTextBuilder.md)\>

## Table of contents

### Constructors

- [constructor](RichTextBuilder.md#constructor)

### Methods

- [animatedImage](RichTextBuilder.md#animatedimage)
- [blockQuote](RichTextBuilder.md#blockquote)
- [build](RichTextBuilder.md#build)
- [codeBlock](RichTextBuilder.md#codeblock)
- [embed](RichTextBuilder.md#embed)
- [heading](RichTextBuilder.md#heading)
- [horizontalRule](RichTextBuilder.md#horizontalrule)
- [image](RichTextBuilder.md#image)
- [list](RichTextBuilder.md#list)
- [paragraph](RichTextBuilder.md#paragraph)
- [table](RichTextBuilder.md#table)
- [video](RichTextBuilder.md#video)

## Constructors

### <a id="constructor" name="constructor"></a> constructor

• **new RichTextBuilder**(): [`RichTextBuilder`](RichTextBuilder.md)

#### Returns

[`RichTextBuilder`](RichTextBuilder.md)

## Methods

### <a id="animatedimage" name="animatedimage"></a> animatedImage

▸ **animatedImage**(`opts`): [`RichTextBuilder`](RichTextBuilder.md)

#### Parameters

| Name   | Type           |
| :----- | :------------- |
| `opts` | `MediaOptions` |

#### Returns

[`RichTextBuilder`](RichTextBuilder.md)

#### Implementation of

ImageContainer.animatedImage

---

### <a id="blockquote" name="blockquote"></a> blockQuote

▸ **blockQuote**(`opts`, `cb`): [`RichTextBuilder`](RichTextBuilder.md)

#### Parameters

| Name   | Type                                          |
| :----- | :-------------------------------------------- |
| `opts` | `BlockQuoteOptions`                           |
| `cb`   | (`blockQuote`: `BlockQuoteContext`) => `void` |

#### Returns

[`RichTextBuilder`](RichTextBuilder.md)

#### Implementation of

BlockQuoteContainer.blockQuote

---

### <a id="build" name="build"></a> build

▸ **build**(): `string`

Serializes the document to a JSON string

#### Returns

`string`

---

### <a id="codeblock" name="codeblock"></a> codeBlock

▸ **codeBlock**(`opts`, `cb`): [`RichTextBuilder`](RichTextBuilder.md)

#### Parameters

| Name   | Type                                        |
| :----- | :------------------------------------------ |
| `opts` | `CodeBlockOptions`                          |
| `cb`   | (`codeBlock`: `CodeBlockContext`) => `void` |

#### Returns

[`RichTextBuilder`](RichTextBuilder.md)

#### Implementation of

CodeBlockContainer.codeBlock

---

### <a id="embed" name="embed"></a> embed

▸ **embed**(`_opts`): [`RichTextBuilder`](RichTextBuilder.md)

#### Parameters

| Name    | Type           |
| :------ | :------------- |
| `_opts` | `EmbedOptions` |

#### Returns

[`RichTextBuilder`](RichTextBuilder.md)

#### Implementation of

EmbedContainer.embed

---

### <a id="heading" name="heading"></a> heading

▸ **heading**(`opts`, `cb`): [`RichTextBuilder`](RichTextBuilder.md)

#### Parameters

| Name   | Type                                    |
| :----- | :-------------------------------------- |
| `opts` | `HeadingOptions`                        |
| `cb`   | (`heading`: `HeadingContext`) => `void` |

#### Returns

[`RichTextBuilder`](RichTextBuilder.md)

#### Implementation of

HeadingContainer.heading

---

### <a id="horizontalrule" name="horizontalrule"></a> horizontalRule

▸ **horizontalRule**(): [`RichTextBuilder`](RichTextBuilder.md)

#### Returns

[`RichTextBuilder`](RichTextBuilder.md)

#### Implementation of

HorizontalRuleContainer.horizontalRule

---

### <a id="image" name="image"></a> image

▸ **image**(`opts`): [`RichTextBuilder`](RichTextBuilder.md)

#### Parameters

| Name   | Type           |
| :----- | :------------- |
| `opts` | `MediaOptions` |

#### Returns

[`RichTextBuilder`](RichTextBuilder.md)

#### Implementation of

ImageContainer.image

---

### <a id="list" name="list"></a> list

▸ **list**(`opts`, `cb`): [`RichTextBuilder`](RichTextBuilder.md)

#### Parameters

| Name   | Type                              |
| :----- | :-------------------------------- |
| `opts` | `ListOptions`                     |
| `cb`   | (`list`: `ListContext`) => `void` |

#### Returns

[`RichTextBuilder`](RichTextBuilder.md)

#### Implementation of

ListContainer.list

---

### <a id="paragraph" name="paragraph"></a> paragraph

▸ **paragraph**(`cb`): [`RichTextBuilder`](RichTextBuilder.md)

#### Parameters

| Name | Type                                        |
| :--- | :------------------------------------------ |
| `cb` | (`paragraph`: `ParagraphContext`) => `void` |

#### Returns

[`RichTextBuilder`](RichTextBuilder.md)

#### Implementation of

ParagraphContainer.paragraph

---

### <a id="table" name="table"></a> table

▸ **table**(`cb`): [`RichTextBuilder`](RichTextBuilder.md)

#### Parameters

| Name | Type                                |
| :--- | :---------------------------------- |
| `cb` | (`table`: `TableContext`) => `void` |

#### Returns

[`RichTextBuilder`](RichTextBuilder.md)

#### Implementation of

TableContainer.table

---

### <a id="video" name="video"></a> video

▸ **video**(`opts`): [`RichTextBuilder`](RichTextBuilder.md)

#### Parameters

| Name   | Type           |
| :----- | :------------- |
| `opts` | `VideoOptions` |

#### Returns

[`RichTextBuilder`](RichTextBuilder.md)

#### Implementation of

VideoContainer.video
