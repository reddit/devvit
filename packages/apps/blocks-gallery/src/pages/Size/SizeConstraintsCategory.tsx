import { Devvit } from '@devvit/public-api';
import { Bar } from '../../components/Bar.js';
import { Tile } from '../../components/Tile.js';

export const SizeConstraintsCategory = () => (
  <vstack gap={'small'}>
    <Tile label={'Max width: 300px'}>
      <Bar maxWidth={'300px'} />
    </Tile>

    <Tile label={'Min width: 300px'}>
      <Bar minWidth={'300px'} />
      <Bar width={'100%'} />
    </Tile>
  </vstack>
);
