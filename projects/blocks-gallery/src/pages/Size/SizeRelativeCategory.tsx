import { Devvit } from '@devvit/public-api';

import { Tile } from '../../components/Tile.js';
import BlockComponent = Devvit.BlockComponent;
import { Bar } from '../../components/Bar.js';

const ExampleWidth: BlockComponent<{ width: number }> = ({ width }) => (
  <Tile label={`Width ${width}%`}>
    <vstack gap={'small'} grow>
      <Bar fillWidth={`${width}%`} />
      <Bar width={'66%'} fillWidth={`${width}%`} />
      <Bar width={'33%'} fillWidth={`${width}%`} />
    </vstack>
  </Tile>
);

export const SizeRelativeCategory = () => (
  <>
    <ExampleWidth width={100} />
    <ExampleWidth width={66} />
    <ExampleWidth width={33} />
  </>
);
