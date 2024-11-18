# Namespace: Blocks

[Devvit](Devvit.md).Blocks

## Table of contents

### Interfaces

- [IntrinsicElements](../interfaces/Devvit.Blocks.IntrinsicElements.md)

### Type Aliases

- [ActionHandlers](Devvit.Blocks.md#actionhandlers)
- [Actionable](Devvit.Blocks.md#actionable)
- [Alignment](Devvit.Blocks.md#alignment)
- [AvatarBackground](Devvit.Blocks.md#avatarbackground)
- [AvatarFacing](Devvit.Blocks.md#avatarfacing)
- [AvatarProps](Devvit.Blocks.md#avatarprops)
- [AvatarSize](Devvit.Blocks.md#avatarsize)
- [BaseProps](Devvit.Blocks.md#baseprops)
- [ButtonAppearance](Devvit.Blocks.md#buttonappearance)
- [ButtonProps](Devvit.Blocks.md#buttonprops)
- [ButtonSize](Devvit.Blocks.md#buttonsize)
- [ColorString](Devvit.Blocks.md#colorstring)
- [ContainerBorderWidth](Devvit.Blocks.md#containerborderwidth)
- [ContainerCornerRadius](Devvit.Blocks.md#containercornerradius)
- [ContainerGap](Devvit.Blocks.md#containergap)
- [ContainerPadding](Devvit.Blocks.md#containerpadding)
- [HasElementChildren](Devvit.Blocks.md#haselementchildren)
- [HasStringChildren](Devvit.Blocks.md#hasstringchildren)
- [HorizontalAlignment](Devvit.Blocks.md#horizontalalignment)
- [IconProps](Devvit.Blocks.md#iconprops)
- [IconSize](Devvit.Blocks.md#iconsize)
- [ImageProps](Devvit.Blocks.md#imageprops)
- [ImageResizeMode](Devvit.Blocks.md#imageresizemode)
- [IntrinsicElementsType](Devvit.Blocks.md#intrinsicelementstype)
- [OnPressEventHandler](Devvit.Blocks.md#onpresseventhandler)
- [OnWebViewEventHandler](Devvit.Blocks.md#onwebvieweventhandler)
- [RootHeight](Devvit.Blocks.md#rootheight)
- [RootProps](Devvit.Blocks.md#rootprops)
- [SizePercent](Devvit.Blocks.md#sizepercent)
- [SizePixels](Devvit.Blocks.md#sizepixels)
- [SizeString](Devvit.Blocks.md#sizestring)
- [SpacerProps](Devvit.Blocks.md#spacerprops)
- [SpacerShape](Devvit.Blocks.md#spacershape)
- [SpacerSize](Devvit.Blocks.md#spacersize)
- [StackProps](Devvit.Blocks.md#stackprops)
- [TextOutline](Devvit.Blocks.md#textoutline)
- [TextOverflow](Devvit.Blocks.md#textoverflow)
- [TextProps](Devvit.Blocks.md#textprops)
- [TextSize](Devvit.Blocks.md#textsize)
- [TextStyle](Devvit.Blocks.md#textstyle)
- [TextWeight](Devvit.Blocks.md#textweight)
- [Thickness](Devvit.Blocks.md#thickness)
- [VerticalAlignment](Devvit.Blocks.md#verticalalignment)
- [WebViewActionable](Devvit.Blocks.md#webviewactionable)
- [WebViewProps](Devvit.Blocks.md#webviewprops)

## Type Aliases

### <a id="actionhandlers" name="actionhandlers"></a> ActionHandlers

Ƭ **ActionHandlers**: keyof [`Actionable`](Devvit.Blocks.md#actionable) & [`WebViewActionable`](Devvit.Blocks.md#webviewactionable)

---

### <a id="actionable" name="actionable"></a> Actionable

Ƭ **Actionable**: `Object`

#### Type declaration

| Name       | Type                                                          |
| :--------- | :------------------------------------------------------------ |
| `onPress?` | [`OnPressEventHandler`](Devvit.Blocks.md#onpresseventhandler) |

---

### <a id="alignment" name="alignment"></a> Alignment

Ƭ **Alignment**: \`$\{VerticalAlignment}\` \| \`$\{HorizontalAlignment}\` \| \`$\{VerticalAlignment} $\{HorizontalAlignment}\` \| \`$\{HorizontalAlignment} $\{VerticalAlignment}\`

---

### <a id="avatarbackground" name="avatarbackground"></a> AvatarBackground

Ƭ **AvatarBackground**: `"light"` \| `"dark"`

---

### <a id="avatarfacing" name="avatarfacing"></a> AvatarFacing

Ƭ **AvatarFacing**: `"left"` \| `"right"`

---

### <a id="avatarprops" name="avatarprops"></a> AvatarProps

Ƭ **AvatarProps**: [`BaseProps`](Devvit.Blocks.md#baseprops) & [`Actionable`](Devvit.Blocks.md#actionable) & \{ `background?`: [`AvatarBackground`](Devvit.Blocks.md#avatarbackground) ; `facing?`: [`AvatarFacing`](Devvit.Blocks.md#avatarfacing) ; `size?`: [`AvatarSize`](Devvit.Blocks.md#avatarsize) ; `thingId`: `string` }

---

### <a id="avatarsize" name="avatarsize"></a> AvatarSize

Ƭ **AvatarSize**: `"xxsmall"` \| `"xsmall"` \| `"small"` \| `"medium"` \| `"large"` \| `"xlarge"` \| `"xxlarge"` \| `"xxxlarge"`

---

### <a id="baseprops" name="baseprops"></a> BaseProps

Ƭ **BaseProps**: `Object`

#### Type declaration

| Name         | Type                                        | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| :----------- | :------------------------------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `grow?`      | `boolean`                                   | -                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `height?`    | [`SizeString`](Devvit.Blocks.md#sizestring) | -                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `id?`        | `string`                                    | This optional field provides a unique identifier for the element. This is useful for ensuring re-use of elements across renders. See the `key` field for more information. Unlike key, id is global. You cannot have two elements with the same id in the same tree.                                                                                                                                                                                                                                                                                                                                                  |
| `key?`       | `string`                                    | This optional field provides some efficiencies around re-ordering elements in a list. Rather Than re-rendering the entire list, the client can use the key to determine if the element has changed. In the example below, if a and b were swapped, the client would know to reuse the existing elements from b, rather than re-creating an expensive tree of elements. Unlike id, key is local to the parent element. This means that the same key can be used in different parts of the tree without conflict. <hstack> <text key="a">hi world</text> <hstack key="b">...deeply nested content...</hstack> </hstack> |
| `maxHeight?` | [`SizeString`](Devvit.Blocks.md#sizestring) | -                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `maxWidth?`  | [`SizeString`](Devvit.Blocks.md#sizestring) | -                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `minHeight?` | [`SizeString`](Devvit.Blocks.md#sizestring) | -                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `minWidth?`  | [`SizeString`](Devvit.Blocks.md#sizestring) | -                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `width?`     | [`SizeString`](Devvit.Blocks.md#sizestring) | -                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |

---

### <a id="buttonappearance" name="buttonappearance"></a> ButtonAppearance

Ƭ **ButtonAppearance**: `"secondary"` \| `"primary"` \| `"plain"` \| `"bordered"` \| `"media"` \| `"destructive"` \| `"caution"` \| `"success"`

---

### <a id="buttonprops" name="buttonprops"></a> ButtonProps

Ƭ **ButtonProps**: [`BaseProps`](Devvit.Blocks.md#baseprops) & [`HasStringChildren`](Devvit.Blocks.md#hasstringchildren) & [`Actionable`](Devvit.Blocks.md#actionable) & \{ `appearance?`: [`ButtonAppearance`](Devvit.Blocks.md#buttonappearance) ; `darkTextColor?`: [`ColorString`](Devvit.Blocks.md#colorstring) ; `disabled?`: `boolean` ; `icon?`: [`IconName`](../README.md#iconname) ; `lightTextColor?`: [`ColorString`](Devvit.Blocks.md#colorstring) ; `size?`: [`ButtonSize`](Devvit.Blocks.md#buttonsize) ; `textColor?`: [`ColorString`](Devvit.Blocks.md#colorstring) }

---

### <a id="buttonsize" name="buttonsize"></a> ButtonSize

Ƭ **ButtonSize**: `"small"` \| `"medium"` \| `"large"`

Affects the button height.
small = 32px;
medium = 40px;
large = 48px;

---

### <a id="colorstring" name="colorstring"></a> ColorString

Ƭ **ColorString**: `string`

---

### <a id="containerborderwidth" name="containerborderwidth"></a> ContainerBorderWidth

Ƭ **ContainerBorderWidth**: [`Thickness`](Devvit.Blocks.md#thickness)

thin = 1px;
thick = 2px;

---

### <a id="containercornerradius" name="containercornerradius"></a> ContainerCornerRadius

Ƭ **ContainerCornerRadius**: `"none"` \| `"small"` \| `"medium"` \| `"large"` \| `"full"`

small = 8px;
medium = 16px;
large = 24px;

---

### <a id="containergap" name="containergap"></a> ContainerGap

Ƭ **ContainerGap**: `"none"` \| `"small"` \| `"medium"` \| `"large"`

small = 8px;
medium = 16px;
large = 32px;

---

### <a id="containerpadding" name="containerpadding"></a> ContainerPadding

Ƭ **ContainerPadding**: `"none"` \| `"xsmall"` \| `"small"` \| `"medium"` \| `"large"`

xsmall = 4px;
small = 8px;
medium = 16px;
large = 32px;

---

### <a id="haselementchildren" name="haselementchildren"></a> HasElementChildren

Ƭ **HasElementChildren**: `Object`

#### Type declaration

| Name        | Type                                           |
| :---------- | :--------------------------------------------- |
| `children?` | [`ElementChildren`](Devvit.md#elementchildren) |

---

### <a id="hasstringchildren" name="hasstringchildren"></a> HasStringChildren

Ƭ **HasStringChildren**: `Object`

#### Type declaration

| Name        | Type                                         |
| :---------- | :------------------------------------------- |
| `children?` | [`StringChildren`](Devvit.md#stringchildren) |

---

### <a id="horizontalalignment" name="horizontalalignment"></a> HorizontalAlignment

Ƭ **HorizontalAlignment**: `"start"` \| `"center"` \| `"end"`

---

### <a id="iconprops" name="iconprops"></a> IconProps

Ƭ **IconProps**: [`BaseProps`](Devvit.Blocks.md#baseprops) & [`HasStringChildren`](Devvit.Blocks.md#hasstringchildren) & [`Actionable`](Devvit.Blocks.md#actionable) & \{ `color?`: [`ColorString`](Devvit.Blocks.md#colorstring) ; `darkColor?`: [`ColorString`](Devvit.Blocks.md#colorstring) ; `lightColor?`: [`ColorString`](Devvit.Blocks.md#colorstring) ; `name`: [`IconName`](../README.md#iconname) ; `size?`: [`IconSize`](Devvit.Blocks.md#iconsize) }

---

### <a id="iconsize" name="iconsize"></a> IconSize

Ƭ **IconSize**: `"xsmall"` \| `"small"` \| `"medium"` \| `"large"`

xsmall = 12px;
small = 16px;
medium = 20px;
large = 24px;

---

### <a id="imageprops" name="imageprops"></a> ImageProps

Ƭ **ImageProps**: [`BaseProps`](Devvit.Blocks.md#baseprops) & [`Actionable`](Devvit.Blocks.md#actionable) & \{ `description?`: `string` ; `imageHeight`: [`SizePixels`](Devvit.Blocks.md#sizepixels) \| `number` ; `imageWidth`: [`SizePixels`](Devvit.Blocks.md#sizepixels) \| `number` ; `resizeMode?`: [`ImageResizeMode`](Devvit.Blocks.md#imageresizemode) ; `url`: `string` }

---

### <a id="imageresizemode" name="imageresizemode"></a> ImageResizeMode

Ƭ **ImageResizeMode**: `"none"` \| `"fit"` \| `"fill"` \| `"cover"` \| `"scale-down"`

---

### <a id="intrinsicelementstype" name="intrinsicelementstype"></a> IntrinsicElementsType

Ƭ **IntrinsicElementsType**: keyof [`IntrinsicElements`](../interfaces/Devvit.Blocks.IntrinsicElements.md)

---

### <a id="onpresseventhandler" name="onpresseventhandler"></a> OnPressEventHandler

Ƭ **OnPressEventHandler**: (`data`: [`JSONObject`](../README.md#jsonobject)) => `void` \| `Promise`\<`void`\>

#### Type declaration

▸ (`data`): `void` \| `Promise`\<`void`\>

##### Parameters

| Name   | Type                                    |
| :----- | :-------------------------------------- |
| `data` | [`JSONObject`](../README.md#jsonobject) |

##### Returns

`void` \| `Promise`\<`void`\>

---

### <a id="onwebvieweventhandler" name="onwebvieweventhandler"></a> OnWebViewEventHandler

Ƭ **OnWebViewEventHandler**: \<T\>(`message`: `T`) => `void` \| `Promise`\<`void`\>

#### Type declaration

▸ \<`T`\>(`message`): `void` \| `Promise`\<`void`\>

##### Type parameters

| Name | Type                                          |
| :--- | :-------------------------------------------- |
| `T`  | extends [`JSONValue`](../README.md#jsonvalue) |

##### Parameters

| Name      | Type |
| :-------- | :--- |
| `message` | `T`  |

##### Returns

`void` \| `Promise`\<`void`\>

---

### <a id="rootheight" name="rootheight"></a> RootHeight

Ƭ **RootHeight**: `"regular"` \| `"tall"`

---

### <a id="rootprops" name="rootprops"></a> RootProps

Ƭ **RootProps**: [`HasElementChildren`](Devvit.Blocks.md#haselementchildren) & \{ `height?`: [`RootHeight`](Devvit.Blocks.md#rootheight) }

---

### <a id="sizepercent" name="sizepercent"></a> SizePercent

Ƭ **SizePercent**: \`$\{number}%\`

---

### <a id="sizepixels" name="sizepixels"></a> SizePixels

Ƭ **SizePixels**: \`$\{number}px\`

---

### <a id="sizestring" name="sizestring"></a> SizeString

Ƭ **SizeString**: [`SizePixels`](Devvit.Blocks.md#sizepixels) \| [`SizePercent`](Devvit.Blocks.md#sizepercent) \| `number`

---

### <a id="spacerprops" name="spacerprops"></a> SpacerProps

Ƭ **SpacerProps**: [`BaseProps`](Devvit.Blocks.md#baseprops) & \{ `shape?`: [`SpacerShape`](Devvit.Blocks.md#spacershape) ; `size?`: [`SpacerSize`](Devvit.Blocks.md#spacersize) }

---

### <a id="spacershape" name="spacershape"></a> SpacerShape

Ƭ **SpacerShape**: `"invisible"` \| `"thin"` \| `"square"`

---

### <a id="spacersize" name="spacersize"></a> SpacerSize

Ƭ **SpacerSize**: `"xsmall"` \| `"small"` \| `"medium"` \| `"large"`

xsmall = 4px;
small = 8px;
medium = 16px;
large = 32px;

---

### <a id="stackprops" name="stackprops"></a> StackProps

Ƭ **StackProps**: [`BaseProps`](Devvit.Blocks.md#baseprops) & [`HasElementChildren`](Devvit.Blocks.md#haselementchildren) & [`Actionable`](Devvit.Blocks.md#actionable) & \{ `alignment?`: [`Alignment`](Devvit.Blocks.md#alignment) ; `backgroundColor?`: [`ColorString`](Devvit.Blocks.md#colorstring) ; `border?`: [`ContainerBorderWidth`](Devvit.Blocks.md#containerborderwidth) ; `borderColor?`: [`ColorString`](Devvit.Blocks.md#colorstring) ; `cornerRadius?`: [`ContainerCornerRadius`](Devvit.Blocks.md#containercornerradius) ; `darkBackgroundColor?`: [`ColorString`](Devvit.Blocks.md#colorstring) ; `darkBorderColor?`: [`ColorString`](Devvit.Blocks.md#colorstring) ; `gap?`: [`ContainerGap`](Devvit.Blocks.md#containergap) ; `lightBackgroundColor?`: [`ColorString`](Devvit.Blocks.md#colorstring) ; `lightBorderColor?`: [`ColorString`](Devvit.Blocks.md#colorstring) ; `padding?`: [`ContainerPadding`](Devvit.Blocks.md#containerpadding) ; `reverse?`: `boolean` }

---

### <a id="textoutline" name="textoutline"></a> TextOutline

Ƭ **TextOutline**: [`Thickness`](Devvit.Blocks.md#thickness)

thin = 1px;
thick = 2px;

---

### <a id="textoverflow" name="textoverflow"></a> TextOverflow

Ƭ **TextOverflow**: `"clip"` \| `"ellipsis"`

---

### <a id="textprops" name="textprops"></a> TextProps

Ƭ **TextProps**: [`BaseProps`](Devvit.Blocks.md#baseprops) & [`HasStringChildren`](Devvit.Blocks.md#hasstringchildren) & [`Actionable`](Devvit.Blocks.md#actionable) & \{ `alignment?`: [`Alignment`](Devvit.Blocks.md#alignment) ; `color?`: [`ColorString`](Devvit.Blocks.md#colorstring) ; `darkColor?`: [`ColorString`](Devvit.Blocks.md#colorstring) ; `lightColor?`: [`ColorString`](Devvit.Blocks.md#colorstring) ; `outline?`: [`TextOutline`](Devvit.Blocks.md#textoutline) ; `overflow?`: [`TextOverflow`](Devvit.Blocks.md#textoverflow) ; `selectable?`: `boolean` ; `size?`: [`TextSize`](Devvit.Blocks.md#textsize) ; `style?`: [`TextStyle`](Devvit.Blocks.md#textstyle) ; `weight?`: [`TextWeight`](Devvit.Blocks.md#textweight) ; `wrap?`: `boolean` }

---

### <a id="textsize" name="textsize"></a> TextSize

Ƭ **TextSize**: `"xsmall"` \| `"small"` \| `"medium"` \| `"large"` \| `"xlarge"` \| `"xxlarge"`

xsmall = 10px;
small = 12px;
medium = 14px;
large = 16px;
xlarge = 18px;
xxlarge = 24px;

---

### <a id="textstyle" name="textstyle"></a> TextStyle

Ƭ **TextStyle**: `"body"` \| `"metadata"` \| `"heading"`

---

### <a id="textweight" name="textweight"></a> TextWeight

Ƭ **TextWeight**: `"regular"` \| `"bold"`

---

### <a id="thickness" name="thickness"></a> Thickness

Ƭ **Thickness**: `"none"` \| `"thin"` \| `"thick"`

---

### <a id="verticalalignment" name="verticalalignment"></a> VerticalAlignment

Ƭ **VerticalAlignment**: `"top"` \| `"middle"` \| `"bottom"`

---

### <a id="webviewactionable" name="webviewactionable"></a> WebViewActionable

Ƭ **WebViewActionable**: `Object`

#### Type declaration

| Name         | Type                                                              |
| :----------- | :---------------------------------------------------------------- |
| `onMessage?` | [`OnWebViewEventHandler`](Devvit.Blocks.md#onwebvieweventhandler) |

---

### <a id="webviewprops" name="webviewprops"></a> WebViewProps

Ƭ **WebViewProps**: [`BaseProps`](Devvit.Blocks.md#baseprops) & [`WebViewActionable`](Devvit.Blocks.md#webviewactionable) & \{ `state?`: [`JSONObject`](../README.md#jsonobject) ; `url`: `string` }
