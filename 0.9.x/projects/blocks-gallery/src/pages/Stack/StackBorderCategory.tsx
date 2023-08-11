import { Devvit } from '@devvit/public-api';

import { Tile } from '../../components/Tile.js';
import { Columns } from '../../components/Columns.js';
import { Box } from '../../components/Box.js';

export const StackBorderCategory = (): JSX.Element => {
  const options: [string, Devvit.Blocks.ContainerBorderWidth][] = [
    ['None *', 'none'],
    ['Thin (1 dp)', 'thin'],
    ['Thick (2 dp)', 'thick'],
  ];

  const content = options.map(([label, option]) => (
    <Tile label={label}>
      <hstack backgroundColor="#EAEDEF" border={option}>
        <Box />
      </hstack>
    </Tile>
  ));

  return (
    <vstack>
      <Columns count={2}>{content}</Columns>
    </vstack>
  );
};
