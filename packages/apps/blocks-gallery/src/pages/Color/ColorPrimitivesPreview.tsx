import { Devvit } from '@devvit/public-api';

import { Columns } from '../../components/Columns.js';
import { Tile } from '../../components/Tile.js';

export const ColorPrimitivePreview = ({ name }: { name: string }): JSX.Element => {
  const tones = [100, 300, 500, 700];
  return (
    <Columns count={2}>
      {tones.map((tone) => {
        const color = `${name}-${tone}`;
        return (
          <Tile label={color}>
            <hstack backgroundColor={color} border={'thin'} borderColor={'neutral-content'}>
              <spacer size={'large'} shape={'square'} />
            </hstack>
          </Tile>
        );
      })}
    </Columns>
  );
};
