import { Devvit } from '@devvit/public-api';

export type BoxProps = {
  spacerSize?: Devvit.Blocks.SpacerSize;
  size?: number;
  color?: string;
  rounded?: boolean;
};

const SIZE_PX: Record<Devvit.Blocks.SpacerSize, number> = {
  xsmall: 4,
  small: 8,
  medium: 16,
  large: 32,
};

export const Box = ({
  spacerSize = 'large',
  size = 1,
  color,
  rounded = false,
}: BoxProps): JSX.Element => {
  const sizePx: Devvit.Blocks.SizePixels = `${SIZE_PX[spacerSize] * size}px`;
  return (
    <hstack
      backgroundColor={color}
      cornerRadius={rounded ? 'full' : 'none'}
      width={sizePx}
      height={sizePx}
    />
  );
};
