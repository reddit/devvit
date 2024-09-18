import { Devvit } from '@devvit/public-api';

import { Columns } from '../../components/Columns.js';
import { Tile } from '../../components/Tile.js';

export const SpacerSizeCategory = (): JSX.Element => {
  const options: [string, Devvit.Blocks.SpacerSize][] = [
    ['XSmall (4 dp)', 'xsmall'],
    ['Small (8 dp)', 'small'],
    ['Medium (16 dp)', 'medium'],
    ['Large (32 dp)', 'large'],
  ];

  const content = options.map(([label, size]) => (
    <Tile label={label}>
      <hstack
        border={'thin'}
        padding={'small'}
        backgroundColor="secondary-background"
        height={'48px'}
        alignment="middle"
      >
        <text>A</text>
        <hstack alignment={'middle'}>
          <hstack backgroundColor="alienblue-500">
            <spacer size={size} shape={'thin'} />
          </hstack>
        </hstack>
        <text>B</text>
      </hstack>
    </Tile>
  ));

  return (
    <vstack>
      <Columns count={2}>{content}</Columns>
    </vstack>
  );
};
