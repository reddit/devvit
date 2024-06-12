import { Devvit } from '@devvit/public-api';

import { Tile } from '../../components/Tile.js';
import BlockComponent = Devvit.BlockComponent;

const Example: BlockComponent<{ width: number; height: number }> = ({ width, height }) => (
  <Tile label={`Size: ${width}px x ${height}px`}>
    <hstack width={`${width}px`} height={`${height}px`} backgroundColor={'#0045AC'} />
  </Tile>
);

export const SizeAbsoluteCategory = (): JSX.Element => (
  <hstack gap={'small'}>
    <vstack gap={'small'}>
      <Example width={20} height={33} />
      <Example width={121} height={55} />
    </vstack>
    <vstack gap={'small'}>
      <Example width={42} height={42} />
      <Example width={64} height={16} />
    </vstack>
  </hstack>
);
