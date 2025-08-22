# Overview

Devvit Blocks is a framework that allows you to build apps with Reddit native components. Blocks is optimized for speed and ease of use, but is not recommended for games due to technical constraints and limitations.

## Examples

### [r/WallStreetBets](https://www.reddit.com/r/wallstreetbets)

Wall Street Bets's daily thread tracks stock performance and discussion on r/wallstreetbets. It's able to render in the feed quickly, and refresh automatically as new data is available.

Syllacrostic is a word game built with Devvit Blocks by u/JeffBritches. Note that playing the game also does not trigger a modal or full screen experience, because it is built completely in Devvit Blocks.

## Devvit Blocks vs. Devvit Web

|                                        | Devvit Blocks            | Devvit Web |
| :------------------------------------- | :----------------------- | :--------- |
| **Interactive In-feed**                | ✅                       | ❌         |
| **Built-in Reddit Design System**      | ✅                       | ❌         |
| **Write once, run on iOS/Android/Web** | ✅                       | ✅         |
| **Full Screen / Focus Mode**           | ❌                       | ✅         |
| **Sounds**                             | ❌                       | ✅         |
| **3D Graphics**                        | ❌                       | ✅         |
| **Animations**                         | Limited to Animated GIFs | ✅         |
| **Standard Web Development Stack**     | ❌                       | ✅         |

## Working together

It's important to notice that Devvit Blocks and Devvit Web are not mutually exclusive. You can use Devvit Blocks to create an interactive preview post, and trigger a Devvit Web modal / full screen experience from a button click inside of the interactive post. Some examples of apps that mix both Devvit Web and Devvit Blocks are:

- [r/hightier](https://www.reddit.com/r/hightier) (_by u/mutual_disagreement_)
- [r/FlappyGoose](https://www.reddit.com/r/FlappyGoose) (_by u/thejohhnyr_)
- [r/chessquiz](https://www.reddit.com/r/chessquiz) (_by u/FlyingLaserTurtle_)

## Available blocks

We support the following elements:

### Containers

- **Blocks**
- [**HStack**](../../../blocks/stacks)
- [**VStack**](../../../blocks/stacks)
- [**ZStack**](../../../blocks/stacks)

### Objects

- [**Text**](../../../blocks/text)
- [**Button**](../../../blocks/button)
- [**Spacer**](../../../blocks/spacer)
- [**Image**](../../../blocks/image)
- [**Icon**](../../../blocks/icon)

Further elements (components) may be derived from these blocks, and obey the same rules.

## Sizing

### Paddings and gaps

- We're operating in a [border-box](https://developer.mozilla.org/en-US/docs/Web/CSS/box-sizing) model, where the padding is counted as part of the size of an element.
- Padding is incompressible.
- Gaps are implemented as if we're injecting spacers between all children.

### Units

There are two supported units:

- `px`: device-independent pixels
- `%`: percent of parent container's available content area (i.e. subtracting the parent's padding and gaps)

### Intrinsic size

All elements have an _intrinsic size_. This is the size that they would be if there were no sizing modifiers applied to them.

- **HStack**: Sum of the intrinsic widths of the children &times; the max of the intrinsic heights of the children (+ gaps and padding)
- **VStack**: Max of the intrinsic widths of the children &times; the sum of the intrinsic heights of the children (+ gaps and padding)
- **ZStack**: Max of the intrinsic sizes of the children (+ padding)
- **Text**: Size of the text without wrapping or truncation
- **Button**: Size of the text without wrapping or truncation (+ padding)
- **Spacer**: Size in pixels, as specified
- **Image**: imageWidth &times; imageHeight

This size provides a baseline, which can be modified by attributes. There are a few sizing attributes:

- `width` / `height`
- `minWidth` / `minHeight`
- `maxWidth` / `maxHeight`
- `grow` (operates in the _current direction_).

:::note
Setting both `width` and `grow` simultaneously is not recommended, because then `grow` would become a no-op (overridden by `width`).
:::

### Preferred size

The preferred size is calculated based on the intrinsic size and the modifier attributes. The modifiers can conflict, in which case the precedence order is:

`(most important) minWidth > maxWidth > width > aspect-ratio > grow > intrinsic width (least important)`

Here, `grow` attempts to set `width="100%"`. Unlike actually setting `width="100%"`, `grow` can be flexibly adjusted later. Examples:

- `<text width="50px" grow />` will always have a preferred size of 50px. (width overrides `grow`)
- `<text minWidth="50px" grow />` will always take at least 50px, and will attempt to consume the available `width`.

### Adjusted size

Grow elements are flexible. Whenever the full width (or height) of a parent element is not fully utilized, a grow element will expand to fit the parent element, assuming that the other constraints permit. Grow is prioritized lower than the other sizing attributes, e.g. an element will never grow beyond its maxWidth.

### Direction

All elements inherit a direction for the purposes of growing. Things only grow in one direction at a time.

| Element                          | Self Direction | Child Direction |
| -------------------------------- | -------------- | --------------- |
| Blocks                           | N/A            | Vertical        |
| [HStack](../../../blocks/stacks) | Inherit        | Horizontal      |
| [VStack](../../../blocks/stacks) | Inherit        | Vertical        |
| [ZStack](../../../blocks/stacks) | Inherit        | Inherit         |
| [Text](../../../blocks/text)     | Horizontal     | N/A             |
| [Button](../../../blocks/button) | Horizontal     | N/A             |
| [Spacer](../../../blocks/spacer) | Inherit        | N/A             |
| [Image](../../../blocks/image)   | Inherit        | N/A             |

### Overflow

All containers clip overflown content.
