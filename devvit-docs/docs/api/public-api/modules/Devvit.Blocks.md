# Namespace: Blocks

[Devvit](Devvit.md).Blocks

## Table of contents

### Interfaces

- [IntrinsicElements](../interfaces/Devvit.Blocks.IntrinsicElements.md)

### Type Aliases

- [Actionable](Devvit.Blocks.md#actionable)
- [Alignment](Devvit.Blocks.md#alignment)
- [AnimationDirection](Devvit.Blocks.md#animationdirection)
- [AnimationLoop](Devvit.Blocks.md#animationloop)
- [AnimationProps](Devvit.Blocks.md#animationprops)
- [AnimationType](Devvit.Blocks.md#animationtype)
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
- [FullSnooProps](Devvit.Blocks.md#fullsnooprops)
- [FullSnooSize](Devvit.Blocks.md#fullsnoosize)
- [HasElementChildren](Devvit.Blocks.md#haselementchildren)
- [HasStringChildren](Devvit.Blocks.md#hasstringchildren)
- [HorizontalAlignment](Devvit.Blocks.md#horizontalalignment)
- [IconProps](Devvit.Blocks.md#iconprops)
- [IconSize](Devvit.Blocks.md#iconsize)
- [ImageProps](Devvit.Blocks.md#imageprops)
- [ImageResizeMode](Devvit.Blocks.md#imageresizemode)
- [IntrinsicAttributes](Devvit.Blocks.md#intrinsicattributes)
- [IntrinsicElementsType](Devvit.Blocks.md#intrinsicelementstype)
- [OnPressEvent](Devvit.Blocks.md#onpressevent)
- [OnPressEventHandler](Devvit.Blocks.md#onpresseventhandler)
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
- [WebViewProps](Devvit.Blocks.md#webviewprops)

## Type Aliases

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

### <a id="animationdirection" name="animationdirection"></a> AnimationDirection

Ƭ **AnimationDirection**: `"forward"` \| `"backward"`

---

### <a id="animationloop" name="animationloop"></a> AnimationLoop

Ƭ **AnimationLoop**: `"repeat"` \| `"bounce"`

---

### <a id="animationprops" name="animationprops"></a> AnimationProps

Ƭ **AnimationProps**: [`BaseProps`](Devvit.Blocks.md#baseprops) & [`Actionable`](Devvit.Blocks.md#actionable) & \{ `autoplay?`: `boolean` ; `direction?`: [`AnimationDirection`](Devvit.Blocks.md#animationdirection) ; `imageHeight`: [`SizePixels`](Devvit.Blocks.md#sizepixels) \| `number` ; `imageWidth`: [`SizePixels`](Devvit.Blocks.md#sizepixels) \| `number` ; `loop?`: `boolean` ; `loopMode?`: [`AnimationLoop`](Devvit.Blocks.md#animationloop) ; `speed?`: `number` ; `type?`: [`AnimationType`](Devvit.Blocks.md#animationtype) ; `url`: `string` }

---

### <a id="animationtype" name="animationtype"></a> AnimationType

Ƭ **AnimationType**: `"lottie"`

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

| Name         | Type                                        |
| :----------- | :------------------------------------------ |
| `grow?`      | `boolean`                                   |
| `height?`    | [`SizeString`](Devvit.Blocks.md#sizestring) |
| `maxHeight?` | [`SizeString`](Devvit.Blocks.md#sizestring) |
| `maxWidth?`  | [`SizeString`](Devvit.Blocks.md#sizestring) |
| `minHeight?` | [`SizeString`](Devvit.Blocks.md#sizestring) |
| `minWidth?`  | [`SizeString`](Devvit.Blocks.md#sizestring) |
| `width?`     | [`SizeString`](Devvit.Blocks.md#sizestring) |

---

### <a id="buttonappearance" name="buttonappearance"></a> ButtonAppearance

Ƭ **ButtonAppearance**: `"secondary"` \| `"primary"` \| `"plain"` \| `"bordered"` \| `"media"` \| `"destructive"` \| `"caution"` \| `"success"`

---

### <a id="buttonprops" name="buttonprops"></a> ButtonProps

Ƭ **ButtonProps**: [`BaseProps`](Devvit.Blocks.md#baseprops) & [`HasStringChildren`](Devvit.Blocks.md#hasstringchildren) & [`Actionable`](Devvit.Blocks.md#actionable) & \{ `appearance?`: [`ButtonAppearance`](Devvit.Blocks.md#buttonappearance) ; `darkTextColor?`: [`ColorString`](Devvit.Blocks.md#colorstring) ; `disabled?`: `boolean` ; `icon?`: [`IconName`](../README.md#iconname) ; `lightTextColor?`: [`ColorString`](Devvit.Blocks.md#colorstring) ; `onClick?`: `string` ; `size?`: [`ButtonSize`](Devvit.Blocks.md#buttonsize) ; `textColor?`: [`ColorString`](Devvit.Blocks.md#colorstring) }

---

### <a id="buttonsize" name="buttonsize"></a> ButtonSize

Ƭ **ButtonSize**: `"small"` \| `"medium"` \| `"large"`

---

### <a id="colorstring" name="colorstring"></a> ColorString

Ƭ **ColorString**: `string`

---

### <a id="containerborderwidth" name="containerborderwidth"></a> ContainerBorderWidth

Ƭ **ContainerBorderWidth**: [`Thickness`](Devvit.Blocks.md#thickness)

---

### <a id="containercornerradius" name="containercornerradius"></a> ContainerCornerRadius

Ƭ **ContainerCornerRadius**: `"none"` \| `"small"` \| `"medium"` \| `"large"` \| `"full"`

---

### <a id="containergap" name="containergap"></a> ContainerGap

Ƭ **ContainerGap**: `"none"` \| `"small"` \| `"medium"` \| `"large"`

---

### <a id="containerpadding" name="containerpadding"></a> ContainerPadding

Ƭ **ContainerPadding**: `"none"` \| `"xsmall"` \| `"small"` \| `"medium"` \| `"large"`

---

### <a id="fullsnooprops" name="fullsnooprops"></a> FullSnooProps

Ƭ **FullSnooProps**: [`BaseProps`](Devvit.Blocks.md#baseprops) & [`Actionable`](Devvit.Blocks.md#actionable) & \{ `facing?`: [`AvatarFacing`](Devvit.Blocks.md#avatarfacing) ; `size?`: [`FullSnooSize`](Devvit.Blocks.md#fullsnoosize) ; `userId`: `string` }

---

### <a id="fullsnoosize" name="fullsnoosize"></a> FullSnooSize

Ƭ **FullSnooSize**: `"xsmall"` \| `"small"` \| `"medium"` \| `"large"` \| `"xlarge"` \| `"xxlarge"`

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

---

### <a id="imageprops" name="imageprops"></a> ImageProps

Ƭ **ImageProps**: [`BaseProps`](Devvit.Blocks.md#baseprops) & [`Actionable`](Devvit.Blocks.md#actionable) & \{ `description?`: `string` ; `imageHeight`: [`SizePixels`](Devvit.Blocks.md#sizepixels) \| `number` ; `imageWidth`: [`SizePixels`](Devvit.Blocks.md#sizepixels) \| `number` ; `resizeMode?`: [`ImageResizeMode`](Devvit.Blocks.md#imageresizemode) ; `url`: `string` }

---

### <a id="imageresizemode" name="imageresizemode"></a> ImageResizeMode

Ƭ **ImageResizeMode**: `"none"` \| `"fit"` \| `"fill"` \| `"cover"` \| `"scale-down"`

---

### <a id="intrinsicattributes" name="intrinsicattributes"></a> IntrinsicAttributes

Ƭ **IntrinsicAttributes**: `Object`

#### Type declaration

| Name      | Type     |
| :-------- | :------- |
| `onclick` | `string` |

---

### <a id="intrinsicelementstype" name="intrinsicelementstype"></a> IntrinsicElementsType

Ƭ **IntrinsicElementsType**: keyof [`IntrinsicElements`](../interfaces/Devvit.Blocks.IntrinsicElements.md)

---

### <a id="onpressevent" name="onpressevent"></a> OnPressEvent

Ƭ **OnPressEvent**: `Object`

#### Type declaration

| Name     | Type                        |
| :------- | :-------------------------- |
| `state?` | [`Data`](../README.md#data) |

---

### <a id="onpresseventhandler" name="onpresseventhandler"></a> OnPressEventHandler

Ƭ **OnPressEventHandler**: (`event`: [`OnPressEvent`](Devvit.Blocks.md#onpressevent)) => `void` \| `Promise`\<`void`\>

#### Type declaration

▸ (`event`): `void` \| `Promise`\<`void`\>

##### Parameters

| Name    | Type                                            |
| :------ | :---------------------------------------------- |
| `event` | [`OnPressEvent`](Devvit.Blocks.md#onpressevent) |

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

---

### <a id="stackprops" name="stackprops"></a> StackProps

Ƭ **StackProps**: [`BaseProps`](Devvit.Blocks.md#baseprops) & [`HasElementChildren`](Devvit.Blocks.md#haselementchildren) & [`Actionable`](Devvit.Blocks.md#actionable) & \{ `alignment?`: [`Alignment`](Devvit.Blocks.md#alignment) ; `backgroundColor?`: [`ColorString`](Devvit.Blocks.md#colorstring) ; `border?`: [`ContainerBorderWidth`](Devvit.Blocks.md#containerborderwidth) ; `borderColor?`: [`ColorString`](Devvit.Blocks.md#colorstring) ; `cornerRadius?`: [`ContainerCornerRadius`](Devvit.Blocks.md#containercornerradius) ; `darkBackgroundColor?`: [`ColorString`](Devvit.Blocks.md#colorstring) ; `darkBorderColor?`: [`ColorString`](Devvit.Blocks.md#colorstring) ; `gap?`: [`ContainerGap`](Devvit.Blocks.md#containergap) ; `lightBackgroundColor?`: [`ColorString`](Devvit.Blocks.md#colorstring) ; `lightBorderColor?`: [`ColorString`](Devvit.Blocks.md#colorstring) ; `padding?`: [`ContainerPadding`](Devvit.Blocks.md#containerpadding) ; `reverse?`: `boolean` }

---

### <a id="textoutline" name="textoutline"></a> TextOutline

Ƭ **TextOutline**: [`Thickness`](Devvit.Blocks.md#thickness)

---

### <a id="textoverflow" name="textoverflow"></a> TextOverflow

Ƭ **TextOverflow**: `"clip"` \| `"ellipsis"`

---

### <a id="textprops" name="textprops"></a> TextProps

Ƭ **TextProps**: [`BaseProps`](Devvit.Blocks.md#baseprops) & [`HasStringChildren`](Devvit.Blocks.md#hasstringchildren) & [`Actionable`](Devvit.Blocks.md#actionable) & \{ `alignment?`: [`Alignment`](Devvit.Blocks.md#alignment) ; `color?`: [`ColorString`](Devvit.Blocks.md#colorstring) ; `darkColor?`: [`ColorString`](Devvit.Blocks.md#colorstring) ; `lightColor?`: [`ColorString`](Devvit.Blocks.md#colorstring) ; `onClick?`: `string` ; `outline?`: [`TextOutline`](Devvit.Blocks.md#textoutline) ; `overflow?`: [`TextOverflow`](Devvit.Blocks.md#textoverflow) ; `selectable?`: `boolean` ; `size?`: [`TextSize`](Devvit.Blocks.md#textsize) ; `style?`: [`TextStyle`](Devvit.Blocks.md#textstyle) ; `weight?`: [`TextWeight`](Devvit.Blocks.md#textweight) ; `wrap?`: `boolean` }

---

### <a id="textsize" name="textsize"></a> TextSize

Ƭ **TextSize**: `"xsmall"` \| `"small"` \| `"medium"` \| `"large"` \| `"xlarge"` \| `"xxlarge"`

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

### <a id="webviewprops" name="webviewprops"></a> WebViewProps

Ƭ **WebViewProps**: [`BaseProps`](Devvit.Blocks.md#baseprops) & \{ `url`: `string` }
