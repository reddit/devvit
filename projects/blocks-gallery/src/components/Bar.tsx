import { Devvit } from '@devvit/public-api';
import BlockComponent = Devvit.BlockComponent;
import SizeString = Devvit.Blocks.SizeString;

type BarProps = {
  width?: SizeString | undefined;
  fillWidth?: SizeString | undefined;
  minWidth?: SizeString | undefined;
  maxWidth?: SizeString | undefined;
};

export const Bar: BlockComponent<BarProps> = ({ width, fillWidth, minWidth, maxWidth }) => (
  <hstack
    border={'thin'}
    cornerRadius={'small'}
    width={width ?? '100%'}
    minWidth={minWidth ?? '0px'}
    maxWidth={maxWidth ?? '100%'}
  >
    <hstack backgroundColor={'#0045AC'} width={fillWidth ?? '100%'} height={'8px'} />
  </hstack>
);
