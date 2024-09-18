import { Devvit } from '@devvit/public-api';

import { Columns } from '../../components/Columns.js';
import { Tile } from '../../components/Tile.js';

export const TextSizeCategory = (): JSX.Element => {
  const options: [string, Devvit.Blocks.TextSize][] = [
    ['XSmall', 'xsmall'],
    ['Small', 'small'],
    ['Medium *', 'medium'],
    ['Large', 'large'],
    ['XLarge', 'xlarge'],
    ['XXLarge', 'xxlarge'],
  ];

  return (
    <vstack>
      <Columns count={2}>
        {options.map(([label, value]) => (
          <Tile label={label}>
            <text selectable={true} size={value}>
              The quick brown fox jumps over the lazy dog.
            </text>
          </Tile>
        ))}
      </Columns>
    </vstack>
  );
};
