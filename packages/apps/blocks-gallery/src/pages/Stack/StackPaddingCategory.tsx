import { Devvit } from '@devvit/public-api';

import { Box } from '../../components/Box.js';
import { Columns } from '../../components/Columns.js';
import { Tile } from '../../components/Tile.js';

export const StackPaddingCategory = (): JSX.Element => {
  const options: [string, Devvit.Blocks.ContainerPadding][] = [
    ['None *', 'none'],
    ['XSmall (4 dp)', 'xsmall'],
    ['Small (8 dp)', 'small'],
    ['Medium (16 dp)', 'medium'],
    ['Large (32 dp)', 'large'],
  ];

  const content = options.map(([label, option]) => (
    <Tile label={label} padding="small">
      <hstack backgroundColor="#0045AC" padding={option}>
        <Box color="#EAEDEF" />
      </hstack>
    </Tile>
  ));

  return (
    <vstack>
      <Columns count={2}>{content}</Columns>
    </vstack>
  );
};
