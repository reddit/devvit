import { Devvit } from '@devvit/public-api';

import { Tile } from '../../components/Tile.js';
import { Columns } from '../../components/Columns.js';

export const TextWeightCategory = (): JSX.Element => {
  const options: [string, Devvit.Blocks.TextWeight][] = [
    ['Regular *', 'regular'],
    ['Semibold', 'bold'],
  ];

  return (
    <vstack>
      <Columns count={2}>
        {options.map(([label, style]) => (
          <Tile label={label}>
            <text size="large" weight={style}>
              The quick brown fox jumps over the lazy dog.
            </text>
          </Tile>
        ))}
      </Columns>
    </vstack>
  );
};
