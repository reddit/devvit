import { Devvit } from '@devvit/public-api';

import { Tile } from '../../components/Tile.js';
import { Columns } from '../../components/Columns.js';

export const SpacerSizeCategory = (): JSX.Element => {
  const options: [string, Devvit.Blocks.SpacerSize][] = [
    ['XSmall (4 dp)', 'xsmall'],
    ['Small (8 dp)', 'small'],
    ['Medium (16 dp)', 'medium'],
    ['Large (24 dp)', 'large'],
  ];

  const content = options.map(([label, size]) => (
    <Tile label={label}>
      <zstack backgroundColor="secondary-background" border={'thin'} padding={'small'}>
        <hstack alignment="middle">
          <text>A</text>
          <hstack alignment={'middle'}>
            <hstack backgroundColor="alienblue-500">
              <spacer size={size} shape={'thin'} />
            </hstack>
          </hstack>
          <text>B</text>
        </hstack>
        <vstack>
          <spacer size="large" />
        </vstack>
      </zstack>
    </Tile>
  ));

  return (
    <vstack>
      <Columns count={2}>{content}</Columns>
    </vstack>
  );
};
