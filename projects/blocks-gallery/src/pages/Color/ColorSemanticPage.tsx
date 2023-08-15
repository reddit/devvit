import { Devvit } from '@devvit/public-api';

import { Columns } from '../../components/Columns.js';
import { Tile } from '../../components/Tile.js';

export const ColorSemanticPage = (): JSX.Element => {
  const colors = [
    'neutral-content',
    'secondary-content',
    'danger-background',
    'brand-background',
    'success-background',
    'warning-background',
  ];
  return (
    <Columns count={2}>
      {colors.map((name) => (
        <Tile label={name}>
          <hstack backgroundColor={name} border={'thin'} borderColor={'neutral-content'}>
            <spacer size={'large'} shape={'square'} />
          </hstack>
        </Tile>
      ))}
    </Columns>
  );
};
