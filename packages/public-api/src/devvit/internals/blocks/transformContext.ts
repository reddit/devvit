import type { BlockSizes_Dimension_Value, Dimensions, UIDimensions } from '@devvit/protos';
import { BlockSizeUnit, BlockStackDirection } from '@devvit/protos';
import type { Devvit } from '../../Devvit.js';

// eslint-disable-next-line security/detect-unsafe-regex
const SIZE_UNIT_REGEX = /^(\d+(?:\.\d+)?)(px|%)?$/;

export const makeDimensionValue = (
  size: Devvit.Blocks.SizeString | undefined,
  maxDimension: number
): BlockSizes_Dimension_Value | undefined => {
  if (size == null) return undefined;
  const pxValue = stackDimensionToPx(size, maxDimension);
  return pxValue != null ? { value: pxValue, unit: BlockSizeUnit.SIZE_UNIT_PIXELS } : undefined;
};

export const calculateMaxDimensions = (
  props: Devvit.Blocks.StackProps | undefined,
  parentMaxDimensions: Dimensions | UIDimensions,
  stackDirection: BlockStackDirection,
  childrenCount: number
): UIDimensions => {
  if (!props) return parentMaxDimensions;

  const paddingOffset = stackPaddingToPx(props.padding, parentMaxDimensions.fontScale) * 2;
  const borderOffset = stackBorderToPx(props.border, props.borderColor) * 2;
  const gapSize = stackGapToPx(props.gap);

  // Calculate height
  let childMaxHeight = parentMaxDimensions.height;
  const hasHeightDefined =
    props.height != null || props.minHeight != null || props.maxHeight != null;
  if (hasHeightDefined) {
    childMaxHeight = getMaxForDimension(
      props.height,
      props.minHeight,
      props.maxHeight,
      parentMaxDimensions.height
    );
  }
  let heightOffset = paddingOffset + borderOffset;
  if (stackDirection === BlockStackDirection.STACK_VERTICAL && gapSize && childrenCount > 0) {
    heightOffset = heightOffset + gapSize * (childrenCount - 1);
  }

  // Calculate width
  let childMaxWidth = parentMaxDimensions.width;
  const hasWidthDefined = props.width != null || props.minWidth != null || props.maxWidth != null;
  if (hasWidthDefined) {
    childMaxWidth = getMaxForDimension(
      props.width,
      props.minWidth,
      props.maxWidth,
      parentMaxDimensions.width
    );
  }
  let widthOffset = paddingOffset + borderOffset;
  if (stackDirection === BlockStackDirection.STACK_HORIZONTAL && gapSize && childrenCount > 0) {
    widthOffset = widthOffset + gapSize * (childrenCount - 1);
  }

  return {
    ...parentMaxDimensions,
    height: childMaxHeight - heightOffset,
    width: childMaxWidth - widthOffset,
  };
};

/* As a result of DX-6656, all percent dimension values will be converted to px values. */
const stackDimensionToPx = (
  value: Devvit.Blocks.SizeString | undefined,
  maxDimension: number
): number | undefined => {
  if (value == null) return undefined;

  if (typeof value === 'number') {
    return (maxDimension * value) / 100;
  } else {
    const parts = value.match(SIZE_UNIT_REGEX);

    if (parts == null) return undefined;

    const dimensions = Number.parseFloat(parts[1]);
    if (parts?.at(2) === '%') {
      return (maxDimension * dimensions) / 100;
    }
    return dimensions;
  }
};

const stackPaddingToPx = (
  padding: Devvit.Blocks.ContainerPadding | undefined,
  fontScale: number = 1 // fontScale is web only and refers to window browser font scaling, default to 1
): number => {
  switch (padding) {
    case 'xsmall':
      return 4 * fontScale;
    case 'small':
      return 8 * fontScale;
    case 'medium':
      return 16 * fontScale;
    case 'large':
      return 32 * fontScale;
    default:
      return 0;
  }
};

const stackGapToPx = (gap: Devvit.Blocks.ContainerGap | undefined): number => {
  switch (gap) {
    case 'small':
      return 8;
    case 'medium':
      return 16;
    case 'large':
      return 32;
  }
  return 0;
};

const stackBorderToPx = (
  borderWidth: Devvit.Blocks.ContainerBorderWidth | undefined,
  color: string | undefined
): number => {
  if (!borderWidth && !color) return 0;

  switch (borderWidth) {
    case 'none':
      return 0;
    case 'thin':
      return 1;
    case 'thick':
      return 2;
    default:
      // Default to a thin border when a color was set, but no borderWidth.
      return 1;
  }
};

const getMaxForDimension = (
  value: Devvit.Blocks.SizeString | undefined,
  min: Devvit.Blocks.SizeString | undefined,
  max: Devvit.Blocks.SizeString | undefined,
  maxDimension: number
): number => {
  const pxValue = stackDimensionToPx(value, maxDimension) || 0;
  const pxMin = stackDimensionToPx(min, maxDimension) || 0;
  const pxMax = stackDimensionToPx(max, maxDimension) || 0;

  const upperBound = Math.min(pxMax, pxValue);
  const lowerBound = Math.max(pxMin, pxValue);

  return Math.max(upperBound, lowerBound);
};
