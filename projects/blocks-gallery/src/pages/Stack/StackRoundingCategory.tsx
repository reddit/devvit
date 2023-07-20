import { Devvit } from '@devvit/public-api';

import { Tile } from '../../components/Tile.js';
import { Columns } from '../../components/Columns.js';
import { Box } from '../../components/Box.js';

export const StackRoundingCategory = (): JSX.Element => {
  const options: [string, Devvit.Blocks.ContainerCornerRadius][] = [
    ['None *', 'none'],
    ['Small (8 dp)', 'small'],
    ['Medium (16 dp)', 'medium'],
    ['Large (24 dp)', 'large'],
    ['Full (50%)', 'full'],
  ];

  const content = options.map(([label, option]) => (
    <Tile label={label} padding="small">
      <vstack backgroundColor="#0045AC" cornerRadius={option}>
        <Box size={2} />
      </vstack>
    </Tile>
  ));

  return (
    <vstack>
      <Columns count={2}>{content}</Columns>
    </vstack>
  );
};
