import { Devvit } from '@devvit/public-api';

export interface BoxProps {
  spacerSize?: Devvit.Blocks.SpacerSize;
  size?: number;
  color?: string;
  rounded?: boolean;
}

export const Box = ({
  spacerSize = 'large',
  size = 1,
  color,
  rounded = false,
}: BoxProps): JSX.Element => (
  <zstack>
    <zstack backgroundColor={color} cornerRadius={rounded ? 'full' : 'none'}>
      <hstack>{new Array(size).fill(<spacer size={spacerSize} />)}</hstack>
      <vstack>{new Array(size).fill(<spacer size={spacerSize} />)}</vstack>
    </zstack>
  </zstack>
);
