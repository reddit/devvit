import { Devvit } from '@devvit/public-api';

import { Columns } from '../../components/Columns.js';
import { Tile } from '../../components/Tile.js';

export const ButtonGrowCategory = (): JSX.Element => {
  const options: [string, boolean][] = [
    ['False *', false],
    ['True', true],
  ];

  const content = options.map(([label, style]) => (
    <Tile label={label}>
      <button grow={style}>Label</button>
    </Tile>
  ));

  return (
    <vstack>
      <Columns count={2}>{content}</Columns>
    </vstack>
  );
};
