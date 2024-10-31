# Namespace: Devvit

## Table of contents

### Namespaces

- [Blocks](Devvit.Blocks.md)

### Type Aliases

- [BlockComponent](Devvit.md#blockcomponent)
- [BlockComponentProps](Devvit.md#blockcomponentprops)
- [Context](Devvit.md#context)
- [CustomPostComponent](Devvit.md#custompostcomponent)
- [ElementChildren](Devvit.md#elementchildren)
- [Fragment](Devvit.md#fragment)
- [StringChild](Devvit.md#stringchild)
- [StringChildren](Devvit.md#stringchildren)

### Functions

- [createElement](Devvit.md#createelement)

## Type Aliases

### <a id="blockcomponent" name="blockcomponent"></a> BlockComponent

Ƭ **BlockComponent**\<`P`\>: (`props`: [`BlockComponentProps`](Devvit.md#blockcomponentprops)\<`P`\>, `context`: [`Context`](Devvit.md#context)) => `JSX.Element`

#### Type parameters

| Name | Type                             |
| :--- | :------------------------------- |
| `P`  | \{ `[key: string]`: `unknown`; } |

#### Type declaration

▸ (`props`, `context`): `JSX.Element`

##### Parameters

| Name      | Type                                                          |
| :-------- | :------------------------------------------------------------ |
| `props`   | [`BlockComponentProps`](Devvit.md#blockcomponentprops)\<`P`\> |
| `context` | [`Context`](Devvit.md#context)                                |

##### Returns

`JSX.Element`

---

### <a id="blockcomponentprops" name="blockcomponentprops"></a> BlockComponentProps

Ƭ **BlockComponentProps**\<`P`\>: `P` & \{ `children?`: `JSX.Children` }

#### Type parameters

| Name | Type                             |
| :--- | :------------------------------- |
| `P`  | \{ `[key: string]`: `unknown`; } |

---

### <a id="context" name="context"></a> Context

Ƭ **Context**: [`ContextAPIClients`](../README.md#contextapiclients) & [`BaseContext`](../README.md#basecontext)

The current app context of the event or render.

---

### <a id="custompostcomponent" name="custompostcomponent"></a> CustomPostComponent

Ƭ **CustomPostComponent**: (`context`: [`Context`](Devvit.md#context)) => `JSX.Element`

#### Type declaration

▸ (`context`): `JSX.Element`

##### Parameters

| Name      | Type                           |
| :-------- | :----------------------------- |
| `context` | [`Context`](Devvit.md#context) |

##### Returns

`JSX.Element`

---

### <a id="elementchildren" name="elementchildren"></a> ElementChildren

Ƭ **ElementChildren**: `JSX.Element` \| `JSX.Children` \| `undefined`

---

### <a id="fragment" name="fragment"></a> Fragment

Ƭ **Fragment**: `JSX.Fragment`

---

### <a id="stringchild" name="stringchild"></a> StringChild

Ƭ **StringChild**: [`Fragment`](Devvit.md#fragment) \| `string` \| `number`

---

### <a id="stringchildren" name="stringchildren"></a> StringChildren

Ƭ **StringChildren**: [`StringChild`](Devvit.md#stringchild) \| ([`StringChild`](Devvit.md#stringchild) \| [`StringChild`](Devvit.md#stringchild)[])[] \| `undefined`

## Functions

### <a id="createelement" name="createelement"></a> createElement

▸ **createElement**(`type`, `props`, `...children`): [`BlockElement`](../README.md#blockelement)

#### Parameters

| Name          | Type                                                                          |
| :------------ | :---------------------------------------------------------------------------- |
| `type`        | keyof [`IntrinsicElements`](../interfaces/Devvit.Blocks.IntrinsicElements.md) |
| `props`       | `undefined` \| \{ `[key: string]`: `unknown`; }                               |
| `...children` | `Children`[]                                                                  |

#### Returns

[`BlockElement`](../README.md#blockelement)
