import { Devvit } from '@devvit/public-api';

import { Box } from '../../components/Box.js';
import { Columns } from '../../components/Columns.js';
import { Tile } from '../../components/Tile.js';

export const StackBorderCategory = (): JSX.Element => {
  const options: [string, Devvit.Blocks.ContainerBorderWidth][] = [
    ['None *', 'none'],
    ['Thin (1 dp)', 'thin'],
    ['Thick (2 dp)', 'thick'],
  ];

  const content = options.map(([label, option]) => (
    <Tile label={label}>
      <hstack backgroundColor="secondary-background" border={option}>
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
