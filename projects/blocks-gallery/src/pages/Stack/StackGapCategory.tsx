import { Devvit } from '@devvit/public-api';

import { Tile } from '../../components/Tile.js';
import { Columns } from '../../components/Columns.js';
import { Box } from '../../components/Box.js';

export const StackGapCategory = (): JSX.Element => {
  const options: [string, Devvit.Blocks.ContainerGap][] = [
    ['None *', 'none'],
    ['Small (8 dp)', 'small'],
    ['Medium (16 dp)', 'medium'],
    ['Large (32 dp)', 'large'],
  ];

  const boxCount = 3;
  const content = options.map(([label, option]) => (
    <Tile label={label}>
      <hstack backgroundColor="#EAEDEF" gap={option}>
        {new Array(boxCount).fill(<Box color="#0045AC" />)}
      </hstack>
    </Tile>
  ));

  return (
    <vstack>
      <Columns count={2}>{content}</Columns>
    </vstack>
  );
};
