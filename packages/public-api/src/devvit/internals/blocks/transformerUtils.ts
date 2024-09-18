import type { BlockSizes, BlockSizes_Dimension_Value } from '@devvit/protos';
import { BlockSizeUnit, BlockStackDirection } from '@devvit/protos';

import type { Devvit } from '../../Devvit.js';
import type { StackParentLayout, TransformContext } from './transformContext.js';

export function parseSize(
  size: Devvit.Blocks.SizeString | undefined
): BlockSizes_Dimension_Value | undefined {
  if (size == null) return undefined;
  if (typeof size === 'number') {
    return { value: size as number, unit: BlockSizeUnit.SIZE_UNIT_PERCENT };
  }

  // Regex:
  // Group 1: Digits with optional decimal trailer
  // Group 2: Optional suffix: 'px' or '%' (defaults to %)
  // eslint-disable-next-line security/detect-unsafe-regex
  const parts = size.match(/^(\d+(?:\.\d+)?)(px|%)?$/);
  if (parts == null) {
    return undefined;
  }
  let unit = BlockSizeUnit.SIZE_UNIT_PERCENT;
  if (parts.at(2) === 'px') {
    unit = BlockSizeUnit.SIZE_UNIT_PIXELS;
  }
  const value = Number.parseFloat(parts[1]);
  return { value, unit };
}

/**
 * If a child has a relative size along its parent's main axis, but that parent's axis is not set, omit the dimension.
 * This is done to enforce consistency between web and Yoga (the layout engine used by mobile).
 * */
export function omitRelativeSizes(
  blockSizes: BlockSizes,
  stackParentLayout: StackParentLayout
): BlockSizes {
  if (
    blockSizes.width?.value?.unit === BlockSizeUnit.SIZE_UNIT_PERCENT ||
    blockSizes.width?.min?.unit === BlockSizeUnit.SIZE_UNIT_PERCENT
  ) {
    if (
      stackParentLayout.direction === BlockStackDirection.STACK_HORIZONTAL ||
      stackParentLayout.direction === BlockStackDirection.STACK_DEPTH
    ) {
      if (!stackParentLayout.hasWidth) {
        blockSizes.width = undefined;
      }
    }
  }

  if (
    blockSizes.height?.value?.unit === BlockSizeUnit.SIZE_UNIT_PERCENT ||
    blockSizes.height?.min?.unit === BlockSizeUnit.SIZE_UNIT_PERCENT
  ) {
    if (
      stackParentLayout.direction === BlockStackDirection.STACK_VERTICAL ||
      stackParentLayout.direction === BlockStackDirection.STACK_DEPTH
    ) {
      if (!stackParentLayout.hasHeight) {
        blockSizes.height = undefined;
      }
    }
  }

  return blockSizes;
}

export function makeBlockSizes(
  props: Devvit.Blocks.BaseProps | undefined,
  transformContext: TransformContext
): BlockSizes | undefined {
  if (props) {
    const hasWidth = props.width != null || props.minWidth != null || props.maxWidth != null;
    const hasHeight = props.height != null || props.minHeight != null || props.maxHeight != null;
    if (hasWidth || hasHeight || props.grow != null) {
      let blockSizes: BlockSizes = {
        width: hasWidth
          ? {
              value: parseSize(props.width),
              min: parseSize(props.minWidth),
              max: parseSize(props.maxWidth),
            }
          : undefined,
        height: hasHeight
          ? {
              value: parseSize(props.height),
              min: parseSize(props.minHeight),
              max: parseSize(props.maxHeight),
            }
          : undefined,
        grow: props.grow,
      };

      if (transformContext.stackParentLayout) {
        blockSizes = omitRelativeSizes(blockSizes, transformContext.stackParentLayout);
      }

      return blockSizes;
    }
  }
  return undefined;
}
