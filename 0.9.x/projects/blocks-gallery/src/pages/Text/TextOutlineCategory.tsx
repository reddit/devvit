import { Devvit } from '@devvit/public-api';

import { Tile } from '../../components/Tile.js';
import { Columns } from '../../components/Columns.js';

export const TextOutlineCategory = (): JSX.Element => {
  const options: [string, Devvit.Blocks.Thickness, string][] = [
    ['None *', 'none', 'bright'],
    ['Thin', 'thin', 'bright'],
    ['Thick', 'thick', 'bright'],
    ['None *', 'none', 'dark'],
    ['Thin', 'thin', 'dark'],
    ['Thick', 'thick', 'dark'],
  ];

  return (
    <vstack>
      <Columns count={3}>
        {options.map(([label, style, color]) => (
          <Tile label={label}>
            <hstack backgroundColor="#808080" padding="small" cornerRadius="small" grow>
              <text
                selectable={false}
                color={color === 'dark' ? 'tone-1' : 'tone-7'}
                outline={style}
              >
                Text
              </text>
            </hstack>
          </Tile>
        ))}
      </Columns>
    </vstack>
  );
};
