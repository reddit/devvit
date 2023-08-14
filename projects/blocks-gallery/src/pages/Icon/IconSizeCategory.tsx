import { Devvit } from '@devvit/public-api';

import { Columns } from '../../components/Columns.js';
import IconSize = Devvit.Blocks.IconSize;
import { Tile } from '../../components/Tile.js';

const sizes: IconSize[] = ['xsmall', 'small', 'medium', 'large'];

export const IconSizeCategory = (): JSX.Element => {
  const icons = sizes.map((size) => (
    <Tile label={size}>
      <icon name={'admin-fill'} size={size} />
    </Tile>
  ));

  return (
    <vstack>
      <Columns count={2}>{icons}</Columns>
    </vstack>
  );
};
