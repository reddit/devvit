import type { BlockAlignment, BlockSizes } from '@devvit/protos';
import { BlockStackDirection } from '@devvit/protos';

import type { Devvit } from '../../Devvit.js';

export const ROOT_STACK_TRANSFORM_CONTEXT: TransformContext = {
  stackParentLayout: {
    hasHeight: true,
    hasWidth: true,
    direction: BlockStackDirection.UNRECOGNIZED,
    alignment: undefined,
  },
};

export interface TransformContext {
  stackParentLayout?: StackParentLayout;
}

export interface StackParentLayout {
  hasHeight: boolean;
  hasWidth: boolean;
  direction: BlockStackDirection;
  alignment: BlockAlignment | undefined;
}

enum ExpandDirection {
  NONE,
  HORIZONTAL,
  VERTICAL,
}

export interface BlockGrowStretchDirection {
  growDirection: ExpandDirection;
  stretchDirection: ExpandDirection;
}

export interface BlockDimensionsDetails {
  hasHeight: boolean;
  hasWidth: boolean;
}

/*
  Determine if a block has height and/or width based on its sizing, and its parent grow/stretch direction.
*/
export function makeStackDimensionsDetails(
  props: Devvit.Blocks.StackProps | undefined,
  stackParentLayout: StackParentLayout | undefined,
  blockSizes: BlockSizes | undefined
): BlockDimensionsDetails {
  if (!stackParentLayout) return { hasHeight: false, hasWidth: false };

  const { growDirection, stretchDirection } = makeBlockGrowStretchDetails(
    props?.grow,
    stackParentLayout.direction,
    stackParentLayout.alignment
  );

  const hasHeight =
    blockSizes?.height?.value?.value ||
    blockSizes?.height?.min?.value ||
    isExpandingOnConstrainedRespectiveAxis(
      ExpandDirection.VERTICAL,
      growDirection,
      stretchDirection,
      stackParentLayout.hasHeight
    );

  const hasWidth =
    blockSizes?.width?.value?.value ||
    blockSizes?.width?.min?.value ||
    isExpandingOnConstrainedRespectiveAxis(
      ExpandDirection.HORIZONTAL,
      growDirection,
      stretchDirection,
      stackParentLayout.hasWidth
    );

  return {
    hasHeight: Boolean(hasHeight),
    hasWidth: Boolean(hasWidth),
  };
}

/*
  Determine if the parent is growing or stretching on the defined axis.
  If true, tells us that the child may have height/width, even if its parent is not explicitly set.
*/
function isExpandingOnConstrainedRespectiveAxis(
  axis: ExpandDirection,
  growDirection: ExpandDirection,
  stretchDirection: ExpandDirection,
  parentHasDimensionSet: boolean
): boolean {
  return (
    (growDirection === axis && parentHasDimensionSet) ||
    (stretchDirection === axis && parentHasDimensionSet)
  );
}

/*
  Determine the grow/stretch direction of a block based on its parent stack direction and alignment.
*/
function makeBlockGrowStretchDetails(
  isGrowing: boolean | undefined,
  parentStackDirection: BlockStackDirection,
  parentAlignment: BlockAlignment | undefined
): BlockGrowStretchDirection {
  const parentIsVerticalOrRoot =
    parentStackDirection === BlockStackDirection.STACK_VERTICAL ||
    parentStackDirection === BlockStackDirection.UNRECOGNIZED;
  const parentIsHoritzontal = parentStackDirection === BlockStackDirection.STACK_HORIZONTAL;

  let growDirection = ExpandDirection.NONE;
  if (parentIsHoritzontal && isGrowing) {
    growDirection = ExpandDirection.HORIZONTAL;
  } else if (parentIsVerticalOrRoot && isGrowing) {
    growDirection = ExpandDirection.VERTICAL;
  }

  const hnone = parentAlignment === undefined || parentAlignment.horizontal === undefined;
  const vnone = parentAlignment === undefined || parentAlignment.vertical === undefined;

  const isStretching = parentIsHoritzontal
    ? Boolean(vnone)
    : parentIsVerticalOrRoot
      ? Boolean(hnone)
      : false;

  let stretchDirection = ExpandDirection.NONE;
  if (parentIsHoritzontal && isStretching) {
    stretchDirection = ExpandDirection.VERTICAL;
  } else if (parentIsVerticalOrRoot && isStretching) {
    stretchDirection = ExpandDirection.HORIZONTAL;
  }

  return {
    growDirection,
    stretchDirection,
  };
}
