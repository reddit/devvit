import { Devvit } from '@devvit/public-api';

import { Tile } from '../../components/Tile.js';
import { Box } from '../../components/Box.js';
import { Columns } from '../../components/Columns.js';

const boxesPerLine: number = 3;
const boxes: JSX.Element[] = new Array(boxesPerLine).fill(<Box color="rgba(0, 69, 172, 0.5)" />);

export const StackDirectionCategory = (): JSX.Element => (
  <Columns count={2}>
    <Tile label="HStack">
      <hstack gap="small">{boxes}</hstack>
    </Tile>

    <Tile label="VStack">
      <vstack gap="small">{boxes}</vstack>
    </Tile>

    <Tile label="ZStack">
      <zstack>{boxes}</zstack>
    </Tile>
  </Columns>
);
