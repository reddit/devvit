import { Devvit } from '@devvit/public-api';

import { Columns } from '../../components/Columns.js';
import { Tile } from '../../components/Tile.js';

export const TextStyleCategory = (): JSX.Element => {
  const options: [string, Devvit.Blocks.TextStyle][] = [
    ['Metadata', 'metadata'],
    ['Body *', 'body'],
    ['Heading', 'heading'],
  ];

  return (
    <vstack>
      <Columns count={1}>
        {options.map(([label, style]) => (
          <Tile label={label}>
            <text selectable={true} style={style}>
              The quick brown fox jumps over the lazy dog.
            </text>
          </Tile>
        ))}
      </Columns>
    </vstack>
  );
};
