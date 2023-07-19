import { Devvit } from '@devvit/public-api';

import { Columns } from '../../components/Columns.js';
import { Tile } from '../../components/Tile.js';

export const ButtonSizeCategory = () => {
  const options: [string, Devvit.Blocks.ButtonSize][] = [
    ['Small (32 dp)', 'small'],
    ['Medium (40 dp) *', 'medium'],
    ['Large (48 dp)', 'large'],
  ];

  const content = options.map(([label, size]) => {
    return (
      <Tile label={label}>
        <button appearance="secondary" size={size}>
          Label
        </button>
      </Tile>
    );
  });

  return (
    <vstack>
      <Columns count={3}>{content}</Columns>
    </vstack>
  );
};
