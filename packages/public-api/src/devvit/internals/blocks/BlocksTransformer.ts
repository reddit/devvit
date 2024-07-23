import type {
  Block,
  BlockAction,
  BlockAlignment,
  BlockBorder,
  BlockColor,
  BlockConfig,
} from '@devvit/protos';
import {
  BlockActionType,
  BlockAnimationDirection,
  BlockAnimationLoopMode,
  BlockAnimationType,
  BlockAvatarBackground,
  BlockAvatarFacing,
  BlockAvatarSize,
  BlockBorderWidth,
  BlockButtonAppearance,
  BlockButtonSize,
  BlockFullSnooSize,
  BlockGap,
  BlockHorizontalAlignment,
  BlockIconSize,
  BlockImageResizeMode,
  BlockPadding,
  BlockRadius,
  BlockSpacerShape,
  BlockSpacerSize,
  BlockStackDirection,
  BlockTextOutline,
  BlockTextOverflow,
  BlockTextSize,
  BlockTextStyle,
  BlockTextWeight,
  BlockType,
  BlockVerticalAlignment,
} from '@devvit/protos';
import { Devvit } from '../../Devvit.js';
import type { ReifiedBlockElement, ReifiedBlockElementOrLiteral } from './BlocksReconciler.js';
import {
  getHexFromNamedHTMLColor,
  getHexFromRgbaColor,
  getHexFromRPLColor,
  isHexColor,
  isHslColor,
  isNamedHTMLColor,
  isRgbaColor,
  isRPLColor,
} from '../helpers/color.js';
import type { AssetsClient, GetURLOptions } from '../../../apis/AssetsClient/AssetsClient.js';
import type { TransformContext } from './transformContext.js';
import { makeStackDimensionsDetails, ROOT_STACK_TRANSFORM_CONTEXT } from './transformContext.js';
import { makeBlockSizes } from './transformerUtils.js';

type DataSet = Record<string, unknown>;
const DATA_PREFIX = 'data-';

const ACTION_HANDLERS: Set<Devvit.Blocks.ActionHandlers> = new Set(['onPress', 'onMessage']);
const ACTION_TYPES: Map<Devvit.Blocks.ActionHandlers, BlockActionType> = new Map([
  ['onPress', BlockActionType.ACTION_CLICK],
  ['onMessage', BlockActionType.ACTION_WEBVIEW],
]);

export class BlocksTransformer {
  readonly #assetsClient: () => AssetsClient | undefined;

  constructor(getAssetsClient: () => AssetsClient | undefined = () => undefined) {
    this.#assetsClient = getAssetsClient;
  }

  createBlocksElementOrThrow({ type, props, children }: ReifiedBlockElement): Block {
    const block = this.createBlocksElement({ type, props, children }, ROOT_STACK_TRANSFORM_CONTEXT);
    if (!block) {
      throw new Error(`Could not create block of type ${type}`);
    }
    return block;
  }

  createBlocksElement(
    { type, props, children }: ReifiedBlockElement,
    transformContext: TransformContext
  ): Block | undefined {
    switch (type) {
      case 'blocks':
        return this.makeRoot(props, ...children);
      case 'hstack':
        return this.makeHStack(props, transformContext, ...children);
      case 'vstack':
        return this.makeVStack(props, transformContext, ...children);
      case 'zstack':
        return this.makeZStack(props, transformContext, ...children);
      case 'text':
        return this.makeText(props, transformContext, ...children);
      case 'button':
        return this.makeButton(props, transformContext, ...children);
      case 'image':
        return this.makeImage(props as Devvit.Blocks.ImageProps, transformContext);
      case 'spacer':
        return this.makeSpacer(props, transformContext);
      case 'icon':
        return this.makeIcon(props as Devvit.Blocks.IconProps, transformContext);
      case 'avatar':
        return this.makeAvatar(props as Devvit.Blocks.AvatarProps, transformContext);
      case 'fullsnoo':
        return this.makeFullSnoo(props as Devvit.Blocks.FullSnooProps, transformContext);
      case 'animation':
        return this.makeAnimation(props as Devvit.Blocks.AnimationProps, transformContext);
      case 'webview':
        return this.makeWebView(props as Devvit.Blocks.WebViewProps, transformContext);
      case '__fragment':
        throw new Error("root fragment is not supported - use 'blocks' instead");
    }
    return undefined;
  }

  makeRootHeight(height: Devvit.Blocks.RootHeight): number {
    switch (height) {
      case 'regular':
        return 320;
      case 'tall':
        return 512;
    }
  }

  makeBlockPadding(padding: Devvit.Blocks.ContainerPadding | undefined): BlockPadding | undefined {
    switch (padding) {
      case 'none':
        return BlockPadding.PADDING_NONE;
      case 'xsmall':
        return BlockPadding.PADDING_XSMALL;
      case 'small':
        return BlockPadding.PADDING_SMALL;
      case 'medium':
        return BlockPadding.PADDING_MEDIUM;
      case 'large':
        return BlockPadding.PADDING_LARGE;
    }
    return undefined;
  }

  makeBlockRadius(
    radius: Devvit.Blocks.ContainerCornerRadius | undefined
  ): BlockRadius | undefined {
    switch (radius) {
      case 'none':
        return BlockRadius.RADIUS_NONE;
      case 'small':
        return BlockRadius.RADIUS_SMALL;
      case 'medium':
        return BlockRadius.RADIUS_MEDIUM;
      case 'large':
        return BlockRadius.RADIUS_LARGE;
      case 'full':
        return BlockRadius.RADIUS_FULL;
    }
    return undefined;
  }

  makeBlockGap(gap: Devvit.Blocks.ContainerGap | undefined): BlockGap | undefined {
    switch (gap) {
      case 'none':
        return BlockGap.GAP_NONE;
      case 'small':
        return BlockGap.GAP_SMALL;
      case 'medium':
        return BlockGap.GAP_MEDIUM;
      case 'large':
        return BlockGap.GAP_LARGE;
    }
    return undefined;
  }

  makeBlockAlignment(alignment: Devvit.Blocks.Alignment | undefined): BlockAlignment | undefined {
    if (alignment === undefined) return undefined;
    let vertical: BlockVerticalAlignment | undefined = undefined;
    let horizontal: BlockHorizontalAlignment | undefined = undefined;
    if (alignment.includes('top')) {
      vertical = BlockVerticalAlignment.ALIGN_TOP;
    } else if (alignment.includes('middle')) {
      vertical = BlockVerticalAlignment.ALIGN_MIDDLE;
    } else if (alignment.includes('bottom')) {
      vertical = BlockVerticalAlignment.ALIGN_BOTTOM;
    }
    if (alignment.includes('start')) {
      horizontal = BlockHorizontalAlignment.ALIGN_START;
    } else if (alignment.includes('center')) {
      horizontal = BlockHorizontalAlignment.ALIGN_CENTER;
    } else if (alignment.includes('end')) {
      horizontal = BlockHorizontalAlignment.ALIGN_END;
    }
    if (vertical !== undefined || horizontal !== undefined) {
      return {
        vertical,
        horizontal,
      };
    }
    return undefined;
  }

  makeBlockBorder(
    borderWidth: Devvit.Blocks.ContainerBorderWidth | undefined,
    color: string | undefined,
    lightColor: string | undefined,
    darkColor: string | undefined
  ): BlockBorder | undefined {
    if (!borderWidth && !color) return undefined;

    let width: BlockBorderWidth | undefined = undefined;
    switch (borderWidth) {
      case 'none':
        width = BlockBorderWidth.BORDER_WIDTH_NONE;
        break;
      case 'thin':
        width = BlockBorderWidth.BORDER_WIDTH_THIN;
        break;
      case 'thick':
        width = BlockBorderWidth.BORDER_WIDTH_THICK;
        break;
      default:
        // Default to a thin border when a color was set, but no borderWidth.
        width = BlockBorderWidth.BORDER_WIDTH_THIN;
        break;
    }

    // Default to #00000019 when a border was set, but no color.
    const borderColor = color ?? 'neutral-border-weak';
    const colors = this.getThemedColors(borderColor, lightColor, darkColor);

    return {
      width,
      color: colors?.light,
      colors,
    };
  }

  makeBlockTextSize(textSize: Devvit.Blocks.TextSize | undefined): BlockTextSize | undefined {
    switch (textSize) {
      case 'xsmall':
        return BlockTextSize.TEXT_SIZE_XSMALL;
      case 'small':
        return BlockTextSize.TEXT_SIZE_SMALL;
      case 'medium':
        return BlockTextSize.TEXT_SIZE_MEDIUM;
      case 'large':
        return BlockTextSize.TEXT_SIZE_LARGE;
      case 'xlarge':
        return BlockTextSize.TEXT_SIZE_XLARGE;
      case 'xxlarge':
        return BlockTextSize.TEXT_SIZE_XXLARGE;
    }
    return undefined;
  }

  makeBlockTextStyle(style: Devvit.Blocks.TextStyle | undefined): BlockTextStyle | undefined {
    switch (style) {
      case 'body':
        return BlockTextStyle.TEXT_STYLE_BODY;
      case 'metadata':
        return BlockTextStyle.TEXT_STYLE_METADATA;
      case 'heading':
        return BlockTextStyle.TEXT_STYLE_HEADING;
    }
    return undefined;
  }

  makeBlockTextOutline(
    outline: Devvit.Blocks.TextOutline | undefined
  ): BlockTextOutline | undefined {
    switch (outline) {
      case 'none':
        return BlockTextOutline.TEXT_OUTLINE_NONE;
      case 'thin':
        return BlockTextOutline.TEXT_OUTLINE_THIN;
      case 'thick':
        return BlockTextOutline.TEXT_OUTLINE_THICK;
    }
    return undefined;
  }

  makeBlockTextWeight(weight: Devvit.Blocks.TextWeight | undefined): BlockTextWeight | undefined {
    switch (weight) {
      case 'regular':
        return BlockTextWeight.TEXT_WEIGHT_REGULAR;
      case 'bold':
        return BlockTextWeight.TEXT_WEIGHT_BOLD;
    }
    return undefined;
  }

  makeBlockTextOverflow(
    overflow: Devvit.Blocks.TextOverflow | undefined
  ): BlockTextOverflow | undefined {
    switch (overflow) {
      case 'clip':
        return BlockTextOverflow.TEXT_OVERFLOW_CLIP;
      case 'ellipsis':
        return BlockTextOverflow.TEXT_OVERFLOW_ELLIPSE;
    }
    return BlockTextOverflow.TEXT_OVERFLOW_ELLIPSE;
  }

  makeBlockButtonAppearance(
    appearance: Devvit.Blocks.ButtonAppearance | undefined
  ): BlockButtonAppearance | undefined {
    switch (appearance) {
      case 'secondary':
        return BlockButtonAppearance.BUTTON_APPEARANCE_SECONDARY;
      case 'primary':
        return BlockButtonAppearance.BUTTON_APPEARANCE_PRIMARY;
      case 'plain':
        return BlockButtonAppearance.BUTTON_APPEARANCE_PLAIN;
      case 'bordered':
        return BlockButtonAppearance.BUTTON_APPEARANCE_BORDERED;
      case 'media':
        return BlockButtonAppearance.BUTTON_APPEARANCE_MEDIA;
      case 'destructive':
        return BlockButtonAppearance.BUTTON_APPEARANCE_DESTRUCTIVE;
      case 'caution':
        return BlockButtonAppearance.BUTTON_APPEARANCE_CAUTION;
      case 'success':
        return BlockButtonAppearance.BUTTON_APPEARANCE_SUCCESS;
    }
    return undefined;
  }

  makeBlockButtonSize(size: Devvit.Blocks.ButtonSize | undefined): BlockButtonSize | undefined {
    switch (size) {
      case 'small':
        return BlockButtonSize.BUTTON_SIZE_SMALL;
      case 'medium':
        return BlockButtonSize.BUTTON_SIZE_MEDIUM;
      case 'large':
        return BlockButtonSize.BUTTON_SIZE_LARGE;
    }
    return undefined;
  }

  makeBlockImageResizeMode(
    resize: Devvit.Blocks.ImageResizeMode | undefined
  ): BlockImageResizeMode | undefined {
    switch (resize) {
      case 'none':
        return BlockImageResizeMode.IMAGE_RESIZE_NONE;
      case 'fit':
        return BlockImageResizeMode.IMAGE_RESIZE_FIT;
      case 'fill':
        return BlockImageResizeMode.IMAGE_RESIZE_FILL;
      case 'cover':
        return BlockImageResizeMode.IMAGE_RESIZE_COVER;
      case 'scale-down':
        return BlockImageResizeMode.IMAGE_RESIZE_SCALE_DOWN;
    }
    return undefined;
  }

  makeBlockSpacerSize(size: Devvit.Blocks.SpacerSize | undefined): BlockSpacerSize | undefined {
    switch (size) {
      case 'xsmall':
        return BlockSpacerSize.SPACER_XSMALL;
      case 'small':
        return BlockSpacerSize.SPACER_SMALL;
      case 'medium':
        return BlockSpacerSize.SPACER_MEDIUM;
      case 'large':
        return BlockSpacerSize.SPACER_LARGE;
    }
    return undefined;
  }

  makeBlockSpacerShape(size: Devvit.Blocks.SpacerShape | undefined): BlockSpacerShape | undefined {
    switch (size) {
      case 'invisible':
        return BlockSpacerShape.SPACER_INVISIBLE;
      case 'thin':
        return BlockSpacerShape.SPACER_THIN;
      case 'square':
        return BlockSpacerShape.SPACER_SQUARE;
    }
    return undefined;
  }

  makeBlockIconSize(size: Devvit.Blocks.IconSize | undefined): BlockIconSize | undefined {
    switch (size) {
      case 'xsmall':
        return BlockIconSize.ICON_SIZE_XSMALL;
      case 'small':
        return BlockIconSize.ICON_SIZE_SMALL;
      case 'medium':
        return BlockIconSize.ICON_SIZE_MEDIUM;
      case 'large':
        return BlockIconSize.ICON_SIZE_LARGE;
    }
    return undefined;
  }

  makeBlockAvatarSize(size: Devvit.Blocks.AvatarSize | undefined): BlockAvatarSize | undefined {
    switch (size) {
      case 'xxsmall':
        return BlockAvatarSize.AVATAR_SIZE_XXSMALL;
      case 'xsmall':
        return BlockAvatarSize.AVATAR_SIZE_XSMALL;
      case 'small':
        return BlockAvatarSize.AVATAR_SIZE_SMALL;
      case 'medium':
        return BlockAvatarSize.AVATAR_SIZE_MEDIUM;
      case 'large':
        return BlockAvatarSize.AVATAR_SIZE_LARGE;
      case 'xlarge':
        return BlockAvatarSize.AVATAR_SIZE_XXLARGE;
      case 'xxlarge':
        return BlockAvatarSize.AVATAR_SIZE_XXLARGE;
      case 'xxxlarge':
        return BlockAvatarSize.AVATAR_SIZE_XXXLARGE;
    }
    return undefined;
  }

  makeBlockAvatarFacing(
    facing: Devvit.Blocks.AvatarFacing | undefined
  ): BlockAvatarFacing | undefined {
    switch (facing) {
      case 'left':
        return BlockAvatarFacing.AVATAR_FACING_LEFT;
      case 'right':
        return BlockAvatarFacing.AVATAR_FACING_RIGHT;
    }
    return undefined;
  }

  makeBlockFullSnooSize(
    size: Devvit.Blocks.FullSnooSize | undefined
  ): BlockFullSnooSize | undefined {
    switch (size) {
      case 'xsmall':
        return BlockFullSnooSize.FULLSNOO_XSMALL;
      case 'small':
        return BlockFullSnooSize.FULLSNOO_SMALL;
      case 'medium':
        return BlockFullSnooSize.FULLSNOO_MEDIUM;
      case 'large':
        return BlockFullSnooSize.FULLSNOO_LARGE;
      case 'xlarge':
        return BlockFullSnooSize.FULLSNOO_XLARGE;
      case 'xxlarge':
        return BlockFullSnooSize.FULLSNOO_XXLARGE;
    }
    return undefined;
  }

  makeBlockAvatarBackground(
    background: Devvit.Blocks.AvatarBackground | undefined
  ): BlockAvatarBackground | undefined {
    switch (background) {
      case 'dark':
        return BlockAvatarBackground.AVATAR_BG_DARK;
      case 'light':
        return BlockAvatarBackground.AVATAR_BG_LIGHT;
    }
    return undefined;
  }

  makeBlockAnimationType(type: Devvit.Blocks.AnimationType | undefined): BlockAnimationType {
    if (type === 'lottie' || type === undefined) {
      return BlockAnimationType.ANIM_LOTTIE;
    }
    return BlockAnimationType.UNRECOGNIZED;
  }

  makeBlockAnimationDirection(
    type: Devvit.Blocks.AnimationDirection | undefined
  ): BlockAnimationDirection | undefined {
    switch (type) {
      case 'backward':
        return BlockAnimationDirection.ANIM_DIR_BACKWARD;
      case 'forward':
        return BlockAnimationDirection.ANIM_DIR_FORWARD;
    }
  }

  makeBlockLoopMode(
    mode: Devvit.Blocks.AnimationLoop | undefined
  ): BlockAnimationLoopMode | undefined {
    switch (mode) {
      case 'repeat':
        return BlockAnimationLoopMode.ANIM_LOOP_REPEAT;
      case 'bounce':
        return BlockAnimationLoopMode.ANIM_LOOP_BOUNCE;
    }
    return undefined;
  }

  getDataSet(props: DataSet): DataSet {
    return Object.keys(props)
      .filter((key) => key.startsWith(DATA_PREFIX))
      .reduce((p, c) => {
        p[c.substring(DATA_PREFIX.length)] = props[c];
        return p;
      }, {} as DataSet);
  }

  makeActions(_type: BlockType, props: { [key: string]: unknown }): BlockAction[] {
    const actions: BlockAction[] = [];
    const dataSet = this.getDataSet(props as DataSet);
    ACTION_HANDLERS.forEach((action) => {
      if (action in props) {
        const id = props[action]!;
        actions.push({
          type: ACTION_TYPES.get(action) ?? BlockActionType.UNRECOGNIZED,
          id: id.toString(),
          data: dataSet,
        });
      }
    });
    return actions;
  }

  blockColorToHex(
    color: Devvit.Blocks.ColorString | undefined,
    theme: 'light' | 'dark' = 'light'
  ): Devvit.Blocks.ColorString | undefined {
    if (!color) return undefined;

    color = color.toLowerCase();
    if (isHexColor(color)) {
      return color;
    } else if (isRPLColor(color)) {
      return getHexFromRPLColor(color, theme);
    } else if (isNamedHTMLColor(color)) {
      return getHexFromNamedHTMLColor(color);
    } else if (isRgbaColor(color)) {
      return getHexFromRgbaColor(color);
    } else if (isHslColor(color)) {
      return color;
    }

    // Color could not be parsed, return red as fallback.
    console.warn(`Could not parse color: ${color}.`);
    return getHexFromNamedHTMLColor('red');
  }

  childrenToBlocks(
    children: ReifiedBlockElementOrLiteral[],
    transformContext: TransformContext
  ): Block[] {
    return children.flatMap(
      (child) =>
        (typeof child !== 'string'
          ? this.createBlocksElement(child, transformContext)
          : undefined) ?? []
    );
  }

  getThemedColors(
    color: Devvit.Blocks.ColorString | undefined,
    light?: Devvit.Blocks.ColorString | undefined,
    dark?: Devvit.Blocks.ColorString | undefined
  ): BlockColor | undefined {
    let lightColor = this.blockColorToHex(light, 'light');
    let darkColor = this.blockColorToHex(dark, 'dark');

    const tokens: string[] = [];

    // don't spend time parsing color if light/dark are already provided
    if (color && (!lightColor || !darkColor)) {
      // split color string, preserving color functions with spaces, such as rgb(r, g, b)
      // eslint-disable-next-line security/detect-unsafe-regex
      const matches = Array.from(color?.matchAll(/[\w#-]+(?:\([\w\t ,.#-]+\))?/g) ?? []);
      tokens.push(...matches.map((group) => group[0]));
    }

    if (!lightColor) {
      lightColor = this.blockColorToHex(tokens?.at(0), 'light');
    }
    if (!darkColor) {
      // if only one color was provided, use it for both light and dark colors
      darkColor = this.blockColorToHex(tokens?.at(1) ?? tokens?.at(0), 'dark');
    }

    return lightColor || darkColor
      ? {
          light: lightColor,
          dark: darkColor,
        }
      : undefined;
  }

  parsePixels(input: Devvit.Blocks.SizePixels | number): number {
    if (typeof input === 'string') {
      return Number(input.slice(0, -2));
    }
    return input;
  }

  resolveAssetUrl(url: string, options?: GetURLOptions): string {
    // try and resolve the URL but allow the client to decide if unknown URLs are allowed
    return this.#assetsClient()?.getURL(url, options) ?? url;
  }

  childrenToString(children: ReifiedBlockElementOrLiteral[]): string {
    return children.map((c) => c.toString()).join('');
  }

  makeRoot(
    props: Devvit.Blocks.BaseProps | undefined,
    ...children: ReifiedBlockElementOrLiteral[]
  ): Block {
    return this.wrapRoot(props, this.childrenToBlocks(children, ROOT_STACK_TRANSFORM_CONTEXT));
  }

  wrapRoot(props: Devvit.Blocks.BaseProps | undefined, children: Block[]): Block {
    return this.makeBlock(
      BlockType.BLOCK_ROOT,
      {},
      {},
      {
        rootConfig: {
          children: children,
          height: this.makeRootHeight(
            Devvit.customPostType?.height ??
              (props as unknown as Devvit.Blocks.RootProps)?.height ??
              'regular'
          ),
        },
      }
    );
  }

  makeStackBlock(
    direction: BlockStackDirection,
    props: Devvit.Blocks.StackProps | undefined,
    transformContext: TransformContext,
    children: ReifiedBlockElementOrLiteral[]
  ): Block {
    const backgroundColors = this.getThemedColors(
      props?.backgroundColor,
      props?.lightBackgroundColor,
      props?.darkBackgroundColor
    );
    const alignment = this.makeBlockAlignment(props?.alignment);
    const blockSizes = makeBlockSizes(props, transformContext);

    const blockDimensionsDetails = makeStackDimensionsDetails(
      props,
      transformContext.stackParentLayout,
      blockSizes
    );

    return this.makeBlock(BlockType.BLOCK_STACK, props, transformContext, {
      stackConfig: {
        alignment,
        backgroundColor: backgroundColors?.light,
        backgroundColors,
        border: this.makeBlockBorder(
          props?.border,
          props?.borderColor,
          props?.lightBorderColor,
          props?.darkBorderColor
        ),
        children: this.childrenToBlocks(children, {
          stackParentLayout: { ...blockDimensionsDetails, direction, alignment },
        }),
        cornerRadius: this.makeBlockRadius(props?.cornerRadius),
        direction: direction,
        gap: this.makeBlockGap(props?.gap),
        padding: this.makeBlockPadding(props?.padding),
        reverse: props?.reverse,
      },
    });
  }

  makeHStack(
    props: Devvit.Blocks.StackProps | undefined,
    transformContext: TransformContext,
    ...children: ReifiedBlockElementOrLiteral[]
  ): Block {
    return this.makeStackBlock(
      BlockStackDirection.STACK_HORIZONTAL,
      props,
      transformContext,
      children
    );
  }

  makeVStack(
    props: Devvit.Blocks.StackProps | undefined,
    transformContext: TransformContext,
    ...children: ReifiedBlockElementOrLiteral[]
  ): Block {
    return this.makeStackBlock(
      BlockStackDirection.STACK_VERTICAL,
      props,
      transformContext,
      children
    );
  }

  makeZStack(
    props: Devvit.Blocks.StackProps | undefined,
    transformContext: TransformContext,
    ...children: ReifiedBlockElementOrLiteral[]
  ): Block {
    return this.makeStackBlock(BlockStackDirection.STACK_DEPTH, props, transformContext, children);
  }

  makeText(
    props: Devvit.Blocks.TextProps | undefined,
    transformContext: TransformContext,
    ...children: ReifiedBlockElementOrLiteral[]
  ): Block {
    const colors = this.getThemedColors(props?.color, props?.lightColor, props?.darkColor);
    return this.makeBlock(BlockType.BLOCK_TEXT, props, transformContext, {
      textConfig: {
        alignment: this.makeBlockAlignment(props?.alignment),
        color: colors?.light,
        colors,
        outline: this.makeBlockTextOutline(props?.outline),
        size: this.makeBlockTextSize(props?.size),
        style: this.makeBlockTextStyle(props?.style),
        text: this.childrenToString(children),
        weight: this.makeBlockTextWeight(props?.weight),
        selectable: props?.selectable,
        wrap: props?.wrap,
        overflow: this.makeBlockTextOverflow(props?.overflow),
      },
    });
  }

  makeButton(
    props: Devvit.Blocks.ButtonProps | undefined,
    transformContext: TransformContext,
    ...children: ReifiedBlockElementOrLiteral[]
  ): Block {
    const textColors = this.getThemedColors(
      props?.textColor,
      props?.lightTextColor,
      props?.darkTextColor
    );
    return this.makeBlock(BlockType.BLOCK_BUTTON, props, transformContext, {
      buttonConfig: {
        buttonAppearance: this.makeBlockButtonAppearance(props?.appearance),
        // not available in all platforms yet
        // backgroundColor: props?.backgroundColor,
        icon: props?.icon,
        buttonSize: this.makeBlockButtonSize(props?.size),
        text: this.childrenToString(children),
        textColor: textColors?.light,
        textColors,
        disabled: props?.disabled,
      },
    });
  }

  makeImage(
    props: Devvit.Blocks.ImageProps | undefined,
    transformContext: TransformContext
  ): Block | undefined {
    return (
      props &&
      this.makeBlock(BlockType.BLOCK_IMAGE, props, transformContext, {
        imageConfig: {
          description: props?.description,
          resizeMode: this.makeBlockImageResizeMode(props.resizeMode),
          url: this.resolveAssetUrl(props.url),
          width: this.parsePixels(props.imageWidth),
          height: this.parsePixels(props.imageHeight),
        },
      })
    );
  }

  makeSpacer(
    props: Devvit.Blocks.SpacerProps | undefined,
    transformContext: TransformContext
  ): Block {
    return this.makeBlock(BlockType.BLOCK_SPACER, props, transformContext, {
      spacerConfig: {
        size: this.makeBlockSpacerSize(props?.size),
        shape: this.makeBlockSpacerShape(props?.shape),
      },
    });
  }

  makeIcon(
    props: Devvit.Blocks.IconProps | undefined,
    transformContext: TransformContext
  ): Block | undefined {
    const colors = this.getThemedColors(props?.color, props?.lightColor, props?.darkColor);
    return (
      props &&
      this.makeBlock(BlockType.BLOCK_ICON, props, transformContext, {
        iconConfig: {
          icon: props.name,
          color: colors?.light,
          colors,
          size: this.makeBlockIconSize(props.size),
        },
      })
    );
  }

  makeAvatar(
    props: Devvit.Blocks.AvatarProps | undefined,
    transformContext: TransformContext
  ): Block | undefined {
    return (
      props &&
      this.makeBlock(BlockType.BLOCK_AVATAR, props, transformContext, {
        avatarConfig: {
          thingId: props.thingId,
          size: this.makeBlockAvatarSize(props.size),
          facing: this.makeBlockAvatarFacing(props.facing),
          background: this.makeBlockAvatarBackground(props.background),
        },
      })
    );
  }

  makeFullSnoo(
    props: Devvit.Blocks.FullSnooProps | undefined,
    transformContext: TransformContext
  ): Block | undefined {
    return (
      props &&
      this.makeBlock(BlockType.BLOCK_FULLSNOO, props, transformContext, {
        fullsnooConfig: {
          userId: props.userId,
          facing: this.makeBlockAvatarFacing(props.facing),
          size: this.makeBlockFullSnooSize(props.size),
        },
      })
    );
  }

  makeAnimation(
    props: Devvit.Blocks.AnimationProps | undefined,
    transformContext: TransformContext
  ): Block | undefined {
    return (
      props &&
      this.makeBlock(BlockType.BLOCK_ANIMATION, props, transformContext, {
        animationConfig: {
          type: this.makeBlockAnimationType(props.type),
          url: this.resolveAssetUrl(props.url),
          loop: props.loop,
          loopMode: this.makeBlockLoopMode(props.loopMode),
          autoplay: props.autoplay,
          width: this.parsePixels(props.imageWidth),
          height: this.parsePixels(props.imageHeight),
          direction: this.makeBlockAnimationDirection(props.direction),
          speed: props.speed,
        },
      })
    );
  }

  makeWebView(
    props: Devvit.Blocks.WebViewProps | undefined,
    transformContext: TransformContext
  ): Block | undefined {
    return (
      props &&
      this.makeBlock(BlockType.BLOCK_WEBVIEW, props, transformContext, {
        webviewConfig: {
          url: this.resolveAssetUrl(props.url, { webview: true }),
          state: props.state,
        },
      })
    );
  }

  makeBlock(
    type: BlockType,
    props: Devvit.Blocks.BaseProps | undefined,
    transformContext: TransformContext,
    config?: BlockConfig | undefined
  ): Block {
    return {
      type,
      sizes: makeBlockSizes(props, transformContext),
      config: config,
      actions: (props && this.makeActions(type, props)) ?? [],
      id: props?.id,
      key: props?.key,
    };
  }

  ensureRootBlock(b: Block): Block {
    const block = b as Block;

    if ((block as Block).type === BlockType.BLOCK_ROOT) {
      if (block.config?.rootConfig && Devvit.customPostType?.height) {
        block.config.rootConfig.height = this.makeRootHeight(Devvit.customPostType?.height);
      }
      return block;
    }

    const root = this.wrapRoot(undefined, [block]);

    if (!root) {
      throw new Error('Could not create root block');
    }

    return root;
  }
}
